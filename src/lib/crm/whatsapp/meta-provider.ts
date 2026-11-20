import { createHmac, timingSafeEqual } from 'node:crypto';
import type {
  IWhatsAppProvider,
  WhatsAppProviderType,
  ProviderTextMessageRequest,
  ProviderTemplateMessageRequest,
  NormalizedSendResult,
  NormalizedIncomingMessage,
  NormalizedDeliveryStatus,
  ProviderConnectionHealth,
} from './provider.interface';

export type MetaTransport = (url: string, options: RequestInit) => Promise<Response>;
let customMetaTransport: MetaTransport | null = null;

export function setMockMetaTransport(transport: MetaTransport | null) {
  customMetaTransport = transport;
}

export class MetaWhatsAppProvider implements IWhatsAppProvider {
  readonly providerType: WhatsAppProviderType = 'meta';

  private getAccessToken(): string {
    return process.env.WHATSAPP_ACCESS_TOKEN?.trim() || '';
  }

  private getPhoneNumberId(): string {
    return process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || '';
  }

  private getApiVersion(): string {
    return process.env.WHATSAPP_API_VERSION?.trim() || 'v21.0';
  }

  private getAppSecret(): string {
    return process.env.WHATSAPP_APP_SECRET?.trim() || '';
  }

  private getWebhookVerifyToken(): string {
    return process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim() || '';
  }

