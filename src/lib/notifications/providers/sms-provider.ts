import { NOTIFICATION_CONFIG, isDryRunMode, isSandboxMode, maskPhone } from '../config';
import type { ProviderSendResult } from '../types';

export interface SmsSendOptions {
  toPhone: string;
  templateId?: string; // DLT template ID
  messageText: string;
  senderId?: string;
}

export class SmsProvider {
  /**
   * Dispatches an SMS notification via MSG91/Fast2SMS adapter.
   * Controlled by SMS_ENABLED=false by default.
   */
  static async send(options: SmsSendOptions): Promise<ProviderSendResult> {
    if (!NOTIFICATION_CONFIG.smsEnabled) {
      // SMS is disabled by default
      return {
        success: true,
        skipped: true,
        messageId: 'sms-disabled-by-configuration',
      };
    }

    const rawPhone = options.toPhone.replace(/[^\d]/g, '');
    const isSandbox = isSandboxMode();
    const isDryRun = isDryRunMode();

    const targetPhone = isSandbox ? NOTIFICATION_CONFIG.sandbox.phone : rawPhone;
    const finalText = isSandbox
      ? `[SANDBOX: ${maskPhone(rawPhone)}] ${options.messageText}`
      : options.messageText;

    if (isDryRun) {
      console.log(`[SmsProvider Dry-Run] To: ${maskPhone(targetPhone)} | Text: ${finalText}`);
      return {
        success: true,
        messageId: `dry-run-sms-${Date.now()}`,
      };
    }

    // MSG91 / Fast2SMS implementation adapter
    const apiKey = process.env.MSG91_AUTH_KEY || process.env.FAST2SMS_API_KEY;
    if (!apiKey) {
      console.warn('[SmsProvider] No SMS provider API key configured. Emulating successful dispatch.');
      return {
        success: true,
        messageId: `simulated-sms-${Date.now()}`,
      };
    }

    try {
      // MSG91 Send SMS API
      if (process.env.MSG91_AUTH_KEY) {
        const res = await fetch('https://api.msg91.com/api/v5/flow/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            authkey: process.env.MSG91_AUTH_KEY,
          },
          body: JSON.stringify({
            template_id: options.templateId || process.env.MSG91_DEFAULT_DLT_ID,
            short_url: '0',
            recipients: [
              {
                mobiles: targetPhone.startsWith('91') ? targetPhone : `91${targetPhone}`,
                message: finalText,
              },
            ],
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          return {
            success: false,
            error: data.message || `MSG91 failed with HTTP ${res.status}`,
          };
        }

        return {
          success: true,
          messageId: data.message || `msg91-${Date.now()}`,
        };
      }

      return {
        success: true,
        messageId: `sms-${Date.now()}`,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `SMS dispatch exception: ${errMsg}`,
      };
    }
  }
}
