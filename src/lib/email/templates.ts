import { CLINIC_INFO } from '@/lib/constants';

interface EmailTemplateProps {
  patientName: string;
  bookingReference: string;
  appointmentDate: string;
  preferredTime?: string | null;
  consultationType: string;
  rescheduledDate?: string | null;
  rescheduledTime?: string | null;
  reason?: string | null;
  confirmedAt?: string | null;
  phone?: string;
  email?: string;
}

const baseStyles = `
  body { margin: 0; padding: 0; background-color: #FAF9F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #202622; }
  .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1px solid #DCE8DD; }
  .header { background-color: #183D32; padding: 36px 32px; text-align: center; }
  .logo-title { font-size: 26px; font-weight: 700; color: #FAF9F4; letter-spacing: 1px; margin: 0; }
  .logo-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #B9A477; margin-top: 6px; }
  .content { padding: 36px 32px; }
  .salutation { font-size: 18px; font-weight: 600; color: #183D32; margin-bottom: 16px; }
  .lead { font-size: 15px; line-height: 1.6; color: #404843; margin-bottom: 24px; }
  .card { background-color: #FAF9F4; border: 1px solid #DCE8DD; border-radius: 14px; padding: 22px; margin-bottom: 26px; }
  .card-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #B9A477; margin: 0 0 12px 0; }
  .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #EAEFEA; font-size: 14px; }
  .detail-row:last-child { border-bottom: none; }
  .detail-label { color: #6C7A71; }
  .detail-value { font-weight: 600; color: #183D32; text-align: right; }
  .badge-ref { display: inline-block; background-color: #183D32; color: #FAF9F4; padding: 6px 14px; border-radius: 8px; font-family: monospace; font-size: 15px; font-weight: 700; letter-spacing: 1px; }
  .btn { display: inline-block; background-color: #B9A477; color: #10271F; text-decoration: none; padding: 13px 28px; border-radius: 50px; font-size: 14px; font-weight: 600; text-align: center; margin-top: 8px; }
  .footer { background-color: #FAF9F4; border-top: 1px solid #EAEFEA; padding: 26px 32px; text-align: center; font-size: 12px; color: #7B8880; line-height: 1.6; }
  .disclaimer { font-size: 11px; color: #8F9D95; margin-top: 14px; line-height: 1.5; }
`;

