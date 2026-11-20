import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendTransactionalEmail } from '@/lib/email/resend';
import { renderAppointmentReminderEmail } from '@/lib/email/templates';

export async function GET(request: Request) {
  return handleReminders(request);
}

export async function POST(request: Request) {
  return handleReminders(request);
}

async function handleReminders(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Verify secret if configured
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In local dev without secret, allow bypass
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
      }
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'
    ) {
      return NextResponse.json({
        success: true,
        message: 'Cron reminder engine running in development mock mode. Supabase not configured.',
        processed: 0,
        dispatched: 0,
        isMock: true,
      });
    }

    const supabase = createServerSupabaseClient();
    const now = new Date().toISOString();

    // 1. Fetch automation settings
    const { data: settings } = await supabase.from('automation_settings').select('key, value');
    const settingsMap = (settings || []).reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, boolean>);

    if (settingsMap['emergency_email_pause'] === true) {
      return NextResponse.json({ message: 'Emergency pause active. No reminders dispatched.' });
    }

    // 2. Fetch pending jobs due for processing
    const { data: dueJobs, error: fetchErr } = await supabase
      .from('reminder_jobs')
      .select(`
        id,
        appointment_id,
        reminder_type,
        scheduled_for,
        appointments:appointment_id (
          id,
          booking_reference,
          full_name,
          phone,
          email,
          appointment_date,
          preferred_time,
          consultation_type,
          status
        )
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .limit(20);

    if (fetchErr) {
      console.error('[Cron Reminder Fetch Error]', fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    if (!dueJobs || dueJobs.length === 0) {
      return NextResponse.json({ message: 'No due reminder jobs to process.', processed: 0 });
    }

    let processedCount = 0;
    let failedCount = 0;

    for (const job of dueJobs) {
      const appt = (job as unknown as { appointments: Record<string, unknown> | null }).appointments;

      // Skip if appointment is no longer confirmed
      if (!appt || (appt.status !== 'confirmed' && appt.status !== 'pending')) {
        await supabase.from('reminder_jobs').update({ status: 'cancelled' }).eq('id', job.id);
        continue;
      }

      // Check specific toggle for 24h or 2h
      if (job.reminder_type === '24h' && settingsMap['enable_24h_reminders'] === false) {
        continue;
      }
      if (job.reminder_type === '2h' && settingsMap['enable_2h_reminders'] === false) {
        continue;
      }

      // Lock job as processing
      await supabase.from('reminder_jobs').update({ status: 'processing' }).eq('id', job.id);

      const patientEmail = String(appt.email || '');
      if (!patientEmail) {
        // Patient did not provide email; mark as completed
        await supabase
          .from('reminder_jobs')
          .update({ status: 'completed', error_message: 'No patient email provided' })
          .eq('id', job.id);
        continue;
      }

      const { html, text } = renderAppointmentReminderEmail(
        {
          patientName: String(appt.full_name || 'Patient'),
          bookingReference: String(appt.booking_reference || ''),
          appointmentDate: String(appt.appointment_date || ''),
          preferredTime: appt.preferred_time as string | null,
          consultationType: String(appt.consultation_type || 'General Consultation'),
        },
        job.reminder_type as '24h' | '2h'
      );

      const emailResult = await sendTransactionalEmail({
        to: patientEmail,
        subject: `Reminder: Upcoming Appointment with ${appt.full_name} (${job.reminder_type})`,
        html,
        text,
        appointmentId: job.appointment_id,
        notificationType: job.reminder_type === '24h' ? 'reminder_24h' : 'reminder_2h',
      });

      if (emailResult.success) {
        await supabase.from('reminder_jobs').update({ status: 'completed' }).eq('id', job.id);
        processedCount++;
      } else {
        await supabase
          .from('reminder_jobs')
          .update({
            status: 'failed',
            error_message: emailResult.error || 'Failed to dispatch email',
          })
          .eq('id', job.id);
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      failed: failedCount,
      totalDue: dueJobs.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Cron Reminders General Error]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
