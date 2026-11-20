// ====================================================================
// VSHMA CLINIC CRM — Provider-Independent WhatsApp Interface Contract
// Allows hot-swapping between Meta Cloud API (with Coexistence) and Green API
// ====================================================================

export type WhatsAppProviderType = 'meta' | 'green_api';

export interface ProviderTextMessageRequest {
  recipientPhone: string;
  messageText: string;
  idempotencyKey?: string;
  replyToMessageId?: string;
}

export interface ProviderTemplateMessageRequest {
  recipientPhone: string;
  templateName: string;
  languageCode: string;
  variables: Record<string, string>;
  idempotencyKey?: string;
}

export interface NormalizedSendResult {
  success: boolean;
  providerType: WhatsAppProviderType;
  providerMessageId?: string;
  status: 'queued' | 'sent' | 'failed';
  error?: string;
  rawResponse?: unknown;
}

export interface NormalizedIncomingMessage {
  providerType: WhatsAppProviderType;
  providerMessageId: string;
  senderPhone: string;
  recipientPhone: string;
  messageBody: string;
  messageType: 'text' | 'image' | 'document' | 'unknown';
  timestamp: string;
  senderName?: string;
  rawPayload: unknown;
}

export interface NormalizedDeliveryStatus {
  providerType: WhatsAppProviderType;
  providerMessageId: string;
  recipientPhone: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  errorMessage?: string;
  rawPayload: unknown;
}

export interface ProviderConnectionHealth {
  providerType: WhatsAppProviderType;
  isHealthy: boolean;
  statusDetails: string;
  accountPhone?: string;
}

export interface IWhatsAppProvider {
  readonly providerType: WhatsAppProviderType;

  /**
   * Send a free-form text message to a recipient.
   */
  sendTextMessage(req: ProviderTextMessageRequest): Promise<NormalizedSendResult>;

  /**
   * Send a pre-approved template message (Meta) or structured text (Green API).
   */
  sendTemplateMessage(req: ProviderTemplateMessageRequest): Promise<NormalizedSendResult>;

  /**
   * Cryptographically validate incoming webhook signatures (HMAC SHA-256 for Meta; token for Green API).
   */
  validateWebhook(request: Request, rawBody: string): boolean;

  /**
   * Normalize an incoming patient message from the provider's proprietary webhook format.
   */
  normalizeIncomingMessage(rawPayload: unknown): NormalizedIncomingMessage | null;

  /**
   * Normalize an outbound delivery status receipt (sent, delivered, read, failed).
   */
  normalizeDeliveryStatus(rawPayload: unknown): NormalizedDeliveryStatus | null;

  /**
   * Check connection health status.
   */
  getConnectionHealth(): Promise<ProviderConnectionHealth>;
}
