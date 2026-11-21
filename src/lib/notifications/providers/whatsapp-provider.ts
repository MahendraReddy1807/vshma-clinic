import { NOTIFICATION_CONFIG, isDryRunMode, isSandboxMode, maskPhone } from '../config';
import type { ProviderSendResult } from '../types';
import { GreenApiWhatsAppProvider } from '@/lib/crm/whatsapp/green-api-provider';

let greenApiInstance: GreenApiWhatsAppProvider | null = null;
function getGreenApi(): GreenApiWhatsAppProvider {
  if (!greenApiInstance) {
    greenApiInstance = new GreenApiWhatsAppProvider();
  }
  return greenApiInstance;
}

export interface WhatsAppSendOptions {
  toPhone: string;
  messageText: string;
}

export class WhatsAppProvider {
  /**
   * Dispatches a WhatsApp notification via Green API, honoring sandbox redirection and dry-run mode.
   */
  static async send(options: WhatsAppSendOptions): Promise<ProviderSendResult> {
    const rawPhone = options.toPhone.replace(/[^\d]/g, '');
    const isSandbox = isSandboxMode();
    const isDryRun = isDryRunMode();

    // Redirect in sandbox
    const targetPhone = isSandbox ? NOTIFICATION_CONFIG.sandbox.phone : rawPhone;
    const finalMessage = isSandbox
      ? `*[SANDBOX REDIRECT -> ${maskPhone(rawPhone)}]*\n\n${options.messageText}`
      : options.messageText;

    if (isDryRun) {
      console.log(`[WhatsAppProvider Dry-Run] To: ${maskPhone(targetPhone)} | Text: ${finalMessage.slice(0, 80)}...`);
      return {
        success: true,
        messageId: `dry-run-wa-${Date.now()}`,
      };
    }

    try {
      const provider = getGreenApi();
      const result = await provider.sendTextMessage({
        recipientPhone: targetPhone,
        messageText: finalMessage,
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'WhatsApp message dispatch failed via Green API',
        };
      }

      return {
        success: true,
        messageId: result.providerMessageId,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Green API WhatsApp dispatch exception: ${errMsg}`,
      };
    }
  }
}
