import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NOTIFICATION_CONFIG, maskEmail, maskPhone } from './config';
import { buildDedupeKey } from './types';
import { LUXURY_EMAIL_TEMPLATES } from './email-templates';
import { WHATSAPP_TEMPLATES } from './whatsapp-templates';
import { SMS_TEMPLATES } from './sms-templates';
import { generateGoogleCalendarUrl, generateIcsAttachment } from './calendar';
import { buildMagicActionUrl } from './magic-links';
import type { NotificationEventType, NotificationChannel, RecipientRole } from './types';

export interface AppointmentData {
  id: string;
  booking_reference: string;
  full_name: string;
  phone: string;
  email?: string | null;
  appointment_date: string; // YYYY-MM-DD
  preferred_time?: string | null;
  consultation_type: string;
  notes?: string | null;
  mode?: string;
  rescheduled_date?: string | null;
  rescheduled_time?: string | null;
  whatsapp_opt_in?: boolean;
}

function parseIstAppointmentStart(dateStr: string, timeStr?: string | null): Date {
  let hour = 10;
  let minute = 30;

  if (timeStr) {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      hour = parseInt(match[1], 10);
      minute = parseInt(match[2], 10);
      const meridiem = match[3]?.toUpperCase();
      if (meridiem === 'PM' && hour < 12) hour += 12;
      if (meridiem === 'AM' && hour === 12) hour = 0;
    }
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const isoIst = `${dateStr}T${pad(hour)}:${pad(minute)}:00+05:30`;
  return new Date(isoIst);
}

export class EventScheduler {
  /**
   * Helper to queue a single job idempotently using upsert/onConflict
   */
  private static async queueJob(opts: {
    appointmentId: string;
    eventType: NotificationEventType;
    channel: NotificationChannel;
    recipientRole: RecipientRole;
    recipientTarget: string;
    payload: Record<string, unknown>;
    scheduledAt?: Date;
  }): Promise<void> {
    const supabase = createServerSupabaseClient();
    const dedupeKey = buildDedupeKey(
      opts.appointmentId,
      opts.eventType,
      opts.channel,
      opts.recipientRole
    );

    const scheduledIso = (opts.scheduledAt || new Date()).toISOString();

    const { error } = await supabase.from('notification_jobs').upsert(
      {
        appointment_id: opts.appointmentId,
        event_type: opts.eventType,
        channel: opts.channel,
        recipient_role: opts.recipientRole,
        recipient_target: opts.recipientTarget,
        payload: opts.payload,
        scheduled_at: scheduledIso,
        status: 'queued',
        dedupe_key: dedupeKey,
        attempts: 0,
        max_attempts: NOTIFICATION_CONFIG.maxRetryAttempts,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'dedupe_key', ignoreDuplicates: true }
    );

    if (error) {
      console.warn(`[EventScheduler] Upsert skipped or failed for ${dedupeKey}:`, error.message);
    }
  }

  /**
   * Event 1: Booking Received (Patient + Clinic)
   */
  static async onBookingReceived(appt: AppointmentData): Promise<void> {
    const timeDisplay = appt.preferred_time || '10:30 AM IST (Flexible)';
    const dateDisplay = appt.appointment_date;

    // 1. Patient Email
    if (appt.email) {
      const emailContent = LUXURY_EMAIL_TEMPLATES.booking_received({
        patientName: appt.full_name,
        referenceNumber: appt.booking_reference,
        appointmentDate: dateDisplay,
        appointmentTime: timeDisplay,
        consultationType: appt.consultation_type,
      });

      await this.queueJob({
        appointmentId: appt.id,
        eventType: 'booking_received',
        channel: 'email',
        recipientRole: 'patient',
        recipientTarget: appt.email,
        payload: {
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        },
      });
    }

    // 2. Patient WhatsApp
    if (appt.phone) {
      const waText = WHATSAPP_TEMPLATES.booking_received({
        patientName: appt.full_name,
        referenceNumber: appt.booking_reference,
        appointmentDate: dateDisplay,
        appointmentTime: timeDisplay,
        consultationType: appt.consultation_type,
      });

      await this.queueJob({
        appointmentId: appt.id,
        eventType: 'booking_received',
        channel: 'whatsapp',
        recipientRole: 'patient',
        recipientTarget: appt.phone,
        payload: { messageText: waText },
      });
    }

    // 3. Clinic Staff Alert Email
    for (const clinicEmail of NOTIFICATION_CONFIG.clinicAlertEmails) {
      const clinicContent = LUXURY_EMAIL_TEMPLATES.clinic_new_booking_alert({
        patientName: appt.full_name,
        referenceNumber: appt.booking_reference,
        appointmentDate: dateDisplay,
        appointmentTime: timeDisplay,
        consultationType: appt.consultation_type,
        phone: appt.phone,
        email: appt.email || undefined,
        notes: appt.notes || undefined,
        actionUrl: `https://vshma.in/admin/appointments`,
      });

      await this.queueJob({
        appointmentId: appt.id,
        eventType: 'booking_received',
        channel: 'email',
        recipientRole: 'clinic',
        recipientTarget: clinicEmail,
        payload: {
          subject: clinicContent.subject,
          html: clinicContent.html,
          text: clinicContent.text,
        },
      });
    }
  }

