import { CLINIC_INFO } from '@/lib/constants';

export interface EmailTemplateProps {
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
  body {
    margin: 0;
    padding: 0;
    background-color: #F6F5F0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #1F2823;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  table {
    border-collapse: collapse;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
  }
  td {
    padding: 0;
  }
  .wrapper {
    width: 100%;
    max-width: 620px;
    margin: 0 auto;
    background-color: #FFFFFF;
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid #E5E0D4;
    box-shadow: 0 8px 30px rgba(12, 35, 26, 0.05);
  }
  .header {
    background-color: #0C231A;
    border-top: 3px solid #C5A869;
    padding: 42px 36px 36px;
    text-align: center;
  }
  .clinic-emblem {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 3.5px;
    text-transform: uppercase;
    color: #C5A869;
    margin-bottom: 8px;
  }
  .logo-title {
    font-family: Georgia, 'Playfair Display', Baskerville, serif;
    font-size: 28px;
    font-weight: 400;
    color: #FAF8F2;
    letter-spacing: 1.5px;
    margin: 0;
  }
  .logo-sub {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 3px;
    color: #D8C69D;
    margin-top: 8px;
    opacity: 0.9;
  }
  .gold-divider {
    width: 44px;
    height: 1px;
    background-color: #C5A869;
    margin: 14px auto 0;
  }
  .content {
    padding: 40px 36px 32px;
  }
  .salutation {
    font-family: Georgia, 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 500;
    color: #0C231A;
    margin-bottom: 14px;
    letter-spacing: 0.3px;
  }
  .lead {
    font-size: 15px;
    line-height: 1.68;
    color: #3C4740;
    margin-bottom: 26px;
  }
  .voucher-card {
    background-color: #FAF9F5;
    border: 1px solid #E6E1D4;
    border-radius: 14px;
    padding: 22px 24px;
    margin-bottom: 26px;
  }
  .care-protocol {
    background-color: #F4F8F5;
    border-left: 3px solid #184A36;
    border-radius: 0 10px 10px 0;
    padding: 18px 22px;
    margin-bottom: 28px;
  }
  .protocol-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #184A36;
    margin: 0 0 10px 0;
  }
  .protocol-item {
    font-size: 13px;
    line-height: 1.6;
    color: #384A3F;
    margin-bottom: 8px;
  }
  .protocol-item:last-child {
    margin-bottom: 0;
  }
  .doctor-signoff {
    padding-top: 20px;
    border-top: 1px solid #EDE8DC;
    margin-top: 26px;
  }
  .signoff-lead {
    font-size: 14px;
    color: #637067;
    margin-bottom: 6px;
  }
  .signoff-name {
    font-family: Georgia, 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 600;
    color: #0C231A;
    margin: 0;
  }
  .signoff-title {
    font-size: 12px;
    color: #8C7545;
    margin-top: 3px;
    letter-spacing: 0.5px;
  }
  .btn-primary {
    display: inline-block;
    background-color: #0C231A;
    color: #FAF8F2 !important;
    text-decoration: none;
    padding: 13px 30px;
    border-radius: 50px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    text-align: center;
    border: 1px solid #C5A869;
  }
  .btn-secondary {
    display: inline-block;
    background-color: #FFFFFF;
    color: #0C231A !important;
    text-decoration: none;
    padding: 11px 26px;
    border-radius: 50px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-align: center;
    border: 1px solid #D6D0C3;
    margin-top: 10px;
  }
  .footer {
    background-color: #FAF9F5;
    border-top: 1px solid #EAE5D9;
    padding: 32px 36px 36px;
    text-align: center;
    font-size: 12px;
    color: #727E76;
    line-height: 1.65;
  }
  .footer-brand {
    font-family: Georgia, serif;
    font-size: 14px;
    font-weight: 600;
    color: #0C231A;
    letter-spacing: 0.5px;
  }
  .footer-sub {
    font-size: 11px;
    color: #8C7545;
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
  }
  .footer-contacts {
    margin-top: 12px;
    font-size: 12px;
    color: #556259;
  }
  .footer-contacts a {
    color: #184A36;
    text-decoration: none;
    font-weight: 600;
  }
  .disclaimer {
    font-size: 11px;
    color: #8C9890;
    margin-top: 18px;
    line-height: 1.55;
    padding-top: 14px;
    border-top: 1px solid #ECE7DC;
  }
