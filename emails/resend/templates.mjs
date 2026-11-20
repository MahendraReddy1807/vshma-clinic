const variableDefaults = {
  CLINIC_NAME: 'VSHMA Homeopathy Clinic',
  DOCTOR_NAME: 'Dr. Chihnitha Reddy T',
  DOCTOR_QUALIFICATION: 'BHMS',
  CLINIC_LOCATION: 'Bengaluru, Karnataka, India',
  CLINIC_LOGO_URL: 'https://vshma-clinic.vercel.app/logo-transparent.png',
  CLINIC_URL: 'https://vshma-clinic.vercel.app',
  WHATSAPP_URL: 'https://wa.me/917416001477',
  PATIENT_NAME: 'Patient',
  PATIENT_EMAIL: 'Not provided',
  PATIENT_PHONE: 'Not provided',
  BOOKING_REFERENCE: 'VSHMA-REFERENCE',
  APPOINTMENT_DATE: 'To be confirmed',
  APPOINTMENT_TIME: 'Flexible',
  PREVIOUS_APPOINTMENT_DATE: 'Previous date',
  PREVIOUS_APPOINTMENT_TIME: 'Previous time',
  NEW_APPOINTMENT_DATE: 'New date',
  NEW_APPOINTMENT_TIME: 'New time',
  BOOKING_CREATED_AT: 'Date and time not available',
  REMINDER_TYPE: 'Upcoming',
  REMINDER_LEAD: 'soon',
  ADMIN_DASHBOARD_URL: 'https://vshma-clinic.vercel.app/admin/appointments',
};

const variableDefinitions = Object.entries(variableDefaults).map(([key, fallbackValue]) => ({
  key,
  type: 'string',
  fallbackValue,
}));

const row = (label, variable) => `
  <tr>
    <td style="padding:11px 0;border-bottom:1px solid #e6ece7;color:#64756c;font-size:14px;">${label}</td>
    <td align="right" style="padding:11px 0;border-bottom:1px solid #e6ece7;color:#183d32;font-size:14px;font-weight:600;">{{{${variable}}}}</td>
  </tr>`;

const card = (title, rows) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;background:#f7f8f3;border:1px solid #e1e9e1;border-radius:12px;">
    <tr><td style="padding:20px 22px 8px;color:#b09a66;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">${title}</td></tr>
    <tr><td style="padding:0 22px 16px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${rows}</table></td></tr>
  </table>`;

const action = (label, url = 'WHATSAPP_URL') => `
  <table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px auto 8px;">
    <tr><td align="center" bgcolor="#183d32" style="border-radius:28px;">
      <a href="{{{${url}}}}" style="display:inline-block;padding:14px 24px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;">${label}</a>
    </td></tr>
  </table>`;

const layout = (preheader, body) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
  <title>{{{CLINIC_NAME}}}</title>
  <style>
    @media screen and (max-width:620px) {
      .email-shell{width:100%!important;border-radius:0!important}
      .email-pad{padding-left:22px!important;padding-right:22px!important}
      .email-title{font-size:26px!important;line-height:1.2!important}
    }
  </style>
</head>
<body style="margin:0;padding:24px 10px;background:#f4f6f1;font-family:Arial,Helvetica,sans-serif;color:#34443c;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
    <tr><td align="center">
      <table role="presentation" class="email-shell" width="600" cellspacing="0" cellpadding="0" style="width:100%;max-width:600px;border:1px solid #dfe7df;border-radius:18px;background:#ffffff;overflow:hidden;">
        <tr><td align="center" class="email-pad" style="padding:26px 34px 22px;background:#ffffff;border-bottom:1px solid #edf1ec;">
          <img src="{{{CLINIC_LOGO_URL}}}" width="54" height="54" alt="VSHMA" style="display:block;width:54px;height:54px;object-fit:contain;margin:0 auto 9px;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:25px;font-weight:bold;letter-spacing:1px;color:#183d32;">{{{CLINIC_NAME}}}</div>
          <div style="margin-top:5px;color:#829c89;font-size:10px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">Natural care · personal attention</div>
        </td></tr>
        <tr><td class="email-pad" style="padding:34px 42px 28px;">
          ${body}
        </td></tr>
        <tr><td class="email-pad" align="center" style="padding:22px 34px 26px;background:#f7f8f3;border-top:1px solid #e8eee8;">
          <div style="font-family:Georgia,'Times New Roman',serif;color:#183d32;font-size:16px;font-weight:bold;">{{{DOCTOR_NAME}}} · {{{DOCTOR_QUALIFICATION}}}</div>
          <div style="margin-top:6px;color:#65756b;font-size:13px;">{{{CLINIC_LOCATION}}}</div>
          <div style="margin-top:8px;color:#65756b;font-size:13px;">Questions? <a href="{{{WHATSAPP_URL}}}" style="color:#426b57;font-weight:bold;">Chat with VSHMA on WhatsApp</a></div>
          <div style="margin-top:16px;color:#89958d;font-size:11px;line-height:1.6;">This email is for appointment coordination. For urgent or emergency symptoms, contact local emergency services.</div>
        </td></tr>
      </table>
      <div style="padding:16px 8px;color:#9aa49d;font-size:11px;">© {{{CLINIC_NAME}}}</div>
    </td></tr>
  </table>
</body>
</html>`;

