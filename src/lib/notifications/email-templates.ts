/**
 * VSHMA Luxury Email Templates
 *
 * 600px bulletproof table layout, inline CSS, bone background, forest header,
 * brass accents, Georgia/Cambria typography, sage detail rows, dark mode support,
 * preheader text, and plain text fallback.
 */

export interface LuxuryEmailProps {
  patientName: string;
  referenceNumber: string;
  appointmentDate: string; // e.g. "Saturday, 28 Nov 2026"
  appointmentTime: string; // e.g. "10:30 AM IST"
  consultationType: string;
  mode?: string;
  doctorName?: string;
  location?: string;
  notes?: string;
  phone?: string;
  email?: string;
  oldDate?: string;
  oldTime?: string;
  actionUrl?: string;
  calendarUrl?: string;
  rescheduleUrl?: string;
  cancelUrl?: string;
  digestListHtml?: string;
  totalAppointments?: number;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const EMAIL_COLORS = {
  bone: '#F7F3EC',
  forest: '#121A15',
  brass: '#B89B5E',
  cream: '#FAF8F5',
  ink: '#161815',
  sage: '#8F9489',
  sageLight: '#E8EAE3',
  white: '#FFFFFF',
  goldMuted: '#D4AF37',
};

/**
 * Base email layout wrapper
 */
function wrapEmailLayout(opts: {
  preheader: string;
  headline: string;
  subtitle?: string;
  referenceNumber?: string;
  contentHtml: string;
  ctaButton?: { label: string; url: string };
  secondaryLinksHtml?: string;
}): string {
  const ctaHtml = opts.ctaButton
    ? `
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 28px;">
        <tr>
          <td align="center">
            <a href="${opts.ctaButton.url}" target="_blank" style="display: inline-block; background-color: ${EMAIL_COLORS.brass}; color: #121A15; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(184, 155, 94, 0.25);">
              ${opts.ctaButton.label} &rarr;
            </a>
          </td>
        </tr>
      </table>
    `
    : '';

  const refBadge = opts.referenceNumber
    ? `
      <div style="display: inline-block; background-color: rgba(184, 155, 94, 0.15); border: 1px solid #B89B5E; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
        <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; font-weight: 700; color: #B89B5E; letter-spacing: 1.5px; text-transform: uppercase;">
          REF: ${opts.referenceNumber}
        </span>
      </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>VSHMA Homeopathy Clinic</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: ${EMAIL_COLORS.bone}; }
    @media (prefers-color-scheme: dark) {
      body, .email-body { background-color: #0B100D !important; }
      .email-card { background-color: #121A15 !important; border-color: #2D3B32 !important; color: #EDE6D3 !important; }
      .text-dark { color: #EDE6D3 !important; }
      .voucher-box { background-color: #16201A !important; border-color: #B89B5E !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${EMAIL_COLORS.bone}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <!-- Preheader preview text -->
  <div style="display: none; font-size: 1px; color: ${EMAIL_COLORS.bone}; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${opts.preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-body" style="background-color: ${EMAIL_COLORS.bone};">
    <tr>
      <td align="center" style="padding: 24px 12px 40px;">
        <!-- Container (600px) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: ${EMAIL_COLORS.white}; border-radius: 20px; overflow: hidden; border: 1px solid rgba(184, 155, 94, 0.3); box-shadow: 0 12px 32px rgba(18, 26, 21, 0.08);" class="email-card">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background-color: ${EMAIL_COLORS.forest}; padding: 32px 24px 28px; border-bottom: 2px solid ${EMAIL_COLORS.brass};">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="https://vshma.in/icon.png" width="44" height="44" alt="VSHMA Logo" style="display: block; border-radius: 50%; margin-bottom: 12px; border: 1px solid ${EMAIL_COLORS.brass};">
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 300; letter-spacing: 2px; color: #FAF8F5; text-transform: uppercase;">
                      VSHMA
                    </span>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 9px; font-weight: 700; letter-spacing: 3px; color: ${EMAIL_COLORS.brass}; text-transform: uppercase; margin-top: 4px;">
                      Homeopathy Clinic &bull; Bengaluru
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 36px 32px 32px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    ${refBadge}
                    <h1 class="text-dark" style="margin: 0 0 8px; font-family: Georgia, 'Times New Roman', Cambria, serif; font-size: 24px; font-weight: 400; color: ${EMAIL_COLORS.forest}; line-height: 1.25;">
                      ${opts.headline}
                    </h1>
                    ${
                      opts.subtitle
                        ? `<p style="margin: 0 0 24px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; color: ${EMAIL_COLORS.sage}; line-height: 1.5;">${opts.subtitle}</p>`
                        : '<div style="margin-bottom: 24px;"></div>'
                    }
                  </td>
                </tr>

                <!-- Dynamic Content Block -->
                <tr>
                  <td>
                    ${opts.contentHtml}
                  </td>
                </tr>

                <!-- CTA Button -->
                ${ctaHtml}

                <!-- Secondary Links -->
                ${
                  opts.secondaryLinksHtml
                    ? `
                  <tr>
                    <td align="center" style="padding-top: 20px;">
                      ${opts.secondaryLinksHtml}
                    </td>
                  </tr>`
                    : ''
                }
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${EMAIL_COLORS.cream}; padding: 24px 32px; border-top: 1px solid rgba(18, 26, 21, 0.08); font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11px; color: ${EMAIL_COLORS.sage}; line-height: 1.6; text-align: center;">
              <p style="margin: 0 0 6px; font-weight: 600; color: ${EMAIL_COLORS.forest};">
                VSHMA Homeopathy Clinic &bull; Lead Practitioner: Dr. Chihnitha Reddy T (BHMS)
              </p>
              <p style="margin: 0 0 8px;">
                Bengaluru, Karnataka, India &bull; Prior Appointment Only &bull; Tel: +91 7416001477
              </p>
              <p style="margin: 0 0 8px; font-size: 10px; color: #A0A59A; line-height: 1.4;">
                Medical Notice: This email confirms appointment logistics. Homeopathic care is tailored individually following clinical dialogue. In medical emergencies, contact local emergency services immediately.
              </p>
              <p style="margin: 0; font-size: 10px;">
                Transactional care notification. To update contact preferences, reply to care@vshma.in.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Renders a luxury "Voucher Card" table block with dashed divider
 */
function renderVoucherCard(items: Array<{ label: string; value: string }>): string {
  const rows = items
    .map(
      (it) => `
      <tr>
        <td style="padding: 8px 14px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11px; text-transform: uppercase; font-weight: 700; color: ${EMAIL_COLORS.brass}; letter-spacing: 1px; width: 35%;">
          ${it.label}
        </td>
        <td style="padding: 8px 14px; font-family: Georgia, serif; font-size: 14px; color: ${EMAIL_COLORS.forest}; font-weight: 500;">
          ${it.value}
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="voucher-box" style="background-color: ${EMAIL_COLORS.cream}; border: 1px solid rgba(184, 155, 94, 0.4); border-radius: 14px; overflow: hidden; margin-bottom: 20px;">
      ${rows}
    </table>
  `;
}

// =========================================================================
// TEMPLATE GENERATORS (13 Templates)
// =========================================================================

export const LUXURY_EMAIL_TEMPLATES = {
  // 1. Booking Received (Patient)
  booking_received: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `We have received your appointment request for ${p.appointmentDate}.`,
      headline: `Your Consultation Request Is Logged`,
      subtitle: `Dear ${p.patientName}, our clinic team is reviewing doctor availability.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        <p style="font-size: 14px; color: ${EMAIL_COLORS.ink}; line-height: 1.6; margin: 0 0 16px;">
          Thank you for reaching out to VSHMA Homeopathy Clinic. We have successfully logged your appointment reservation request.
        </p>
        ${renderVoucherCard([
          { label: 'Consultation', value: p.consultationType },
          { label: 'Requested Date', value: p.appointmentDate },
          { label: 'Preferred Time', value: p.appointmentTime },
          { label: 'Doctor', value: p.doctorName || 'Dr. Chihnitha Reddy T (BHMS)' },
        ])}
        <p style="font-size: 13px; color: ${EMAIL_COLORS.sage}; line-height: 1.5; margin: 0;">
          You will receive an official confirmation via WhatsApp and email once our team confirms your exact consultation window.
        </p>
      `,
      ctaButton: {
        label: 'View Clinic Details',
        url: 'https://vshma.in/contact',
      },
    });

    const text = `VSHMA HOMEOPATHY CLINIC
Appointment Request Received (Ref: ${p.referenceNumber})

Dear ${p.patientName},
We have received your consultation request for ${p.consultationType}.
Requested Date: ${p.appointmentDate} (${p.appointmentTime})
Doctor: ${p.doctorName || 'Dr. Chihnitha Reddy T (BHMS)'}

Our clinic team is reviewing schedule availability and will confirm shortly.
WhatsApp Concierge: +91 7416001477
https://vshma.in`;

    return { subject: `Appointment Request Received [Ref: ${p.referenceNumber}] — VSHMA Clinic`, html, text };
  },