`;

function renderVoucherHeader(title: string, reference: string, titleColor = '#A38548'): string {
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #EDE8DC; margin-bottom: 12px;">
    <tr>
      <td align="left" valign="middle" style="padding-bottom: 12px; text-align: left; vertical-align: middle;">
        <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: ${titleColor};">${title}</span>
      </td>
      <td align="right" valign="middle" style="padding-bottom: 12px; text-align: right; vertical-align: middle;">
        <span style="display: inline-block; background-color: #0C231A; color: #FAF8F2; padding: 5px 12px; border-radius: 6px; font-family: 'Courier New', Courier, monospace; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; border: 1px solid #C5A869;">${reference}</span>
      </td>
    </tr>
  </table>
  `.trim();
}

function renderDetailRow(label: string, valueHtml: string, isLast = false): string {
  const borderBottom = isLast ? '' : 'border-bottom: 1px solid #EFEBE0;';
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; ${borderBottom}">
    <tr>
      <td align="left" valign="middle" style="padding: 10px 0; text-align: left; vertical-align: middle; width: 44%;">
        <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #727F76; font-size: 12px; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 500;">${label}</span>
      </td>
      <td align="right" valign="middle" style="padding: 10px 0; text-align: right; vertical-align: middle; width: 56%;">
        <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-weight: 600; color: #0C231A; font-size: 14px;">${valueHtml}</span>
      </td>
    </tr>
  </table>
  `.trim();
}

function wrapEmail(title: string, bodyContent: string, preheaderText = ''): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>${baseStyles}</style>
</head>
<body style="margin: 0; padding: 32px 12px; background-color: #F6F5F0;">
  <!-- Preheader text for inbox preview -->
  <div style="display: none; max-height: 0px; overflow: hidden; font-size: 1px; line-height: 1px; color: #F6F5F0; opacity: 0;">
    ${preheaderText || title} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center">
        <div class="wrapper">
          <!-- Premium Header -->
          <div class="header">
            <div class="clinic-emblem">Classical Homeopathy</div>
            <h1 class="logo-title">${CLINIC_INFO.name}</h1>
            <div class="logo-sub">Holistic Medicine &bull; Bengaluru</div>
            <div class="gold-divider"></div>
          </div>

          <!-- Main Content -->
          <div class="content">
            ${bodyContent}
          </div>

          <!-- Executive Footer -->
          <div class="footer">
            <div class="footer-brand">${CLINIC_INFO.fullName}</div>
            <div class="footer-sub">${CLINIC_INFO.doctor} (${CLINIC_INFO.qualification}) &bull; ${CLINIC_INFO.location}</div>
            
            <div class="footer-contacts">
              WhatsApp Concierge: <a href="${CLINIC_INFO.whatsappUrl}">+91 ${CLINIC_INFO.phone}</a>
              &bull; Web: <a href="https://vshma-clinic.vercel.app">vshma-clinic.vercel.app</a>
            </div>

            <div class="disclaimer">
              Notice: Homeopathic consultations are elective appointments. For acute medical emergencies, please seek immediate assistance at your nearest hospital or emergency center.
              <br><br>
              &copy; ${new Date().getFullYear()} VSHMA Homeopathy Clinic. All rights reserved. Confidential medical communication.
            </div>
          </div>
        </div>
      </td>
    </tr>
  </table>
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
      Thank you for entrusting your health to <strong>VSHMA Homeopathy Clinic</strong>. We have successfully received your consultation request and our clinical staff has logged your dossier for schedule review.
    </div>

    <div class="voucher-card">
      ${renderVoucherHeader('Reservation Dossier', props.bookingReference, '#A38548')}
      ${renderDetailRow('Consultation Type', props.consultationType)}
      ${renderDetailRow('Requested Date', `<span style="color: #0C231A; font-weight: 700;">${props.appointmentDate}</span>`)}
      ${renderDetailRow('Preferred Time', props.preferredTime || 'Flexible / Morning')}
      ${renderDetailRow('Lead Practitioner', `${CLINIC_INFO.doctor} (${CLINIC_INFO.qualification})`)}
      ${renderDetailRow('Booking Status', '<span style="display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; background-color: #FDF8E8; color: #78530E; border: 1px solid #F0DC9B;">Under Review</span>', true)}
    </div>

    <div class="care-protocol">
      <div class="protocol-title">✦ Next Steps in Your Care Journey</div>
      <div class="protocol-item">&bull; <strong>Clinical Review:</strong> Dr. Chihnitha Reddy T personally reviews the appointment queue to ensure sufficient dedicated time for each patient.</div>
      <div class="protocol-item">&bull; <strong>Official Confirmation:</strong> As soon as your specific time slot is locked into the schedule, you will receive an official confirmation notice.</div>
      <div class="protocol-item">&bull; <strong>Direct Concierge:</strong> If your schedule requires an urgent modification, please message our WhatsApp concierge directly.</div>
    </div>

    <div style="text-align: center; margin: 28px 0 20px;">
      <a href="${CLINIC_INFO.whatsappUrl}" class="btn-primary">
        Message Clinic Concierge on WhatsApp
      </a>
    </div>

    <div class="doctor-signoff">
      <div class="signoff-lead">In dedicated service to your well-being,</div>
      <div class="signoff-name">${CLINIC_INFO.doctor}</div>
      <div class="signoff-title">${CLINIC_INFO.qualificationFull} &bull; VSHMA Clinic</div>
    </div>
    `,
    `We have received your appointment request (${props.bookingReference}) for ${props.appointmentDate}.`
  );

  const text = `
VSHMA HOMEOPATHY CLINIC
Classical Homeopathy • Bengaluru
--------------------------------------------------

Dear ${props.patientName},

Thank you for choosing VSHMA Homeopathy Clinic. We have successfully logged your appointment reservation request.

RESERVATION DETAILS:
- Booking Reference: ${props.bookingReference}
- Consultation: ${props.consultationType}
- Requested Date: ${props.appointmentDate}
- Preferred Time: ${props.preferredTime || 'Flexible'}
- Doctor: ${CLINIC_INFO.doctor} (${CLINIC_INFO.qualification})
- Status: Under Review

WHAT HAPPENS NEXT:
Our clinical staff will review doctor availability and send you an official confirmation once your appointment time is confirmed.

Need urgent adjustments?
WhatsApp Concierge: +91 ${CLINIC_INFO.phone}

Warm regards,
${CLINIC_INFO.doctor}
${CLINIC_INFO.qualificationFull}
VSHMA Homeopathy Clinic, Bengaluru
  `.trim();

  return { html, text };
}