const heading = (text, intro) => `
  <div style="margin-bottom:9px;color:#829c89;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;">VSHMA · Bengaluru</div>
  <h1 class="email-title" style="margin:0;color:#183d32;font-family:Georgia,'Times New Roman',serif;font-size:31px;line-height:1.25;">${text}</h1>
  <p style="margin:15px 0 0;color:#5d6a62;font-size:15px;line-height:1.7;">${intro}</p>`;

export const emailTemplates = [
  {
    alias: 'vshma-appointment-request',
    name: 'VSHMA · Appointment request received',
    subject: 'We received your appointment request | VSHMA Clinic',
    variables: variableDefinitions,
    html: layout('Your appointment request has been received and is awaiting clinic confirmation.', `
      ${heading('Request received', 'Dear {{{PATIENT_NAME}}}, we have received your appointment request. It is awaiting confirmation from the clinic.')}
      ${card('Request details', `${row('Booking reference', 'BOOKING_REFERENCE')}${row('Requested date', 'APPOINTMENT_DATE')}${row('Requested time', 'APPOINTMENT_TIME')}${row('Clinic', 'CLINIC_LOCATION')}`)}
      <p style="margin:0;color:#5d6a62;font-size:14px;line-height:1.7;">We will contact you when the clinic has reviewed availability. This message is not an appointment confirmation.</p>
      ${action('Contact the clinic')}`),
  },
  {
    alias: 'vshma-appointment-confirmed',
    name: 'VSHMA · Appointment confirmed',
    subject: 'Your appointment is confirmed | VSHMA Clinic',
    variables: variableDefinitions,
    html: layout('Your VSHMA appointment is confirmed.', `
      ${heading('Your appointment is confirmed', 'Dear {{{PATIENT_NAME}}}, your appointment with {{{DOCTOR_NAME}}} ({{{DOCTOR_QUALIFICATION}}}) has been confirmed.')}
      ${card('Confirmed appointment', `${row('Booking reference', 'BOOKING_REFERENCE')}${row('Date', 'APPOINTMENT_DATE')}${row('Time', 'APPOINTMENT_TIME')}${row('Clinic', 'CLINIC_LOCATION')}`)}
      <p style="margin:0;color:#5d6a62;font-size:14px;line-height:1.7;">Please contact the clinic if you need help with your appointment details.</p>
      ${action('Contact the clinic')}`),
  },
  {
    alias: 'vshma-appointment-rescheduled',
    name: 'VSHMA · Appointment rescheduled',
    subject: 'Your appointment has been rescheduled | VSHMA Clinic',
    variables: variableDefinitions,
    html: layout('Your VSHMA appointment schedule has changed.', `
      ${heading('Appointment rescheduled', 'Dear {{{PATIENT_NAME}}}, your appointment schedule has been updated. Please review the previous and new time below.')}
      ${card('Schedule update', `${row('Booking reference', 'BOOKING_REFERENCE')}${row('Previous date', 'PREVIOUS_APPOINTMENT_DATE')}${row('Previous time', 'PREVIOUS_APPOINTMENT_TIME')}${row('New date', 'NEW_APPOINTMENT_DATE')}${row('New time', 'NEW_APPOINTMENT_TIME')}${row('Clinic', 'CLINIC_LOCATION')}`)}
      <p style="margin:0;color:#5d6a62;font-size:14px;line-height:1.7;">If the new schedule does not work for you, contact the clinic to discuss another time.</p>
      ${action('Contact the clinic')}`),
  },
  {
    alias: 'vshma-appointment-cancelled',
    name: 'VSHMA · Appointment cancelled',
    subject: 'Appointment update | VSHMA Clinic',
    variables: variableDefinitions,
    html: layout('An update about your VSHMA appointment.', `
      ${heading('Appointment cancelled', 'Dear {{{PATIENT_NAME}}}, your appointment request has been cancelled.')}
      ${card('Cancelled appointment', `${row('Booking reference', 'BOOKING_REFERENCE')}${row('Date', 'APPOINTMENT_DATE')}${row('Time', 'APPOINTMENT_TIME')}${row('Clinic', 'CLINIC_LOCATION')}`)}
      <p style="margin:0;color:#5d6a62;font-size:14px;line-height:1.7;">If you would like to request another appointment, contact the clinic and we will help with next steps.</p>
      ${action('Request another appointment', 'CLINIC_URL')}`),
  },
  {
    alias: 'vshma-appointment-reminder',
    name: 'VSHMA · Appointment reminder',
    subject: 'Reminder: Your upcoming VSHMA appointment',
    variables: variableDefinitions,
    html: layout('A reminder about your upcoming confirmed VSHMA appointment.', `
      ${heading('{{{REMINDER_TYPE}}} appointment reminder', 'Dear {{{PATIENT_NAME}}}, this is a reminder that your appointment is coming up {{{REMINDER_LEAD}}}.')}
      ${card('Appointment details', `${row('Booking reference', 'BOOKING_REFERENCE')}${row('Date', 'APPOINTMENT_DATE')}${row('Time', 'APPOINTMENT_TIME')}${row('Doctor', 'DOCTOR_NAME')}${row('Clinic', 'CLINIC_LOCATION')}`)}
      <p style="margin:0;color:#5d6a62;font-size:14px;line-height:1.7;">This reminder is for an appointment the clinic has confirmed. Contact us if you need assistance.</p>
      ${action('Contact the clinic')}`),
  },
  {
    alias: 'vshma-admin-new-booking',
    name: 'VSHMA · New booking admin notification',
    subject: 'New appointment request received | VSHMA',
    variables: variableDefinitions,
    html: layout('A new VSHMA appointment request is ready for review.', `
      ${heading('New appointment request', 'A new appointment request was submitted. Review the scheduling details in the admin dashboard.')}
      ${card('Booking details', `${row('Patient', 'PATIENT_NAME')}${row('Email', 'PATIENT_EMAIL')}${row('Phone', 'PATIENT_PHONE')}${row('Booking reference', 'BOOKING_REFERENCE')}${row('Requested date', 'APPOINTMENT_DATE')}${row('Requested time', 'APPOINTMENT_TIME')}${row('Submitted', 'BOOKING_CREATED_AT')}`)}
      <p style="margin:0;color:#5d6a62;font-size:13px;line-height:1.7;">This notification intentionally excludes consultation notes and other clinical details.</p>
      ${action('Open appointment dashboard', 'ADMIN_DASHBOARD_URL')}`),
  },
];

export function variablesForTemplate(template) {
  const used = new Set([...template.html.matchAll(/\{\{\{([A-Z0-9_]+)\}\}\}/g)].map((match) => match[1]));
  return template.variables.filter((variable) => used.has(variable.key));
}
