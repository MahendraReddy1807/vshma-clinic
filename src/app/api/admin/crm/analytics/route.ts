import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatNotificationLogDatabaseError } from '@/lib/email/database-errors';

/**
 * GET /api/admin/crm/analytics
 * Aggregate clinic CRM conversion metrics, channel statistics, and retention trends.
 */
export async function GET(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  try {
    const supabase = createServerSupabaseClient();

    // 1. Fetch appointments summary
    const { data: appointments } = await supabase
      .from('appointments')
      .select('status, consultation_type, created_at, appointment_date, whatsapp_opt_in');

    const appts = appointments || [];
    const totalBookings = appts.length;
    const pending = appts.filter((a) => a.status === 'pending').length;
    const confirmed = appts.filter((a) => a.status === 'confirmed').length;
    const completed = appts.filter((a) => a.status === 'completed').length;
    const cancelled = appts.filter((a) => a.status === 'cancelled').length;
    const rescheduled = appts.filter((a) => a.status === 'rescheduled').length;

    const conversionRate = totalBookings > 0 ? Math.round(((confirmed + completed) / totalBookings) * 100) : 0;
    const whatsappOptInRate = totalBookings > 0
      ? Math.round((appts.filter((a) => a.whatsapp_opt_in).length / totalBookings) * 100)
      : 0;

    // 2. Fetch notification delivery logs
    const { data: logs, error: logsError } = await supabase
      .from('notification_logs')
      .select('channel, status, created_at');
    if (logsError) {
      const message = formatNotificationLogDatabaseError(logsError);
      console.error('[CRM notification log read failed]', message);
      return NextResponse.json({ error: message }, { status: 503 });
    }

    const notifLogs = logs || [];
    const whatsappLogs = notifLogs.filter((l) => l.channel === 'whatsapp');
    const emailLogs = notifLogs.filter((l) => l.channel === 'email');

    const whatsappDelivered = whatsappLogs.filter((l) => l.status === 'delivered' || l.status === 'read').length;
    const whatsappDeliveryRate = whatsappLogs.length > 0 ? Math.round((whatsappDelivered / whatsappLogs.length) * 100) : 100;

    const emailDelivered = emailLogs.filter((l) => l.status === 'delivered').length;
    const emailDeliveryRate = emailLogs.length > 0 ? Math.round((emailDelivered / emailLogs.length) * 100) : 100;

    // 3. Consultation type distribution
    const typeCounts: Record<string, number> = {};
    for (const a of appts) {
      const type = a.consultation_type || 'General Consultation';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalBookings,
        pending,
        confirmed,
        completed,
        rescheduled,
        cancelled,
        conversionRate,
        whatsappOptInRate,
        channelStats: {
          whatsapp: {
            total: whatsappLogs.length,
            delivered: whatsappDelivered,
            rate: whatsappDeliveryRate,
          },
          email: {
            total: emailLogs.length,
            delivered: emailDelivered,
            rate: emailDeliveryRate,
          },
        },
        consultationTypes: typeCounts,
      },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
