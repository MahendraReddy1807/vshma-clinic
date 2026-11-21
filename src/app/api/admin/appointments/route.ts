import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendTransactionalEmail } from '@/lib/email/resend';
import { buildEmailVariables } from '@/lib/email/template-variables';
import {
  scheduleAppointmentReminders,
  rescheduleAppointmentReminders,
  cancelAppointmentReminders,
} from '@/lib/scheduler/reminder-engine';
import { EventScheduler } from '@/lib/notifications/event-scheduler';
import { NotificationDispatcher } from '@/lib/notifications/dispatcher';
import { formatTimeTo12h, getTodayISO } from '@/lib/utils';
import {
  notifyPatientAppointmentConfirmedViaWhatsApp,
  notifyPatientAppointmentRescheduledViaWhatsApp,
  notifyPatientAppointmentCancelledViaWhatsApp,
} from '@/lib/whatsapp/service';
import type { AppointmentStatus } from '@/types';

export async function GET(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim() || '';
  const status = searchParams.get('status') || '';
  const date = searchParams.get('date') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    return NextResponse.json({ error: 'Invalid pagination values.' }, { status: 400 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'
  ) {
    return NextResponse.json({ error: 'Appointment service is not configured.' }, { status: 503 });
  }

  try {
    const supabase = createServerSupabaseClient();
    let query = supabase.from('appointments').select('*', { count: 'exact' });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (date) {
      query = query.eq('appointment_date', date);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,booking_reference.ilike.%${search}%`);
    }

    if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('Appointments query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Attach latest notification logs to each appointment
    const appointmentIds = (data || []).map((a: { id: string }) => a.id);
    const logsByAppt: Record<string, { email?: unknown; whatsapp?: unknown; admin_whatsapp?: unknown }> = {};

    if (appointmentIds.length > 0) {
      try {
        const { data: logs } = await supabase
          .from('notification_logs')
          .select('*')
          .in('appointment_id', appointmentIds)
          .order('attempted_at', { ascending: false });

        if (logs) {
          for (const log of logs) {
            if (!logsByAppt[log.appointment_id]) {
              logsByAppt[log.appointment_id] = {};
            }
            if (log.channel === 'email' && !logsByAppt[log.appointment_id].email) {
              logsByAppt[log.appointment_id].email = log;
            } else if (log.channel === 'whatsapp') {
              if (log.notification_type === 'admin_new_booking' && !logsByAppt[log.appointment_id].admin_whatsapp) {
                logsByAppt[log.appointment_id].admin_whatsapp = log;
              } else if (log.notification_type !== 'admin_new_booking' && !logsByAppt[log.appointment_id].whatsapp) {
                logsByAppt[log.appointment_id].whatsapp = log;
              }
            }
          }
        }
      } catch (logErr) {
        console.warn('Could not attach notification logs:', logErr);
      }
    }

    const enrichedAppointments = (data || []).map((appt: { id: string }) => ({
      ...appt,
      email_notification: logsByAppt[appt.id]?.email || null,
      whatsapp_notification: logsByAppt[appt.id]?.whatsapp || null,
      admin_whatsapp_notification: logsByAppt[appt.id]?.admin_whatsapp || null,
    }));

    return NextResponse.json({
      appointments: enrichedAppointments,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  try {
    const {
      id,
      status,
      confirmed_date,
      confirmed_time,
      rescheduled_date,
      rescheduled_time,
      reason,
      whatsapp_opt_in,
    } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Valid appointment ID is required' }, { status: 400 });
    }

    const allowedStatuses: AppointmentStatus[] = ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid appointment status' }, { status: 400 });
    }

    if (!status && typeof whatsapp_opt_in !== 'boolean') {
      return NextResponse.json({ error: 'Either status or whatsapp_opt_in is required' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
      return NextResponse.json({ error: 'Appointment service is not configured.' }, { status: 503 });
    }

    const supabase = createServerSupabaseClient();

    // 1. Fetch current appointment details
    const { data: currentAppt, error: fetchErr } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr || !currentAppt) {
      return NextResponse.json({ error: fetchErr?.message || 'Appointment not found' }, { status: 404 });
    }

    const todayIST = getTodayISO();
    const nowIso = new Date().toISOString();
    const updatePayload: Record<string, unknown> = {
      updated_at: nowIso,
    };

    if (typeof whatsapp_opt_in === 'boolean') {
      updatePayload.whatsapp_opt_in = whatsapp_opt_in;
      updatePayload.whatsapp_opt_in_timestamp = nowIso;
      updatePayload.whatsapp_opt_in_source = 'admin_staff_update';

      // Sync consent change with patients dossier if phone matches
      try {
        const pPhone = currentAppt.phone;
        if (pPhone) {
          const rawDigits = pPhone.replace(/\D/g, '');
          const normalized = rawDigits.length === 10 ? `+91${rawDigits}` : rawDigits.startsWith('91') && rawDigits.length === 12 ? `+${rawDigits}` : pPhone;
          await supabase.from('patients').update({
            whatsapp_opt_in,
            whatsapp_opt_in_timestamp: nowIso,
            whatsapp_opt_in_source: 'admin_staff_update',
            updated_at: nowIso,
          }).or(`phone.eq.${pPhone},phone.eq.${normalized}`);
        }
      } catch {
        // Safe fallback if patients table is not yet migrated
      }
    }

    // If staff is only updating WhatsApp consent without changing appointment status
    if (!status) {
      const { data: updatedAppt, error: updateErr } = await supabase
        .from('appointments')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

      if (updateErr || !updatedAppt) {
        return NextResponse.json({ error: updateErr?.message || 'Failed to update consent.' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        appointment: updatedAppt,
        message: `WhatsApp consent ${whatsapp_opt_in ? 'granted' : 'revoked'} successfully.`,
      });
    }

    updatePayload.status = status;

    let targetDate = currentAppt.appointment_date;
    let targetTime = currentAppt.preferred_time || '10:30 AM';

    if (status === 'confirmed') {
      // Validate confirmed date
      const selectedDate = confirmed_date || currentAppt.appointment_date;
      if (selectedDate < todayIST) {
        return NextResponse.json({ error: 'Confirmed appointment date cannot be in the past.' }, { status: 400 });
      }
      targetDate = selectedDate;

      // Validate and format exact confirmed time (e.g. "9:15 AM", "10:30 AM", "2:20 PM")
      const rawTime = confirmed_time || currentAppt.preferred_time || '10:30 AM';
      targetTime = formatTimeTo12h(rawTime);

      updatePayload.appointment_date = targetDate;
      updatePayload.preferred_time = targetTime;
      updatePayload.confirmed_at = nowIso;
    } else if (status === 'rescheduled') {
      if (!rescheduled_date) {
        return NextResponse.json({ error: 'Rescheduled date is required.' }, { status: 400 });
      }
      if (rescheduled_date < todayIST) {
        return NextResponse.json({ error: 'Rescheduled date cannot be in the past.' }, { status: 400 });
      }
      targetDate = rescheduled_date;
      targetTime = formatTimeTo12h(rescheduled_time || currentAppt.preferred_time || '10:30 AM');

      updatePayload.rescheduled_date = targetDate;
      updatePayload.rescheduled_time = targetTime;
    } else if (status === 'cancelled') {
      if (reason) updatePayload.cancellation_reason = reason;
    }

    // 2. Perform Database Transaction FIRST — Never dispatch notifications before DB success
    const { data: updatedAppt, error: updateErr } = await supabase
      .from('appointments')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (updateErr || !updatedAppt) {
      return NextResponse.json({ error: updateErr?.message || 'Failed to update appointment record.' }, { status: 500 });
    }

    // 3. Automated Notifications & Reminders (Only after DB success)
    const recipientEmail = updatedAppt.email || currentAppt.email;
    const patientPhone = updatedAppt.phone || currentAppt.phone;
    const whatsappOptIn = Boolean(updatedAppt.whatsapp_opt_in ?? currentAppt.whatsapp_opt_in);

    const emailWarnings: string[] = [];
    let whatsappStatus: string = whatsappOptIn ? 'pending' : 'not_opted_in';

    if (status === 'confirmed') {
      // Notification Engine: queue confirmed event + reminders
      try {
        await EventScheduler.onConfirmed(updatedAppt);
      } catch (err) {
        console.warn('[EventScheduler onConfirmed Error]', err);
      }

      // 3a. Schedule reminder jobs using exact confirmed date and exact time
      if (currentAppt.status !== 'confirmed') {
        await scheduleAppointmentReminders({
          id: updatedAppt.id,
          appointment_date: targetDate,
          preferred_time: targetTime,
        });
      }

      // 3b. Dual Patient Notifications (Email + WhatsApp)
      if (currentAppt.status !== 'confirmed') {
        // Email Confirmation via Resend
        if (recipientEmail) {
          const emailResult = await sendTransactionalEmail({
            to: recipientEmail,
            appointmentId: updatedAppt.id,
            bookingReference: updatedAppt.booking_reference,
            notificationType: 'appointment_confirmed',
            variables: buildEmailVariables({
              patientName: updatedAppt.full_name,
              bookingReference: updatedAppt.booking_reference,
              appointmentDate: targetDate,
              appointmentTime: targetTime, // Exact confirmed time
            }),
          }).catch((err) => {
            console.error('[Admin Confirm Email Error]', err);
            return { success: false, error: String(err) };
          });
          if (!emailResult.success) {
            emailWarnings.push(emailResult.error || 'Appointment confirmation email could not be delivered.');
          }
        }

        // WhatsApp Confirmation via Meta Cloud API
        if (patientPhone) {
          try {
            const waRes = await notifyPatientAppointmentConfirmedViaWhatsApp({
              appointmentId: updatedAppt.id,
              bookingReference: updatedAppt.booking_reference,
              patientName: updatedAppt.full_name,
              patientPhone,
              confirmedDate: targetDate,
              confirmedTime: targetTime, // Exact confirmed time
              consultationType: updatedAppt.consultation_type,
              whatsappOptIn,
            });
            whatsappStatus = waRes.status || (waRes.success ? 'sent' : 'failed');
          } catch (waErr) {
            console.error('[Admin Confirm WhatsApp Error]', waErr);
            whatsappStatus = 'failed';
          }
        }
      }

      // Record in admin notifications
      try {
        await supabase.from('admin_notifications').insert({
          appointment_id: updatedAppt.id,
          title: `Appointment Confirmed: ${updatedAppt.booking_reference}`,
          message: `${updatedAppt.full_name}'s consultation confirmed for ${targetDate} at ${targetTime}.`,
          type: 'confirmed',
          is_read: false,
        });
      } catch (notifErr) {
        console.error('[Admin Notif Insert Error]', notifErr);
      }

    } else if (status === 'rescheduled') {
      const newDate = targetDate;
      const newTime = targetTime;

      // Notification Engine: queue rescheduled event + recalculate reminders
      try {
        await EventScheduler.onRescheduled(updatedAppt, currentAppt.appointment_date, currentAppt.preferred_time || '');
      } catch (err) {
        console.warn('[EventScheduler onRescheduled Error]', err);
      }

      // Reschedule reminder jobs with new exact schedule
      await rescheduleAppointmentReminders(updatedAppt.id, newDate, newTime);

      // Email Rescheduled Notice
      if (recipientEmail && (currentAppt.rescheduled_date !== newDate || currentAppt.rescheduled_time !== newTime || currentAppt.status !== 'rescheduled')) {
        const emailResult = await sendTransactionalEmail({
          to: recipientEmail,
          appointmentId: updatedAppt.id,
          bookingReference: updatedAppt.booking_reference,
          notificationType: 'appointment_rescheduled',
          idempotencySuffix: `${newDate}:${newTime || ''}`,
          variables: buildEmailVariables({
            patientName: updatedAppt.full_name,
            bookingReference: updatedAppt.booking_reference,
            previousAppointmentDate: currentAppt.appointment_date,
            previousAppointmentTime: currentAppt.preferred_time,
            newAppointmentDate: newDate,
            newAppointmentTime: newTime,
          }),
        }).catch((err) => {
          console.error('[Admin Reschedule Email Error]', err);
          return { success: false, error: String(err) };
        });
        if (!emailResult.success) {
          emailWarnings.push(emailResult.error || 'Appointment rescheduling email could not be delivered.');
        }
      }

      // WhatsApp Rescheduled Notice
      if (patientPhone) {
        try {
          const waRes = await notifyPatientAppointmentRescheduledViaWhatsApp({
            appointmentId: updatedAppt.id,
            bookingReference: updatedAppt.booking_reference,
            patientName: updatedAppt.full_name,
            patientPhone,
            newDate,
            newTime,
            consultationType: updatedAppt.consultation_type,
            whatsappOptIn,
          });
          whatsappStatus = waRes.status || (waRes.success ? 'sent' : 'failed');
        } catch (waErr) {
          console.error('[Admin Reschedule WhatsApp Error]', waErr);
          whatsappStatus = 'failed';
        }
      }

      try {
        await supabase.from('admin_notifications').insert({
          appointment_id: updatedAppt.id,
          title: `Appointment Rescheduled: ${updatedAppt.booking_reference}`,
          message: `${updatedAppt.full_name} moved to ${newDate} at ${newTime}.`,
          type: 'rescheduled',
          is_read: false,
        });
      } catch (notifErr) {
        console.error('[Admin Notif Insert Error]', notifErr);
      }

    } else if (status === 'cancelled') {
      // Notification Engine: queue cancelled event + cancel queued jobs
      try {
        await EventScheduler.onCancelled(updatedAppt, reason, 'clinic');
      } catch (err) {
        console.warn('[EventScheduler onCancelled Error]', err);
      }

      // Cancel pending reminders
      await cancelAppointmentReminders(updatedAppt.id);

      // Email Cancellation Notice
      if (recipientEmail && currentAppt.status !== 'cancelled') {
        const emailResult = await sendTransactionalEmail({
          to: recipientEmail,
          appointmentId: updatedAppt.id,
          bookingReference: updatedAppt.booking_reference,
          notificationType: 'appointment_cancelled',
          variables: buildEmailVariables({
            patientName: updatedAppt.full_name,
            bookingReference: updatedAppt.booking_reference,
            appointmentDate: currentAppt.appointment_date,
            appointmentTime: currentAppt.preferred_time,
          }),
        }).catch((err) => {
          console.error('[Admin Cancel Email Error]', err);
          return { success: false, error: String(err) };
        });
        if (!emailResult.success) {
          emailWarnings.push(emailResult.error || 'Appointment cancellation email could not be delivered.');
        }
      }

      // WhatsApp Cancellation Notice
      if (patientPhone) {
        try {
          const waRes = await notifyPatientAppointmentCancelledViaWhatsApp({
            appointmentId: updatedAppt.id,
            bookingReference: updatedAppt.booking_reference,
            patientName: updatedAppt.full_name,
            patientPhone,
            appointmentDate: currentAppt.appointment_date,
            reason: reason || 'Clinic / Patient schedule adjustment',
            whatsappOptIn,
          });
          whatsappStatus = waRes.status || (waRes.success ? 'sent' : 'failed');
        } catch (waErr) {
          console.error('[Admin Cancel WhatsApp Error]', waErr);
          whatsappStatus = 'failed';
        }
      }

      try {
        await supabase.from('admin_notifications').insert({
          appointment_id: updatedAppt.id,
          title: `Appointment Cancelled: ${updatedAppt.booking_reference}`,
          message: `${updatedAppt.full_name}'s appointment was cancelled. ${reason ? `Reason: ${reason}` : ''}`,
          type: 'cancelled',
          is_read: false,
        });
      } catch (notifErr) {
        console.error('[Admin Notif Insert Error]', notifErr);
      }

    } else if (status === 'completed') {
      try {
        await EventScheduler.onCompleted(updatedAppt);
      } catch (err) {
        console.warn('[EventScheduler onCompleted Error]', err);
      }
      await cancelAppointmentReminders(updatedAppt.id);
    }

    // Instantly trigger dispatcher to send immediate updates
    void NotificationDispatcher.dispatchDueJobs(15).catch((err) =>
      console.warn('[Dispatcher Instant Trigger Error]', err)
    );

    return NextResponse.json({
      success: true,
      appointment: updatedAppt,
      notificationStatus: {
        email: emailWarnings.length === 0 ? 'sent' : 'failed',
        whatsapp: whatsappStatus,
      },
      emailWarnings,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
    return NextResponse.json({ success: true, id });
  }

  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from('appointments').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
