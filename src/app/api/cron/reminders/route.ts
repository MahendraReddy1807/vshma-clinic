import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendTransactionalEmail } from '@/lib/email/resend';
import { buildEmailVariables } from '@/lib/email/template-variables';

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
      return NextResponse.json({ error: 'Reminder service is not configured.' }, { status: 503 });
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
          rescheduled_date,
          rescheduled_time,
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

      // Rescheduled appointments retain a confirmed slot; pending requests do not.
      if (!appt || (appt.status !== 'confirmed' && appt.status !== 'rescheduled')) {
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

      // Claim the job atomically so overlapping cron runs cannot send it twice.
      const { data: claimedJob, error: claimError } = await supabase
        .from('reminder_jobs')
        .update({ status: 'processing' })
        .eq('id', job.id)
        .eq('status', 'pending')
        .select('id')
        .maybeSingle();
      if (claimError || !claimedJob) continue;

      const patientEmail = String(appt.email || '');
      if (!patientEmail) {
        // Patient did not provide email; mark as completed
        await supabase
          .from('reminder_jobs')
          .update({ status: 'completed', error_message: 'No patient email provided' })
          .eq('id', job.id);
        continue;
      }

      const emailResult = await sendTransactionalEmail({
        to: patientEmail,
        appointmentId: job.appointment_id,
        bookingReference: String(appt.booking_reference || ''),
        notificationType: job.reminder_type === '24h' ? 'reminder_24h' : 'reminder_2h',
        variables: buildEmailVariables({
          patientName: String(appt.full_name || 'Patient'),
          bookingReference: String(appt.booking_reference || ''),
          appointmentDate: String(appt.rescheduled_date || appt.appointment_date || ''),
          appointmentTime: String(appt.rescheduled_time || appt.preferred_time || 'Flexible'),
          reminderType: job.reminder_type as '24h' | '2h',
        }),
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