  /**
   * Event 2: Confirmed (Patient + Calendar + Reminders)
   */
  static async onConfirmed(appt: AppointmentData): Promise<void> {
    const timeDisplay = appt.preferred_time || '10:30 AM IST';
    const dateDisplay = appt.appointment_date;
    const locationDisplay = 'VSHMA Homeopathy Clinic, Bengaluru, Karnataka (By Prior Appt)';

    const calProps = {
      title: `Homeopathy Consultation - Dr. Chihnitha Reddy T (${appt.consultation_type})`,
      description: `Consultation with Dr. Chihnitha Reddy T (BHMS) at VSHMA Homeopathy Clinic.\nReference: ${appt.booking_reference}\nPatient: ${appt.full_name}\nLocation: ${locationDisplay}`,
      location: locationDisplay,
      startDate: appt.appointment_date,
      timeStr: timeDisplay,
      durationMinutes: 45,
      referenceNumber: appt.booking_reference,
    };

    const calendarUrl = generateGoogleCalendarUrl(calProps);
    const icsAttachment = generateIcsAttachment(calProps);
    const rescheduleUrl = buildMagicActionUrl(appt.id, 'reschedule');
    const cancelUrl = buildMagicActionUrl(appt.id, 'cancel');

    // 1. Patient Confirmed Email
    if (appt.email) {
      const emailContent = LUXURY_EMAIL_TEMPLATES.confirmed({
        patientName: appt.full_name,
        referenceNumber: appt.booking_reference,
        appointmentDate: dateDisplay,
        appointmentTime: timeDisplay,
        consultationType: appt.consultation_type,
        location: locationDisplay,
        calendarUrl,
        rescheduleUrl,
        cancelUrl,
      });

      await this.queueJob({
        appointmentId: appt.id,
        eventType: 'confirmed',
        channel: 'email',
        recipientRole: 'patient',
        recipientTarget: appt.email,
        payload: {
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
          attachments: [icsAttachment],
        },
      });
    }

    // 2. Patient Confirmed WhatsApp
    if (appt.phone) {
      const waText = WHATSAPP_TEMPLATES.confirmed({
        patientName: appt.full_name,
        referenceNumber: appt.booking_reference,
        appointmentDate: dateDisplay,
        appointmentTime: timeDisplay,
        consultationType: appt.consultation_type,
        location: locationDisplay,
        actionUrl: rescheduleUrl,
      });

      await this.queueJob({
        appointmentId: appt.id,
        eventType: 'confirmed',
        channel: 'whatsapp',
        recipientRole: 'patient',
        recipientTarget: appt.phone,
        payload: { messageText: waText },
      });

      // 3. Optional SMS fallback if enabled
      const smsText = SMS_TEMPLATES.confirmed({
        patientName: appt.full_name,
        timeStr: `${dateDisplay} ${timeDisplay}`,
        referenceNumber: appt.booking_reference,
      });

      await this.queueJob({
        appointmentId: appt.id,
        eventType: 'confirmed',
        channel: 'sms',
        recipientRole: 'patient',
        recipientTarget: appt.phone,
        payload: {
          messageText: smsText,
          templateId: SMS_TEMPLATES.dltTemplateIds.confirmed,
        },
      });
    }

    // 4. Schedule Multi-Tier Reminders
    await this.scheduleRemindersForSlot(appt, appt.appointment_date, timeDisplay);
  }

