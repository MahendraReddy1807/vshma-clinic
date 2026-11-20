import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface GmailConfig {
  user: string;
  pass: string;
  isConfigured: boolean;
}

export function getGmailConfig(): GmailConfig {
  const rawUser = (process.env.GMAIL_USER || '').trim();
  const user = (rawUser.includes('#') ? rawUser.split('#')[0].trim() : rawUser)
    .replace(/^["']|["']$/g, '')
    .trim();

  const rawPass = (process.env.GMAIL_APP_PASSWORD || '').trim();
  // 1. Strip trailing comment if present
  const withoutComment = rawPass.includes('#') ? rawPass.split('#')[0].trim() : rawPass;
  // 2. Strip surrounding quotes and all internal spaces from Google App Password
  const pass = withoutComment.replace(/^["']|["']$/g, '').replace(/\s+/g, '');

  const isConfigured = Boolean(user && pass && user.includes('@') && pass.length >= 16);
  return { user, pass, isConfigured };
}

let cachedTransporter: Transporter | null = null;

export function getGmailTransporter(): Transporter | null {
  const config = getGmailConfig();
  if (!config.isConfigured) return null;

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }
  return cachedTransporter;
}

export async function sendEmailViaGmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ messageId?: string; error?: string }> {
  const transporter = getGmailTransporter();
  const config = getGmailConfig();
  if (!transporter || !config.isConfigured) {
    return { error: 'Gmail SMTP is not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD.' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"VSHMA Homeopathy Clinic" <${config.user}>`,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return { messageId: info.messageId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Gmail SMTP error';
    return { error: `Gmail SMTP Error: ${message}` };
  }
}
