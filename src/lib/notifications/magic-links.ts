import crypto from 'crypto';

function getSecret(): string {
  return (
    process.env.MAGIC_LINK_SECRET ||
    process.env.CRON_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    'vshma-default-super-secret-hmac-key'
  );
}

export type MagicAction = 'confirm' | 'reschedule' | 'cancel';

export interface MagicPayload {
  appointmentId: string;
  action: MagicAction;
  exp: number; // unix timestamp in ms
}

/**
 * Creates an HMAC-SHA256 signed single-purpose magic token without requiring login.
 */
export function createMagicToken(
  appointmentId: string,
  action: MagicAction,
  expiresInHours = 72
): string {
  const secret = getSecret();
  const exp = Date.now() + expiresInHours * 60 * 60 * 1000;
  const data = `${appointmentId}:${action}:${exp}`;
  const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
  const tokenPayload: MagicPayload = { appointmentId, action, exp };
  const base64Payload = Buffer.from(JSON.stringify(tokenPayload)).toString('base64url');
  return `${base64Payload}.${signature}`;
}

/**
 * Verifies a magic token signature and expiration.
 */
export function verifyMagicToken(token: string): {
  valid: boolean;
  appointmentId?: string;
  action?: MagicAction;
  error?: string;
} {
  if (!token || !token.includes('.')) {
    return { valid: false, error: 'Malformed magic token' };
  }

  const [base64Payload, signature] = token.split('.');
  try {
    const rawPayload = Buffer.from(base64Payload, 'base64url').toString('utf8');
    const payload: MagicPayload = JSON.parse(rawPayload);

    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Magic link has expired' };
    }

    const secret = getSecret();
    const expectedData = `${payload.appointmentId}:${payload.action}:${payload.exp}`;
    const expectedSig = crypto.createHmac('sha256', secret).update(expectedData).digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSig, 'hex');

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, error: 'Invalid magic link signature' };
    }

    return {
      valid: true,
      appointmentId: payload.appointmentId,
      action: payload.action,
    };
  } catch {
    return { valid: false, error: 'Failed to parse magic token payload' };
  }
}

/**
 * Builds the absolute action URL for client click.
 */
export function buildMagicActionUrl(
  appointmentId: string,
  action: MagicAction,
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vshma.in'
): string {
  const token = createMagicToken(appointmentId, action);
  const cleanBase = baseUrl.replace(/\/$/, '');
  return `${cleanBase}/book/${action}?token=${token}`;
}