  /**
   * Schedule 24h, 2h, 1h, and 10min reminders.
   * STRICT INVARIANT: Skip any reminder whose scheduled time has already passed!
   */
  private static async scheduleRemindersForSlot(
    appt: AppointmentData,
    dateStr: string,
    timeStr: string
  ): Promise<void> {
    const startTime = parseIstAppointmentStart(dateStr, timeStr);
    const now = Date.now();
    const minBufferMs = 60 * 1000; // 1 min buffer

    const offsets = [
      { type: 'reminder_24h' as NotificationEventType, offsetMs: 24 * 60 * 60 * 1000 },
      { type: 'reminder_2h' as NotificationEventType, offsetMs: 2 * 60 * 60 * 1000 },
      { type: 'reminder_1h' as NotificationEventType, offsetMs: 1 * 60 * 60 * 1000 },
      { type: 'reminder_10m' as NotificationEventType, offsetMs: 10 * 60 * 1000 },
    ];

    for (const { type, offsetMs } of offsets) {
      const scheduledTime = new Date(startTime.getTime() - offsetMs);

      // Skip past reminders
      if (scheduledTime.getTime() <= now + minBufferMs) {
        continue;
      }

      // Patient Email: 24h and 2h
      if (appt.email && (type === 'reminder_24h' || type === 'reminder_2h')) {
        const emailContent =
          type === 'reminder_24h'
            ? LUXURY_EMAIL_TEMPLATES.reminder_24h({
                patientName: appt.full_name,
                referenceNumber: appt.booking_reference,
                appointmentDate: dateStr,
                appointmentTime: timeStr,
                consultationType: appt.consultation_type,
              })
            : LUXURY_EMAIL_TEMPLATES.reminder_2h({
                patientName: appt.full_name,
                referenceNumber: appt.booking_reference,
                appointmentDate: dateStr,
                appointmentTime: timeStr,
                consultationType: appt.consultation_type,
              });

        await this.queueJob({
          appointmentId: appt.id,
          eventType: type,
          channel: 'email',
          recipientRole: 'patient',
          recipientTarget: appt.email,
          scheduledAt: scheduledTime,
          payload: {
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          },
        });
      }

      // Patient WhatsApp: All 4 tiers
      if (appt.phone) {
        let waText = '';
        if (type === 'reminder_24h') {
          waText = WHATSAPP_TEMPLATES.reminder_24h({
            patientName: appt.full_name,
            referenceNumber: appt.booking_reference,
            appointmentDate: dateStr,
            appointmentTime: timeStr,
            consultationType: appt.consultation_type,
          });
        } else if (type === 'reminder_2h') {
          waText = WHATSAPP_TEMPLATES.reminder_2h({
            patientName: appt.full_name,
            referenceNumber: appt.booking_reference,
            appointmentDate: dateStr,
            appointmentTime: timeStr,
            consultationType: appt.consultation_type,
          });
        } else if (type === 'reminder_1h') {
          waText = WHATSAPP_TEMPLATES.reminder_1h({
            patientName: appt.full_name,
            referenceNumber: appt.booking_reference,
            appointmentDate: dateStr,
            appointmentTime: timeStr,
            consultationType: appt.consultation_type,
          });
        } else if (type === 'reminder_10m') {
          waText = WHATSAPP_TEMPLATES.reminder_10m({
            patientName: appt.full_name,
            referenceNumber: appt.booking_reference,
            appointmentDate: dateStr,
            appointmentTime: timeStr,
            consultationType: appt.consultation_type,
          });
        }

        await this.queueJob({
          appointmentId: appt.id,
          eventType: type,
          channel: 'whatsapp',
          recipientRole: 'patient',
          recipientTarget: appt.phone,
          scheduledAt: scheduledTime,
          payload: { messageText: waText },
        });

        // SMS fallback for 2h and 10min
        if (type === 'reminder_2h' || type === 'reminder_10m') {
          const smsText =
            type === 'reminder_2h'
              ? SMS_TEMPLATES.reminder_2h({
                  patientName: appt.full_name,
                  timeStr,
                  referenceNumber: appt.booking_reference,
                })
              : SMS_TEMPLATES.reminder_10m({
                  patientName: appt.full_name,
                  timeStr,
                  referenceNumber: appt.booking_reference,
                });

          await this.queueJob({
            appointmentId: appt.id,
            eventType: type,
            channel: 'sms',
            recipientRole: 'patient',
            recipientTarget: appt.phone,
            scheduledAt: scheduledTime,
            payload: {
              messageText: smsText,
              templateId:
                type === 'reminder_2h'
                  ? SMS_TEMPLATES.dltTemplateIds.reminder_2h
                  : SMS_TEMPLATES.dltTemplateIds.reminder_10m,
            },
          });
        }
      }
    }

    // Doctor Reminders: 1h and 10min before appointment
    const doc1hTime = new Date(startTime.getTime() - 60 * 60 * 1000);
    if (doc1hTime.getTime() > now + minBufferMs) {
      const docWa1h = WHATSAPP_TEMPLATES.doctor_reminder_1h({
        patientName: appt.full_name,
        referenceNumber: appt.booking_reference,
        appointmentDate: dateStr,
        appointmentTime: timeStr,
        consultationType: appt.consultation_type,
      });

      await this.queueJob({
        appointmentId: appt.id,
        eventType: 'doctor_reminder_1h',
        channel: 'whatsapp',
        recipientRole: 'doctor',
        recipientTarget: NOTIFICATION_CONFIG.doctorWhatsAppPhone,
        scheduledAt: doc1hTime,
        payload: { messageText: docWa1h },
      });

      // Doctor Email
      for (const clinicEmail of NOTIFICATION_CONFIG.clinicAlertEmails) {
        const docEmail = LUXURY_EMAIL_TEMPLATES.doctor_reminder({
          patientName: appt.full_name,
          referenceNumber: appt.booking_reference,
          appointmentDate: dateStr,
          appointmentTime: timeStr,
          consultationType: appt.consultation_type,
          phone: appt.phone,
          notes: appt.notes || undefined,
        });

        await this.queueJob({
          appointmentId: appt.id,
          eventType: 'doctor_reminder_1h',
          channel: 'email',
          recipientRole: 'doctor',
          recipientTarget: clinicEmail,
          scheduledAt: doc1hTime,
          payload: {
            subject: docEmail.subject,
            html: docEmail.html,
            text: docEmail.text,
          },
        });
      }
    }

    const doc10mTime = new Date(startTime.getTime() - 10 * 60 * 1000);
    if (doc10mTime.getTime() > now + minBufferMs) {
      const docWa10m = WHATSAPP_TEMPLATES.doctor_reminder_10m({
        patientName: appt.full_name,
        referenceNumber: appt.booking_reference,
        appointmentDate: dateStr,
        appointmentTime: timeStr,
        consultationType: appt.consultation_type,
      });

      await this.queueJob({
        appointmentId: appt.id,
        eventType: 'doctor_reminder_10m',
        channel: 'whatsapp',
        recipientRole: 'doctor',
        recipientTarget: NOTIFICATION_CONFIG.doctorWhatsAppPhone,
        scheduledAt: doc10mTime,
        payload: { messageText: docWa10m },
      });
    }
  }

