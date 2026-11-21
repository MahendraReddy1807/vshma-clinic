/**
 * VSHMA SMS Templates
 * Strictly under 160 characters for single-SMS compliance.
 * Includes DLT template ID placeholders for Indian telecom regulation.
 */

export interface SmsTemplateData {
  patientName: string;
  timeStr: string;
  referenceNumber: string;
}

export const SMS_TEMPLATES = {
  // TODO: Replace with official TRAI DLT template ID once approved
  dltTemplateIds: {
    confirmed: 'DLT_VSHMA_CONFIRM_01',
    reminder_2h: 'DLT_VSHMA_REMIND_2H_02',
    reminder_10m: 'DLT_VSHMA_REMIND_10M_03',
  },

  confirmed: (d: SmsTemplateData) =>
    `VSHMA: Dear ${d.patientName}, your appointment is confirmed for ${d.timeStr}. Ref: ${d.referenceNumber}. Reach 10m early. Help: 7416001477`,

  reminder_2h: (d: SmsTemplateData) =>
    `VSHMA: Reminder: Consultation today at ${d.timeStr}. Please arrive 10m prior. Ref: ${d.referenceNumber}. VSHMA Clinic`,

  reminder_10m: (d: SmsTemplateData) =>
    `VSHMA: Your consultation slot is now ready. Please proceed to the clinic desk. Ref: ${d.referenceNumber}`,
};
