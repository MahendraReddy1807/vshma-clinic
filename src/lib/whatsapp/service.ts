import { createHash } from 'node:crypto';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  isWhatsAppConfigured,
  sendWhatsAppMessage,
} from './client';
import {
  buildAdminBookingTemplate,
  buildPatientBookingAckTemplate,
  buildPatientAppointmentConfirmedTemplate,
  buildPatientAppointmentRescheduledTemplate,
  buildPatientAppointmentCancelledTemplate,
  buildPatientAppointmentReminderTemplate,
  formatWhatsAppRecipient,
} from './templates';
import type {
  WhatsAppSendResult,
  WhatsAppWebhookPayload,
} from './types';

export interface BookingWhatsAppNotificationParams {
  appointmentId: string;
  bookingReference: string;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  preferredTime: string;
  consultationType: string;
  whatsappOptIn?: boolean;
}

function stableWhatsAppIdempotencyKey(
  reference: string,
  target: 'admin' | 'patient',
  suffix?: string
): string {
  return createHash('sha256')
    .update(`vshma|whatsapp|${target}|${reference}|${suffix || ''}`)
    .digest('hex');
}

async function logSkippedConsent(
  appointmentId: string,
  bookingReference: string,
  notificationType: string,
  recipientPhone: string,
  templateAlias: string,
  idempotencyKey: string
) {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.from('notification_logs').upsert(
      {
        appointment_id: appointmentId,
        notification_type: notificationType,
        channel: 'whatsapp',
        recipient: formatWhatsAppRecipient(recipientPhone),
        booking_reference: bookingReference,
        template_alias: templateAlias,
        status: 'skipped',
        error_message: 'Skipped — patient has not opted in',
        attempted_at: new Date().toISOString(),
        idempotency_key: idempotencyKey,
      },
      { onConflict: 'idempotency_key' }
    );
  } catch (err) {
    // Fail safe
    console.error('[WhatsApp Opt-Out Log Error]', err);
  }
}

/**
 * Sends an automated server-side WhatsApp alert to the authorized clinic administrator
 * upon a new patient booking request.
 *
 * Adheres strictly to Meta utility template guidelines.
 * Fail-safe: An error in WhatsApp dispatch never rolls back the patient's booked appointment.
 */
export async function notifyAdminNewBookingViaWhatsApp(
  params: BookingWhatsAppNotificationParams
): Promise<WhatsAppSendResult> {
  if (!isWhatsAppConfigured()) {
    return {
      success: false,
      status: 'failed',
      skipped: true,
      error: 'WhatsApp configuration is missing. Notification skipped safely.',
    };
  }

  const adminPhone = process.env.WHATSAPP_ADMIN_PHONE?.trim() || '7416001477';
  const idempotencyKey = stableWhatsAppIdempotencyKey(params.bookingReference, 'admin');

  // Supabase audit logging
  let supabase: ReturnType<typeof createServerSupabaseClient> | null = null;
  try {
    supabase = createServerSupabaseClient();
  } catch {
    // If Supabase client fails, proceed safely
  }

  // Check for duplicate prior dispatch
  if (supabase) {
    const { data: existing } = await supabase
      .from('notification_logs')
      .select('id, status, resend_message_id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (existing && (existing.status === 'sent' || existing.status === 'delivered' || existing.status === 'read')) {
      return {
        success: true,
        status: existing.status as 'sent' | 'delivered' | 'read',
        messageId: existing.resend_message_id || undefined,
        skipped: true,
      };
    }
  }

  const payload = buildAdminBookingTemplate(adminPhone, {
    patientName: params.patientName,
    patientPhone: params.patientPhone,
    appointmentDate: params.appointmentDate,
    appointmentTime: params.preferredTime,
    consultationType: params.consultationType,
    bookingReference: params.bookingReference,
    dashboardPath: `/admin/appointments?search=${params.bookingReference}`,
  });

  const sendResult = await sendWhatsAppMessage(payload);

  // Durable logging in notification_logs table (channel = 'whatsapp')
  if (supabase) {
    try {
      await supabase.from('notification_logs').upsert(
        {
          appointment_id: params.appointmentId,
          notification_type: 'admin_new_booking',
          channel: 'whatsapp',
          recipient: formatWhatsAppRecipient(adminPhone),
          booking_reference: params.bookingReference,
          template_alias: 'vshma_admin_new_booking',
          status: sendResult.status,
          resend_message_id: sendResult.messageId || null,
          idempotency_key: idempotencyKey,
          error_message: sendResult.error || null,
          attempted_at: new Date().toISOString(),
          sent_at: sendResult.success ? new Date().toISOString() : null,
          template_variables: {
            patientName: params.patientName,
            patientPhone: params.patientPhone,
            appointmentDate: params.appointmentDate,
            preferredTime: params.preferredTime,
            consultationType: params.consultationType,
            bookingReference: params.bookingReference,
          },
        },
        { onConflict: 'idempotency_key' }
      );
    } catch (logErr) {
      console.error('[WhatsApp Admin Log Error]', logErr);
    }
  }

  return sendResult;
}

