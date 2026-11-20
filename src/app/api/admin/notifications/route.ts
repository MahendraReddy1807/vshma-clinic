import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendTransactionalEmail } from '@/lib/email/resend';
import {
  renderBookingReceivedEmail,
  renderAppointmentConfirmedEmail,
  renderAppointmentRescheduledEmail,
  renderAppointmentCancelledEmail,
  renderAppointmentReminderEmail,
} from '@/lib/email/templates';
import type { NotificationLog, AdminNotification } from '@/types';

export async function GET(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'
  ) {
    const demoNotifications: AdminNotification[] = [
      {
        id: 'notif-1',
        appointment_id: 'demo-1',
        title: 'New Appointment Request: VSHMA-892144',
        message: 'Priya Sharma requested a consultation for General Consultation.',
        type: 'new_booking',
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'notif-2',
        appointment_id: 'demo-2',
        title: 'Appointment Confirmed: VSHMA-739102',
        message: 'Rajesh K’s consultation confirmed. 24h & 2h reminders scheduled.',
        type: 'confirmed',
        is_read: true,
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'notif-3',
        appointment_id: 'demo-3',
        title: 'Appointment Rescheduled: VSHMA-612984',
        message: 'Sneha Patel moved to upcoming Friday. Updated slot email delivered.',
        type: 'rescheduled',
        is_read: true,
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ];

    const demoLogs: NotificationLog[] = [
      {
        id: 'log-1',
        appointment_id: 'demo-1',
        notification_type: 'booking_received',
        recipient: 'priya.sharma@example.com',
        subject: 'Appointment Request Received: VSHMA-892144 - VSHMA Clinic',
        channel: 'email',
        status: 'sent',
        error_message: null,
        retry_count: 0,
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 'log-2',
        appointment_id: 'demo-2',
        notification_type: 'appointment_confirmed',
        recipient: 'rajesh.k@example.com',
        subject: 'Confirmed: Consultation with Dr. Chihnitha Reddy T (VSHMA-739102)',
        channel: 'email',
        status: 'sent',
        error_message: null,
        retry_count: 0,
        sent_at: new Date(Date.now() - 3600000).toISOString(),
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'log-3',
        appointment_id: 'demo-3',
        notification_type: 'appointment_rescheduled',
        recipient: 'sneha.patel@example.com',
        subject: 'Rescheduled: Appointment VSHMA-612984 - VSHMA Clinic',
        channel: 'email',
        status: 'sent',
        error_message: null,
        retry_count: 0,
        sent_at: new Date(Date.now() - 7200000).toISOString(),
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ];

    return NextResponse.json({
      notifications: demoNotifications,
      unreadCount: demoNotifications.filter((n) => !n.is_read).length,
      logs: demoLogs,
    });
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

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ success: true });
    }

    const supabase = createServerSupabaseClient();

    if (mark_all === true) {
      await supabase.from('admin_notifications').update({ is_read: true }).eq('is_read', false);
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

    const appt = log.appointments;
    if (!appt) {
      return NextResponse.json({ error: 'Associated appointment not found' }, { status: 404 });
    }

    let rendered = { html: '', text: '' };
    switch (log.notification_type) {
      case 'booking_received':
        rendered = renderBookingReceivedEmail(appt);
        break;
      case 'appointment_confirmed':
        rendered = renderAppointmentConfirmedEmail(appt);
        break;
      case 'appointment_rescheduled':
        rendered = renderAppointmentRescheduledEmail(appt);
        break;
      case 'appointment_cancelled':
        rendered = renderAppointmentCancelledEmail(appt);
        break;
      case 'reminder_24h':
        rendered = renderAppointmentReminderEmail(appt, '24h');
        break;
      case 'reminder_2h':
        rendered = renderAppointmentReminderEmail(appt, '2h');
        break;
      default:
        return NextResponse.json({ error: `Cannot retry notification type: ${log.notification_type}` }, { status: 400 });
    }

    // Increment retry count and dispatch
    await supabase
      .from('notification_logs')
      .update({ retry_count: (log.retry_count || 0) + 1, status: 'pending' })
      .eq('id', log.id);

    const emailSubject = log.subject || 'Notification from VSHMA Homeopathy Clinic';
    const result = await sendTransactionalEmail({
      to: log.recipient,
      subject: emailSubject,
      html: rendered.html,
      text: rendered.text,
      appointmentId: appt.id,
      notificationType: log.notification_type,
    });

    return NextResponse.json({ success: result.success, messageId: result.messageId, error: result.error });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