  /**
   * Event 3: Rescheduled (Patient + Clinic + Cancel old reminders & queue new)
   */
  static async onRescheduled(
    appt: AppointmentData,
    oldDate: string,
    oldTime: string
  ): Promise<void> {
    const supabase = createServerSupabaseClient();

    // 1. Cancel all queued reminder jobs for the old slot
    await supabase
      .from('notification_jobs')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('appointment_id', appt.id)
      .eq('status', 'queued')
      .ilike('event_type', '%reminder%');

    const newDate = appt.rescheduled_date || appt.appointment_date;
    const newTime = appt.rescheduled_time || appt.preferred_time || '10:30 AM IST';

    // 2. Patient Email
    if (appt.email) {
      const emailContent = LUXURY_EMAIL_TEMPLATES.rescheduled({
        patientName: appt.full_name,
        referenceNumber: appt.booking_reference,
        appointmentDate: newDate,
        appointmentTime: newTime,
        consultationType: appt.consultation_type,
        oldDate,
        oldTime,
      });

      await this.queueJob({
        appointmentId: appt.id,
        eventType: 'rescheduled',
        channel: 'email',
        recipientRole: 'patient',
        recipientTarget: appt.email,
        payload: {
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        },
      });
    }

    // 3. Patient WhatsApp
    if (appt.phone) {
      const waText = WHATSAPP_TEMPLATES.rescheduled({
        patientName: appt.full_name,
        referenceNumber: appt.booking_reference,
        appointmentDate: newDate,
        appointmentTime: newTime,
        consultationType: appt.consultation_type,
        oldDate,
        oldTime,
      });

      await this.queueJob({
        appointmentId: appt.id,
        eventType: 'rescheduled',
        channel: 'whatsapp',
        recipientRole: 'patient',
        recipientTarget: appt.phone,
        payload: { messageText: waText },
      });
    }

    // 4. Re-schedule reminders for the new slot
    await this.scheduleRemindersForSlot(appt, newDate, newTime);
  }