/**
 * Sends an optional WhatsApp booking acknowledgement to the patient if explicit consent was granted.
 * Respects patient choice: If whatsappOptIn is false or omitted, this function exits without sending.
 */
export async function notifyPatientBookingAckViaWhatsApp(
  params: BookingWhatsAppNotificationParams
): Promise<WhatsAppSendResult> {
  const idempotencyKey = stableWhatsAppIdempotencyKey(params.bookingReference, 'patient');

  if (!params.whatsappOptIn) {
    await logSkippedConsent(
      params.appointmentId,
      params.bookingReference,
      'booking_received',
      params.patientPhone,
      'vshma_patient_booking_ack',
      idempotencyKey
    );
    return {
      success: true,
      status: 'skipped',
      skipped: true,
      error: 'Skipped — patient has not opted in',
    };
  }

  let supabase: ReturnType<typeof createServerSupabaseClient> | null = null;
  try {
    supabase = createServerSupabaseClient();
  } catch { }

  // Check duplicate
  if (supabase) {
    const { data: existing } = await supabase
      .from('notification_logs')
      .select('id, status, resend_message_id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (existing && (existing.status === 'sent' || existing.status === 'delivered' || existing.status === 'read')) {
      return {
        success: true,
        status: existing.status as 'sent' | 'delivered' | 'read',
        messageId: existing.resend_message_id || undefined,
        skipped: true,
      };
    }
  }

  const payload = buildPatientBookingAckTemplate(params.patientPhone, {
    patientName: params.patientName,
    consultationType: params.consultationType,
    appointmentDate: params.appointmentDate,
    appointmentTime: params.preferredTime,
    bookingReference: params.bookingReference,
  });

  const sendResult = await sendWhatsAppMessage(payload);

  if (supabase) {
    try {
      await supabase.from('notification_logs').upsert(
        {
          appointment_id: params.appointmentId,
          notification_type: 'booking_received',
          channel: 'whatsapp',
          recipient: formatWhatsAppRecipient(params.patientPhone),
          booking_reference: params.bookingReference,
          template_alias: 'vshma_patient_booking_ack',
          status: sendResult.status,
          resend_message_id: sendResult.messageId || null,
          idempotency_key: idempotencyKey,
          error_message: sendResult.error || null,
          attempted_at: new Date().toISOString(),
          sent_at: sendResult.success ? new Date().toISOString() : null,
          template_variables: {
            patientName: params.patientName,
            consultationType: params.consultationType,
            appointmentDate: params.appointmentDate,
            preferredTime: params.preferredTime,
            bookingReference: params.bookingReference,
          },
        },
        { onConflict: 'idempotency_key' }
      );
    } catch (logErr) {
      console.error('[WhatsApp Patient Log Error]', logErr);
    }
  }

  return sendResult;
}

export interface PatientConfirmedWhatsAppParams {
  appointmentId: string;
  bookingReference: string;
  patientName: string;
  patientPhone: string;
  confirmedDate: string;
  confirmedTime: string; // Exact time: e.g. "10:30 AM"
  consultationType: string;
  whatsappOptIn?: boolean;
}

/**
 * Sends an automated server-side WhatsApp appointment confirmation to the patient.
 * Respects opt-out: Only sent if whatsappOptIn is true.
 * Uses exact confirmed date and exact confirmed time.
 */
