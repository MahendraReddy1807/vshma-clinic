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

  const { data: inserted, error: insertError } = await supabase
    .from('notification_logs')
    .insert(payload)
    .select('id')
    .single();

  if (!insertError && inserted) {
    return { kind: 'reserved', id: inserted.id };
  }

  const { data: existingRow, error: selectError } = await supabase
    .from('notification_logs')
    .select('id, status, resend_message_id, retry_count, attempted_at, created_at')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (selectError || !existingRow) {
    return { kind: 'error', error: `Could not reserve email delivery log: ${formatNotificationLogDatabaseError(insertError || selectError)}` };
  }

  const existing = existingRow as ExistingNotification;

  if (existing.status === 'sent' || existing.status === 'accepted' || existing.status === 'delivered') {
    return { kind: 'already-sent', id: existing.id, messageId: existing.resend_message_id || undefined };
  }

  const attemptedAt = existing.attempted_at ? new Date(existing.attempted_at).getTime() : 0;
  const isStale = existing.status === 'processing' && Date.now() - attemptedAt > 5 * 60 * 1000;
  const retryCount = existing.retry_count ?? 0;

  if (existing.status === 'failed' || isStale) {
    if (retryCount >= 3) {
      return { kind: 'error', error: `Maximum retry attempts (3) exceeded for notification ${existing.id}.` };
    }

    const claimed = await supabase
      .from('notification_logs')
      .update({
        status: 'processing',
        attempted_at: nowIso,
        retry_count: retryCount + 1,
        error_message: null,
      })
      .eq('id', existing.id)
      .eq('status', existing.status)
      .select('id')
      .maybeSingle();

    if (claimed.error || !claimed.data) {
      return { kind: 'error', error: 'Another request is already retrying this email.' };
    }

    return { kind: 'reserved', id: existing.id };
  }

  if (existing.status === 'processing') {
    return { kind: 'error', error: 'Email delivery already in progress.' };
  }

  return { kind: 'error', error: `Unexpected notification status '${existing.status}'.` };
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

export function isResendTestMode(): boolean {
  return false;
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

  const rendered = renderEmailTemplate(params.notificationType, params.variables);
  const senderAddress = `"VSHMA Homeopathy Clinic" <${gmailConfig.user || 'care@vshma.in'}>`;

  const deliveryResult = await deliverTransactionalEmail(
    params,
    templateAlias,
    {
      reserve: async (p: DeliveryParams, alias: string, key: string) => reserveNotification(supabase, p, alias, key),
      markFailed: async (id: string, message: string) => updateNotification(supabase, id, { status: 'failed', error_message: message }),
      checkPaused: async () => ({ paused: false }),
      getPublishedTemplate: async () => ({ published: true }),
      markAttempt: async (id: string, attemptedAt: string) => updateNotification(supabase, id, { attempted_at: attemptedAt }),
      send: async (_sendParams: DeliveryParams, _from: string, _alias: string, _idempotencyKey: string) => {
        if (!gmailConfig.isConfigured) {
          return { messageId: `simulated-gmail-${Date.now()}` };
        }

        const res = await sendEmailViaGmail({
          to: params.to,
          subject: EMAIL_SUBJECT_BY_EVENT[params.notificationType] || 'VSHMA Clinic Notification',
          html: rendered.html,
          text: rendered.text,
        });

        if (res.error) {
          return { error: res.error };
        }

        return { messageId: res.messageId };
      },
      markAccepted: async (id: string, messageId: string, acceptedAt: string) => updateNotification(supabase, id, {
        status: 'sent',
        resend_message_id: messageId,
        sent_at: acceptedAt,
      }),
      isConfigured: true,
      from: senderAddress,
    }
  );

  return {
    success: deliveryResult.success,
    messageId: deliveryResult.messageId,
    error: deliveryResult.error,
    skipped: deliveryResult.skipped,
  };
}
