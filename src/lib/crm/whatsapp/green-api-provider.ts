import { timingSafeEqual } from 'node:crypto';
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

export type GreenApiTransport = (url: string, options: RequestInit) => Promise<Response>;
let customGreenTransport: GreenApiTransport | null = null;

export function setMockGreenTransport(transport: GreenApiTransport | null) {
  customGreenTransport = transport;
}

export class GreenApiWhatsAppProvider implements IWhatsAppProvider {
  readonly providerType: WhatsAppProviderType = 'green_api';

  public getIdInstance(): string {
    return (
      process.env.GREEN_API_ID_INSTANCE?.trim() ||
      process.env.GREEN_API_INSTANCE_ID?.trim() ||
      ''
    );
  }

  public getApiToken(): string {
    return (
      process.env.GREEN_API_TOKEN_INSTANCE?.trim() ||
      process.env.GREEN_API_API_TOKEN?.trim() ||
      ''
    );
  }

  public getHost(): string {
    const raw = (
      process.env.GREEN_API_URL?.trim() ||
      process.env.GREEN_API_HOST?.trim() ||
      'https://7107.api.greenapi.com'
    );
    return raw.replace(/\/+$/, '');
  }

  async sendTextMessage(req: ProviderTextMessageRequest): Promise<NormalizedSendResult> {
    const idInstance = this.getIdInstance();
    const token = this.getApiToken();

    if (!idInstance || !token) {
      return {
        success: false,
        providerType: 'green_api',
        status: 'failed',
        error: 'Green API credentials (GREEN_API_ID_INSTANCE or GREEN_API_TOKEN_INSTANCE) missing.',
      };
    }

    const cleanDigits = req.recipientPhone.replace(/[^0-9]/g, '');
    const chatId = `${cleanDigits}@c.us`;
    const host = this.getHost();
    const url = `${host}/waInstance${idInstance}/sendMessage/${token}`;

    const payload = {
      chatId,
      message: req.messageText,
      quotedMessageId: req.replyToMessageId || undefined,
    };

    try {
      const transport = customGreenTransport || fetch;
      const res = await transport(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        let errorMsg = data.message || data.description || '';
        if (res.status === 466) {
          const quotaDetail = data.correspondentsStatus || data.invokeStatus || '';
          errorMsg = `Green API Developer Plan Limit Exceeded (HTTP 466): ${data.message || data.description || quotaDetail || 'Chat limit reached'}. On the Green API Free Developer tariff, messages can only be sent to 3 whitelisted numbers or up to 100 requests. Add this recipient to your allowed chats in console.green-api.com or upgrade the instance to a paid tariff.`;
        } else if (!errorMsg) {
          errorMsg = `Green API HTTP error ${res.status}`;
        }

        return {
          success: false,
          providerType: 'green_api',
          status: 'failed',
          error: errorMsg,
          rawResponse: data,
        };
      }

      const messageId = data.idMessage;
      return {
        success: true,
        providerType: 'green_api',
        providerMessageId: String(messageId || ''),
        status: 'sent',
        rawResponse: data,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const safeError = token ? msg.replaceAll(token, '[REDACTED_TOKEN]') : msg;
      return {
        success: false,
        providerType: 'green_api',
        status: 'failed',
        error: safeError,
      };
    }
  }

  async sendTemplateMessage(req: ProviderTemplateMessageRequest): Promise<NormalizedSendResult> {
    // Green API does not require Meta template approval; it renders the text with variable substitutions
    let renderedText = `*${req.templateName.replace(/_/g, ' ').toUpperCase()}*\n\n`;
    for (const [key, val] of Object.entries(req.variables)) {
      renderedText += `${key.replace(/_/g, ' ')}: ${val}\n`;
    }
    renderedText += `\n— VSHMA Homeopathy Clinic`;

    return this.sendTextMessage({
      recipientPhone: req.recipientPhone,
      messageText: renderedText,
      idempotencyKey: req.idempotencyKey,
    });
  }

  private getWebhookSecret(): string {
    return (
      process.env.GREEN_API_WEBHOOK_SECRET?.trim() ||
      process.env.GREEN_API_TOKEN_INSTANCE?.trim() ||
      process.env.GREEN_API_API_TOKEN?.trim() ||
      ''
    );
  }

  validateWebhook(request: Request, rawBody: string): boolean {
    const configuredSecret = this.getWebhookSecret();
    const expectedInstance = this.getIdInstance();

    // Fail closed: Webhook authentication strictly requires configured secret and instance ID
    if (!configuredSecret || !expectedInstance) {
      console.error(
        '[Green API Provider] Webhook rejected: GREEN_API_WEBHOOK_SECRET (or TOKEN_INSTANCE) or ID_INSTANCE is not configured.'
      );
      return false;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return false;
    }

    // 1. Verify instanceData.idInstance matches
    const instanceData = parsed?.instanceData as Record<string, unknown> | undefined;
    if (!instanceData || String(instanceData.idInstance || '') !== expectedInstance) {
      return false;
    }

    // 2. Verify secret token via header, query parameter, or webhook body token
    const candidateToken =
      request.headers.get('x-green-api-token') ||
      request.headers.get('x-webhook-token') ||
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ||
      new URL(request.url).searchParams.get('token') ||
      new URL(request.url).searchParams.get('secret') ||
      (typeof parsed.token === 'string' ? parsed.token : '') ||
      (typeof instanceData.token === 'string' ? instanceData.token : '') ||
      (typeof parsed.webhookToken === 'string' ? parsed.webhookToken : '');

    if (!candidateToken) {
      return false;
    }

    const candBuf = Buffer.from(String(candidateToken).trim(), 'utf8');
    const expBuf = Buffer.from(configuredSecret, 'utf8');

    if (candBuf.length !== expBuf.length || candBuf.length === 0) {
      return false;
    }

    try {
      return timingSafeEqual(candBuf, expBuf);
    } catch {
      return false;
    }
  }

  normalizeIncomingMessage(rawPayload: unknown): NormalizedIncomingMessage | null {
    if (!rawPayload || typeof rawPayload !== 'object') return null;
    const p = rawPayload as Record<string, unknown>;

    // Green API incoming message webhook event
    if (p.typeWebhook === 'incomingMessageReceived') {
      const msgData = p.messageData as Record<string, unknown> | undefined;
      const senderData = p.senderData as Record<string, unknown> | undefined;

      const rawChatId = String(senderData?.chatId || senderData?.sender || '');
      const cleanPhone = rawChatId.replace('@c.us', '').replace(/[^0-9]/g, '');

      let bodyText = '';
      if (msgData?.typeMessage === 'textMessage') {
        bodyText = String((msgData.textMessageData as Record<string, unknown>)?.textMessage || '');
      } else if (msgData?.typeMessage === 'extendedTextMessage') {
        bodyText = String((msgData.extendedTextMessageData as Record<string, unknown>)?.text || '');
      }

      return {
        providerType: 'green_api',
        providerMessageId: String(p.idMessage || ''),
        senderPhone: cleanPhone,
        recipientPhone: String(p.instanceData ? (p.instanceData as Record<string, unknown>).wid || '' : ''),
        messageBody: bodyText,
        messageType: msgData?.typeMessage === 'textMessage' ? 'text' : 'unknown',
        timestamp: p.timestamp ? new Date(Number(p.timestamp) * 1000).toISOString() : new Date().toISOString(),
        senderName: senderData?.senderName ? String(senderData.senderName) : undefined,
        rawPayload,
      };
    }

    return null;
  }

  normalizeDeliveryStatus(rawPayload: unknown): NormalizedDeliveryStatus | null {
    if (!rawPayload || typeof rawPayload !== 'object') return null;
    const p = rawPayload as Record<string, unknown>;

    // Green API status event: outgoingMessageStatus
    if (p.typeWebhook === 'outgoingMessageStatus') {
      const rawChatId = String(p.chatId || '');
      const cleanPhone = rawChatId.replace('@c.us', '').replace(/[^0-9]/g, '');
      const statusRaw = String(p.status || '');

      const mappedStatus =
        statusRaw === 'delivered'
          ? 'delivered'
          : statusRaw === 'read'
          ? 'read'
          : statusRaw === 'sent'
          ? 'sent'
          : 'failed';

      return {
        providerType: 'green_api',
        providerMessageId: String(p.idMessage || ''),
        recipientPhone: cleanPhone,
        status: mappedStatus,
        timestamp: p.timestamp ? new Date(Number(p.timestamp) * 1000).toISOString() : new Date().toISOString(),
        errorMessage: statusRaw === 'failed' ? 'Message delivery failed on Green API instance' : undefined,
        rawPayload,
      };
    }

    return null;
  }

  async getConnectionHealth(): Promise<ProviderConnectionHealth> {
    const idInstance = this.getIdInstance();
    const token = this.getApiToken();

    if (!idInstance || !token) {
      return {
        providerType: 'green_api',
        isHealthy: false,
        statusDetails: 'Credentials unconfigured (GREEN_API_ID_INSTANCE or GREEN_API_TOKEN_INSTANCE missing).',
      };
    }

    return {
      providerType: 'green_api',
      isHealthy: true,
      statusDetails: 'Green API configured and ready.',
    };
  }
}
