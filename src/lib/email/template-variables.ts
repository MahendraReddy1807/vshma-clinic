import { CLINIC_INFO } from '@/lib/constants';
import type { EmailTemplateVariables } from '@/lib/email/catalog';

export interface AppointmentEmailDetails {
  patientName?: string | null;
  patientEmail?: string | null;
  patientPhone?: string | null;
  bookingReference?: string | null;
  appointmentDate?: string | null;
  appointmentTime?: string | null;
  previousAppointmentDate?: string | null;
  previousAppointmentTime?: string | null;
  newAppointmentDate?: string | null;
  newAppointmentTime?: string | null;
  bookingCreatedAt?: string | null;
  reminderType?: '24h' | '2h';
  appointmentId?: string | null;
}

const siteUrl = () => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || 'https://vshma-clinic.vercel.app';
  try {
    const parsed = new URL(configured);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.origin : 'https://vshma-clinic.vercel.app';
  } catch {
    return 'https://vshma-clinic.vercel.app';
  }
};

function readableDate(value?: string | null, fallback = 'To be confirmed') {
  if (!value) return fallback;
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00+05:30` : value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

function readableTimestamp(value?: string | null) {
  if (!value) return 'Date and time not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date and time not available';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(date) + ' IST';
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function buildEmailVariables(details: AppointmentEmailDetails): EmailTemplateVariables {
  const origin = siteUrl();
  const reference = details.bookingReference || 'Reference unavailable';
  const reminderType = details.reminderType === '2h' ? '2-hour' : '24-hour';
  const variables: Record<string, string> = {
    CLINIC_NAME: CLINIC_INFO.fullName,
    DOCTOR_NAME: CLINIC_INFO.doctor,
    DOCTOR_QUALIFICATION: CLINIC_INFO.qualification,
    CLINIC_LOCATION: CLINIC_INFO.location,
    CLINIC_LOGO_URL: new URL('/logo-transparent.png', origin).toString(),
    CLINIC_URL: new URL('/book', origin).toString(),
    WHATSAPP_URL: CLINIC_INFO.whatsappUrl,
    PATIENT_NAME: details.patientName || 'Patient',
    PATIENT_EMAIL: details.patientEmail || 'Not provided',
    PATIENT_PHONE: details.patientPhone || 'Not provided',
    BOOKING_REFERENCE: reference,
    APPOINTMENT_DATE: readableDate(details.appointmentDate),
    APPOINTMENT_TIME: details.appointmentTime || 'Flexible',
    PREVIOUS_APPOINTMENT_DATE: readableDate(details.previousAppointmentDate, 'Previous date not available'),
    PREVIOUS_APPOINTMENT_TIME: details.previousAppointmentTime || 'Previous time not available',
    NEW_APPOINTMENT_DATE: readableDate(details.newAppointmentDate),
    NEW_APPOINTMENT_TIME: details.newAppointmentTime || 'Flexible',
    BOOKING_CREATED_AT: readableTimestamp(details.bookingCreatedAt),
    REMINDER_TYPE: reminderType,
    REMINDER_LEAD: details.reminderType === '2h' ? 'in about two hours' : 'tomorrow',
    ADMIN_DASHBOARD_URL: new URL(`/admin/appointments?search=${encodeURIComponent(reference)}`, origin).toString(),
  };

  for (const key of Object.keys(variables)) variables[key] = escapeHtml(variables[key]);
  return variables;
}