  // 2. Clinic New Booking Alert (Staff)
  clinic_new_booking_alert: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `New patient appointment request: ${p.patientName} (${p.appointmentDate})`,
      headline: `New Patient Request Received`,
      subtitle: `Action required: confirm or schedule in Staff Portal.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        ${renderVoucherCard([
          { label: 'Patient Name', value: p.patientName },
          { label: 'Phone', value: p.phone || 'Not provided' },
          { label: 'Email', value: p.email || 'Not provided' },
          { label: 'Consultation', value: p.consultationType },
          { label: 'Date Window', value: `${p.appointmentDate} (${p.appointmentTime})` },
          { label: 'Patient Notes', value: p.notes || 'None' },
        ])}
      `,
      ctaButton: {
        label: 'Open in Admin Portal',
        url: p.actionUrl || 'https://vshma.in/admin/appointments',
      },
    });

    const text = `VSHMA CLINIC ALERT - NEW BOOKING REQUEST
Patient: ${p.patientName}
Phone: ${p.phone || 'N/A'}
Date: ${p.appointmentDate} (${p.appointmentTime})
Type: ${p.consultationType}
Ref: ${p.referenceNumber}
Notes: ${p.notes || 'None'}
Admin: ${p.actionUrl || 'https://vshma.in/admin/appointments'}`;

    return { subject: `[Clinic Alert] New Booking Request: ${p.patientName} (${p.appointmentDate})`, html, text };
  },

  // 3. Confirmed (Patient)
  confirmed: (p: LuxuryEmailProps): RenderedEmail => {
    const secondaryHtml = `
      <div style="font-size: 12px; color: ${EMAIL_COLORS.sage};">
        ${p.calendarUrl ? `<a href="${p.calendarUrl}" target="_blank" style="color: ${EMAIL_COLORS.brass}; text-decoration: underline; margin-right: 14px;">+ Add to Google Calendar</a>` : ''}
        ${p.rescheduleUrl ? `<a href="${p.rescheduleUrl}" target="_blank" style="color: ${EMAIL_COLORS.sage}; text-decoration: underline; margin-right: 14px;">Reschedule Slot</a>` : ''}
        ${p.cancelUrl ? `<a href="${p.cancelUrl}" target="_blank" style="color: ${EMAIL_COLORS.sage}; text-decoration: underline;">Cancel Appointment</a>` : ''}
      </div>
    `;

    const html = wrapEmailLayout({
      preheader: `Your consultation with Dr. Chihnitha Reddy T is confirmed for ${p.appointmentDate} at ${p.appointmentTime}.`,
      headline: `Your Appointment Is Confirmed`,
      subtitle: `Dear ${p.patientName}, we look forward to welcoming you.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        ${renderVoucherCard([
          { label: 'Doctor', value: p.doctorName || 'Dr. Chihnitha Reddy T (BHMS)' },
          { label: 'Consultation', value: p.consultationType },
          { label: 'Date', value: p.appointmentDate },
          { label: 'Confirmed Time', value: p.appointmentTime },
          { label: 'Mode', value: p.mode || 'In-Clinic (Bengaluru)' },
          { label: 'Location', value: p.location || 'Bengaluru, Karnataka (By Prior Appointment)' },
        ])}
        <p style="font-size: 13px; color: ${EMAIL_COLORS.ink}; line-height: 1.6; margin: 0 0 12px;">
          Please arrive 10 minutes prior to your scheduled consultation time. If you have past medical records or diagnostic reports, kindly bring them along.
        </p>
      `,
      ctaButton: {
        label: 'Get Clinic Directions',
        url: 'https://vshma.in/contact',
      },
      secondaryLinksHtml: secondaryHtml,
    });

    const text = `VSHMA HOMEOPATHY CLINIC
Appointment Confirmed (Ref: ${p.referenceNumber})

Dear ${p.patientName},
Your consultation with Dr. Chihnitha Reddy T is confirmed.
Date: ${p.appointmentDate}
Time: ${p.appointmentTime}
Type: ${p.consultationType}
Location: ${p.location || 'Bengaluru, Karnataka'}

Reschedule: ${p.rescheduleUrl || 'https://vshma.in/book'}
Cancel: ${p.cancelUrl || 'https://vshma.in/book'}
Help: +91 7416001477`;

    return { subject: `Appointment Confirmed: ${p.appointmentDate} at ${p.appointmentTime} [Ref: ${p.referenceNumber}]`, html, text };
  },

  // 4. Rescheduled (Patient)
  rescheduled: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `Your appointment has been rescheduled to ${p.appointmentDate} at ${p.appointmentTime}.`,
      headline: `Appointment Rescheduled`,
      subtitle: `Dear ${p.patientName}, your consultation time has been updated.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        ${renderVoucherCard([
          { label: 'Doctor', value: p.doctorName || 'Dr. Chihnitha Reddy T (BHMS)' },
          { label: 'Previous Slot', value: `${p.oldDate || 'Original Date'} at ${p.oldTime || 'Original Time'}` },
          { label: 'New Confirmed Slot', value: `${p.appointmentDate} at ${p.appointmentTime}` },
          { label: 'Consultation', value: p.consultationType },
          { label: 'Location', value: p.location || 'Bengaluru, Karnataka' },
        ])}
        <p style="font-size: 13px; color: ${EMAIL_COLORS.ink}; line-height: 1.5; margin: 0;">
          All pre-visit reminders have been adjusted to your new slot. We look forward to seeing you.
        </p>
      `,
      ctaButton: {
        label: 'View Appointment Details',
        url: p.actionUrl || 'https://vshma.in/contact',
      },
    });

    const text = `VSHMA HOMEOPATHY CLINIC
Appointment Rescheduled (Ref: ${p.referenceNumber})

Dear ${p.patientName},
Your appointment has been updated:
New Slot: ${p.appointmentDate} at ${p.appointmentTime}
Doctor: ${p.doctorName || 'Dr. Chihnitha Reddy T (BHMS)'}
Location: ${p.location || 'Bengaluru, Karnataka'}
https://vshma.in`;

    return { subject: `Appointment Rescheduled to ${p.appointmentDate} [Ref: ${p.referenceNumber}]`, html, text };
  },

  // 5. Cancelled (Patient)
  cancelled: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `Your appointment for ${p.appointmentDate} has been cancelled.`,
      headline: `Appointment Cancelled`,
      subtitle: `Dear ${p.patientName}, your reservation has been released.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        <p style="font-size: 14px; color: ${EMAIL_COLORS.ink}; line-height: 1.6; margin: 0 0 16px;">
          Your consultation (Ref: ${p.referenceNumber}) for <strong>${p.appointmentDate}</strong> has been cancelled. All scheduled reminders have been withdrawn.
        </p>
        <p style="font-size: 13px; color: ${EMAIL_COLORS.sage}; line-height: 1.5; margin: 0;">
          Whenever you are ready to resume homeopathic care, our calendar remains open for you.
        </p>
      `,
      ctaButton: {
        label: 'Book a New Appointment',
        url: 'https://vshma.in/book',
      },
    });

    const text = `VSHMA HOMEOPATHY CLINIC
Appointment Cancelled (Ref: ${p.referenceNumber})

Dear ${p.patientName},
Your appointment for ${p.appointmentDate} has been cancelled.
Whenever you are ready to reschedule, visit: https://vshma.in/book`;

    return { subject: `Appointment Cancelled [Ref: ${p.referenceNumber}] — VSHMA Clinic`, html, text };
  },

  // 6. Completed (Patient)
  completed: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `Thank you for your consultation with Dr. Chihnitha Reddy T.`,
      headline: `Thank You for Visiting VSHMA`,
      subtitle: `Dear ${p.patientName}, care continuity is our highest priority.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        <p style="font-size: 14px; color: ${EMAIL_COLORS.ink}; line-height: 1.6; margin: 0 0 16px;">
          It was a privilege to conduct your clinical case analysis today. Please take your prescribed constitutional remedy according to the directions provided by Dr. Chihnitha.
        </p>
        <p style="font-size: 13px; color: ${EMAIL_COLORS.sage}; line-height: 1.5; margin: 0 0 16px;">
          Homeopathic constitutional treatment works progressively over time. We recommend scheduling a follow-up assessment in 3 to 4 weeks to review your bodily response.
        </p>
      `,
      ctaButton: {
        label: 'Schedule Follow-up Assessment',
        url: 'https://vshma.in/book',
      },
    });

    const text = `VSHMA HOMEOPATHY CLINIC
Thank You for Consulting (Ref: ${p.referenceNumber})

Dear ${p.patientName},
Thank you for consulting with Dr. Chihnitha Reddy T today.
Please follow your prescribed remedy instructions.
Schedule your 3-4 week follow-up: https://vshma.in/book`;

    return { subject: `Care Continuity Note — Dr. Chihnitha Reddy T [VSHMA Clinic]`, html, text };
  },

  // 7. No-show (Patient)
  no_show: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `We missed you at your scheduled consultation today.`,
      headline: `We Missed You Today`,
      subtitle: `Dear ${p.patientName}, schedule changes happen.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        <p style="font-size: 14px; color: ${EMAIL_COLORS.ink}; line-height: 1.6; margin: 0 0 16px;">
          We missed you for your scheduled consultation today (${p.appointmentDate}, ${p.appointmentTime}). We understand unforeseen circumstances arise.
        </p>
        <p style="font-size: 13px; color: ${EMAIL_COLORS.sage}; line-height: 1.5; margin: 0;">
          If you would like to rebook your appointment for a convenient date, our team will be glad to assist you.
        </p>
      `,
      ctaButton: {
        label: 'Rebook Your Consultation',
        url: 'https://vshma.in/book',
      },
    });

    const text = `VSHMA HOMEOPATHY CLINIC
We Missed You Today (Ref: ${p.referenceNumber})

Dear ${p.patientName},
We missed you at your scheduled consultation today (${p.appointmentDate}).
If you would like to reschedule, please visit: https://vshma.in/book`;

    return { subject: `We Missed You Today — VSHMA Homeopathy Clinic`, html, text };
  },

  // 8. Reminder 24h (Patient)
  reminder_24h: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `Reminder: Your consultation with Dr. Chihnitha Reddy T is tomorrow at ${p.appointmentTime}.`,
      headline: `Your Consultation Is Tomorrow`,
      subtitle: `Dear ${p.patientName}, gentle 24-hour appointment reminder.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        ${renderVoucherCard([
          { label: 'Date', value: p.appointmentDate },
          { label: 'Time', value: p.appointmentTime },
          { label: 'Doctor', value: p.doctorName || 'Dr. Chihnitha Reddy T' },
          { label: 'Location', value: p.location || 'Bengaluru, Karnataka' },
        ])}
        <p style="font-size: 13px; color: ${EMAIL_COLORS.ink}; line-height: 1.5; margin: 0;">
          If you need to make any adjustments to your schedule, kindly let us know today.
        </p>
      `,
      ctaButton: {
        label: 'View Directions',
        url: 'https://vshma.in/contact',
      },
    });

    const text = `VSHMA CLINIC REMINDER: Your consultation is tomorrow at ${p.appointmentTime}. Ref: ${p.referenceNumber}. Location: ${p.location || 'Bengaluru'}. Questions: 7416001477`;

    return { subject: `Reminder: Your Appointment Tomorrow at ${p.appointmentTime} [VSHMA Clinic]`, html, text };
  },

  // 9. Reminder 2h (Patient)
  reminder_2h: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `Reminder: Your consultation with Dr. Chihnitha Reddy T is in 2 hours at ${p.appointmentTime}.`,
      headline: `Your Appointment in 2 Hours`,
      subtitle: `Dear ${p.patientName}, Dr. Chihnitha is preparing for your consultation.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        ${renderVoucherCard([
          { label: 'Today at', value: p.appointmentTime },
          { label: 'Doctor', value: p.doctorName || 'Dr. Chihnitha Reddy T' },
          { label: 'Location', value: p.location || 'Bengaluru, Karnataka' },
        ])}
        <p style="font-size: 13px; color: ${EMAIL_COLORS.ink}; line-height: 1.5; margin: 0;">
          Please arrive 10 minutes early. We look forward to seeing you shortly.
        </p>
      `,
      ctaButton: {
        label: 'Open Clinic Directions',
        url: 'https://vshma.in/contact',
      },
    });

    const text = `VSHMA CLINIC: Your appointment is in 2 hours at ${p.appointmentTime}. Please arrive 10m early. Ref: ${p.referenceNumber}.`;

    return { subject: `Reminder: Your Appointment in 2 Hours (${p.appointmentTime}) — VSHMA`, html, text };
  },

  // 10. Reminder 1h (Patient)
  reminder_1h: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `Your consultation starts in 1 hour at ${p.appointmentTime}.`,
      headline: `Your Consultation in 1 Hour`,
      subtitle: `Dear ${p.patientName}, we look forward to seeing you shortly.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        <p style="font-size: 14px; color: ${EMAIL_COLORS.ink}; line-height: 1.6; margin: 0 0 12px;">
          Your consultation with Dr. Chihnitha Reddy T begins in 1 hour (at <strong>${p.appointmentTime}</strong>).
        </p>
      `,
      ctaButton: {
        label: 'Clinic Map',
        url: 'https://vshma.in/contact',
      },
    });
    const text = `VSHMA CLINIC: Consultation begins in 1 hour at ${p.appointmentTime}. Ref: ${p.referenceNumber}.`;
    return { subject: `Your Appointment in 1 Hour (${p.appointmentTime}) — VSHMA Clinic`, html, text };
  },

  // 11. Reminder 10m (Patient)
  reminder_10m: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `Your appointment slot is starting in 10 minutes.`,
      headline: `Your Slot Starts in 10 Minutes`,
      subtitle: `Dear ${p.patientName}, your room is ready.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        <p style="font-size: 14px; color: ${EMAIL_COLORS.ink}; line-height: 1.6; margin: 0;">
          Dr. Chihnitha is ready to begin your consultation. Please proceed to the clinic desk.
        </p>
      `,
    });
    const text = `VSHMA CLINIC: Your slot starts in 10 minutes. Please proceed to the consultation room.`;
    return { subject: `Your Appointment Starts in 10 Minutes — VSHMA Clinic`, html, text };
  },

  // 12. Doctor Reminder (Staff / Doctor)
  doctor_reminder: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `Upcoming patient consultation: ${p.patientName} at ${p.appointmentTime}`,
      headline: `Upcoming Consultation Alert`,
      subtitle: `Patient: ${p.patientName} (${p.appointmentTime})`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        ${renderVoucherCard([
          { label: 'Patient Name', value: p.patientName },
          { label: 'Time', value: p.appointmentTime },
          { label: 'Consultation', value: p.consultationType },
          { label: 'Phone', value: p.phone || 'N/A' },
          { label: 'Notes', value: p.notes || 'None' },
        ])}
      `,
      ctaButton: {
        label: 'Open Appointment Dossier',
        url: p.actionUrl || 'https://vshma.in/admin/appointments',
      },
    });
    const text = `DOCTOR SCHEDULE ALERT: Patient ${p.patientName} at ${p.appointmentTime}. Type: ${p.consultationType}. Portal: https://vshma.in/admin/appointments`;
    return { subject: `[Doctor Alert] Next Patient: ${p.patientName} (${p.appointmentTime})`, html, text };
  },

  // 13. Doctor Daily Digest (Morning 8:00 AM IST)
  doctor_daily_digest: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `Morning Schedule: ${p.totalAppointments || 0} consultations scheduled for ${p.appointmentDate}.`,
      headline: `Daily Schedule Digest`,
      subtitle: `Good morning, Dr. Chihnitha Reddy T. Schedule for ${p.appointmentDate}.`,
      contentHtml: `
        <div style="margin-bottom: 20px;">
          <span style="font-size: 13px; font-weight: 700; color: ${EMAIL_COLORS.brass}; text-transform: uppercase; letter-spacing: 1px;">
            Total Consultations: ${p.totalAppointments || 0}
          </span>
        </div>
        ${p.digestListHtml || '<p style="color: #666; font-size: 13px;">No consultations scheduled for today.</p>'}
      `,
      ctaButton: {
        label: 'Open Staff Dashboard',
        url: 'https://vshma.in/admin/appointments',
      },
    });
    const text = `VSHMA CLINIC - DAILY DIGEST for ${p.appointmentDate}
Total Appointments: ${p.totalAppointments || 0}
Portal: https://vshma.in/admin/appointments`;
    return { subject: `Daily Clinic Schedule Digest: ${p.appointmentDate} (${p.totalAppointments || 0} appts)`, html, text };
  },
};
