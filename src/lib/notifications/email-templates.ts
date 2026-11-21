/**
 * VSHMA Luxury Light-First Email Templates (13 Complete Templates)
 *
 * 600px bulletproof table layout, inline CSS, bone background, forest header,
 * brass accents, high-contrast dark text on light surfaces everywhere,
 * embedded CID logo, color-scheme: light only, preheader text, and plain text fallbacks.
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
  brassText: '#9B7E3E',
  cream: '#FAF8F5',
  ink: '#161815',
  sageText: '#5A635B',
  borderSage: '#D4D8BA',
  white: '#FFFFFF',
};

/**
 * Base email layout wrapper — Light-First, Bulletproof across Gmail, Apple Mail, Outlook
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
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 26px;">
        <tr>
          <td align="center">
            <a href="${opts.ctaButton.url}" target="_blank" style="display: inline-block; background-color: ${EMAIL_COLORS.brass}; color: #121A15; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; text-decoration: none; padding: 13px 30px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(184, 155, 94, 0.25);">
              ${opts.ctaButton.label} &rarr;
            </a>
          </td>
        </tr>
      </table>
    `
    : '';

  const refBadge = opts.referenceNumber
    ? `
      <div style="display: inline-block; background-color: #FAF4E6; border: 1px solid #B89B5E; padding: 4px 12px; border-radius: 9999px; margin-bottom: 12px;">
        <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; font-weight: 700; color: #9B7E3E; letter-spacing: 1.5px; text-transform: uppercase;">
          REF: ${opts.referenceNumber}
        </span>
      </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light">
  <title>VSHMA Homeopathy Clinic</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: ${EMAIL_COLORS.bone}; color: ${EMAIL_COLORS.ink}; }
    /* Force light presentation across dark mode clients */
    :root { color-scheme: light only; supported-color-schemes: light; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${EMAIL_COLORS.bone}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <!-- Preheader text -->
  <div style="display: none; font-size: 1px; color: ${EMAIL_COLORS.bone}; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${opts.preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${EMAIL_COLORS.bone};">
    <tr>
      <td align="center" style="padding: 24px 12px 40px;">
        <!-- Container (600px) -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: ${EMAIL_COLORS.white}; border-radius: 18px; overflow: hidden; border: 1px solid ${EMAIL_COLORS.borderSage}; box-shadow: 0 10px 30px rgba(18, 26, 21, 0.06);">
          
          <!-- Header Banner (Forest with embedded CID logo) -->
          <tr>
            <td align="center" style="background-color: ${EMAIL_COLORS.forest}; padding: 30px 24px 26px; border-bottom: 2px solid ${EMAIL_COLORS.brass};">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <img src="cid:vshma-logo" width="46" height="46" alt="VSHMA Logo" style="display: block; border-radius: 50%; margin-bottom: 10px; border: 1px solid ${EMAIL_COLORS.brass}; background-color: #18231C;">
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 300; letter-spacing: 2px; color: #FAF8F5; text-transform: uppercase;">
                      VSHMA
                    </span>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 2.5px; color: ${EMAIL_COLORS.brass}; text-transform: uppercase; margin-top: 3px;">
                      Homeopathy Clinic &bull; Bengaluru
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td style="padding: 34px 28px 30px; background-color: ${EMAIL_COLORS.white};">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    ${refBadge}
                    <h1 style="margin: 0 0 8px; font-family: Georgia, 'Times New Roman', Cambria, serif; font-size: 24px; font-weight: 400; color: ${EMAIL_COLORS.forest}; line-height: 1.25;">
                      ${opts.headline}
                    </h1>
                    ${
                      opts.subtitle
                        ? `<p style="margin: 0 0 22px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 13px; color: ${EMAIL_COLORS.sageText}; line-height: 1.5;">${opts.subtitle}</p>`
                        : '<div style="margin-bottom: 22px;"></div>'
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
            <td style="background-color: ${EMAIL_COLORS.cream}; padding: 22px 28px; border-top: 1px solid ${EMAIL_COLORS.borderSage}; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11px; color: ${EMAIL_COLORS.sageText}; line-height: 1.6; text-align: center;">
              <p style="margin: 0 0 6px; font-weight: 600; color: ${EMAIL_COLORS.forest};">
                VSHMA Homeopathy Clinic &bull; Lead Practitioner: Dr. Chihnitha Reddy T (BHMS)
              </p>
              <p style="margin: 0 0 8px;">
                Bengaluru, Karnataka, India &bull; Prior Appointment Only &bull; Tel: +91 7416001477
              </p>
              <p style="margin: 0 0 8px; font-size: 10px; color: #7B8278; line-height: 1.4;">
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
 * Renders high-contrast light voucher table block (dark text on cream surface)
 */
function renderVoucherCard(items: Array<{ label: string; value: string }>): string {
  const rows = items
    .map(
      (it) => `
      <tr>
        <td style="padding: 10px 14px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11px; text-transform: uppercase; font-weight: 700; color: ${EMAIL_COLORS.brassText}; letter-spacing: 1px; width: 36%; vertical-align: top; border-bottom: 1px solid rgba(212, 216, 186, 0.4);">
          ${it.label}
        </td>
        <td style="padding: 10px 14px; font-family: Georgia, serif; font-size: 14px; color: ${EMAIL_COLORS.ink}; font-weight: 500; border-bottom: 1px solid rgba(212, 216, 186, 0.4); line-height: 1.4;">
          ${it.value}
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${EMAIL_COLORS.cream}; border: 1px solid ${EMAIL_COLORS.borderSage}; border-radius: 12px; overflow: hidden; margin-bottom: 20px;">
      ${rows}
    </table>
  `;
}

// =========================================================================
// 13 COMPLETE LIGHT-FIRST LUXURY TEMPLATES
// =========================================================================

export const LUXURY_EMAIL_TEMPLATES = {
  // 1. Booking Received (Patient)
  booking_received: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `We have received your appointment request for ${p.appointmentDate}.`,
      headline: `Consultation Request Received`,
      subtitle: `Dear ${p.patientName}, our clinic team is reviewing doctor availability.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        <p style="font-size: 14px; color: ${EMAIL_COLORS.ink}; line-height: 1.6; margin: 0 0 16px;">
          Thank you for reaching out to VSHMA Homeopathy Clinic. We have successfully logged your appointment request.
        </p>
        ${renderVoucherCard([
          { label: 'Consultation', value: p.consultationType },
          { label: 'Requested Date', value: p.appointmentDate },
          { label: 'Preferred Time', value: p.appointmentTime },
          { label: 'Doctor', value: p.doctorName || 'Dr. Chihnitha Reddy T (BHMS)' },
        ])}
        <p style="font-size: 13px; color: ${EMAIL_COLORS.sageText}; line-height: 1.5; margin: 0;">
          Our reception team will confirm your exact consultation window shortly via WhatsApp and email.
        </p>
      `,
      ctaButton: {
        label: 'View Clinic Location & Details',
        url: 'https://vshma.in/contact',
      },
    });

    const text = `VSHMA HOMEOPATHY CLINIC
Consultation Request Received (Ref: ${p.referenceNumber})

Dear ${p.patientName},
We have received your consultation request for ${p.consultationType}.
Requested Date: ${p.appointmentDate} (${p.appointmentTime})
Doctor: ${p.doctorName || 'Dr. Chihnitha Reddy T (BHMS)'}

Our clinic team is reviewing schedule availability and will confirm shortly.
WhatsApp Concierge: +91 7416001477
Website: https://vshma.in`;

    return { subject: `Appointment Request Received [Ref: ${p.referenceNumber}] — VSHMA Clinic`, html, text };
  },

  // 2. Clinic New Booking Alert (Staff)
  clinic_new_booking_alert: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `New patient appointment request: ${p.patientName} (${p.appointmentDate})`,
      headline: `New Patient Request Received`,
      subtitle: `Action required: confirm or schedule in Admin Portal.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        ${renderVoucherCard([
          { label: 'Patient Name', value: p.patientName },
          { label: 'Phone', value: p.phone || 'Not provided' },
          { label: 'Email', value: p.email || 'Not provided' },
          { label: 'Consultation', value: p.consultationType },
          { label: 'Date Window', value: `${p.appointmentDate} (${p.appointmentTime})` },
          { label: 'Patient Notes', value: p.notes || 'None provided' },
        ])}
      `,
      ctaButton: {
        label: 'Open Admin Portal',
        url: 'https://vshma.in/admin/appointments',
      },
    });

    const text = `VSHMA CLINIC ALERT: New Booking Request
Ref: ${p.referenceNumber}
Patient: ${p.patientName}
Phone: ${p.phone || 'Not provided'}
Consultation: ${p.consultationType}
Requested Date: ${p.appointmentDate} (${p.appointmentTime})

Open Admin Portal: https://vshma.in/admin/appointments`;

    return { subject: `[ACTION REQUIRED] New Booking: ${p.patientName} (${p.appointmentDate}) — VSHMA`, html, text };
  },

  // 3. Doctor Booking Alert
  doctor_new_booking_alert: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `Schedule notice for Dr. Chihnitha: Consultation with ${p.patientName}`,
      headline: `New Consultation Scheduled`,
      subtitle: `Hello Dr. Chihnitha, a patient has scheduled a consultation with you.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        ${renderVoucherCard([
          { label: 'Patient', value: p.patientName },
          { label: 'Consultation Type', value: p.consultationType },
          { label: 'Date & Time', value: `${p.appointmentDate} at ${p.appointmentTime}` },
          { label: 'Format', value: p.mode || 'In-Clinic (Bengaluru)' },
          { label: 'Clinical Notes', value: p.notes || 'First intake' },
        ])}
      `,
      ctaButton: {
        label: 'View Patient File in Portal',
        url: 'https://vshma.in/admin/appointments',
      },
    });

    const text = `DR. CHIHNITHA — SCHEDULE ALERT
New Consultation: ${p.patientName}
Type: ${p.consultationType}
Date: ${p.appointmentDate} at ${p.appointmentTime}
Format: ${p.mode || 'In-Clinic'}
Ref: ${p.referenceNumber}
Portal: https://vshma.in/admin/appointments`;

    return { subject: `Schedule Alert: ${p.patientName} on ${p.appointmentDate} — Dr. Chihnitha Reddy T`, html, text };
  },

  // 4. Booking Confirmed (Patient)
  booking_confirmed: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `Your consultation is confirmed for ${p.appointmentDate} at ${p.appointmentTime}.`,
      headline: `Your Consultation Is Confirmed`,
      subtitle: `We look forward to welcoming you, ${p.patientName}.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        <p style="font-size: 14px; color: ${EMAIL_COLORS.ink}; line-height: 1.6; margin: 0 0 16px;">
          Your appointment has been officially confirmed by Dr. Chihnitha Reddy T. An <code>.ics</code> calendar invite is attached for your calendar.
        </p>
        ${renderVoucherCard([
          { label: 'Consultation', value: p.consultationType },
          { label: 'Date', value: p.appointmentDate },
          { label: 'Time', value: p.appointmentTime },
          { label: 'Doctor', value: p.doctorName || 'Dr. Chihnitha Reddy T (BHMS)' },
          { label: 'Location', value: p.location || 'VSHMA Clinic, Bengaluru' },
        ])}
        <div style="background-color: #FAF4E6; border: 1px solid #D4D8BA; border-radius: 10px; padding: 14px; margin-top: 16px;">
          <strong style="color: #121A15; font-size: 12px; display: block; margin-bottom: 4px;">Preparation for Your Visit:</strong>
          <span style="color: #5A635B; font-size: 12px; line-height: 1.5;">
            Please bring any recent diagnostic reports or medication lists. For in-clinic sessions, please arrive 5–10 minutes early.
          </span>
        </div>
      `,
      ctaButton: {
        label: 'Add to Calendar / View Voucher',
        url: p.calendarUrl || 'https://vshma.in/contact',
      },
      secondaryLinksHtml: `
        <a href="${p.rescheduleUrl || 'https://vshma.in/contact'}" style="color: ${EMAIL_COLORS.sageText}; font-size: 12px; text-decoration: underline; margin-right: 16px;">Reschedule</a>
        <a href="${p.cancelUrl || 'https://vshma.in/contact'}" style="color: #92400E; font-size: 12px; text-decoration: underline;">Cancel Appointment</a>
      `,
    });

    const text = `VSHMA HOMEOPATHY CLINIC
Appointment Confirmed (Ref: ${p.referenceNumber})

Dear ${p.patientName},
Your consultation is confirmed:
Date: ${p.appointmentDate} at ${p.appointmentTime}
Type: ${p.consultationType}
Doctor: ${p.doctorName || 'Dr. Chihnitha Reddy T (BHMS)'}
Location: ${p.location || 'VSHMA Clinic, Bengaluru'}

Preparation: Please bring any prior medical records.
Contact: +91 7416001477 | care@vshma.in`;

    return { subject: `Appointment Confirmed: ${p.appointmentDate} at ${p.appointmentTime} — VSHMA Clinic`, html, text };
  },

  // 5. Booking Rescheduled
  booking_rescheduled: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `Your consultation has been rescheduled to ${p.appointmentDate} at ${p.appointmentTime}.`,
      headline: `Consultation Rescheduled`,
      subtitle: `Your updated appointment details are confirmed.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        <p style="font-size: 14px; color: ${EMAIL_COLORS.ink}; line-height: 1.6; margin: 0 0 16px;">
          Dear ${p.patientName}, your consultation with Dr. Chihnitha Reddy T has been moved to a new time window.
        </p>
        ${renderVoucherCard([
          { label: 'New Date & Time', value: `${p.appointmentDate} at ${p.appointmentTime}` },
          { label: 'Previous Slot', value: `${p.oldDate || 'Prior Slot'} at ${p.oldTime || ''}` },
          { label: 'Consultation', value: p.consultationType },
          { label: 'Doctor', value: p.doctorName || 'Dr. Chihnitha Reddy T (BHMS)' },
        ])}
      `,
      ctaButton: {
        label: 'View Updated Calendar Details',
        url: p.calendarUrl || 'https://vshma.in/contact',
      },
    });

    const text = `VSHMA HOMEOPATHY CLINIC
Appointment Rescheduled (Ref: ${p.referenceNumber})

Dear ${p.patientName},
Your appointment has been updated to:
New Date: ${p.appointmentDate} at ${p.appointmentTime}
Previous Slot: ${p.oldDate || ''} ${p.oldTime || ''}
Doctor: ${p.doctorName || 'Dr. Chihnitha Reddy T (BHMS)'}

Questions? WhatsApp: +91 7416001477`;

    return { subject: `Appointment Rescheduled: ${p.appointmentDate} at ${p.appointmentTime} — VSHMA Clinic`, html, text };
  },

  // 6. Booking Cancelled
  booking_cancelled: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `Your appointment for ${p.appointmentDate} has been cancelled.`,
      headline: `Consultation Cancelled`,
      subtitle: `We have updated our clinical calendar.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        <p style="font-size: 14px; color: ${EMAIL_COLORS.ink}; line-height: 1.6; margin: 0 0 16px;">
          Dear ${p.patientName}, your appointment on <strong>${p.appointmentDate}</strong> (${p.appointmentTime}) has been cancelled as requested.
        </p>
        <p style="font-size: 13px; color: ${EMAIL_COLORS.sageText}; line-height: 1.5; margin: 0 0 16px;">
          Whenever you are ready to resume care with Dr. Chihnitha, you are warmly invited to book a fresh slot online.
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
Your appointment on ${p.appointmentDate} (${p.appointmentTime}) has been cancelled.
Whenever you wish to reschedule, visit https://vshma.in/book or message +91 7416001477.`;

    return { subject: `Appointment Cancelled [Ref: ${p.referenceNumber}] — VSHMA Clinic`, html, text };
  },

  // 7. Reminder: 24 Hours
  reminder_24h: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `Reminder: Your consultation with Dr. Chihnitha is tomorrow at ${p.appointmentTime}.`,
      headline: `Your Consultation Is Tomorrow`,
      subtitle: `We look forward to seeing you, ${p.patientName}.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        <p style="font-size: 14px; color: ${EMAIL_COLORS.ink}; line-height: 1.6; margin: 0 0 16px;">
          This is a gentle reminder that your consultation is scheduled for tomorrow.
        </p>
        ${renderVoucherCard([
          { label: 'Date', value: p.appointmentDate },
          { label: 'Time', value: p.appointmentTime },
          { label: 'Consultation', value: p.consultationType },
          { label: 'Location', value: p.location || 'VSHMA Clinic, Bengaluru' },
        ])}
      `,
      ctaButton: {
        label: 'Confirm / Get Directions',
        url: 'https://vshma.in/contact',
      },
    });

    const text = `VSHMA HOMEOPATHY CLINIC
Reminder: Consultation Tomorrow (Ref: ${p.referenceNumber})

Dear ${p.patientName},
Your consultation is tomorrow, ${p.appointmentDate} at ${p.appointmentTime}.
Location: ${p.location || 'VSHMA Clinic, Bengaluru'}
Doctor: Dr. Chihnitha Reddy T (BHMS)

Directions: https://vshma.in/contact`;

    return { subject: `Reminder: Your Consultation Tomorrow at ${p.appointmentTime} — VSHMA Clinic`, html, text };
  },

  // 8. Reminder: 2 Hours
  reminder_2h: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `Your consultation is in 2 hours at ${p.appointmentTime}.`,
      headline: `Your Consultation Starts in 2 Hours`,
      subtitle: `We are ready for your session today.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        ${renderVoucherCard([
          { label: 'Time Today', value: p.appointmentTime },
          { label: 'Doctor', value: 'Dr. Chihnitha Reddy T (BHMS)' },
          { label: 'Format', value: p.mode || 'In-Clinic (Bengaluru)' },
          { label: 'Clinic Desk', value: '+91 7416001477' },
        ])}
      `,
      ctaButton: {
        label: 'Open Clinic Location Map',
        url: 'https://maps.google.com/?q=Bengaluru+Karnataka+India',
      },
    });

    const text = `VSHMA HOMEOPATHY CLINIC
Reminder: Consultation in 2 Hours

Dear ${p.patientName},
Your session is today at ${p.appointmentTime}.
Doctor: Dr. Chihnitha Reddy T (BHMS)
Desk: +91 7416001477`;

    return { subject: `Reminder: Consultation in 2 Hours (${p.appointmentTime}) — VSHMA Clinic`, html, text };
  },

  // 9. Post-Consultation Follow-Up
  post_consultation_followup: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `Thank you for consulting Dr. Chihnitha Reddy T. Here are your care notes.`,
      headline: `Thank You for Your Consultation`,
      subtitle: `Notes on your homeopathic care plan and next steps.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        <p style="font-size: 14px; color: ${EMAIL_COLORS.ink}; line-height: 1.6; margin: 0 0 16px;">
          Dear ${p.patientName}, thank you for your visit today. Here are important guidelines to support your remedy response:
        </p>
        <div style="background-color: #FAF4E6; border: 1px solid #D4D8BA; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <ul style="margin: 0; padding-left: 18px; color: #161815; font-size: 13px; line-height: 1.7;">
            <li>Take your prescribed natural remedies on a clean palate (15 minutes away from food, coffee, or strong mints).</li>
            <li>Observe any gentle changes in energy, sleep rhythms, and symptom patterns over the next 10–14 days.</li>
            <li>If you experience any sudden acute shifts, send an update to our reception WhatsApp.</li>
          </ul>
        </div>
      `,
      ctaButton: {
        label: 'Schedule Follow-Up Review',
        url: 'https://vshma.in/book',
      },
    });

    const text = `VSHMA HOMEOPATHY CLINIC
Post-Consultation Care Guidelines (Ref: ${p.referenceNumber})

Dear ${p.patientName},
Thank you for your visit today with Dr. Chihnitha Reddy T.
Guidelines:
1. Take remedies 15 mins away from food/coffee.
2. Note changes in energy, sleep, and symptoms.
3. Message our clinic desk on WhatsApp (+91 7416001477) if needed.
Book review: https://vshma.in/book`;

    return { subject: `Your Consultation Follow-up & Care Guidelines — VSHMA Clinic`, html, text };
  },

  // 10. Remedy Tracking Check-In (7-Day)
  remedy_tracking_checkin: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `How are you feeling after starting your homeopathic remedies?`,
      headline: `Weekly Remedy Check-In`,
      subtitle: `Dr. Chihnitha would like to check on your initial response.`,
      referenceNumber: p.referenceNumber,
      contentHtml: `
        <p style="font-size: 14px; color: ${EMAIL_COLORS.ink}; line-height: 1.6; margin: 0 0 16px;">
          Dear ${p.patientName}, it has been one week since your consultation.
        </p>
        <p style="font-size: 13px; color: ${EMAIL_COLORS.sageText}; line-height: 1.6; margin: 0 0 20px;">
          Homeopathic remedies work gently by stimulating your natural vitality. How are your symptoms progressing? Please reply to this email or send a brief WhatsApp update so our team can note your progress.
        </p>
      `,
      ctaButton: {
        label: 'Message Clinic via WhatsApp',
        url: 'https://wa.me/917416001477?text=Hi%20VSHMA%2C%20sharing%20my%20weekly%20remedy%20progress',
      },
    });

    const text = `VSHMA HOMEOPATHY CLINIC
Remedy Check-In (Ref: ${p.referenceNumber})

Dear ${p.patientName},
It has been one week since your consultation. How are your symptoms responding?
Send a quick update via WhatsApp (+91 7416001477) or reply to this email.`;

    return { subject: `How Are You Feeling? Weekly Remedy Check-In — VSHMA Clinic`, html, text };
  },

  // 11. Daily Clinic Digest (Doctor & Clinic Staff)
  daily_clinic_digest: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `Daily Clinic Schedule: ${p.totalAppointments || 0} consultations for ${p.appointmentDate}.`,
      headline: `Daily Clinical Schedule`,
      subtitle: `${p.appointmentDate} &bull; ${p.totalAppointments || 0} Scheduled Patient Sessions`,
      contentHtml: `
        <p style="font-size: 14px; color: ${EMAIL_COLORS.ink}; line-height: 1.5; margin: 0 0 16px;">
          Good morning. Here is today's schedule for Dr. Chihnitha Reddy T at VSHMA Homeopathy Clinic:
        </p>
        ${p.digestListHtml || '<p style="color:#5A635B;font-size:13px;">No scheduled appointments for today.</p>'}
      `,
      ctaButton: {
        label: 'Open Full Staff Roster',
        url: 'https://vshma.in/admin/appointments',
      },
    });

    const text = `VSHMA CLINIC — DAILY SCHEDULE
Date: ${p.appointmentDate}
Total Appointments: ${p.totalAppointments || 0}
Open Portal: https://vshma.in/admin/appointments`;

    return { subject: `Daily Clinic Digest: ${p.appointmentDate} (${p.totalAppointments || 0} Appointments) — VSHMA`, html, text };
  },

  // 12. Opt-Out Confirmed
  opt_out_confirmed: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `You have opted out of non-essential communications from VSHMA Clinic.`,
      headline: `Notification Preferences Updated`,
      subtitle: `Your communication preference has been saved.`,
      contentHtml: `
        <p style="font-size: 14px; color: ${EMAIL_COLORS.ink}; line-height: 1.6; margin: 0 0 16px;">
          Dear ${p.patientName}, as requested, we have removed your contact details from non-essential reminders and check-in dispatches.
        </p>
        <p style="font-size: 13px; color: ${EMAIL_COLORS.sageText}; line-height: 1.5; margin: 0;">
          Direct transactional notices regarding active appointment bookings will still be provided when you schedule a visit.
        </p>
      `,
    });

    const text = `VSHMA HOMEOPATHY CLINIC
Notification Preferences Updated

Dear ${p.patientName},
You have opted out of non-essential check-ins. If you ever wish to re-subscribe, contact care@vshma.in.`;

    return { subject: `Notification Preferences Updated — VSHMA Clinic`, html, text };
  },

  // 13. Inactivity Re-Engagement (90-Day Review)
  inactivity_reengagement: (p: LuxuryEmailProps): RenderedEmail => {
    const html = wrapEmailLayout({
      preheader: `It has been a few months since your last consultation with Dr. Chihnitha.`,
      headline: `Seasonal Health Review`,
      subtitle: `Checking in on your continued wellness journey.`,
      contentHtml: `
        <p style="font-size: 14px; color: ${EMAIL_COLORS.ink}; line-height: 1.6; margin: 0 0 16px;">
          Dear ${p.patientName}, seasons change and health rhythms evolve. It has been a few months since your last consultation at VSHMA Clinic.
        </p>
        <p style="font-size: 13px; color: ${EMAIL_COLORS.sageText}; line-height: 1.6; margin: 0 0 20px;">
          If you are experiencing any shifts in immunity, energy, or seasonal complaints, Dr. Chihnitha is available for a focused follow-up review.
        </p>
      `,
      ctaButton: {
        label: 'Schedule Seasonal Follow-up',
        url: 'https://vshma.in/book',
      },
    });

    const text = `VSHMA HOMEOPATHY CLINIC
Seasonal Health Review

Dear ${p.patientName},
It has been a few months since your last consultation with Dr. Chihnitha Reddy T.
If you would like to review your symptoms or lifestyle rhythms, schedule a session at https://vshma.in/book.`;

    return { subject: `Seasonal Health Review & Follow-up — VSHMA Clinic`, html, text };
  },

  // Aliases for event scheduler and legacy caller compatibility
  confirmed: (p: LuxuryEmailProps) => LUXURY_EMAIL_TEMPLATES.booking_confirmed(p),
  rescheduled: (p: LuxuryEmailProps) => LUXURY_EMAIL_TEMPLATES.booking_rescheduled(p),
  cancelled: (p: LuxuryEmailProps) => LUXURY_EMAIL_TEMPLATES.booking_cancelled(p),
  completed: (p: LuxuryEmailProps) => LUXURY_EMAIL_TEMPLATES.post_consultation_followup(p),
  no_show: (p: LuxuryEmailProps) => LUXURY_EMAIL_TEMPLATES.post_consultation_followup(p),
  doctor_reminder: (p: LuxuryEmailProps) => LUXURY_EMAIL_TEMPLATES.doctor_new_booking_alert(p),
};