export async function notifyPatientAppointmentConfirmedViaWhatsApp(
  params: PatientConfirmedWhatsAppParams
): Promise<WhatsAppSendResult> {
  const idempotencyKey = stableWhatsAppIdempotencyKey(
    params.bookingReference,
    'patient',
    `confirmed|${params.confirmedDate}|${params.confirmedTime}`
  );

  if (!params.whatsappOptIn) {
    await logSkippedConsent(
      params.appointmentId,
      params.bookingReference,
      'appointment_confirmed',
      params.patientPhone,
      'vshma_patient_appointment_confirmed',
      idempotencyKey
    );
    return {
      success: true,
      status: 'skipped',
      skipped: true,
      error: 'Skipped — patient has not opted in',
    };
  }

  let supabase: ReturnType<typeof createServerSupabaseClient> | null = null;
  try {
    supabase = createServerSupabaseClient();
  } catch { }

  // Check duplicate prior dispatch
  if (supabase) {
    const { data: existing } = await supabase
      .from('notification_logs')
      .select('id, status, resend_message_id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (existing && (existing.status === 'sent' || existing.status === 'delivered' || existing.status === 'read')) {
      return {
        success: true,
        status: existing.status as 'sent' | 'delivered' | 'read',
        messageId: existing.resend_message_id || undefined,
        skipped: true,
      };
    }
  }

  const payload = buildPatientAppointmentConfirmedTemplate(params.patientPhone, {
    patientName: params.patientName,
    confirmedDate: params.confirmedDate,
    confirmedTime: params.confirmedTime,
    consultationType: params.consultationType,
    bookingReference: params.bookingReference,
  });

  const sendResult = await sendWhatsAppMessage(payload);

  if (supabase) {
    try {
      await supabase.from('notification_logs').upsert(
        {
          appointment_id: params.appointmentId,
          notification_type: 'appointment_confirmed',
          channel: 'whatsapp',
          recipient: formatWhatsAppRecipient(params.patientPhone),
          booking_reference: params.bookingReference,
          template_alias: 'vshma_patient_appointment_confirmed',
          status: sendResult.status,
          resend_message_id: sendResult.messageId || null,
          idempotency_key: idempotencyKey,
          error_message: sendResult.error || null,
          attempted_at: new Date().toISOString(),
          sent_at: sendResult.success ? new Date().toISOString() : null,
          template_variables: {
            patientName: params.patientName,
            confirmedDate: params.confirmedDate,
            confirmedTime: params.confirmedTime,
            consultationType: params.consultationType,
            bookingReference: params.bookingReference,
          },
        },
        { onConflict: 'idempotency_key' }
      );
    } catch (logErr) {
      console.error('[WhatsApp Patient Confirmation Log Error]', logErr);
    }
  }

  return sendResult;
}

export interface PatientRescheduledWhatsAppParams {
  appointmentId: string;
  bookingReference: string;
  patientName: string;
  patientPhone: string;
  newDate: string;
  newTime: string; // Exact time: e.g. "2:20 PM"
  consultationType: string;
  whatsappOptIn?: boolean;
}

/**
 * Sends an automated server-side WhatsApp rescheduling notification to the patient.
 * Respects opt-out: Only sent if whatsappOptIn is true.
 */
export async function notifyPatientAppointmentRescheduledViaWhatsApp(
  params: PatientRescheduledWhatsAppParams
): Promise<WhatsAppSendResult> {
  const idempotencyKey = stableWhatsAppIdempotencyKey(
    params.bookingReference,
    'patient',
    `rescheduled|${params.newDate}|${params.newTime}`
  );

  if (!params.whatsappOptIn) {
    await logSkippedConsent(
      params.appointmentId,
      params.bookingReference,
      'appointment_rescheduled',
      params.patientPhone,
      'vshma_patient_appointment_rescheduled',
      idempotencyKey
    );
    return {
      success: true,
      status: 'skipped',
      skipped: true,
      error: 'Skipped — patient has not opted in',
    };
  }

  let supabase: ReturnType<typeof createServerSupabaseClient> | null = null;
  try {
    supabase = createServerSupabaseClient();
  } catch { }

  if (supabase) {
    const { data: existing } = await supabase
      .from('notification_logs')
      .select('id, status, resend_message_id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (existing && (existing.status === 'sent' || existing.status === 'delivered' || existing.status === 'read')) {
      return {
        success: true,
        status: existing.status as 'sent' | 'delivered' | 'read',
        messageId: existing.resend_message_id || undefined,
        skipped: true,
      };
    }
  }

  const payload = buildPatientAppointmentRescheduledTemplate(params.patientPhone, {
    patientName: params.patientName,
    newDate: params.newDate,
    newTime: params.newTime,
    consultationType: params.consultationType,
    bookingReference: params.bookingReference,
  });

  const sendResult = await sendWhatsAppMessage(payload);

  if (supabase) {
    try {
      await supabase.from('notification_logs').upsert(
        {
          appointment_id: params.appointmentId,
          notification_type: 'appointment_rescheduled',
          channel: 'whatsapp',
          recipient: formatWhatsAppRecipient(params.patientPhone),
          booking_reference: params.bookingReference,
          template_alias: 'vshma_patient_appointment_rescheduled',
          status: sendResult.status,
          resend_message_id: sendResult.messageId || null,
          idempotency_key: idempotencyKey,
          error_message: sendResult.error || null,
          attempted_at: new Date().toISOString(),
          sent_at: sendResult.success ? new Date().toISOString() : null,
          template_variables: {
            patientName: params.patientName,
            newDate: params.newDate,
            newTime: params.newTime,
            consultationType: params.consultationType,
            bookingReference: params.bookingReference,
          },
        },
        { onConflict: 'idempotency_key' }
      );
    } catch (logErr) {
      console.error('[WhatsApp Patient Reschedule Log Error]', logErr);
    }
  }

  return sendResult;
}

