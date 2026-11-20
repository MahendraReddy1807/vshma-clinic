import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { NotificationType } from '@/types';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text: string;
  appointmentId?: string;
  notificationType: NotificationType;
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isMock?: boolean;
}

export async function sendTransactionalEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { to, subject, html, text, appointmentId, notificationType } = params;

  // 1. Check emergency email pause setting
  try {
    const supabase = createServerSupabaseClient();
    const { data: pauseSetting } = await supabase
      .from('automation_settings')
      .select('value')
      .eq('key', 'emergency_email_pause')
      .maybeSingle();

    if (pauseSetting?.value === true) {
      console.warn(`[Resend Email] Paused by emergency_email_pause switch. Skipping email to ${to}`);
      if (appointmentId) {
        await logNotification(appointmentId, notificationType, to, subject, 'failed', 'Emergency email pause active');
      }
      return { success: false, error: 'Emergency email pause active' };
    }
  } catch {
    // If table doesn't exist yet in local mode, continue
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'VSHMA Homeopathy Clinic <onboarding@resend.dev>';

  // 2. Mock mode if API key is not configured
  if (!apiKey || apiKey === 'your_resend_api_key' || apiKey.startsWith('re_mock')) {
    console.log(`[Resend Mock Email] To: ${to} | Subject: ${subject}`);
    if (appointmentId) {
      await logNotification(appointmentId, notificationType, to, subject, 'sent', null);
    }
    return {
      success: true,
      messageId: `mock_${Date.now()}`,
      isMock: true,
    };
  }

  // 3. Real Resend API dispatch
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject,
        html,
        text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `HTTP ${response.status} from Resend`;
      console.error('[Resend Error]', errorMessage);
      if (appointmentId) {
        await logNotification(appointmentId, notificationType, to, subject, 'failed', errorMessage);
      }
      return { success: false, error: errorMessage };
    }

    if (appointmentId) {
      await logNotification(appointmentId, notificationType, to, subject, 'sent', null);
    }

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Resend Network Error]', message);
    if (appointmentId) {
      await logNotification(appointmentId, notificationType, to, subject, 'failed', message);
    }
    return { success: false, error: message };
  }
}

async function logNotification(
  appointmentId: string,
  notificationType: NotificationType,
  recipient: string,
  subject: string,
  status: 'sent' | 'failed' | 'queued',
  errorMessage: string | null
) {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.from('notification_logs').insert({
      appointment_id: appointmentId,
      notification_type: notificationType,
      channel: 'email',
      recipient,
      subject,
      status,
      error_message: errorMessage,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    });
  } catch (err) {
    console.error('[Notification Log Error]', err);
  }
}
