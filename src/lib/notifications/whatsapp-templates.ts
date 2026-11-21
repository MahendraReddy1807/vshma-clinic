/**
 * VSHMA WhatsApp Message Templates
 * Formatted with warm, elegant tone, clear details, and IST timestamps.
 * Variables stored in {{1}}, {{2}} Meta-ready format.
 */

export interface WhatsAppTemplateData {
  patientName: string;
  doctorName?: string;
  referenceNumber: string;
  appointmentDate: string; // e.g. "Sat, 28 Nov 2026"
  appointmentTime: string; // e.g. "10:30 AM IST"
  consultationType: string;
  mode?: string;
  location?: string;
  actionUrl?: string;
  oldDate?: string;
  oldTime?: string;
  clinicPhone?: string;
}

export const WHATSAPP_TEMPLATES = {
  booking_received: (d: WhatsAppTemplateData) =>
    [
      `*VSHMA HOMEOPATHY CLINIC*`,
      `*Appointment Request Received* 🌿`,
      ``,
      `Dear ${d.patientName},`,
      `We have received your consultation request for *${d.consultationType}*.`,
      ``,
      `📅 *Requested Date:* ${d.appointmentDate}`,
      `⏰ *Preferred Time:* ${d.appointmentTime}`,
      `🔖 *Reference:* ${d.referenceNumber}`,
      ``,
      `Our clinic team is reviewing doctor availability and will send your confirmation shortly.`,
      ``,
      `WhatsApp Concierge: +91 7416001477`,
      `— Dr. Chihnitha Reddy T & the VSHMA Clinic Team`,
    ].join('\n'),

  confirmed: (d: WhatsAppTemplateData) =>
    [
      `*VSHMA HOMEOPATHY CLINIC*`,
      `*Appointment Confirmed* ✅`,
      ``,
      `Dear ${d.patientName},`,
      `Your consultation with *${d.doctorName || 'Dr. Chihnitha Reddy T'}* is confirmed.`,
      ``,
      `📅 *Date:* ${d.appointmentDate}`,
      `⏰ *Time:* ${d.appointmentTime}`,
      `🌿 *Mode:* ${d.mode || 'In-Clinic Consultation'}`,
      `📍 *Location:* ${d.location || 'Bengaluru, Karnataka (By Prior Appointment)'}`,
      `🔖 *Reference:* ${d.referenceNumber}`,
      ``,
      d.actionUrl ? `Manage / Reschedule: ${d.actionUrl}\n` : '',
      `Please arrive 10 minutes prior to your slot. We look forward to welcoming you.`,
      ``,
      `— VSHMA Homeopathy Clinic`,
    ].join('\n'),

  rescheduled: (d: WhatsAppTemplateData) =>
    [
      `*VSHMA HOMEOPATHY CLINIC*`,
      `*Appointment Rescheduled* 🗓️`,
      ``,
      `Dear ${d.patientName},`,
      `Your appointment has been successfully updated.`,
      ``,
      `• *Previous Slot:* ${d.oldDate || 'Original Date'} at ${d.oldTime || 'Original Time'}`,
      `• *New Slot:* *${d.appointmentDate}* at *${d.appointmentTime}*`,
      `• *Reference:* ${d.referenceNumber}`,
      ``,
      d.actionUrl ? `View Details: ${d.actionUrl}\n` : '',
      `All reminders have been adjusted to your new consultation time.`,
      ``,
      `— VSHMA Homeopathy Clinic`,
    ].join('\n'),

  cancelled: (d: WhatsAppTemplateData) =>
    [
      `*VSHMA HOMEOPATHY CLINIC*`,
      `*Appointment Cancelled*`,
      ``,
      `Dear ${d.patientName},`,
      `Your appointment (Ref: ${d.referenceNumber}) for ${d.appointmentDate} has been cancelled.`,
      ``,
      `Whenever you are ready to resume care, you may request a new slot anytime:`,
      `👉 https://vshma.in/book`,
      ``,
      `Wishing you peace and good health,`,
      `— VSHMA Homeopathy Clinic`,
    ].join('\n'),

  completed: (d: WhatsAppTemplateData) =>
    [
      `*VSHMA HOMEOPATHY CLINIC*`,
      `*Thank You for Visiting* 🌿`,
      ``,
      `Dear ${d.patientName},`,
      `Thank you for consulting with Dr. Chihnitha Reddy T today.`,
      ``,
      `Please follow your prescribed constitutional dosage rhythms. If you have questions regarding your prescription, message us here directly.`,
      ``,
      `For your continuity follow-up consultation in 3–4 weeks:`,
      `👉 https://vshma.in/book`,
      ``,
      `— Dr. Chihnitha Reddy T, VSHMA Clinic`,
    ].join('\n'),

  no_show: (d: WhatsAppTemplateData) =>
    [
      `*VSHMA HOMEOPATHY CLINIC*`,
      ``,
      `Dear ${d.patientName},`,
      `We missed you at your scheduled consultation today (${d.appointmentDate}, ${d.appointmentTime}). We understand unexpected schedule changes occur.`,
      ``,
      `If you would like to reschedule your consultation, please visit:`,
      `👉 https://vshma.in/book`,
      ``,
      `— VSHMA Homeopathy Clinic`,
    ].join('\n'),

  reminder_24h: (d: WhatsAppTemplateData) =>
    [
      `*VSHMA CLINIC REMINDER* ⏰`,
      `*Your Consultation Tomorrow*`,
      ``,
      `Dear ${d.patientName},`,
      `This is a gentle reminder that your appointment with Dr. Chihnitha Reddy T is scheduled for *tomorrow*:`,
      ``,
      `📅 *Date:* ${d.appointmentDate}`,
      `⏰ *Time:* ${d.appointmentTime}`,
      `🔖 *Ref:* ${d.referenceNumber}`,
      ``,
      d.actionUrl ? `Directions & Reschedule: ${d.actionUrl}\n` : '',
      `If you need to adjust your time, please let us know today.`,
      `— VSHMA Homeopathy Clinic`,
    ].join('\n'),

  reminder_2h: (d: WhatsAppTemplateData) =>
    [
      `*VSHMA CLINIC REMINDER* 🔔`,
      `*Your Appointment in 2 Hours*`,
      ``,
      `Dear ${d.patientName},`,
      `Dr. Chihnitha Reddy T is preparing for your consultation today at *${d.appointmentTime}*.`,
      ``,
      `📍 *Location:* ${d.location || 'Bengaluru, Karnataka'}`,
      `Please plan to arrive 10 minutes early. Map & directions: https://vshma.in/contact`,
      ``,
      `— VSHMA Homeopathy Clinic`,
    ].join('\n'),

  reminder_1h: (d: WhatsAppTemplateData) =>
    [
      `*VSHMA CLINIC* ⏳`,
      `Dear ${d.patientName}, your consultation begins in *1 hour* at *${d.appointmentTime}*.`,
      `We look forward to seeing you shortly.`,
      `— VSHMA Homeopathy Clinic`,
    ].join('\n'),

  reminder_10m: (d: WhatsAppTemplateData) =>
    [
      `*VSHMA CLINIC* 🚪`,
      `Dear ${d.patientName}, your consultation slot with Dr. Chihnitha is ready. Please step into the clinic consultation room.`,
      `— VSHMA Homeopathy Clinic`,
    ].join('\n'),

  doctor_reminder_1h: (d: WhatsAppTemplateData) =>
    [
      `*DOCTOR SCHEDULE ALERT* 📋`,
      `Upcoming consultation in *1 hour*:`,
      `• *Patient:* ${d.patientName}`,
      `• *Time:* ${d.appointmentTime}`,
      `• *Type:* ${d.consultationType}`,
      `• *Ref:* ${d.referenceNumber}`,
      `Portal: https://vshma.in/admin/appointments`,
    ].join('\n'),

  doctor_reminder_10m: (d: WhatsAppTemplateData) =>
    [
      `*DOCTOR ALERT* 🔔`,
      `Next patient scheduled in *10 minutes*:`,
      `• *Patient:* ${d.patientName} (${d.appointmentTime})`,
      `• *Type:* ${d.consultationType}`,
    ].join('\n'),

  doctor_daily_digest: (d: { doctorName: string; dateStr: string; appointmentsList: string; totalCount: number }) =>
    [
      `*VSHMA CLINIC - DAILY MORNING SCHEDULE* ☀️`,
      `Good morning, ${d.doctorName}.`,
      `Date: *${d.dateStr}* (IST)`,
      `Total Scheduled: *${d.totalCount} appointments*`,
      ``,
      d.appointmentsList,
      ``,
      `Portal: https://vshma.in/admin/appointments`,
    ].join('\n'),
};
