import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatNotificationLogDatabaseError } from '@/lib/email/database-errors';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    const eventType = typeof payload.type === 'string' ? payload.type : null;
    const emailData = (payload.data && typeof payload.data === 'object' ? payload.data : {}) as Record<string, unknown>;
    const emailId = typeof emailData.email_id === 'string' ? emailData.email_id : typeof emailData.id === 'string' ? emailData.id : null;

    if (!emailId || !eventType) {
      return NextResponse.json({ error: 'Missing email ID or event type' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Database service not configured' }, { status: 503 });
    }

    const supabase = createServerSupabaseClient();
    const nowIso = new Date().toISOString();
    let updateResult;

    if (eventType === 'email.delivered') {
      updateResult = await supabase
        .from('notification_logs')
        .update({
          status: 'delivered',
          delivered_at: nowIso,
          error_message: null,
        })
        .eq('resend_message_id', emailId);
    } else if (eventType === 'email.bounced') {
      const bounceObj = emailData.bounce && typeof emailData.bounce === 'object' ? (emailData.bounce as Record<string, unknown>) : null;
      const bounceDetails = typeof bounceObj?.message === 'string' ? bounceObj.message : 'Email bounced by recipient mail server.';
      updateResult = await supabase
        .from('notification_logs')
        .update({
          status: 'bounced',
          error_message: bounceDetails,
        })
        .eq('resend_message_id', emailId);
    } else if (eventType === 'email.complained') {
      updateResult = await supabase
        .from('notification_logs')
        .update({
          status: 'failed',
          error_message: 'Recipient reported message as spam/complaint.',
        })
        .eq('resend_message_id', emailId);
    } else if (eventType === 'email.sent') {
      updateResult = await supabase
        .from('notification_logs')
        .update({
          status: 'accepted',
        })
        .eq('resend_message_id', emailId)
        .in('status', ['queued', 'pending', 'processing']);
    }

    if (updateResult?.error) {
      const error = formatNotificationLogDatabaseError(updateResult.error);
      console.error('[Resend webhook notification log update failed]', error);
      return NextResponse.json({ error }, { status: 503 });
    }

    return NextResponse.json({ received: true, event: eventType, emailId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Resend Webhook Error]', msg);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'VSHMA Resend Webhook Handler' });
}
