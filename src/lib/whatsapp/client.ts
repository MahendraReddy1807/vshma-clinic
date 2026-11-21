import type {
  WhatsAppConfig,
  WhatsAppTemplatePayload,
  WhatsAppSendResult,
} from './types';
import { GreenApiWhatsAppProvider } from '@/lib/crm/whatsapp/green-api-provider';

let greenProviderInstance: GreenApiWhatsAppProvider | null = null;
function getGreenProvider(): GreenApiWhatsAppProvider {
  if (!greenProviderInstance) {
    greenProviderInstance = new GreenApiWhatsAppProvider();
  }
  return greenProviderInstance;
}

/**
 * Resolves the active WhatsApp provider.
 * VSHMA clinic standardizes on Green API by default.
 * Meta is only selected if explicitly configured via WHATSAPP_PROVIDER=meta.
 */
export function getActiveWhatsAppProvider(): 'green_api' | 'meta' {
  const explicit = process.env.WHATSAPP_PROVIDER?.trim().toLowerCase();
  if (explicit === 'meta') return 'meta';
  return 'green_api';
}

/**
 * Checks whether the active WhatsApp provider (Green API or Meta) has valid credentials.
 */
export function isWhatsAppConfigured(): boolean {
  const provider = getActiveWhatsAppProvider();
  if (provider === 'green_api') {
    const id = process.env.GREEN_API_ID_INSTANCE?.trim() || process.env.GREEN_API_INSTANCE_ID?.trim();
    const token = process.env.GREEN_API_TOKEN_INSTANCE?.trim() || process.env.GREEN_API_API_TOKEN?.trim();
    return Boolean(id && token);
  }
  const config = getWhatsAppConfig();
  return Boolean(config?.accessToken && config?.phoneNumberId);
}

/**
 * Renders structured WhatsApp text for Green API from a standard template payload.
 */
