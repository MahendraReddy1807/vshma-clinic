import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { emailTemplates, variablesForTemplate } from '../emails/resend/templates.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outputDirectory = path.resolve(here, '../emails/previews');
const samples = {
  CLINIC_NAME: 'VSHMA Homeopathy Clinic',
  DOCTOR_NAME: 'Dr. Chihnitha Reddy T',
  DOCTOR_QUALIFICATION: 'BHMS',
  CLINIC_LOCATION: 'Bengaluru, Karnataka, India',
  CLINIC_LOGO_URL: 'https://vshma-clinic.vercel.app/logo-transparent.png',
  CLINIC_URL: 'https://vshma-clinic.vercel.app/book',
  WHATSAPP_URL: 'https://wa.me/917416001477',
  PATIENT_NAME: 'Asha Sample',
  PATIENT_EMAIL: 'asha@example.test',
  PATIENT_PHONE: '+91 90000 00000',
  BOOKING_REFERENCE: 'VSHMA-SAMPLE-001',
  APPOINTMENT_DATE: 'Saturday, 28 November 2026',
  APPOINTMENT_TIME: 'Morning · 9:00 AM–12:00 PM',
  PREVIOUS_APPOINTMENT_DATE: 'Friday, 27 November 2026',
  PREVIOUS_APPOINTMENT_TIME: 'Afternoon · 12:00 PM–3:00 PM',
  NEW_APPOINTMENT_DATE: 'Saturday, 28 November 2026',
  NEW_APPOINTMENT_TIME: 'Morning · 9:00 AM–12:00 PM',
  BOOKING_CREATED_AT: 'Friday, 20 November 2026 · 10:30 AM IST',
  REMINDER_TYPE: '24-hour',
  REMINDER_LEAD: 'tomorrow',
  ADMIN_DASHBOARD_URL: 'https://vshma-clinic.vercel.app/admin/appointments?search=VSHMA-SAMPLE-001',
};
const escapeHtml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

await fs.mkdir(outputDirectory, { recursive: true });
for (const template of emailTemplates) {
  const html = template.html.replace(/\{\{\{([A-Z0-9_]+)\}\}\}/g, (_, key) => escapeHtml(samples[key] ?? ''));
  const outputPath = path.join(outputDirectory, `${template.alias}.html`);
  await fs.writeFile(outputPath, html, 'utf8');
  console.log(`Preview written: ${path.relative(process.cwd(), outputPath)}`);
}
