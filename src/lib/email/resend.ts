import { Resend } from 'resend';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EMAIL_SUBJECT_BY_EVENT, EMAIL_TEMPLATE_BY_EVENT } from '@/lib/email/catalog';
import { formatNotificationLogDatabaseError } from '@/lib/email/database-errors';
import { deliverTransactionalEmail } from '@/lib/email/delivery-core';
import { getGmailConfig, sendEmailViaGmail } from '@/lib/email/gmail';
import { renderEmailTemplate } from '@/lib/email/renderer';
import type { DeliveryParams, ReservationResult } from '@/lib/email/delivery-core';
import type { EmailTemplateVariables } from '@/lib/email/catalog';
import type { NotificationType } from '@/types';

interface SendEmailParams extends DeliveryParams {
  notificationType: NotificationType;
  variables: EmailTemplateVariables;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

interface ExistingNotification {
  id: string;
  status: 'pending' | 'queued' | 'processing' | 'accepted' | 'sent' | 'failed' | 'delivered' | 'bounced' | 'skipped' | 'read';
  resend_message_id: string | null;
  retry_count: number | null;
  attempted_at: string | null;
  created_at: string;
}

function safeProviderError(error: { name?: string; message?: string; statusCode?: number | null } | null | undefined) {
  if (!error) return 'Resend returned an unspecified error.';
  const name = error.name || 'ResendError';
  const status = error.statusCode ? ` (HTTP ${error.statusCode})` : '';
  return `${name}${status}${error.message ? `: ${error.message}` : ''}`;
}

async function reserveNotification(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  params: DeliveryParams,
  templateAlias: string,
  idempotencyKey: string
): Promise<ReservationResult> {
  const now = new Date();
  const nowIso = now.toISOString();
  const payload = {
    appointment_id: params.appointmentId,
    booking_reference: params.bookingReference,
    notification_type: params.notificationType,
    template_alias: templateAlias,
    template_variables: params.variables,
    idempotency_key: idempotencyKey,
    channel: 'email',
    recipient: params.to,
    subject: EMAIL_SUBJECT_BY_EVENT[params.notificationType as NotificationType],
    status: 'processing',
    error_message: null,
    attempted_at: nowIso,
  };

  const inserted = await supabase.from('notification_logs').insert(payload).select('id').single();
  if (!inserted.error && inserted.data) return { kind: 'reserved', id: inserted.data.id };
  if (inserted.error?.code !== '23505') {
    return { kind: 'error', error: `Could not reserve email delivery: ${formatNotificationLogDatabaseError(inserted.error)} No email was sent.` };
  }

  const existingResult = await supabase
    .from('notification_logs')
    .select('id,status,resend_message_id,retry_count,attempted_at,created_at')
    .eq('idempotency_key', idempotencyKey)
    .single();
  const existing = existingResult.data as ExistingNotification | null;
  if (existingResult.error || !existing) {
    const error = formatNotificationLogDatabaseError(existingResult.error);
    return { kind: 'error', error: `Could not verify the previous email attempt: ${error}. No email was sent.` };
  }

  if (['accepted', 'sent', 'delivered'].includes(existing.status)) {
    return { kind: 'already-sent', id: existing.id, messageId: existing.resend_message_id || undefined };
  }

  if (!['pending', 'queued', 'processing', 'failed'].includes(existing.status)) {
    return { kind: 'error', error: `The prior email attempt is ${existing.status}; it was not sent again.` };
  }

  const lastAttempt = existing.attempted_at || existing.created_at;
  const ageMs = now.getTime() - Date.parse(lastAttempt);
  if (!Number.isFinite(ageMs)) {
    return { kind: 'error', error: 'The prior email attempt has an invalid timestamp. Review it before retrying.' };
  }
  if (ageMs < 10 * 60 * 1000) {
    return { kind: 'error', error: 'An email attempt with this idempotency key is already in progress.' };
  }
  if (ageMs >= 23 * 60 * 60 * 1000) {
    return { kind: 'error', error: 'The previous email attempt is outside the safe retry window. Review it in Resend first.' };
  }

  // Change status in the same conditional update used to claim the retry. Alternating
  // pending/queued/processing makes concurrent stale-row claimants mutually exclusive.
  const claimedStatus = existing.status === 'processing' ? 'queued' : 'processing';
  const claimed = await supabase
    .from('notification_logs')
    .update({
      status: claimedStatus,
      attempted_at: nowIso,
      retry_count: (existing.retry_count || 0) + 1,
      error_message: null,
    })
    .eq('id', existing.id)
    .eq('status', existing.status)
    .select('id')
    .maybeSingle();
  if (claimed.error) {
    return { kind: 'error', error: `Could not claim a safe email retry: ${formatNotificationLogDatabaseError(claimed.error)}` };
  }
  if (!claimed.data) return { kind: 'error', error: 'Another request is already retrying this email.' };
  return { kind: 'reserved', id: existing.id };
}

async function updateNotification(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  id: string,
  values: Record<string, string | number | null>
) {
  const { error } = await supabase.from('notification_logs').update(values).eq('id', id);
  if (error) {
    console.error('[Email log update failed]', formatNotificationLogDatabaseError(error));
    return false;
  }
  return true;
}

export function isResendTestMode(fromEmail?: string): boolean {
  const sender = fromEmail || process.env.RESEND_FROM_EMAIL || '';
  return sender.toLowerCase().includes('onboarding@resend.dev');
}

export async function sendTransactionalEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const templateAlias = EMAIL_TEMPLATE_BY_EVENT[params.notificationType];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const error = 'Supabase email logging is not configured. No email was sent.';
    console.error('[Email delivery blocked]', error);
    return { success: false, error };
  }

  const supabase = createServerSupabaseClient();
  const gmailConfig = getGmailConfig();
  const resendApiKey = process.env.RESEND_API_KEY;
  const resendFrom = process.env.RESEND_FROM_EMAIL;
  const resendConfigured = Boolean(resendApiKey && resendApiKey !== 'your_resend_api_key' && resendFrom);

  const activeProvider: 'gmail' | 'resend' | 'none' = gmailConfig.isConfigured
    ? 'gmail'
    : resendConfigured
      ? 'resend'
      : 'none';

  const resend = activeProvider === 'resend' ? new Resend(resendApiKey!) : null;
  const senderAddress = activeProvider === 'gmail'
    ? `"VSHMA Homeopathy Clinic" <${gmailConfig.user}>`
    : (resendFrom || '');

  return deliverTransactionalEmail(params, templateAlias, {
    reserve: (emailParams, alias, key) => reserveNotification(supabase, emailParams, alias, key),
    markFailed: (id, message) => updateNotification(supabase, id, { status: 'failed', error_message: message }),
    checkPaused: async () => {
      const { data, error } = await supabase
        .from('automation_settings')
        .select('value')
        .eq('key', 'emergency_email_pause')
        .maybeSingle();
      return error
        ? { paused: false, error: `Could not verify the email emergency-pause setting: ${formatNotificationLogDatabaseError(error)}` }
        : { paused: data?.value === true };
    },
    getPublishedTemplate: async (alias) => {
      if (activeProvider === 'gmail') {
        return { published: true };
      }
      if (!resend) return { published: false, error: 'No email provider is configured.' };
      const { data, error } = await resend.templates.get(alias);
      return error
        ? { published: false, error: `Could not verify Resend template ${alias}: ${safeProviderError(error)}` }
        : { published: Boolean(data && data.status === 'published') };
    },
    markAttempt: (id, attemptedAt) => updateNotification(supabase, id, {
      status: 'processing',
      attempted_at: attemptedAt,
    }),
    send: async (emailParams, sender, alias, key) => {
      if (activeProvider === 'gmail') {
        const { html, text } = renderEmailTemplate(params.notificationType, emailParams.variables);
        const subject = EMAIL_SUBJECT_BY_EVENT[params.notificationType];
        return sendEmailViaGmail({
          to: emailParams.to,
          subject,
          html,
          text,
        });
      }

      if (!resend) return { error: 'No email provider is configured.' };
      const { data, error } = await resend.emails.send(
        { from: sender, to: emailParams.to, template: { id: alias, variables: emailParams.variables } },
        { idempotencyKey: key }
      );
      return error || !data?.id
        ? { error: safeProviderError(error) }
        : { messageId: data.id };
    },
    markAccepted: (id, messageId, acceptedAt) => {
      if (activeProvider === 'gmail') {
        return updateNotification(supabase, id, {
          status: 'sent',
          resend_message_id: messageId,
          sent_at: acceptedAt,
          error_message: null,
        });
      }

      const testModeNote = isResendTestMode(senderAddress)
        ? '[Resend Test Mode: sender uses onboarding@resend.dev; delivery is restricted by Resend testing-domain rules.]'
        : null;
      return updateNotification(supabase, id, {
        status: 'accepted',
        resend_message_id: messageId,
        sent_at: acceptedAt,
        error_message: testModeNote,
      });
    },
    isConfigured: activeProvider !== 'none',
    from: senderAddress,
    onError: (context, message) => console.error(`[${context}]`, message),
  });
}
