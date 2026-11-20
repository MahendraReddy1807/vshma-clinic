import { createHash } from 'node:crypto';
import { Resend } from 'resend';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { EMAIL_SUBJECT_BY_EVENT, EMAIL_TEMPLATE_BY_EVENT } from '@/lib/email/catalog';
import type { EmailTemplateVariables } from '@/lib/email/catalog';
import type { NotificationType } from '@/types';

interface SendEmailParams {
  to: string;
  appointmentId: string;
  bookingReference: string;
  notificationType: NotificationType;
  variables: EmailTemplateVariables;
  idempotencySuffix?: string;
  idempotencyKey?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

interface ExistingNotification {
  id: string;
  status: 'pending' | 'queued' | 'sent' | 'failed' | 'delivered';
  resend_message_id: string | null;
  retry_count: number;
  attempted_at: string | null;
}

function isValidEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function stableIdempotencyKey(reference: string, type: NotificationType, suffix?: string) {
  return createHash('sha256').update(`vshma|${reference}|${type}|${suffix || ''}`).digest('hex');
}

function safeProviderError(error: { name?: string; statusCode?: number | null } | null | undefined) {
  if (!error) return 'Resend returned an unspecified error.';
  return error.statusCode
    ? `${error.name || 'ResendError'} (HTTP ${error.statusCode})`
    : `${error.name || 'ResendError'} (no response status)`;
}

async function reserveNotification(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  params: SendEmailParams,
  templateAlias: string,
  idempotencyKey: string
): Promise<{ id: string; alreadySent?: false } | { id: string; alreadySent: true; messageId?: string } | { error: string }> {
  const payload = {
    appointment_id: params.appointmentId,
    booking_reference: params.bookingReference,
    notification_type: params.notificationType,
    template_alias: templateAlias,
    template_variables: params.variables,
    idempotency_key: idempotencyKey,
    channel: 'email',
    recipient: params.to,
    subject: EMAIL_SUBJECT_BY_EVENT[params.notificationType],
    status: 'queued',
    error_message: null,
    attempted_at: null,
  };

  const inserted = await supabase.from('notification_logs').insert(payload).select('id').single();
  if (!inserted.error && inserted.data) return { id: inserted.data.id };
  if (inserted.error?.code !== '23505') {
    console.error('[Email log reservation failed]', inserted.error?.code || 'unknown database error');
    return { error: 'Could not reserve an email delivery log. No email was sent.' };
  }

  const existingResult = await supabase
    .from('notification_logs')
    .select('id,status,resend_message_id,retry_count,attempted_at')
    .eq('idempotency_key', idempotencyKey)
    .single();
  const existing = existingResult.data as ExistingNotification | null;
  if (existingResult.error || !existing) {
    console.error('[Email log lookup failed]', existingResult.error?.code || 'missing row');
    return { error: 'Could not verify the previous email attempt. No email was sent.' };
  }

  if (existing.status === 'sent' || existing.status === 'delivered') {
    return { id: existing.id, alreadySent: true, messageId: existing.resend_message_id || undefined };
  }

  const now = Date.now();
  const attemptedAt = existing.attempted_at ? Date.parse(existing.attempted_at) : null;
  if (existing.status === 'queued' && attemptedAt && now - attemptedAt > 10 * 60 * 1000 && now - attemptedAt < 23 * 60 * 60 * 1000) {
    const claimed = await supabase
      .from('notification_logs')
      .update({ status: 'pending', retry_count: (existing.retry_count || 0) + 1 })
      .eq('id', existing.id)
      .eq('status', 'queued')
      .lt('attempted_at', new Date(now - 10 * 60 * 1000).toISOString())
      .gt('attempted_at', new Date(now - 23 * 60 * 60 * 1000).toISOString())
      .select('id')
      .maybeSingle();
    if (claimed.error) return { error: 'Could not reserve a safe email retry.' };
    if (claimed.data) return { id: claimed.data.id };
  }

  if (existing.status !== 'failed') {
    return { error: 'An email attempt with this idempotency key is already queued or pending.' };
  }
  if (attemptedAt && now - attemptedAt >= 23 * 60 * 60 * 1000) {
    return { error: 'The previous email attempt is outside the safe retry window. Review it in Resend first.' };
  }

  const retry = await supabase
    .from('notification_logs')
    .update({ status: 'queued', retry_count: (existing.retry_count || 0) + 1, error_message: null })
    .eq('id', existing.id)
    .eq('status', 'failed')
    .select('id')
    .maybeSingle();
  if (retry.error) return { error: 'Could not reserve a safe email retry.' };
  if (!retry.data) return { error: 'Another request is already retrying this email.' };
  return { id: retry.data.id };
}

async function updateNotification(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  id: string,
  values: Record<string, string | number | null>
) {
  const { error } = await supabase.from('notification_logs').update(values).eq('id', id);
  if (error) console.error('[Email log update failed]', error.code || 'unknown database error');
  return !error;
}

export async function sendTransactionalEmail(params: SendEmailParams): Promise<SendEmailResult> {
  try {
    return await dispatchTransactionalEmail(params);
  } catch (error) {
    const name = error instanceof Error ? error.name : 'EmailServiceError';
    console.error('[Email delivery failed]', name);
    return { success: false, error: 'Email delivery failed before a confirmed provider response.' };
  }
}

async function dispatchTransactionalEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const templateAlias = EMAIL_TEMPLATE_BY_EVENT[params.notificationType];
  const idempotencyKey = params.idempotencyKey || stableIdempotencyKey(
    params.bookingReference,
    params.notificationType,
    params.idempotencySuffix
  );

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: false, error: 'Supabase email logging is not configured.' };
  }
  const supabase = createServerSupabaseClient();
  const reservation = await reserveNotification(supabase, params, templateAlias, idempotencyKey);
  if ('error' in reservation) return { success: false, error: reservation.error };
  if (reservation.alreadySent) {
    return { success: true, skipped: true, messageId: reservation.messageId };
  }
  const logId = reservation.id;
  const fail = async (message: string): Promise<SendEmailResult> => {
    await updateNotification(supabase, logId, { status: 'failed', error_message: message });
    return { success: false, error: message };
  };

  if (!isValidEmail(params.to)) return fail('Recipient email address is invalid.');
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || apiKey === 'your_resend_api_key' || !from) {
    return fail('Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.');
  }

  const { data: pauseSetting, error: settingsError } = await supabase
    .from('automation_settings')
    .select('value')
    .eq('key', 'emergency_email_pause')
    .maybeSingle();
  if (settingsError) return fail('Could not verify the email emergency-pause setting.');
  if (pauseSetting?.value === true) return fail('Email sending is paused by the clinic.');

  const resend = new Resend(apiKey);
  try {
    const { data: template, error: templateError } = await resend.templates.get(templateAlias);
    if (templateError || !template || template.status !== 'published') {
      return fail(`Resend template ${templateAlias} is missing or unpublished.`);
    }

    const attemptRecorded = await updateNotification(supabase, logId, { attempted_at: new Date().toISOString() });
    if (!attemptRecorded) return { success: false, error: 'Could not safely record the email attempt. No email was sent.' };

    const { data, error } = await resend.emails.send(
      {
        from,
        to: params.to,
        template: { id: templateAlias, variables: params.variables },
      },
      { idempotencyKey }
    );
    if (error || !data?.id) return fail(safeProviderError(error));

    const logUpdated = await updateNotification(supabase, logId, {
      status: 'sent',
      resend_message_id: data.id,
      sent_at: new Date().toISOString(),
      error_message: null,
    });
    if (!logUpdated) {
      return { success: true, messageId: data.id, error: 'Email accepted by Resend, but delivery log update failed.' };
    }
    return { success: true, messageId: data.id };
  } catch (error) {
    const name = error instanceof Error ? error.name : 'NetworkError';
    return fail(`${name}: Resend request failed before a confirmed response.`);
  }
}
