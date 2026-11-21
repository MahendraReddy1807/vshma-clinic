import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  NOTIFICATION_CONFIG,
  isCurrentlyQuietHours,
  getNextQuietHoursReleaseTime,
  maskEmail,
  maskPhone,
} from './config';
import { EmailProvider } from './providers/email-provider';
import { WhatsAppProvider } from './providers/whatsapp-provider';
import { SmsProvider } from './providers/sms-provider';
import type { NotificationJob, ProviderSendResult } from './types';

export interface DispatchResult {
  totalClaimed: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  rescheduledQuietHoursCount: number;
  errors: Array<{ jobId: string; error: string }>;
}

export class NotificationDispatcher {
  /**
   * Atomically claims due notification jobs and dispatches them with retry backoff.
   */
  static async dispatchDueJobs(limit = 25): Promise<DispatchResult> {
    const supabase = createServerSupabaseClient();
    const nowIso = new Date().toISOString();

    const result: DispatchResult = {
      totalClaimed: 0,
      sentCount: 0,
      failedCount: 0,
      skippedCount: 0,
      rescheduledQuietHoursCount: 0,
      errors: [],
    };

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'
    ) {
      console.warn('[NotificationDispatcher] Supabase credentials missing. Bypassing database queue.');
      return result;
    }

    // 1. Fetch due jobs
    const { data: rawJobs, error: fetchErr } = await supabase
      .from('notification_jobs')
      .select('*')
      .eq('status', 'queued')
      .lte('scheduled_at', nowIso)
      .order('scheduled_at', { ascending: true })
      .limit(limit);

    if (fetchErr) {
      console.error('[NotificationDispatcher] Error querying due jobs:', fetchErr.message);
      return result;
    }

    const jobs = (rawJobs || []) as NotificationJob[];
    result.totalClaimed = jobs.length;
    if (jobs.length === 0) return result;

    // 2. Mark claimed jobs as 'processing' to prevent concurrent runs
    const jobIds = jobs.map((j) => j.id);
    await supabase
      .from('notification_jobs')
      .update({ status: 'processing', updated_at: nowIso })
      .in('id', jobIds);

    // 3. Process each job independently
    for (const job of jobs) {
      try {
        // A. Quiet Hours Check for Patient Reminders (9 PM - 7 AM IST)
        if (
          job.recipient_role === 'patient' &&
          job.event_type.startsWith('reminder_') &&
          isCurrentlyQuietHours()
        ) {
          const nextRelease = getNextQuietHoursReleaseTime();
          await supabase
            .from('notification_jobs')
            .update({
              status: 'queued',
              scheduled_at: nextRelease.toISOString(),
              updated_at: new Date().toISOString(),
              last_error: 'Rescheduled: currently in quiet hours (9 PM - 7 AM IST)',
            })
            .eq('id', job.id);

          result.rescheduledQuietHoursCount++;
          continue;
        }

        // B. Consent & Opt-out Check for WhatsApp and SMS
        if (job.channel === 'whatsapp' || job.channel === 'sms') {
          const cleanPhone = job.recipient_target.replace(/[^\d]/g, '');
          const { data: optOut } = await supabase
            .from('opt_out_registry')
            .select('id')
            .eq('phone', cleanPhone)
            .maybeSingle();

          if (optOut) {
            await supabase
              .from('notification_jobs')
              .update({
                status: 'skipped',
                sent_at: new Date().toISOString(),
                last_error: 'Recipient previously opted out via STOP',
                updated_at: new Date().toISOString(),
              })
              .eq('id', job.id);

            await supabase.from('notification_logs').insert({
              job_id: job.id,
              appointment_id: job.appointment_id,
              event_type: job.event_type,
              channel: job.channel,
              recipient: maskPhone(job.recipient_target),
              status: 'skipped',
              error_message: 'Recipient opted out via STOP',
            });

            result.skippedCount++;
            continue;
          }
        }

        // C. Provider Dispatch
        let sendRes: ProviderSendResult;
        const payload = job.payload || {};

        if (job.channel === 'email') {
          sendRes = await EmailProvider.send({
            to: job.recipient_target,
            subject: String(payload.subject || 'VSHMA Clinic Appointment Notification'),
            html: String(payload.html || '<p>Appointment notification</p>'),
            text: payload.text ? String(payload.text) : undefined,
            replyTo: payload.replyTo ? String(payload.replyTo) : undefined,
          });
        } else if (job.channel === 'whatsapp') {
          sendRes = await WhatsAppProvider.send({
            toPhone: job.recipient_target,
            messageText: String(payload.messageText || payload.text || ''),
          });
        } else if (job.channel === 'sms') {
          sendRes = await SmsProvider.send({
            toPhone: job.recipient_target,
            templateId: payload.templateId ? String(payload.templateId) : undefined,
            messageText: String(payload.messageText || payload.text || ''),
          });
        } else {
          sendRes = { success: false, error: `Unsupported channel: ${job.channel}` };
        }

        // D. Handle Outcome
        if (sendRes.success) {
          await supabase
            .from('notification_jobs')
            .update({
              status: sendRes.skipped ? 'skipped' : 'sent',
              sent_at: new Date().toISOString(),
              provider_message_id: sendRes.messageId || null,
              last_error: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id);

          await supabase.from('notification_logs').insert({
            job_id: job.id,
            appointment_id: job.appointment_id,
            event_type: job.event_type,
            channel: job.channel,
            recipient:
              job.channel === 'email'
                ? maskEmail(job.recipient_target)
                : maskPhone(job.recipient_target),
            status: sendRes.skipped ? 'skipped' : 'sent',
            provider_message_id: sendRes.messageId,
          });

          if (sendRes.skipped) {
            result.skippedCount++;
          } else {
            result.sentCount++;
          }
        } else {
          // Failure: calculate backoff
          const nextAttempts = (job.attempts || 0) + 1;
          const isFinalFailure = nextAttempts >= job.max_attempts;
          const backoffMins =
            NOTIFICATION_CONFIG.backoffScheduleMinutes[nextAttempts - 1] || 60;
          const nextScheduledAt = new Date(Date.now() + backoffMins * 60 * 1000).toISOString();

          await supabase
            .from('notification_jobs')
            .update({
              status: isFinalFailure ? 'failed' : 'queued',
              attempts: nextAttempts,
              scheduled_at: isFinalFailure ? job.scheduled_at : nextScheduledAt,
              last_error: sendRes.error,
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id);

          await supabase.from('notification_logs').insert({
            job_id: job.id,
            appointment_id: job.appointment_id,
            event_type: job.event_type,
            channel: job.channel,
            recipient:
              job.channel === 'email'
                ? maskEmail(job.recipient_target)
                : maskPhone(job.recipient_target),
            status: isFinalFailure ? 'failed' : 'queued',
            error_message: sendRes.error,
          });

          result.failedCount++;
          result.errors.push({ jobId: job.id, error: sendRes.error || 'Unknown dispatch error' });
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        await supabase
          .from('notification_jobs')
          .update({
            status: 'failed',
            last_error: errorMsg,
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id);

        result.failedCount++;
        result.errors.push({ jobId: job.id, error: errorMsg });
      }
    }

    return result;
  }
}