  async sendTextMessage(req: ProviderTextMessageRequest): Promise<NormalizedSendResult> {
    const accessToken = this.getAccessToken();
    const phoneNumberId = this.getPhoneNumberId();

    if (!accessToken || !phoneNumberId) {
      return {
        success: false,
        providerType: 'meta',
        status: 'failed',
        error: 'Meta Cloud API credentials (WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID) missing.',
      };
    }

    const cleanPhone = req.recipientPhone.replace(/[^0-9]/g, '');
    const url = `https://graph.facebook.com/${this.getApiVersion()}/${phoneNumberId}/messages`;

    const payload: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: req.messageText,
      },
    };

    if (req.replyToMessageId) {
      payload.context = { message_id: req.replyToMessageId };
    }

    try {
      const transport = customMetaTransport || fetch;
      const res = await transport(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          providerType: 'meta',
          status: 'failed',
          error: data.error?.message || `Meta API HTTP error ${res.status}`,
          rawResponse: data,
        };
      }

      const messageId = data.messages?.[0]?.id;
      return {
        success: true,
        providerType: 'meta',
        providerMessageId: messageId,
        status: 'sent',
        rawResponse: data,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        providerType: 'meta',
        status: 'failed',
        error: msg,
      };
    }
  }

  async sendTemplateMessage(req: ProviderTemplateMessageRequest): Promise<NormalizedSendResult> {
    const accessToken = this.getAccessToken();
    const phoneNumberId = this.getPhoneNumberId();

    if (!accessToken || !phoneNumberId) {
      return {
        success: false,
        providerType: 'meta',
        status: 'failed',
        error: 'Meta Cloud API credentials missing.',
      };
    }

    const cleanPhone = req.recipientPhone.replace(/[^0-9]/g, '');
    const url = `https://graph.facebook.com/${this.getApiVersion()}/${phoneNumberId}/messages`;

    // Map dictionary variables into Meta parameter list
    const parameters = Object.values(req.variables).map((val) => ({
      type: 'text',
      text: String(val),
    }));

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'template',
      template: {
        name: req.templateName,
        language: { code: req.languageCode || 'en' },
        components: [
          {
            type: 'body',
            parameters,
          },
        ],
      },
    };

    try {
      const transport = customMetaTransport || fetch;
      const res = await transport(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          providerType: 'meta',
          status: 'failed',
          error: data.error?.message || `Meta API HTTP error ${res.status}`,
          rawResponse: data,
        };
      }

      const messageId = data.messages?.[0]?.id;
      return {
        success: true,
        providerType: 'meta',
        providerMessageId: messageId,
        status: 'sent',
        rawResponse: data,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        providerType: 'meta',
        status: 'failed',
        error: msg,
      };
    }
  }

  validateWebhook(request: Request, rawBody: string): boolean {
    const appSecret = this.getAppSecret();
    if (!appSecret) {
      console.error('[Meta WhatsApp Provider] Webhook validation failed: WHATSAPP_APP_SECRET is not configured. Failing closed.');
      return false;
    }

    const signature = request.headers.get('x-hub-signature-256');
    if (!signature || !signature.startsWith('sha256=')) {
      return false;
    }

    const providedHash = signature.slice(7).trim().toLowerCase();
    const expectedHash = createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex').toLowerCase();

    const providedBuffer = Buffer.from(providedHash, 'utf8');
    const expectedBuffer = Buffer.from(expectedHash, 'utf8');

    // Buffer length check to prevent timingSafeEqual throwing an error on mismatched byte lengths
    if (providedBuffer.length !== expectedBuffer.length || providedBuffer.length === 0) {
      return false;
    }

    try {
      return timingSafeEqual(providedBuffer, expectedBuffer);
    } catch {
      return false;
    }
  }

  normalizeIncomingMessage(rawPayload: unknown): NormalizedIncomingMessage | null {
    if (!rawPayload || typeof rawPayload !== 'object') return null;
    const p = rawPayload as Record<string, unknown>;

    // Meta webhook payload navigation
    const entries = (p.entry as Array<Record<string, unknown>>) || [];
    for (const entry of entries) {
      const changes = (entry.changes as Array<Record<string, unknown>>) || [];
      for (const change of changes) {
        const val = change.value as Record<string, unknown>;
        const messages = (val?.messages as Array<Record<string, unknown>>) || [];
        const contacts = (val?.contacts as Array<Record<string, unknown>>) || [];

        if (messages.length > 0) {
          const m = messages[0];
          const textBody = (m.text as Record<string, unknown>)?.body;
          const senderName = (contacts[0]?.profile as Record<string, unknown>)?.name;

          return {
            providerType: 'meta',
            providerMessageId: String(m.id || ''),
            senderPhone: String(m.from || ''),
            recipientPhone: String((val.metadata as Record<string, unknown>)?.display_phone_number || ''),
            messageBody: typeof textBody === 'string' ? textBody : '',
            messageType: m.type === 'text' ? 'text' : m.type === 'image' ? 'image' : 'unknown',
            timestamp: m.timestamp ? new Date(Number(m.timestamp) * 1000).toISOString() : new Date().toISOString(),
            senderName: typeof senderName === 'string' ? senderName : undefined,
            rawPayload,
          };
        }
      }
    }

    return null;
  }

  normalizeDeliveryStatus(rawPayload: unknown): NormalizedDeliveryStatus | null {
    if (!rawPayload || typeof rawPayload !== 'object') return null;
    const p = rawPayload as Record<string, unknown>;

    const entries = (p.entry as Array<Record<string, unknown>>) || [];
    for (const entry of entries) {
      const changes = (entry.changes as Array<Record<string, unknown>>) || [];
      for (const change of changes) {
        const val = change.value as Record<string, unknown>;
        const statuses = (val?.statuses as Array<Record<string, unknown>>) || [];

        if (statuses.length > 0) {
          const s = statuses[0];
          const rawStatus = String(s.status || '');
          const statusMapped =
            rawStatus === 'delivered'
              ? 'delivered'
              : rawStatus === 'read'
              ? 'read'
              : rawStatus === 'sent'
              ? 'sent'
              : 'failed';

          const errors = s.errors as Array<Record<string, unknown>> | undefined;
          const errDetail = errors?.[0]?.message || errors?.[0]?.title;

          return {
            providerType: 'meta',
            providerMessageId: String(s.id || ''),
            recipientPhone: String(s.recipient_id || ''),
            status: statusMapped,
            timestamp: s.timestamp ? new Date(Number(s.timestamp) * 1000).toISOString() : new Date().toISOString(),
            errorMessage: typeof errDetail === 'string' ? errDetail : undefined,
            rawPayload,
          };
        }
      }
    }

    return null;
  }

  async getConnectionHealth(): Promise<ProviderConnectionHealth> {
    const hasToken = Boolean(this.getAccessToken());
    const hasPhoneId = Boolean(this.getPhoneNumberId());

    if (!hasToken || !hasPhoneId) {
      return {
        providerType: 'meta',
        isHealthy: false,
        statusDetails: 'Credentials unconfigured (WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID missing).',
      };
    }

    return {
      providerType: 'meta',
      isHealthy: true,
      statusDetails: 'Meta WhatsApp Cloud API v21.0 configured and ready.',
    };
  }
}