export function renderWhatsAppTextFromPayload(payload: WhatsAppTemplatePayload): string {
  const templateName = payload.template?.name || '';
  const params: string[] = [];

  for (const comp of payload.template?.components || []) {
    if (comp.parameters) {
      for (const p of comp.parameters) {
        if (p.type === 'text' && p.text) {
          params.push(p.text);
        }
      }
    }
  }

  if (templateName === 'vshma_admin_new_booking') {
    return [
      '*VSHMA CLINIC ALERT*',
      '*New Patient Booking Request Received* 🔔',
      '',
      `• *Patient:* ${params[0] || 'Unknown'}`,
      `• *Phone:* +91 ${params[1] || 'Not provided'}`,
      `• *Date:* ${params[2] || 'Scheduled'}`,
      `• *Time:* ${params[3] || 'Flexible'}`,
      `• *Consultation:* ${params[4] || 'General Consultation'}`,
      `• *Booking Ref:* ${params[5] || 'VSHMA-REF'}`,
      '',
      'Staff Portal: https://vshma-clinic.vercel.app/admin/appointments',
    ].join('\n');
  }

  if (templateName === 'vshma_patient_booking_ack') {
    return [
      '*VSHMA HOMEOPATHY CLINIC*',
      '*Appointment Request Received*',
      '',
      `Dear ${params[0] || 'Patient'},`,
      '',
      'Thank you for reaching out to VSHMA Homeopathy Clinic. We have successfully logged your appointment reservation request.',
      '',
      '📋 *Requested Details:*',
      `• *Consultation:* ${params[1] || 'Homeopathic Consultation'}`,
      `• *Requested Date:* ${params[2] || 'Scheduled'}`,
      `• *Preferred Time:* ${params[3] || 'Flexible'}`,
      `• *Booking Reference:* ${params[4] || 'VSHMA-REF'}`,
      '',
      'Our clinic team is reviewing doctor availability and will send you an official confirmation once your appointment time is confirmed.',
      '',
      'WhatsApp Concierge: +91 7416001477',
      '— VSHMA Homeopathy Clinic',
    ].join('\n');
  }

  if (templateName === 'vshma_patient_appointment_confirmed') {
    return [
      '*VSHMA HOMEOPATHY CLINIC*',
      '*Appointment Confirmed* ✅',
      '',
      `Dear ${params[0] || 'Patient'},`,
      '',
      'Your consultation with *Dr. Chihnitha Reddy T (BHMS)* is officially CONFIRMED!',
      '',
      '📋 *Confirmed Schedule:*',
      `• *Confirmed Date:* ${params[1] || 'Scheduled'}`,
      `• *Exact Time (IST):* ${params[2] || 'Scheduled Window'}`,
      `• *Consultation:* ${params[3] || 'Homeopathic Consultation'}`,
      `• *Booking Reference:* ${params[4] || 'VSHMA-REF'}`,
      '• *Location:* Bengaluru, Karnataka, India',
      '',
      '✦ *Preparation Guidelines:*',
      '• Please arrive or connect 5 minutes before your scheduled time.',
      '• Refrain from coffee, mint, or pungent aromatics 15 minutes before the session.',
      '• Keep previous prescriptions or lab reports handy.',
      '',
      'Need assistance? Message us on WhatsApp: +91 7416001477',
      '— VSHMA Homeopathy Clinic',
    ].join('\n');
  }

  if (templateName === 'vshma_patient_appointment_rescheduled') {
    return [
      '*VSHMA HOMEOPATHY CLINIC*',
      '*Appointment Rescheduled* 🗓️',
      '',
      `Dear ${params[0] || 'Patient'},`,
      '',
      'Your upcoming consultation at VSHMA Homeopathy Clinic has been rescheduled to an updated date and time:',
      '',
      '📋 *Updated Schedule:*',
      `• *New Date:* ${params[1] || 'Scheduled'}`,
      `• *New Exact Time (IST):* ${params[2] || 'Scheduled Window'}`,
      `• *Consultation:* ${params[3] || 'Homeopathic Consultation'}`,
      `• *Booking Reference:* ${params[4] || 'VSHMA-REF'}`,
      '',
      'If this newly assigned time does not comfortably align with your calendar, reply directly to this message to pick an alternate slot.',
      '',
      '— VSHMA Homeopathy Clinic',
    ].join('\n');
  }

  if (templateName === 'vshma_patient_appointment_cancelled') {
    return [
      '*VSHMA HOMEOPATHY CLINIC*',
      '*Appointment Cancelled* ❌',
      '',
      `Dear ${params[0] || 'Patient'},`,
      '',
      `This is to confirm that your appointment request (Ref: ${params[1] || 'VSHMA-REF'}) for ${params[2] || 'scheduled date'} has been cancelled.`,
      params[3] ? `• Reason: ${params[3]}` : '',
      '',
      'Whenever you wish to schedule in the future, visit: https://vshma-clinic.vercel.app/book or contact us directly on WhatsApp.',
      '',
      '— VSHMA Homeopathy Clinic',
    ].filter(Boolean).join('\n');
  }

  if (templateName === 'vshma_patient_appointment_reminder') {
    return [
      '*VSHMA HOMEOPATHY CLINIC*',
      '*Appointment Reminder* ⏰',
      '',
      `Dear ${params[0] || 'Patient'},`,
      '',
      `Friendly reminder that your homeopathic consultation with Dr. Chihnitha Reddy T is scheduled for *${params[1] || 'soon'}* (${params[2] || 'Scheduled'} at ${params[3] || 'Scheduled'}).`,
      '',
      `• *Booking Reference:* ${params[4] || 'VSHMA-REF'}`,
      '• *Location:* Bengaluru, Karnataka, India',
      '',
      'Please arrive 5 minutes prior and avoid strong aromatics (coffee/mint) 15 minutes before your visit.',
      'WhatsApp Concierge: +91 7416001477',
      '— VSHMA Homeopathy Clinic',
    ].join('\n');
  }

  // Generic fallback
  return [
    `*${templateName.replace(/_/g, ' ').toUpperCase()}*`,
    '',
    ...params.map((val, idx) => `• Parameter ${idx + 1}: ${val}`),
    '',
    '— VSHMA Homeopathy Clinic',
  ].join('\n');
}

/**
 * Retrieves and validates the server-side WhatsApp Cloud API configuration.
 * Never exposes credentials to client-side code.
 */
export function getWhatsAppConfig(): WhatsAppConfig | null {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const adminPhone = process.env.WHATSAPP_ADMIN_PHONE?.trim();
  const webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim() || '';
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || 'v21.0';
  const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim();

  if (!accessToken || !phoneNumberId || !adminPhone) {
    return null;
  }

  return {
    accessToken,
    phoneNumberId,
    businessAccountId,
    apiVersion,
    adminPhone,
    webhookVerifyToken,
  };
}

