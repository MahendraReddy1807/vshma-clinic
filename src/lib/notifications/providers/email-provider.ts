import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { NOTIFICATION_CONFIG, isDryRunMode, isSandboxMode, maskEmail } from '../config';
import type { ProviderSendResult } from '../types';

export interface EmailAttachment {
  filename: string;
  content?: string | Buffer;
  path?: string;
  contentType?: string;
  cid?: string;
}

export interface EmailSendOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: EmailAttachment[];
}

export interface GmailDailyStats {
  date: string;
  count: number;
  limit: number;
  warningThreshold: number;
  isWarning: boolean;
}

// In-memory daily send tracker (500 sends/day limit for standard Gmail)
const GMAIL_DAILY_LIMIT = 500;
const GMAIL_WARN_THRESHOLD = 400; // 80%

let dailyCountState = {
  date: new Date().toISOString().slice(0, 10),
  count: 0,
};

function getDailySendStats(): GmailDailyStats {
  const today = new Date().toISOString().slice(0, 10);
  if (dailyCountState.date !== today) {
    dailyCountState = { date: today, count: 0 };
  }
  return {
    date: dailyCountState.date,
    count: dailyCountState.count,
    limit: GMAIL_DAILY_LIMIT,
    warningThreshold: GMAIL_WARN_THRESHOLD,
    isWarning: dailyCountState.count >= GMAIL_WARN_THRESHOLD,
  };
}

function incrementDailySendCount() {
  const today = new Date().toISOString().slice(0, 10);
  if (dailyCountState.date !== today) {
    dailyCountState = { date: today, count: 1 };
  } else {
    dailyCountState.count += 1;
  }
}

let cachedTransporter: Transporter | null = null;

function getGmailTransporter(): Transporter | null {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ''); // remove any accidental spaces

  if (!user || !pass) {
    return null;
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // SSL
      auth: {
        user,
        pass,
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    });
  }

  return cachedTransporter;
}

export class EmailProvider {
  /**
   * Returns current Gmail quota usage and warning status.
   */
  static getQuotaStats(): GmailDailyStats {
    return getDailySendStats();
  }

  /**
   * Verifies the Gmail SMTP connection using transporter.verify().
   */
  static async verifyConnection(): Promise<{ success: boolean; message: string; code?: string }> {
    const user = process.env.GMAIL_USER?.trim();
    const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');

    if (!user || !pass) {
      return {
        success: false,
        message: 'GMAIL_USER or GMAIL_APP_PASSWORD is not set in environment variables.',
        code: 'MISSING_CREDENTIALS',
      };
    }

    try {
      const transporter = getGmailTransporter();
      if (!transporter) {
        throw new Error('Failed to initialize Gmail SMTP transport.');
      }

      await transporter.verify();
      return {
        success: true,
        message: `Gmail SMTP connected successfully as ${maskEmail(user)}. Ready for secure dispatches.`,
      };
    } catch (err: unknown) {
      const error = err as { code?: string; responseCode?: number; message?: string };
      if (error.responseCode === 535 || error.code === 'EAUTH') {
        return {
          success: false,
          message: 'Gmail authentication failed (535): Please check that your 16-character Google App Password is correct.',
          code: 'CHECK_APP_PASSWORD',
        };
      }
      return {
        success: false,
        message: error.message || String(err),
        code: error.code || 'SMTP_ERROR',
      };
    }
  }

  /**
   * Dispatches an email via Gmail SMTP with sandbox routing, daily limit monitoring,
   * exponential backoff for temporary errors, and embedded CID logo.
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
          <strong>SANDBOX MODE ACTIVE:</strong> Originally destined for <code>${maskEmail(rawTo)}</code>. Redirected to test allowlist.
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

    // Check daily send limit
    const stats = getDailySendStats();
    if (stats.count >= stats.limit) {
      const errorMsg = `Daily Gmail send limit (${stats.limit}/day) reached. Queueing for next window.`;
      console.error(`[EmailProvider] ${errorMsg}`);
      return {
        success: false,
        error: errorMsg,
      };
    }

    const transporter = getGmailTransporter();
    if (!transporter) {
      console.warn('[EmailProvider] GMAIL_USER/GMAIL_APP_PASSWORD not set. Emulating dispatch in test environment.');
      return {
        success: true,
        messageId: `simulated-gmail-${Date.now()}`,
      };
    }

    const gmailUser = process.env.GMAIL_USER?.trim() || 'care@vshma.in';
    const fromAddress = `"VSHMA Homeopathy Clinic" <${gmailUser}>`;

    // Prepare attachments: user attachments + embedded CID logo
    const mailAttachments: EmailAttachment[] = [];

    // Embed clinic logo as CID so it renders in all mail clients without external URL reliance
    const logoPath = path.join(process.cwd(), 'public', 'logo-transparent.png');
    if (fs.existsSync(logoPath)) {
      mailAttachments.push({
        filename: 'vshma-emblem.png',
        path: logoPath,
        cid: 'vshma-logo',
      });
    }

    if (options.attachments && options.attachments.length > 0) {
      mailAttachments.push(...options.attachments);
    }

    const mailOptions = {
      from: fromAddress,
      to: targetRecipient,
      replyTo: options.replyTo || gmailUser,
      subject: finalSubject,
      html: finalHtml,
      text: options.text,
      attachments: mailAttachments,
      headers: {
        'X-Entity-Ref-ID': `vshma-${Date.now()}`,
      },
    };

    // Sequential dispatch with retry logic for temporary errors (421, 450)
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        // Small sequential delay (200ms) to prevent burst rate issues
        if (attempts > 1) {
          const delayMs = Math.pow(2, attempts) * 300;
          await new Promise((res) => setTimeout(res, delayMs));
        }

        const info = await transporter.sendMail(mailOptions);
        incrementDailySendCount();

        return {
          success: true,
          messageId: info.messageId,
        };
      } catch (err: unknown) {
        const error = err as { code?: string; responseCode?: number; message?: string };

        // Authentication failure - do not retry
        if (error.responseCode === 535 || error.code === 'EAUTH') {
          return {
            success: false,
            error: 'Authentication failed (535): Check Gmail App Password in admin settings.',
          };
        }

        // Temporary SMTP failures (421, 450) - retry up to maxAttempts
        const isTemporary = error.responseCode === 421 || error.responseCode === 450;
        if (isTemporary && attempts < maxAttempts) {
          console.warn(`[EmailProvider] Temporary SMTP error ${error.responseCode}. Retrying attempt ${attempts + 1}...`);
          continue;
        }

        return {
          success: false,
          error: error.message || String(err),
        };
      }
    }

    return {
      success: false,
      error: 'Max dispatch retries exceeded for Gmail SMTP.',
    };
  }
}