export interface PatientCancelledWhatsAppParams {
  appointmentId: string;
  bookingReference: string;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  reason?: string;
  whatsappOptIn?: boolean;
}

/**
 * Sends an automated server-side WhatsApp cancellation notification to the patient.
 * Respects opt-out: Only sent if whatsappOptIn is true.
 */
export async function notifyPatientAppointmentCancelledViaWhatsApp(
  params: PatientCancelledWhatsAppParams
): Promise<WhatsAppSendResult> {
  const idempotencyKey = stableWhatsAppIdempotencyKey(
    params.bookingReference,
    'patient',
    'cancelled'
  );

  if (!params.whatsappOptIn) {
    await logSkippedConsent(
      params.appointmentId,
      params.bookingReference,
      'appointment_cancelled',
      params.patientPhone,
      'vshma_patient_appointment_cancelled',
      idempotencyKey
    );
    return {
      success: true,
      status: 'skipped',
      skipped: true,
      error: 'Skipped — patient has not opted in',
    };
  }

  let supabase: ReturnType<typeof createServerSupabaseClient> | null = null;
  try {
    supabase = createServerSupabaseClient();
  } catch { }

  if (supabase) {
    const { data: existing } = await supabase
      .from('notification_logs')
      .select('id, status, resend_message_id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (existing && (existing.status === 'sent' || existing.status === 'delivered' || existing.status === 'read')) {
      return {
        success: true,
        status: existing.status as 'sent' | 'delivered' | 'read',
        messageId: existing.resend_message_id || undefined,
        skipped: true,
      };
    }
  }

  const payload = buildPatientAppointmentCancelledTemplate(params.patientPhone, {
    patientName: params.patientName,
    bookingReference: params.bookingReference,
    appointmentDate: params.appointmentDate,
    reason: params.reason,
  });

  const sendResult = await sendWhatsAppMessage(payload);

  if (supabase) {
    try {
      await supabase.from('notification_logs').upsert(
        {
          appointment_id: params.appointmentId,
          notification_type: 'appointment_cancelled',
          channel: 'whatsapp',
          recipient: formatWhatsAppRecipient(params.patientPhone),
          booking_reference: params.bookingReference,
          template_alias: 'vshma_patient_appointment_cancelled',
          status: sendResult.status,
          resend_message_id: sendResult.messageId || null,
          idempotency_key: idempotencyKey,
          error_message: sendResult.error || null,
          attempted_at: new Date().toISOString(),
          sent_at: sendResult.success ? new Date().toISOString() : null,
          template_variables: {
            patientName: params.patientName,
            bookingReference: params.bookingReference,
            appointmentDate: params.appointmentDate,
            reason: params.reason || '',
          },
        },
        { onConflict: 'idempotency_key' }
      );
    } catch (logErr) {
      console.error('[WhatsApp Patient Cancellation Log Error]', logErr);
    }
  }

  return sendResult;
}

export interface PatientReminderWhatsAppParams {
  appointmentId: string;
  bookingReference: string;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  exactTime: string; // e.g. "10:30 AM"
  reminderType: '24h' | '2h';
  whatsappOptIn?: boolean;
}

/**
 * Sends an automated server-side WhatsApp reminder (24h or 2h) before the exact appointment time.
 * Respects opt-out: Only sent if whatsappOptIn is true.
 */