  /**
   * Event 4: Cancelled (Patient + Clinic + Cancel all queued reminders)
   */
  static async onCancelled(
    appt: AppointmentData,
    reason?: string,
    cancelledBy: 'clinic' | 'patient' = 'clinic'
  ): Promise<void> {
    const supabase = createServerSupabaseClient();

    // Cancel all queued reminders
    await supabase
      .from('notification_jobs')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('appointment_id', appt.id)
      .eq('status', 'queued');

    // 1. Patient Email
    if (appt.email) {
      const emailContent = LUXURY_EMAIL_TEMPLATES.cancelled({
        patientName: appt.full_name,
        referenceNumber: appt.booking_reference,
        appointmentDate: appt.appointment_date,
        appointmentTime: appt.preferred_time || '',
        consultationType: appt.consultation_type,
      });

      await this.queueJob({
        appointmentId: appt.id,
        eventType: 'cancelled',
        channel: 'email',
        recipientRole: 'patient',
        recipientTarget: appt.email,
        payload: {
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        },
      });
    }

    // 2. Patient WhatsApp
    if (appt.phone) {
      const waText = WHATSAPP_TEMPLATES.cancelled({
        patientName: appt.full_name,
        referenceNumber: appt.booking_reference,
        appointmentDate: appt.appointment_date,
        appointmentTime: appt.preferred_time || '',
        consultationType: appt.consultation_type,
      });

      await this.queueJob({
        appointmentId: appt.id,
        eventType: 'cancelled',
        channel: 'whatsapp',
        recipientRole: 'patient',
        recipientTarget: appt.phone,
        payload: { messageText: waText },
      });
    }

    // 3. If cancelled by patient, notify clinic
    if (cancelledBy === 'patient') {
      for (const clinicEmail of NOTIFICATION_CONFIG.clinicAlertEmails) {
        await this.queueJob({
          appointmentId: appt.id,
          eventType: 'cancelled',
          channel: 'email',
          recipientRole: 'clinic',
          recipientTarget: clinicEmail,
          payload: {
            subject: `[Patient Cancelled] ${appt.full_name} (${appt.appointment_date}) [Ref: ${appt.booking_reference}]`,
            html: `<p>Patient ${appt.full_name} has cancelled appointment ${appt.booking_reference} scheduled for ${appt.appointment_date}. Reason: ${reason || 'Not specified'}.</p>`,
            text: `Patient ${appt.full_name} cancelled appointment ${appt.booking_reference}.`,
          },
        });
      }
    }
  }

  /**
   * Event 5: Completed (Thank you + care continuity)
   */
  static async onCompleted(appt: AppointmentData): Promise<void> {
    const supabase = createServerSupabaseClient();
    await supabase
      .from('notification_jobs')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('appointment_id', appt.id)
      .eq('status', 'queued');

    if (appt.email) {
      const emailContent = LUXURY_EMAIL_TEMPLATES.completed({
        patientName: appt.full_name,
        referenceNumber: appt.booking_reference,
        appointmentDate: appt.appointment_date,
        appointmentTime: appt.preferred_time || '',
        consultationType: appt.consultation_type,
      });

      await this.queueJob({
        appointmentId: appt.id,
        eventType: 'completed',
        channel: 'email',
        recipientRole: 'patient',
        recipientTarget: appt.email,
        payload: {
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        },
      });
    }

    if (appt.phone) {
      const waText = WHATSAPP_TEMPLATES.completed({
        patientName: appt.full_name,
        referenceNumber: appt.booking_reference,
        appointmentDate: appt.appointment_date,
        appointmentTime: appt.preferred_time || '',
        consultationType: appt.consultation_type,
      });

      await this.queueJob({
        appointmentId: appt.id,
        eventType: 'completed',
        channel: 'whatsapp',
        recipientRole: 'patient',
        recipientTarget: appt.phone,
        payload: { messageText: waText },
      });
    }
  }

  /**
   * Event 6: No-Show (Gentle offer to rebook)
   */
  static async onNoShow(appt: AppointmentData): Promise<void> {
    if (appt.email) {
      const emailContent = LUXURY_EMAIL_TEMPLATES.no_show({
        patientName: appt.full_name,
        referenceNumber: appt.booking_reference,
        appointmentDate: appt.appointment_date,
        appointmentTime: appt.preferred_time || '',
        consultationType: appt.consultation_type,
      });

      await this.queueJob({
        appointmentId: appt.id,
        eventType: 'no_show',
        channel: 'email',
        recipientRole: 'patient',
        recipientTarget: appt.email,
        payload: {
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        },
      });
    }

    if (appt.phone) {
      const waText = WHATSAPP_TEMPLATES.no_show({
        patientName: appt.full_name,
        referenceNumber: appt.booking_reference,
        appointmentDate: appt.appointment_date,
        appointmentTime: appt.preferred_time || '',
        consultationType: appt.consultation_type,
      });

      await this.queueJob({
        appointmentId: appt.id,
        eventType: 'no_show',
        channel: 'whatsapp',
        recipientRole: 'patient',
        recipientTarget: appt.phone,
        payload: { messageText: waText },
      });
    }
  }
}
