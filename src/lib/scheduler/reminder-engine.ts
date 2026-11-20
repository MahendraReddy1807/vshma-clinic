import { createServerSupabaseClient } from '@/lib/supabase/server';

// Convert date string (YYYY-MM-DD) and preferred_time window to approximate IST Date
export function parseAppointmentISTDate(dateStr: string, timeStr?: string | null): Date {
  let hour = 10; // Default 10:00 AM IST
  const minute = 0;

  if (timeStr) {
    const lower = timeStr.toLowerCase();
    if (lower.includes('morning') || lower.includes('9am')) {
      hour = 10;
    } else if (lower.includes('afternoon') || lower.includes('12pm')) {
      hour = 13;
    } else if (lower.includes('evening') || lower.includes('3pm')) {
      hour = 16;
    }
  }

  // Parse as IST (UTC+5:30)
  // Date ISO string: YYYY-MM-DDTHH:MM:00+05:30
  const formattedHour = hour.toString().padStart(2, '0');
  const formattedMinute = minute.toString().padStart(2, '0');
  const istIso = `${dateStr}T${formattedHour}:${formattedMinute}:00+05:30`;
  return new Date(istIso);
}

export async function scheduleAppointmentReminders(appointment: {
  id: string;
  appointment_date: string;
  preferred_time?: string | null;
}) {
  try {
    const supabase = createServerSupabaseClient();
    const apptDate = parseAppointmentISTDate(appointment.appointment_date, appointment.preferred_time);
    const now = new Date();

    // 24 Hours before
    const time24h = new Date(apptDate.getTime() - 24 * 60 * 60 * 1000);
    // 2 Hours before
    const time2h = new Date(apptDate.getTime() - 2 * 60 * 60 * 1000);

    const jobsToInsert = [];

    if (time24h > now) {
      jobsToInsert.push({
        appointment_id: appointment.id,
        reminder_type: '24h',
        scheduled_for: time24h.toISOString(),
        status: 'pending',
      });
    }

    if (time2h > now) {
      jobsToInsert.push({
        appointment_id: appointment.id,
        reminder_type: '2h',
        scheduled_for: time2h.toISOString(),
        status: 'pending',
      });
    }

    if (jobsToInsert.length > 0) {
      await supabase.from('reminder_jobs').insert(jobsToInsert);
    }
  } catch (err) {
    console.error('[Schedule Reminders Error]', err);
  }
}

export async function cancelAppointmentReminders(appointmentId: string) {
  try {
    const supabase = createServerSupabaseClient();
    await supabase
      .from('reminder_jobs')
      .update({ status: 'cancelled' })
      .eq('appointment_id', appointmentId)
      .eq('status', 'pending');
  } catch (err) {
    console.error('[Cancel Reminders Error]', err);
  }
}

export async function rescheduleAppointmentReminders(
  appointmentId: string,
  newDate: string,
  newTime?: string | null
) {
  // 1. Cancel previous pending jobs
  await cancelAppointmentReminders(appointmentId);
  // 2. Schedule fresh jobs
  await scheduleAppointmentReminders({
    id: appointmentId,
    appointment_date: newDate,
    preferred_time: newTime,
  });
}
