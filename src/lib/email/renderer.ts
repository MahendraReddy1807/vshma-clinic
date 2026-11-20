import {
  renderBookingReceivedEmail,
  renderAdminNewAppointmentEmail,
  renderAppointmentConfirmedEmail,
  renderAppointmentRescheduledEmail,
  renderAppointmentCancelledEmail,
  renderAppointmentReminderEmail,
} from '@/lib/email/templates';
import type { NotificationType } from '@/types';

export function renderEmailTemplate(
  notificationType: NotificationType,
  variables: Record<string, string | number>
): { html: string; text: string } {
  const props = {
    patientName: String(variables.PATIENT_NAME || 'Patient'),
    bookingReference: String(variables.BOOKING_REFERENCE || 'VSHMA-REF'),
    appointmentDate: String(variables.APPOINTMENT_DATE || variables.NEW_APPOINTMENT_DATE || 'Scheduled Date'),
    preferredTime: String(variables.APPOINTMENT_TIME || variables.NEW_APPOINTMENT_TIME || 'Scheduled Window'),
    consultationType: String(variables.CONSULTATION_TYPE || 'Homeopathic Consultation'),
    rescheduledDate: variables.NEW_APPOINTMENT_DATE ? String(variables.NEW_APPOINTMENT_DATE) : undefined,
    rescheduledTime: variables.NEW_APPOINTMENT_TIME ? String(variables.NEW_APPOINTMENT_TIME) : undefined,
    reason: variables.REASON ? String(variables.REASON) : undefined,
    phone: variables.PATIENT_PHONE ? String(variables.PATIENT_PHONE) : undefined,
    email: variables.PATIENT_EMAIL ? String(variables.PATIENT_EMAIL) : undefined,
  };

  switch (notificationType) {
    case 'booking_received':
      return renderBookingReceivedEmail(props);
    case 'admin_new_booking':
      return renderAdminNewAppointmentEmail(props);
    case 'appointment_confirmed':
      return renderAppointmentConfirmedEmail(props);
    case 'appointment_rescheduled':
      return renderAppointmentRescheduledEmail(props);
    case 'appointment_cancelled':
      return renderAppointmentCancelledEmail(props);
    case 'reminder_24h':
      return renderAppointmentReminderEmail(props, '24h');
    case 'reminder_2h':
      return renderAppointmentReminderEmail(props, '2h');
    default:
      return renderBookingReceivedEmail(props);
  }
}
