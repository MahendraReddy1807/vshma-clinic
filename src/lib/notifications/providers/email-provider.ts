import { Resend } from 'resend';
import { NOTIFICATION_CONFIG, isDryRunMode, isSandboxMode, maskEmail } from '../config';
import type { ProviderSendResult } from '../types';

let resendInstance: Resend | null = null;
function getResendClient(): Resend | null {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export interface EmailSendOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export class EmailProvider {
  /**
   * Dispatches an email, honoring sandbox redirection and dry-run mode.
   */
  static async send(options: EmailSendOptions): Promise<ProviderSendResult> {
    const rawTo = options.to.trim().toLowerCase();
    const isSandbox = isSandboxMode();
    const isDryRun = isDryRunMode();

    const targetRecipient = isSandbox ? NOTIFICATION_CONFIG.sandbox.email : rawTo;
    const finalSubject = isSandbox
      ? `[SANDBOX: ${maskEmail(rawTo)}] ${options.subject}`
      : options.subject;

    const sandboxNoticeHtml = isSandbox
      ? `<div style="background:#FFFBEB;border:1px solid #FDE68A;padding:12px;margin-bottom:20px;border-radius:8px;font-family:sans-serif;font-size:12px;color:#92400E;">
          <strong>SANDBOX MODE ACTIVE:</strong> This email was originally intended for <code>${maskEmail(rawTo)}</code> and redirected to test allowlist.
        </div>`
      : '';

    const finalHtml = sandboxNoticeHtml ? `${sandboxNoticeHtml}${options.html}` : options.html;

    if (isDryRun) {
      console.log(`[EmailProvider Dry-Run] To: ${maskEmail(targetRecipient)} | Subject: ${finalSubject}`);
      return {
        success: true,
        messageId: `dry-run-email-${Date.now()}`,
      };
    }

    const resend = getResendClient();
    if (!resend) {
      console.warn('[EmailProvider] RESEND_API_KEY is not configured. Emulating dispatch in test environment.');
      return {
        success: true,
        messageId: `simulated-email-${Date.now()}`,
      };
    }

    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'VSHMA Clinic <care@vshma.in>';
      const payload: Parameters<typeof resend.emails.send>[0] = {
        from: fromEmail,
        to: targetRecipient,
        subject: finalSubject,
        html: finalHtml,
        text: options.text,
        replyTo: options.replyTo || 'care@vshma.in',
      };

      if (options.attachments && options.attachments.length > 0) {
        payload.attachments = options.attachments.map((att) => ({
          filename: att.filename,
          content: att.content,
        }));
      }

      const res = await resend.emails.send(payload);

      if (res.error) {
        return {
          success: false,
          error: `${res.error.name}: ${res.error.message}`,
        };
      }

      return {
        success: true,
        messageId: res.data?.id,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Resend dispatch exception: ${errMsg}`,
      };
    }
  }
}