/* 2. Admin: New Appointment Alert */
export function renderAdminNewAppointmentEmail(props: EmailTemplateProps): { html: string; text: string } {
  const html = wrapEmail(
    `[New Booking Alert] ${props.patientName} - ${props.bookingReference}`,
    `
    <div class="salutation" style="color: #0C231A;">New Consultation Request</div>
    <div class="lead">
      A new patient has submitted a consultation booking request via the VSHMA portal. Please review the schedule and confirm or adjust the slot.
    </div>

    <div class="voucher-card">
      ${renderVoucherHeader('Patient Dossier', props.bookingReference, '#A38548')}
      ${renderDetailRow('Patient Name', `<span style="font-weight: 700; color: #0C231A;">${props.patientName}</span>`)}
      ${renderDetailRow('Phone Contact', `+91 ${props.phone}`)}
      ${renderDetailRow('Email Address', props.email || 'Not provided')}
      ${renderDetailRow('Consultation Category', props.consultationType)}
      ${renderDetailRow('Requested Date', `<span style="color: #0C231A; font-weight: 700;">${props.appointmentDate}</span>`)}
      ${renderDetailRow('Preferred Time', props.preferredTime || 'Any slot', true)}
    </div>

    <div style="text-align: center; margin: 28px 0 16px;">
      <a href="https://vshma-clinic.vercel.app/admin/appointments" class="btn-primary">
        Open Staff Dashboard to Confirm Slot
      </a>
    </div>
    `,
    `New booking request from ${props.patientName} (Ref: ${props.bookingReference}) for ${props.appointmentDate}.`
  );

  const text = `
NEW PATIENT CONSULTATION ALERT - VSHMA
--------------------------------------------------

Reference ID: ${props.bookingReference}
Patient Name: ${props.patientName}
Phone: +91 ${props.phone}
Email: ${props.email || 'Not provided'}
Consultation: ${props.consultationType}
Requested Date: ${props.appointmentDate}
Preferred Time: ${props.preferredTime || 'Any slot'}

Review and lock in the appointment:
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
    <div class="lead">
      We are delighted to confirm your upcoming consultation with <strong>${CLINIC_INFO.doctor}</strong> at VSHMA Homeopathy Clinic. Your dedicated session has been reserved.
    </div>

    <div class="voucher-card" style="border: 1px solid #C1E6D3; background: #FAFDFB;">
      ${renderVoucherHeader('Confirmed Consultation Voucher', props.bookingReference, '#0C5E3B')}
      ${renderDetailRow('Consultation Status', '<span style="display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; background-color: #EBF7EE; color: #0C5E3B; border: 1px solid #B8E5C4;">Officially Confirmed</span>')}
      ${renderDetailRow('Confirmed Date', `<span style="color: #0C5E3B; font-weight: 700; font-size: 16px;">${props.appointmentDate}</span>`)}
      ${renderDetailRow('Exact Time (IST)', `<span style="color: #0C231A; font-weight: 700;">${props.preferredTime || 'Scheduled Slot'}</span>`)}
      ${renderDetailRow('Consultation Category', props.consultationType)}
      ${renderDetailRow('Lead Practitioner', `${CLINIC_INFO.doctor} (${CLINIC_INFO.qualification})`)}
      ${renderDetailRow('Clinic Location', CLINIC_INFO.location, true)}
    </div>

    <div class="care-protocol">
      <div class="protocol-title">✦ Clinical Care Guidelines for Best Outcomes</div>
      <div class="protocol-item">&bull; <strong>Punctuality:</strong> Kindly arrive at the clinic or connect to the virtual session 5 minutes before your time.</div>
      <div class="protocol-item">&bull; <strong>Sensory Preparation:</strong> Refrain from consuming coffee, mint, raw garlic, or strongly scented spices 15 minutes prior to the consultation to maintain homeopathic clarity.</div>
      <div class="protocol-item">&bull; <strong>Medical Records:</strong> Please keep any recent laboratory reports, discharge summaries, or current medication lists ready for review.</div>
    </div>

    <div style="text-align: center; margin: 28px 0 20px;">
      <a href="${CLINIC_INFO.whatsappUrl}" class="btn-primary">
        Contact Clinic Concierge on WhatsApp
      </a>
    </div>

    <div class="doctor-signoff">
      <div class="signoff-lead">We look forward to guiding you on your path to vibrant health,</div>
      <div class="signoff-name">${CLINIC_INFO.doctor}</div>
      <div class="signoff-title">${CLINIC_INFO.qualificationFull} &bull; VSHMA Clinic</div>
    </div>
    `,
    `Your appointment with Dr. Chihnitha Reddy T is officially confirmed for ${props.appointmentDate} at ${props.preferredTime || 'your scheduled slot'}.`
  );

  const text = `
VSHMA HOMEOPATHY CLINIC
Classical Homeopathy • Bengaluru
--------------------------------------------------

Dear ${props.patientName},

Your appointment with ${CLINIC_INFO.doctor} at VSHMA Homeopathy Clinic is officially CONFIRMED!

CONFIRMED SCHEDULE:
- Booking Reference: ${props.bookingReference}
- Consultation: ${props.consultationType}
- Confirmed Date: ${props.appointmentDate}
- Scheduled Time: ${props.preferredTime || 'Scheduled Window'}
- Lead Practitioner: ${CLINIC_INFO.doctor} (${CLINIC_INFO.qualification})
- Location: ${CLINIC_INFO.location}

CONSULTATION GUIDELINES:
- Please arrive or connect 5 minutes before your scheduled slot.
- Avoid coffee, mint, or pungent aromatics 15 minutes before the session.
- Keep previous medical prescriptions or lab reports handy.

If you have questions, reach us on WhatsApp: +91 ${CLINIC_INFO.phone}

Warm regards,
${CLINIC_INFO.doctor}
${CLINIC_INFO.qualificationFull}
VSHMA Homeopathy Clinic, Bengaluru
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
      Please note that your upcoming consultation at <strong>VSHMA Homeopathy Clinic</strong> has been rescheduled to an updated date and time window.
    </div>

    <div class="voucher-card" style="border: 1px solid #DAC0EF; background: #FAF7FC;">
      ${renderVoucherHeader('Updated Schedule Voucher', props.bookingReference, '#4F1D77')}
      ${renderDetailRow('Schedule Status', '<span style="display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; background-color: #F5EDFA; color: #4F1D77; border: 1px solid #DAC0EF;">Rescheduled</span>')}
      ${renderDetailRow('New Appointment Date', `<span style="color: #4F1D77; font-weight: 700; font-size: 16px;">${newDate}</span>`)}
      ${renderDetailRow('New Exact Time (IST)', `<span style="color: #0C231A; font-weight: 700;">${newTime || 'Standard Slot'}</span>`)}
      ${renderDetailRow('Consultation Category', props.consultationType)}
      ${renderDetailRow('Lead Practitioner', `${CLINIC_INFO.doctor} (${CLINIC_INFO.qualification})`)}
      ${props.reason ? renderDetailRow('Update Reason', `<span style="color: #592E7B;">${props.reason}</span>`, true) : ''}
    </div>

    <div class="care-protocol" style="border-left-color: #4F1D77; background-color: #FAF5FC;">
      <div class="protocol-title" style="color: #4F1D77;">✦ Schedule Inconvenience Guarantee</div>
      <div class="protocol-item">If this newly assigned time does not comfortably align with your calendar, our concierge will gladly coordinate an alternate slot that suits your schedule.</div>
    </div>

    <div style="text-align: center; margin: 28px 0 20px;">
      <a href="${CLINIC_INFO.whatsappUrl}" class="btn-primary" style="background-color: #381258; border-color: #A072C8;">
        Adjust Slot on WhatsApp Concierge
      </a>
    </div>

    <div class="doctor-signoff">
      <div class="signoff-lead">Thank you for your graceful accommodation,</div>
      <div class="signoff-name">${CLINIC_INFO.doctor}</div>
      <div class="signoff-title">${CLINIC_INFO.qualificationFull} &bull; VSHMA Clinic</div>
    </div>
    `,
    `Your consultation has been rescheduled to ${newDate} at ${newTime || 'your slot'}.`
  );

  const text = `
VSHMA HOMEOPATHY CLINIC
Classical Homeopathy • Bengaluru
--------------------------------------------------

Dear ${props.patientName},

Your upcoming consultation at VSHMA Homeopathy Clinic has been rescheduled.

UPDATED SCHEDULE:
- Booking Reference: ${props.bookingReference}
- New Date: ${newDate}
- New Time: ${newTime || 'Scheduled Slot'}
- Doctor: ${CLINIC_INFO.doctor}
${props.reason ? `- Reason: ${props.reason}\n` : ''}

If this updated slot is inconvenient, message us on WhatsApp at +91 ${CLINIC_INFO.phone} to pick an alternate time.

Warm regards,
${CLINIC_INFO.doctor}
${CLINIC_INFO.qualificationFull}
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
      This is an official notice that your consultation booking (Ref: <strong>${props.bookingReference}</strong>) scheduled for <strong>${props.appointmentDate}</strong> has been cancelled.
    </div>

    <div class="voucher-card" style="border: 1px solid #F5C6C6; background: #FFFBFB;">
      ${renderVoucherHeader('Cancellation Record', props.bookingReference, '#8A2222')}
      ${renderDetailRow('Status', '<span style="display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; background-color: #FDF1F1; color: #8A2222; border: 1px solid #F5C6C6;">Cancelled</span>')}
      ${renderDetailRow('Original Date', props.appointmentDate)}
      ${renderDetailRow('Consultation Category', props.consultationType)}
      ${props.reason ? renderDetailRow('Cancellation Reason', `<span style="color: #8A2222;">${props.reason}</span>`, true) : ''}
    </div>

    <div class="lead" style="font-size: 14px; color: #536058;">
      Whenever you are ready to resume care or discuss your homeopathic wellness journey, our clinic remains here to assist you.
    </div>

    <div style="text-align: center; margin: 28px 0 20px;">
      <a href="https://vshma-clinic.vercel.app/book" class="btn-primary">
        Book a Future Consultation
      </a>
      <br>
      <a href="${CLINIC_INFO.whatsappUrl}" class="btn-secondary">
        Chat with WhatsApp Concierge
      </a>
    </div>

    <div class="doctor-signoff">
      <div class="signoff-lead">Wishing you enduring health and vitality,</div>
      <div class="signoff-name">${CLINIC_INFO.doctor}</div>
      <div class="signoff-title">${CLINIC_INFO.qualificationFull} &bull; VSHMA Clinic</div>
    </div>
    `,
    `Notice of appointment cancellation for booking ${props.bookingReference} (${props.appointmentDate}).`
  );

  const text = `
VSHMA HOMEOPATHY CLINIC
Classical Homeopathy • Bengaluru
--------------------------------------------------

Dear ${props.patientName},

Your appointment (Ref: ${props.bookingReference}) for ${props.appointmentDate} has been cancelled.
${props.reason ? `Reason: ${props.reason}\n` : ''}

Whenever you wish to schedule in the future, visit:
https://vshma-clinic.vercel.app/book

Or contact our WhatsApp concierge: +91 ${CLINIC_INFO.phone}

Warm regards,
${CLINIC_INFO.doctor}
${CLINIC_INFO.qualificationFull}
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
  const heading = reminderType === '24h' ? 'Your Consultation is Tomorrow' : 'Consultation Starting Shortly';

  const html = wrapEmail(
    `${heading} - VSHMA Clinic`,
    `
    <div class="salutation">Dear ${props.patientName},</div>
    <div class="lead">
      This is a courteous reminder that your homeopathic consultation with <strong>${CLINIC_INFO.doctor}</strong> is scheduled for <strong>${timeLabel}</strong>.
    </div>

    <div class="voucher-card" style="border: 1px solid #B8E2ED; background: #F8FCFD;">
      ${renderVoucherHeader('Appointment Summary', props.bookingReference, '#0F4E61')}
      ${renderDetailRow('Reminder Interval', `<span style="display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; background-color: #EDF7FA; color: #0F4E61; border: 1px solid #B8E2ED;">${reminderType === '24h' ? '24 Hours Prior' : '2 Hours Prior'}</span>`)}
      ${renderDetailRow('Appointment Date', `<span style="color: #0F4E61; font-weight: 700;">${props.appointmentDate}</span>`)}
      ${renderDetailRow('Scheduled Time (IST)', `<span style="color: #0C231A; font-weight: 700;">${props.preferredTime || 'Scheduled'}</span>`)}
      ${renderDetailRow('Consultation Category', props.consultationType)}
      ${renderDetailRow('Clinic Location', CLINIC_INFO.location, true)}
    </div>

    <div class="care-protocol">
      <div class="protocol-title">✦ Consultation Protocol Reminder</div>
      <div class="protocol-item">&bull; Refrain from consuming coffee, garlic, onion, or strong mints 15 minutes before your slot.</div>
      <div class="protocol-item">&bull; Have your previous prescriptions or lab investigation reports within arm's reach.</div>
      <div class="protocol-item">&bull; Arrive or join the session 5 minutes prior to ensure a peaceful, unhurried start.</div>
    </div>

    <div style="text-align: center; margin: 28px 0 20px;">
      <a href="${CLINIC_INFO.whatsappUrl}" class="btn-primary" style="background-color: #0F4E61; border-color: #64B8CE;">
        Need Directions or Assistance?
      </a>
    </div>

    <div class="doctor-signoff">
      <div class="signoff-lead">Looking forward to seeing you,</div>
      <div class="signoff-name">${CLINIC_INFO.doctor}</div>
      <div class="signoff-title">${CLINIC_INFO.qualificationFull} &bull; VSHMA Clinic</div>
    </div>
    `,
    `Reminder: Your appointment with Dr. Chihnitha Reddy T is scheduled for ${timeLabel} (${props.appointmentDate} at ${props.preferredTime || 'your slot'}).`
  );

  const text = `
VSHMA HOMEOPATHY CLINIC
Classical Homeopathy • Bengaluru
--------------------------------------------------

Dear ${props.patientName},

Reminder: Your consultation with ${CLINIC_INFO.doctor} is scheduled for ${timeLabel}.

APPOINTMENT SUMMARY:
- Booking Reference: ${props.bookingReference}
- Date: ${props.appointmentDate}
- Time: ${props.preferredTime || 'Scheduled'}
- Location: ${CLINIC_INFO.location}
- Consultation: ${props.consultationType}

If you require directions or need assistance, contact our WhatsApp Concierge: +91 ${CLINIC_INFO.phone}.

Warm regards,
${CLINIC_INFO.doctor}
${CLINIC_INFO.qualificationFull}
VSHMA Homeopathy Clinic
  `.trim();

  return { html, text };
}