export async function notifyPatientAppointmentReminderViaWhatsApp(
  params: PatientReminderWhatsAppParams
): Promise<WhatsAppSendResult> {
  const idempotencyKey = stableWhatsAppIdempotencyKey(
    params.bookingReference,
    'patient',
    `reminder_${params.reminderType}|${params.appointmentDate}|${params.exactTime}`
  );

  if (!params.whatsappOptIn) {
    await logSkippedConsent(
      params.appointmentId,
      params.bookingReference,
      `reminder_${params.reminderType}`,
      params.patientPhone,
      'vshma_patient_appointment_reminder',
      idempotencyKey
    );
    return {
      success: true,
      status: 'skipped',
      skipped: true,
      error: 'Skipped — patient has not opted in',
    };
  }

  let supabase: ReturnType<typeof createServerSupabaseClient> | null = null;
  try {
    supabase = createServerSupabaseClient();
  } catch { }

  if (supabase) {
    const { data: existing } = await supabase
      .from('notification_logs')
      .select('id, status, resend_message_id')
      .eq('idempotency_key', idempotencyKey)
      .maybeSingle();

    if (existing && (existing.status === 'sent' || existing.status === 'delivered' || existing.status === 'read')) {
      return {
        success: true,
        status: existing.status as 'sent' | 'delivered' | 'read',
        messageId: existing.resend_message_id || undefined,
        skipped: true,
      };
    }
  }

  const reminderWindow = params.reminderType === '24h' ? 'Tomorrow' : 'in 2 hours';
  const payload = buildPatientAppointmentReminderTemplate(params.patientPhone, {
    patientName: params.patientName,
    appointmentDate: params.appointmentDate,
    exactTime: params.exactTime,
    reminderWindow,
    bookingReference: params.bookingReference,
  });

  const sendResult = await sendWhatsAppMessage(payload);

  if (supabase) {
    try {
      await supabase.from('notification_logs').upsert(
        {
          appointment_id: params.appointmentId,
          notification_type: params.reminderType === '24h' ? 'reminder_24h' : 'reminder_2h',
          channel: 'whatsapp',
          recipient: formatWhatsAppRecipient(params.patientPhone),
          booking_reference: params.bookingReference,
          template_alias: 'vshma_patient_appointment_reminder',
          status: sendResult.status,
          resend_message_id: sendResult.messageId || null,
          idempotency_key: idempotencyKey,
          error_message: sendResult.error || null,
          attempted_at: new Date().toISOString(),
          sent_at: sendResult.success ? new Date().toISOString() : null,
          template_variables: {
            patientName: params.patientName,
            appointmentDate: params.appointmentDate,
            exactTime: params.exactTime,
            reminderWindow,
            bookingReference: params.bookingReference,
          },
        },
        { onConflict: 'idempotency_key' }
      );
    } catch (logErr) {
      console.error('[WhatsApp Patient Reminder Log Error]', logErr);
    }
  }

  return sendResult;
}

/**
 * Processes incoming Meta WhatsApp delivery status webhooks (sent, delivered, read, failed).
 * Updates matching notification_logs records in Supabase.
 */
export async function processWhatsAppWebhookPayload(
  payload: WhatsAppWebhookPayload
): Promise<{ updatedCount: number; errors: string[] }> {
  let updatedCount = 0;
  const errors: string[] = [];

  const supabase = createServerSupabaseClient();

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const statuses = change.value?.statuses || [];
      for (const statusObj of statuses) {
        const metaMessageId = statusObj.id;
        const newStatus = statusObj.status; // 'sent' | 'delivered' | 'read' | 'failed'
        const errorDetails = statusObj.errors?.[0]?.message || statusObj.errors?.[0]?.title;

        try {
          const updateData: Record<string, unknown> = {
            status: newStatus,
          };
          if (errorDetails) {
            updateData.error_message = errorDetails;
          }

          const { error } = await supabase
            .from('notification_logs')
            .update(updateData)
            .eq('resend_message_id', metaMessageId)
            .eq('channel', 'whatsapp');

          if (error) {
            errors.push(`Failed to update message ${metaMessageId}: ${error.message}`);
          } else {
            updatedCount++;
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(`Error processing webhook status for ${metaMessageId}: ${msg}`);
        }
      }
    }
  }

  return { updatedCount, errors };
}
