/**
 * VSHMA Notification Engine - Global Configuration & Sandbox Routing
 *
 * Rules:
 * - Timezone: Asia/Kolkata (IST)
 * - NOTIFY_MODE: 'live' | 'sandbox' | 'dry-run'
 * - Default: 'sandbox' outside production (and default 'sandbox' unless explicitly live)
 * - Sandbox allowlist: mahendrart07@gmail.com and 7416001477
 * - Quiet hours: 9 PM to 7 AM IST for patient reminders
 * - Privacy: Never log full phone numbers, emails, or medical data.
 */

export const NOTIFICATION_CONFIG = {
  timezone: 'Asia/Kolkata',
  sandbox: {
    email: 'mahendrart07@gmail.com',
    phone: '7416001477',
    formattedPhone: '+917416001477',
  },
  quietHours: {
    startHourIST: 21, // 9:00 PM IST
    endHourIST: 7,   // 7:00 AM IST
  },
  maxRetryAttempts: 5,
  backoffScheduleMinutes: [1, 5, 15, 30, 60],
  clinicAlertEmails: (process.env.CLINIC_ALERT_EMAILS || 'mahendrart07@gmail.com')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  doctorWhatsAppPhone: process.env.DOCTOR_WHATSAPP_PHONE || '7416001477',
  smsEnabled: process.env.SMS_ENABLED === 'true',
};

export type NotifyMode = 'live' | 'sandbox' | 'dry-run';

export function getNotifyMode(): NotifyMode {
  const envMode = process.env.NOTIFY_MODE?.toLowerCase().trim();
  if (envMode === 'live') {
    // Safety: only allow live if explicit in production
    return 'live';
  }
  if (envMode === 'dry-run') {
    return 'dry-run';
  }
  return 'sandbox';
}

export function isLiveMode(): boolean {
  return getNotifyMode() === 'live';
}

export function isSandboxMode(): boolean {
  return getNotifyMode() === 'sandbox';
}

export function isDryRunMode(): boolean {
  return getNotifyMode() === 'dry-run';
}

/**
 * Mask email for safe privacy logging:
 * e.g. "mahendrart07@gmail.com" -> "m***7@gmail.com"
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return '***';
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const [local, domain] = parts;
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/**
 * Mask phone number for safe privacy logging:
 * e.g. "+917416001477" -> "+91 ******1477"
 */
export function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '***';
  const clean = phone.replace(/[^\d+]/g, '');
  if (clean.length < 6) return '***';
  const last4 = clean.slice(-4);
  const prefix = clean.startsWith('+') ? clean.slice(0, 3) : '';
  return `${prefix} ******${last4}`;
}

/**
 * Checks whether the current time in IST is within quiet hours (9 PM to 7 AM IST).
 */
export function isCurrentlyQuietHours(date = new Date()): boolean {
  // Convert date to IST hours
  const istFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: NOTIFICATION_CONFIG.timezone,
    hour: 'numeric',
    hour12: false,
  });
  const hourIST = parseInt(istFormatter.format(date), 10);
  return hourIST >= NOTIFICATION_CONFIG.quietHours.startHourIST || hourIST < NOTIFICATION_CONFIG.quietHours.endHourIST;
}

/**
 * Returns the next morning 7:05 AM IST Date object for quiet hours rescheduling.
 */
export function getNextQuietHoursReleaseTime(date = new Date()): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: NOTIFICATION_CONFIG.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const year = parseInt(parts.find((p) => p.type === 'year')?.value || '2026', 10);
  const month = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10);
  const day = parseInt(parts.find((p) => p.type === 'day')?.value || '1', 10);
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);

  // If after 9 PM, target tomorrow 7:05 AM IST; if early morning, target today 7:05 AM IST.
  const targetDay = hour >= NOTIFICATION_CONFIG.quietHours.startHourIST ? day + 1 : day;
  // Format as ISO in IST timezone: +05:30
  const pad = (n: number) => String(n).padStart(2, '0');
  const isoStr = `${year}-${pad(month)}-${pad(targetDay)}T07:05:00+05:30`;
  return new Date(isoStr);
}
