/**
 * VSHMA Notification Engine - Types & Interfaces
 * Timezone: Asia/Kolkata (IST)
 */

export type NotificationChannel = 'email' | 'whatsapp' | 'sms';
export type RecipientRole = 'patient' | 'doctor' | 'clinic';

export type NotificationEventType =
  | 'booking_received'
  | 'confirmed'
  | 'rescheduled'
  | 'cancelled'
  | 'completed'
  | 'no_show'
  | 'reminder_24h'
  | 'reminder_2h'
  | 'reminder_1h'
  | 'reminder_10m'
  | 'doctor_reminder_1h'
  | 'doctor_reminder_10m'
  | 'doctor_daily_digest';

export type JobStatus =
  | 'queued'
  | 'processing'
  | 'sent'
  | 'failed'
  | 'cancelled'
  | 'skipped';

export interface NotificationJob {
  id: string;
  appointment_id: string;
  event_type: NotificationEventType;
  channel: NotificationChannel;
  recipient_role: RecipientRole;
  recipient_target: string;
  payload: Record<string, unknown>;
  scheduled_at: string;
  status: JobStatus;
  attempts: number;
  max_attempts: number;
  last_error?: string | null;
  provider_message_id?: string | null;
  dedupe_key: string;
  created_at: string;
  updated_at: string;
  sent_at?: string | null;
}

export interface NotificationLog {
  id: string;
  job_id?: string | null;
  appointment_id?: string | null;
  event_type: string;
  channel: NotificationChannel | 'in_app';
  recipient: string;
  status: 'pending' | 'queued' | 'processing' | 'accepted' | 'sent' | 'delivered' | 'bounced' | 'failed' | 'read' | 'skipped';
  provider_message_id?: string | null;
  error_message?: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface ProviderSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Builds a deterministic dedupe key so nothing is ever sent twice:
 * appointment_id + event_type + channel + recipient_role
 */
export function buildDedupeKey(
  appointmentId: string,
  eventType: NotificationEventType | string,
  channel: NotificationChannel,
  recipientRole: RecipientRole
): string {
  return `${appointmentId}:${eventType}:${channel}:${recipientRole}`.toLowerCase();
}
