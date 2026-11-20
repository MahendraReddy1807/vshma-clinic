import { createHash } from 'node:crypto';

export interface DeliveryParams {
  to: string;
  appointmentId: string;
  bookingReference: string;
  notificationType: string;
  variables: Record<string, string | number>;
  idempotencySuffix?: string;
  idempotencyKey?: string;
}

export type ReservationResult =
  | { kind: 'reserved'; id: string }
  | { kind: 'already-sent'; id: string; messageId?: string }
  | { kind: 'error'; error: string };

export interface DeliveryDependencies {
  reserve(params: DeliveryParams, templateAlias: string, idempotencyKey: string): Promise<ReservationResult>;
  markFailed(id: string, message: string): Promise<boolean>;
  checkPaused(): Promise<{ paused: boolean; error?: string }>;
  getPublishedTemplate(alias: string): Promise<{ published: boolean; error?: string }>;
  markAttempt(id: string, attemptedAt: string): Promise<boolean>;
  send(params: DeliveryParams, from: string, alias: string, idempotencyKey: string): Promise<{ messageId?: string; error?: string }>;
  markAccepted(id: string, messageId: string, acceptedAt: string): Promise<boolean>;
  isConfigured: boolean;
  from: string;
  now?: () => Date;
  onError?: (context: string, message: string) => void;
}

export interface DeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

export function stableIdempotencyKey(reference: string, type: string, suffix?: string) {
  return createHash('sha256').update(`vshma|${reference}|${type}|${suffix || ''}`).digest('hex');
}

function validEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function deliverTransactionalEmail(
  params: DeliveryParams,
  templateAlias: string,
  dependencies: DeliveryDependencies
): Promise<DeliveryResult> {
  const key = params.idempotencyKey || stableIdempotencyKey(
    params.bookingReference,
    params.notificationType,
    params.idempotencySuffix
  );

  let reservation: ReservationResult;
  try {
    reservation = await dependencies.reserve(params, templateAlias, key);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    dependencies.onError?.('Email log reservation failed', message);
    return { success: false, error: message };
  }

  if (reservation.kind === 'error') {
    dependencies.onError?.('Email log reservation failed', reservation.error);
    return { success: false, error: reservation.error };
  }
  if (reservation.kind === 'already-sent') {
    return { success: true, skipped: true, messageId: reservation.messageId };
  }

  const logId = reservation.id;
  const fail = async (message: string): Promise<DeliveryResult> => {
    try {
      if (!(await dependencies.markFailed(logId, message))) {
        const combined = `${message} Email failure could not be recorded in notification_logs.`;
        dependencies.onError?.('Email failure log update failed', combined);
        return { success: false, error: combined };
      }
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Unknown database error';
      const combined = `${message} Email failure could not be recorded: ${detail}`;
      dependencies.onError?.('Email failure log update failed', combined);
      return { success: false, error: combined };
    }
    return { success: false, error: message };
  };

  if (!validEmail(params.to)) return fail('Recipient email address is invalid.');
  if (!dependencies.isConfigured) return fail('Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL.');

  let pause: { paused: boolean; error?: string };
  try {
    pause = await dependencies.checkPaused();
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown database error';
    return fail(`Could not verify the email emergency-pause setting: ${detail}`);
  }
  if (pause.error) return fail(pause.error);
  if (pause.paused) return fail('Email sending is paused by the clinic.');

  let template: { published: boolean; error?: string };
  try {
    template = await dependencies.getPublishedTemplate(templateAlias);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown provider error';
    return fail(`Could not verify Resend template ${templateAlias}: ${detail}`);
  }
  if (template.error || !template.published) {
    return fail(template.error || `Resend template ${templateAlias} is missing or unpublished.`);
  }

  const now = (dependencies.now || (() => new Date()))().toISOString();
  let attempted: boolean;
  try {
    attempted = await dependencies.markAttempt(logId, now);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown database error';
    dependencies.onError?.('Email attempt reservation update failed', detail);
    return { success: false, error: `Could not safely record the email attempt. No email was sent. ${detail}` };
  }
  if (!attempted) return { success: false, error: 'Could not safely record the email attempt. No email was sent.' };

  let sent: { messageId?: string; error?: string };
  try {
    sent = await dependencies.send(params, dependencies.from, templateAlias, key);
  } catch (error) {
    const detail = error instanceof Error ? error.name : 'NetworkError';
    return fail(`${detail}: Resend request failed before a confirmed response.`);
  }
  if (sent.error || !sent.messageId) return fail(sent.error || 'Resend returned no message ID.');

  let logged: boolean;
  try {
    logged = await dependencies.markAccepted(logId, sent.messageId, (dependencies.now || (() => new Date()))().toISOString());
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown database error';
    dependencies.onError?.('Accepted email log update failed', detail);
    return { success: true, messageId: sent.messageId, error: 'Email accepted by Resend, but delivery log update failed.' };
  }
  if (!logged) {
    dependencies.onError?.('Accepted email log update failed', 'Resend accepted the email but notification_logs could not be updated.');
    return { success: true, messageId: sent.messageId, error: 'Email accepted by Resend, but delivery log update failed.' };
  }
  return { success: true, messageId: sent.messageId };
}
