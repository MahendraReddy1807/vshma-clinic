export type WhatsAppNotificationStatus =
  | 'pending'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'skipped'
  | 'bounced';

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId?: string;
  apiVersion: string;
  adminPhone: string;
  webhookVerifyToken: string;
}

export interface WhatsAppTemplateParameter {
  type: 'text';
  text: string;
}

export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'button';
  sub_type?: 'url' | 'quick_reply';
  index?: number;
  parameters: WhatsAppTemplateParameter[];
}

export interface WhatsAppTemplatePayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: {
      code: string;
    };
    components: WhatsAppTemplateComponent[];
  };
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  status: WhatsAppNotificationStatus;
  error?: string;
  skipped?: boolean;
}

export interface WhatsAppWebhookStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  errors?: Array<{
    code: number;
    title: string;
    message?: string;
    error_data?: { details: string };
  }>;
}

export interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: 'whatsapp';
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      statuses?: WhatsAppWebhookStatus[];
      messages?: Array<{
        from: string;
        id: string;
        timestamp: string;
        type: string;
      }>;
    };
    field: string;
  }>;
}

export interface WhatsAppWebhookPayload {
  object: 'whatsapp_business_account';
  entry: WhatsAppWebhookEntry[];
}
