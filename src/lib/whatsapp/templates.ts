import type { WhatsAppTemplatePayload, WhatsAppTemplateComponent } from './types';

export interface AdminBookingTemplateParams {
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  consultationType: string;
  bookingReference: string;
  dashboardPath?: string;
}

export interface PatientBookingAckTemplateParams {
  patientName: string;
  consultationType: string;
  appointmentDate: string;
  appointmentTime: string;
  bookingReference: string;
}

export interface PatientAppointmentConfirmedTemplateParams {
  patientName: string;
  confirmedDate: string;
  confirmedTime: string; // Exact time: e.g. "10:30 AM"
  consultationType: string;
  bookingReference: string;
  clinicName?: string;
}

export interface PatientAppointmentRescheduledTemplateParams {
  patientName: string;
  newDate: string;
  newTime: string; // Exact time: e.g. "2:20 PM"
  consultationType: string;
  bookingReference: string;
}

export interface PatientAppointmentCancelledTemplateParams {
  patientName: string;
  bookingReference: string;
  appointmentDate: string;
  reason?: string;
}

export interface PatientAppointmentReminderTemplateParams {
  patientName: string;
  appointmentDate: string;
  exactTime: string; // e.g. "10:30 AM"
  reminderWindow: string; // e.g. "Tomorrow" or "in 2 hours"
  bookingReference: string;
  clinicLocation?: string;
}

/**
 * Normalizes phone numbers to standard Meta WhatsApp format (digits only with country code, no + or spaces).
 * Defaulting to India country code 91 if a 10-digit number is provided.
 */
export function formatWhatsAppRecipient(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }
  return digits;
}

/**
 * Builds the official Meta WhatsApp Cloud API template payload for clinic admin notifications.
 * Template: vshma_admin_new_booking (UTILITY category)
 *
 * Safe: Contains only administrative logistics; no confidential medical symptoms/notes.
 */
export function buildAdminBookingTemplate(
  recipientPhone: string,
  params: AdminBookingTemplateParams
): WhatsAppTemplatePayload {
  const components: WhatsAppTemplateComponent[] = [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: params.patientName },
        { type: 'text', text: params.patientPhone },
        { type: 'text', text: params.appointmentDate },
        { type: 'text', text: params.appointmentTime || 'Flexible / General' },
        { type: 'text', text: params.consultationType },
        { type: 'text', text: params.bookingReference },
      ],
    },
  ];

  if (params.dashboardPath) {
    components.push({
      type: 'button',
      sub_type: 'url',
      index: 0,
      parameters: [
        { type: 'text', text: params.dashboardPath.replace(/^\//, '') },
      ],
    });
  }

  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatWhatsAppRecipient(recipientPhone),
    type: 'template',
    template: {
      name: 'vshma_admin_new_booking',
      language: {
        code: 'en',
      },
      components,
    },
  };
}

/**
 * Builds the official Meta WhatsApp Cloud API template payload for patient request acknowledgement.
 * Template: vshma_patient_booking_ack (UTILITY category)
 *
 * Clearly indicates this is an initial request pending final slot confirmation.
 */
export function buildPatientBookingAckTemplate(
  recipientPhone: string,
  params: PatientBookingAckTemplateParams
): WhatsAppTemplatePayload {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatWhatsAppRecipient(recipientPhone),
    type: 'template',
    template: {
      name: 'vshma_patient_booking_ack',
      language: {
        code: 'en',
      },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: params.patientName },
            { type: 'text', text: params.consultationType },
            { type: 'text', text: params.appointmentDate },
            { type: 'text', text: params.appointmentTime || 'Flexible / General' },
            { type: 'text', text: params.bookingReference },
          ],
        },
      ],
    },
  };
}

/**
 * Builds the official Meta WhatsApp Cloud API template payload for appointment confirmation.
 * Template: vshma_patient_appointment_confirmed (UTILITY category)
 *
 * Populated with exact confirmed date, exact confirmed time, and booking reference.
 * Strictly adheres to Meta utility requirements (no clinical diagnoses/symptoms).
 */
export function buildPatientAppointmentConfirmedTemplate(
  recipientPhone: string,
  params: PatientAppointmentConfirmedTemplateParams
): WhatsAppTemplatePayload {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatWhatsAppRecipient(recipientPhone),
    type: 'template',
    template: {
      name: 'vshma_patient_appointment_confirmed',
      language: {
        code: 'en',
      },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: params.patientName },
            { type: 'text', text: params.confirmedDate },
            { type: 'text', text: params.confirmedTime }, // Exact time e.g. "10:30 AM"
            { type: 'text', text: params.consultationType },
            { type: 'text', text: params.bookingReference },
            { type: 'text', text: params.clinicName || 'VSHMA Homeopathy Clinic' },
          ],
        },
      ],
    },
  };
}

/**
 * Builds the official Meta WhatsApp Cloud API template payload for appointment rescheduling.
 * Template: vshma_patient_appointment_rescheduled (UTILITY category)
 */
export function buildPatientAppointmentRescheduledTemplate(
  recipientPhone: string,
  params: PatientAppointmentRescheduledTemplateParams
): WhatsAppTemplatePayload {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatWhatsAppRecipient(recipientPhone),
    type: 'template',
    template: {
      name: 'vshma_patient_appointment_rescheduled',
      language: {
        code: 'en',
      },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: params.patientName },
            { type: 'text', text: params.newDate },
            { type: 'text', text: params.newTime }, // Exact time e.g. "2:20 PM"
            { type: 'text', text: params.consultationType },
            { type: 'text', text: params.bookingReference },
          ],
        },
      ],
    },
  };
}

/**
 * Builds the official Meta WhatsApp Cloud API template payload for appointment cancellation.
 * Template: vshma_patient_appointment_cancelled (UTILITY category)
 */
export function buildPatientAppointmentCancelledTemplate(
  recipientPhone: string,
  params: PatientAppointmentCancelledTemplateParams
): WhatsAppTemplatePayload {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatWhatsAppRecipient(recipientPhone),
    type: 'template',
    template: {
      name: 'vshma_patient_appointment_cancelled',
      language: {
        code: 'en',
      },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: params.patientName },
            { type: 'text', text: params.bookingReference },
            { type: 'text', text: params.appointmentDate },
            { type: 'text', text: params.reason || 'Requested by clinic desk / patient' },
          ],
        },
      ],
    },
  };
}

/**
 * Builds the official Meta WhatsApp Cloud API template payload for automated reminders (24h / 2h).
 * Template: vshma_patient_appointment_reminder (UTILITY category)
 */
export function buildPatientAppointmentReminderTemplate(
  recipientPhone: string,
  params: PatientAppointmentReminderTemplateParams
): WhatsAppTemplatePayload {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: formatWhatsAppRecipient(recipientPhone),
    type: 'template',
    template: {
      name: 'vshma_patient_appointment_reminder',
      language: {
        code: 'en',
      },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: params.patientName },
            { type: 'text', text: params.appointmentDate },
            { type: 'text', text: params.exactTime },
            { type: 'text', text: params.reminderWindow },
            { type: 'text', text: params.bookingReference },
            { type: 'text', text: params.clinicLocation || 'VSHMA Homeopathy Clinic, Bengaluru' },
          ],
        },
      ],
    },
  };
}