/**
 * Validates whether a phone number meets E.164 specifications (10 to 15 digits).
 */
export function isValidE164Phone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

/**
 * Interface for mockable transport to facilitate unit/integration testing without live network calls.
 */
export type WhatsAppTransport = (
  url: string,
  options: RequestInit
) => Promise<Response>;

let customTransport: WhatsAppTransport | null = null;

/**
 * For local test suite execution: allows tests to inject mock fetch responses without calling live Meta API.
 */
export function setMockWhatsAppTransport(transport: WhatsAppTransport | null) {
  customTransport = transport;
}

/**
 * Sends an official WhatsApp template message via Meta WhatsApp Business Cloud API.
 */
export async function sendWhatsAppMessage(
  payload: WhatsAppTemplatePayload,
  configOverride?: Partial<WhatsAppConfig>
): Promise<WhatsAppSendResult> {
  const activeProvider = getActiveWhatsAppProvider();

  // 1. Direct Green API dispatch: Meta credentials are NEVER required when using Green API
  if (activeProvider === 'green_api') {
    const id = process.env.GREEN_API_ID_INSTANCE?.trim() || process.env.GREEN_API_INSTANCE_ID?.trim();
    const token = process.env.GREEN_API_TOKEN_INSTANCE?.trim() || process.env.GREEN_API_API_TOKEN?.trim();

    if (!id || !token) {
      return {
        success: false,
        status: 'failed',
        error: 'Green API credentials (GREEN_API_ID_INSTANCE or GREEN_API_TOKEN_INSTANCE) missing.',
      };
    }

    const provider = getGreenProvider();
    const formattedText = renderWhatsAppTextFromPayload(payload);
    const sendResult = await provider.sendTextMessage({
      recipientPhone: payload.to,
      messageText: formattedText,
    });

    return {
      success: sendResult.success,
      status: sendResult.success ? 'sent' : 'failed',
      messageId: sendResult.providerMessageId,
      error: sendResult.error,
    };
  }

  // 2. Meta WhatsApp Cloud API dispatch
  const config = { ...(getWhatsAppConfig() || {}), ...configOverride } as WhatsAppConfig;

  if (!config.accessToken || !config.phoneNumberId) {
    return {
      success: false,
      status: 'failed',
      error: 'Meta WhatsApp Cloud API credentials are not configured.',
    };
  }

  if (!isValidE164Phone(payload.to)) {
    return {
      success: false,
      status: 'failed',
      error: `Invalid recipient phone number format: "${payload.to}". Expected 10-15 digits.`,
    };
  }

  const url = `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${config.accessToken}`,
    'Content-Type': 'application/json',
  };

  const transport = customTransport || fetch;

  const maxRetries = 2;
  let attempt = 0;
  let lastError = '';

  while (attempt <= maxRetries) {
    try {
      const response = await transport(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.messages?.[0]?.id) {
        return {
          success: true,
          status: 'sent',
          messageId: data.messages[0].id,
        };
      }

      // Parse Meta error response
      const metaError = data?.error;
      const errorCode = metaError?.code;
      const errorMsg = metaError?.message || response.statusText || 'Meta API call failed.';
      const errorDetails = metaError?.error_data?.details ? ` (${metaError.error_data.details})` : '';

      lastError = `Meta API Error [${errorCode || response.status}]: ${errorMsg}${errorDetails}`;

      // Check if error is transient and retryable (HTTP 500, 502, 503, 504)
      const isTransient = response.status >= 500 && response.status < 600;
      if (isTransient && attempt < maxRetries) {
        attempt++;
        const backoffMs = Math.pow(2, attempt) * 500;
        await new Promise((res) => setTimeout(res, backoffMs));
        continue;
      }

      return {
        success: false,
        status: 'failed',
        error: lastError,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      lastError = `Network error connecting to Meta WhatsApp API: ${msg}`;
      if (attempt < maxRetries) {
        attempt++;
        const backoffMs = Math.pow(2, attempt) * 500;
        await new Promise((res) => setTimeout(res, backoffMs));
        continue;
      }
      return {
        success: false,
        status: 'failed',
        error: lastError,
      };
    }
  }

  return {
    success: false,
    status: 'failed',
    error: lastError,
  };
}