function wrapEmail(title: string, bodyContent: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${baseStyles}</style>
</head>
<body style="margin: 0; padding: 30px 10px; background-color: #FAF9F4;">
  <div class="wrapper">
    <div class="header">
      <h1 class="logo-title">${CLINIC_INFO.name}</h1>
      <div class="logo-sub">Homeopathy Clinic &bull; Bengaluru</div>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <div><strong>${CLINIC_INFO.fullName}</strong></div>
      <div>${CLINIC_INFO.doctor} (${CLINIC_INFO.qualification}) &bull; ${CLINIC_INFO.location}</div>
      <div style="margin-top: 6px;">WhatsApp Hotline: +91 ${CLINIC_INFO.phone}</div>
      <div class="disclaimer">
        Notice: Homeopathic consultations are elective appointments. For acute medical emergencies, please seek immediate assistance at your local hospital.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/* 1. Patient: Booking Request Received (Pending Review) */
export function renderBookingReceivedEmail(props: EmailTemplateProps): { html: string; text: string } {
  const html = wrapEmail(
    'Appointment Request Received - VSHMA',
    `
    <div class="salutation">Dear ${props.patientName},</div>
    <div class="lead">
      Thank you for reaching out to VSHMA Homeopathy Clinic. We have successfully logged your appointment reservation request.
    </div>

    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-size: 12px; text-transform: uppercase; color: #6C7A71; display: block; margin-bottom: 6px;">Your Booking Reference</span>
      <span class="badge-ref">${props.bookingReference}</span>
    </div>

    <div class="card">
      <div class="card-title">Requested Appointment Details</div>
      <div class="detail-row"><span class="detail-label">Consultation</span><span class="detail-value">${props.consultationType}</span></div>
      <div class="detail-row"><span class="detail-label">Requested Date</span><span class="detail-value">${props.appointmentDate}</span></div>
      <div class="detail-row"><span class="detail-label">Preferred Time</span><span class="detail-value">${props.preferredTime || 'Morning / Flexible'}</span></div>
      <div class="detail-row"><span class="detail-label">Doctor</span><span class="detail-value">${CLINIC_INFO.doctor}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value" style="color: #B45309;">Pending Confirmation</span></div>
    </div>

    <div class="lead" style="font-size: 14px;">
      <strong>What happens next?</strong><br>
      Our clinic team will review the doctor's schedule and send you an official confirmation email once your slot is locked in. If you have any urgent timing changes, you can message our WhatsApp concierge at +91 ${CLINIC_INFO.phone}.
    </div>
    `
  );

  const text = `
Dear ${props.patientName},

Thank you for reaching out to VSHMA Homeopathy Clinic. We have received your appointment request.

Booking Reference: ${props.bookingReference}
Consultation: ${props.consultationType}
Requested Date: ${props.appointmentDate}
Preferred Time: ${props.preferredTime || 'Flexible'}
Doctor: ${CLINIC_INFO.doctor} (${CLINIC_INFO.qualification})
Status: Pending Confirmation

Our clinic will review doctor availability and send an official confirmation shortly.

VSHMA Homeopathy Clinic
Bengaluru, Karnataka, India
WhatsApp: +91 ${CLINIC_INFO.phone}
  `.trim();

  return { html, text };
}

/* 2. Admin: New Appointment Alert */
export function renderAdminNewAppointmentEmail(props: EmailTemplateProps): { html: string; text: string } {
  const html = wrapEmail(
    `[New Booking] ${props.patientName} - ${props.bookingReference}`,
    `
    <div class="salutation" style="color: #183D32;">New Patient Appointment Request</div>
    <div class="lead">
      A new consultation booking request has been submitted on the VSHMA website.
    </div>

    <div class="card">
      <div class="card-title">Booking Summary</div>
      <div class="detail-row"><span class="detail-label">Reference ID</span><span class="detail-value" style="font-family: monospace;">${props.bookingReference}</span></div>
      <div class="detail-row"><span class="detail-label">Patient Name</span><span class="detail-value">${props.patientName}</span></div>
      <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">+91 ${props.phone}</span></div>
      <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${props.email || 'Not provided'}</span></div>
      <div class="detail-row"><span class="detail-label">Consultation</span><span class="detail-value">${props.consultationType}</span></div>
      <div class="detail-row"><span class="detail-label">Requested Date</span><span class="detail-value">${props.appointmentDate}</span></div>
      <div class="detail-row"><span class="detail-label">Preferred Slot</span><span class="detail-value">${props.preferredTime || 'Any slot'}</span></div>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="https://vshma-clinic.vercel.app/admin/appointments" class="btn">
        Open Admin Dashboard to Confirm
      </a>
    </div>
    `
  );

  const text = `
NEW PATIENT APPOINTMENT REQUEST

Reference ID: ${props.bookingReference}
Patient Name: ${props.patientName}
Phone: +91 ${props.phone}
Email: ${props.email || 'Not provided'}
Consultation: ${props.consultationType}
Requested Date: ${props.appointmentDate}
Preferred Slot: ${props.preferredTime || 'Any'}

Review & confirm in the admin dashboard:
https://vshma-clinic.vercel.app/admin/appointments
  `.trim();

  return { html, text };
}

/* 3. Patient: Appointment Confirmed */
export function renderAppointmentConfirmedEmail(props: EmailTemplateProps): { html: string; text: string } {
  const html = wrapEmail(
    `Appointment Confirmed: ${props.appointmentDate} - VSHMA`,
    `
    <div class="salutation">Dear ${props.patientName},</div>
    <div class="lead" style="color: #047857; font-weight: 600;">
      Your appointment with ${CLINIC_INFO.doctor} is officially confirmed!
    </div>

    <div class="card">
      <div class="card-title">Confirmed Schedule</div>
      <div class="detail-row"><span class="detail-label">Booking Reference</span><span class="detail-value" style="font-family: monospace;">${props.bookingReference}</span></div>
      <div class="detail-row"><span class="detail-label">Consultation</span><span class="detail-value">${props.consultationType}</span></div>
      <div class="detail-row"><span class="detail-label">Confirmed Date</span><span class="detail-value" style="color: #047857; font-weight: 700;">${props.appointmentDate}</span></div>
      <div class="detail-row"><span class="detail-label">Time Window</span><span class="detail-value">${props.preferredTime || 'Scheduled'}</span></div>
      <div class="detail-row"><span class="detail-label">Practitioner</span><span class="detail-value">${CLINIC_INFO.doctor} (${CLINIC_INFO.qualification})</span></div>
      <div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">${CLINIC_INFO.location}</span></div>
    </div>

    <div class="lead" style="font-size: 14px;">
      <strong>Consultation Guidelines:</strong>
      <ul style="padding-left: 20px; margin-top: 8px;">
        <li>Please arrive or log into the session 5 minutes prior to your time.</li>
        <li>Have a summary of any previous medical prescriptions or lab investigations ready.</li>
        <li>Avoid consuming strong-smelling substances (e.g. coffee, camphor, raw garlic) 15 minutes before your consultation.</li>
      </ul>
    </div>
    `
  );

  const text = `
Dear ${props.patientName},

Your appointment with ${CLINIC_INFO.doctor} at VSHMA Homeopathy Clinic is officially CONFIRMED!

Booking Reference: ${props.bookingReference}
Consultation: ${props.consultationType}
Confirmed Date: ${props.appointmentDate}
Time Window: ${props.preferredTime || 'Scheduled'}
Location: ${CLINIC_INFO.location}

Please arrive or connect 5 minutes before your slot.

VSHMA Homeopathy Clinic
Bengaluru, Karnataka, India
WhatsApp Hotline: +91 ${CLINIC_INFO.phone}
  `.trim();

  return { html, text };
}

/* 4. Patient: Appointment Rescheduled */
export function renderAppointmentRescheduledEmail(props: EmailTemplateProps): { html: string; text: string } {
  const newDate = props.rescheduledDate || props.appointmentDate;
  const newTime = props.rescheduledTime || props.preferredTime;

  const html = wrapEmail(
    `Appointment Rescheduled - ${props.bookingReference}`,
    `
    <div class="salutation">Dear ${props.patientName},</div>
    <div class="lead">
      Your upcoming consultation at VSHMA Homeopathy Clinic has been rescheduled to a new date and time.
    </div>

    <div class="card">
      <div class="card-title">Updated Appointment Schedule</div>
      <div class="detail-row"><span class="detail-label">Booking Reference</span><span class="detail-value">${props.bookingReference}</span></div>
      <div class="detail-row"><span class="detail-label">New Date</span><span class="detail-value" style="color: #183D32; font-weight: 700;">${newDate}</span></div>
      <div class="detail-row"><span class="detail-label">New Time Slot</span><span class="detail-value">${newTime || 'To be specified'}</span></div>
      <div class="detail-row"><span class="detail-label">Consultation</span><span class="detail-value">${props.consultationType}</span></div>
      <div class="detail-row"><span class="detail-label">Doctor</span><span class="detail-value">${CLINIC_INFO.doctor}</span></div>
      ${props.reason ? `<div class="detail-row"><span class="detail-label">Reason</span><span class="detail-value">${props.reason}</span></div>` : ''}
    </div>

    <div class="lead" style="font-size: 14px;">
      If this updated time is inconvenient, please reply to this email or message us directly on WhatsApp at +91 ${CLINIC_INFO.phone} to pick an alternate slot.
    </div>
    `
  );

  const text = `
Dear ${props.patientName},

Your upcoming consultation at VSHMA Homeopathy Clinic has been rescheduled.

Booking Reference: ${props.bookingReference}
New Date: ${newDate}
New Time Slot: ${newTime || 'Scheduled'}
Doctor: ${CLINIC_INFO.doctor}
${props.reason ? `Reason: ${props.reason}\n` : ''}

If this does not work for you, reach out on WhatsApp at +91 ${CLINIC_INFO.phone}.

VSHMA Homeopathy Clinic
  `.trim();

  return { html, text };
}

/* 5. Patient: Appointment Cancelled */
export function renderAppointmentCancelledEmail(props: EmailTemplateProps): { html: string; text: string } {
  const html = wrapEmail(
    `Appointment Cancelled - ${props.bookingReference}`,
    `
    <div class="salutation">Dear ${props.patientName},</div>
    <div class="lead">
      This is to confirm that your appointment request (Ref: <strong>${props.bookingReference}</strong>) scheduled for ${props.appointmentDate} has been cancelled.
    </div>

    ${props.reason ? `
    <div class="card">
      <div class="card-title">Cancellation Reason</div>
      <div style="font-size: 14px; color: #404843;">${props.reason}</div>
    </div>
    ` : ''}

    <div class="lead" style="font-size: 14px;">
      Whenever you are ready to book another consultation, you may visit our website or reach out directly via WhatsApp.
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="https://vshma-clinic.vercel.app/book" class="btn">
        Book a Future Consultation
      </a>
    </div>
    `
  );

  const text = `
Dear ${props.patientName},

Your appointment (Ref: ${props.bookingReference}) for ${props.appointmentDate} has been cancelled.
${props.reason ? `Reason: ${props.reason}\n` : ''}
Whenever you wish to schedule in the future, visit https://vshma-clinic.vercel.app/book or contact us on WhatsApp (+91 ${CLINIC_INFO.phone}).

VSHMA Homeopathy Clinic
  `.trim();

  return { html, text };
}

/* 6. Patient: Automated Reminders (24h or 2h before visit) */
export function renderAppointmentReminderEmail(
  props: EmailTemplateProps,
  reminderType: '24h' | '2h'
): { html: string; text: string } {
  const timeLabel = reminderType === '24h' ? 'tomorrow' : 'in approximately 2 hours';
  const heading = reminderType === '24h' ? 'Upcoming Appointment Tomorrow' : 'Appointment Reminder: Starting Soon';

  const html = wrapEmail(
    `${heading} - VSHMA Clinic`,
    `
    <div class="salutation">Dear ${props.patientName},</div>
    <div class="lead">
      This is a friendly reminder that your homeopathic consultation with ${CLINIC_INFO.doctor} is scheduled for <strong>${timeLabel}</strong>.
    </div>

    <div class="card">
      <div class="card-title">Your Appointment Summary</div>
      <div class="detail-row"><span class="detail-label">Reference</span><span class="detail-value" style="font-family: monospace;">${props.bookingReference}</span></div>
      <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value" style="color: #183D32; font-weight: 700;">${props.appointmentDate}</span></div>
      <div class="detail-row"><span class="detail-label">Time Window</span><span class="detail-value">${props.preferredTime || 'Scheduled'}</span></div>
      <div class="detail-row"><span class="detail-label">Consultation</span><span class="detail-value">${props.consultationType}</span></div>
      <div class="detail-row"><span class="detail-label">Location</span><span class="detail-value">${CLINIC_INFO.location}</span></div>
    </div>

    <div class="lead" style="font-size: 14px;">
      Need directions or wish to reschedule? Reach out directly via WhatsApp at +91 ${CLINIC_INFO.phone}.
    </div>
    `
  );

  const text = `
Dear ${props.patientName},

Reminder: Your consultation with ${CLINIC_INFO.doctor} at VSHMA Homeopathy Clinic is scheduled for ${timeLabel}.

Reference: ${props.bookingReference}
Date: ${props.appointmentDate}
Time: ${props.preferredTime || 'Scheduled'}
Location: ${CLINIC_INFO.location}

If you need assistance, contact WhatsApp +91 ${CLINIC_INFO.phone}.

VSHMA Homeopathy Clinic
  `.trim();

  return { html, text };
}
