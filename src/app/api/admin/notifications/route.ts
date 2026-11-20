import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendTransactionalEmail } from '@/lib/email/resend';
import { buildEmailVariables } from '@/lib/email/template-variables';

export async function GET(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
    return NextResponse.json({ error: 'Notification service is not configured.' }, { status: 503 });
  }

  try {
    const supabase = createServerSupabaseClient();

    // 1. Fetch recent in-dashboard alerts
    const { data: notifications } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    // 2. Count unread alerts
    const { count: unreadCount } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    // 3. Fetch recent email notification logs
    const { data: logs } = await supabase
      .from('notification_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      logs: logs || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PATCH: Mark notification(s) as read
export async function PATCH(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, mark_all } = body;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
      return NextResponse.json({ error: 'Notification service is not configured.' }, { status: 503 });
    }

    const supabase = createServerSupabaseClient();

    if (mark_all === true) {
      const { error } = await supabase.from('admin_notifications').update({ is_read: true }).eq('is_read', false);
      if (error) return NextResponse.json({ error: 'Could not update notifications.' }, { status: 500 });
      return NextResponse.json({ success: true, markedAll: true });
    }

    if (!id) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: Retry failed email notification
export async function POST(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { log_id } = body;

    if (!log_id) {
      return NextResponse.json({ error: 'Log ID is required' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data: log, error } = await supabase
      .from('notification_logs')
      .select('*, appointments(*)')
      .eq('id', log_id)
      .single();

    if (error || !log) {
      return NextResponse.json({ error: 'Notification log not found' }, { status: 404 });
    }

    if (log.status !== 'failed') {
      return NextResponse.json({ error: 'Only failed email notifications can be retried.' }, { status: 409 });
    }

    const appt = log.appointments;
    if (!appt) {
      return NextResponse.json({ error: 'Associated appointment not found' }, { status: 404 });
    }

    const allowedTypes = [
      'booking_received',
      'admin_new_booking',
      'appointment_confirmed',
      'appointment_rescheduled',
      'appointment_cancelled',
      'reminder_24h',
      'reminder_2h',
    ];
    if (!allowedTypes.includes(log.notification_type)) {
      return NextResponse.json({ error: 'This notification type cannot be retried.' }, { status: 400 });
    }

    const variables = log.template_variables && Object.keys(log.template_variables).length
      ? log.template_variables
      : buildEmailVariables({
          patientName: appt.full_name,
          patientEmail: appt.email,
          patientPhone: appt.phone,
          bookingReference: appt.booking_reference,
          appointmentDate: appt.rescheduled_date || appt.appointment_date,
          appointmentTime: appt.rescheduled_time || appt.preferred_time,
          previousAppointmentDate: appt.appointment_date,
          previousAppointmentTime: appt.preferred_time,
          newAppointmentDate: appt.rescheduled_date || appt.appointment_date,
          newAppointmentTime: appt.rescheduled_time || appt.preferred_time,
          bookingCreatedAt: appt.created_at,
          reminderType: log.notification_type === 'reminder_2h' ? '2h' : '24h',
        });

    const result = await sendTransactionalEmail({
      to: log.recipient,
      appointmentId: appt.id,
      bookingReference: log.booking_reference || appt.booking_reference,
      notificationType: log.notification_type,
      variables,
      idempotencyKey: log.idempotency_key,
    });

    return NextResponse.json({ success: result.success, messageId: result.messageId, error: result.error });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
