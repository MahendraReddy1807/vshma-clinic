import type { NotificationType } from '@/types';

export const EMAIL_TEMPLATE_BY_EVENT = {
  booking_received: 'vshma-appointment-request',
  appointment_confirmed: 'vshma-appointment-confirmed',
  appointment_rescheduled: 'vshma-appointment-rescheduled',
  appointment_cancelled: 'vshma-appointment-cancelled',
  reminder_24h: 'vshma-appointment-reminder',
  reminder_2h: 'vshma-appointment-reminder',
  admin_new_booking: 'vshma-admin-new-booking',
} as const satisfies Record<NotificationType, string>;

export const EMAIL_SUBJECT_BY_EVENT: Record<NotificationType, string> = {
  booking_received: 'We received your appointment request | VSHMA Clinic',
  appointment_confirmed: 'Your appointment is confirmed | VSHMA Clinic',
  appointment_rescheduled: 'Your appointment has been rescheduled | VSHMA Clinic',
  appointment_cancelled: 'Appointment update | VSHMA Clinic',
  reminder_24h: 'Reminder: Your upcoming VSHMA appointment',
  reminder_2h: 'Reminder: Your upcoming VSHMA appointment',
  admin_new_booking: 'New appointment request received | VSHMA',
};

export type EmailTemplateAlias = (typeof EMAIL_TEMPLATE_BY_EVENT)[NotificationType];
export type EmailTemplateVariables = Record<string, string | number>;
