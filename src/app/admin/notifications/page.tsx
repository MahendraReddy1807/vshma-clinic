'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  Mail,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  Clock,
  ShieldAlert,
  Send,
  RefreshCw,
  Play,
  Filter,
  Check,
  AlertCircle,
  Smartphone,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import type { NotificationLog, AdminNotification } from '@/types';
import { formatDate } from '@/lib/utils';

interface NotificationJobItem {
  id: string;
  appointment_id: string;
  event_type: string;
  channel: 'email' | 'whatsapp' | 'sms';
  recipient_role: string;
  recipient_target: string;
  scheduled_at: string;
  status: 'queued' | 'processing' | 'sent' | 'failed' | 'cancelled' | 'skipped';
  attempts: number;
  max_attempts: number;
  last_error?: string | null;
  created_at: string;
  sent_at?: string | null;
  appointments?: {
    booking_reference?: string;
    full_name?: string;
    phone?: string;
  };
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [jobs, setJobs] = useState<NotificationJobItem[]>([]);
  const [jobStats, setJobStats] = useState({ queued: 0, sent: 0, failed: 0, skipped: 0 });
  const [notifyMode, setNotifyMode] = useState<'sandbox' | 'live' | 'dry-run'>('sandbox');
  const [loading, setLoading] = useState(true);

  // Active view tab: 'jobs' | 'logs' | 'alerts'
  const [activeTab, setActiveTab] = useState<'jobs' | 'logs' | 'alerts'>('jobs');
  const [channelFilter, setChannelFilter] = useState<'all' | 'email' | 'whatsapp' | 'sms'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'queued' | 'sent' | 'failed' | 'skipped'>('all');

  // Dispatcher execution feedback
  const [runningDispatcher, setRunningDispatcher] = useState(false);
  const [dispatcherResult, setDispatcherResult] = useState<string | null>(null);
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);

  // Gmail SMTP Connection Test State
  const [testingGmail, setTestingGmail] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<{
    success: boolean;
    message: string;
    quota?: { count: number; limit: number; isWarning: boolean };
  } | null>(null);

  const handleTestGmail = async () => {
    setTestingGmail(true);
    setGmailStatus(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
    try {
      const res = await fetch('/api/admin/emails/test-gmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ testEmail: 'mahendrart07@gmail.com' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setGmailStatus({ success: false, message: data.error || 'Connection handshake failed' });
      } else {
        setGmailStatus({
          success: true,
          message: data.message + (data.sendResult?.success ? ' (Live test message dispatched)' : ''),
          quota: data.quota,
        });
      }
    } catch (err: unknown) {
      setGmailStatus({ success: false, message: err instanceof Error ? err.message : 'Network error' });
    } finally {
      setTestingGmail(false);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('vshma_admin_session');
        localStorage.removeItem('vshma_admin_email');
        router.push('/admin/login');
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setLogs(data.logs || []);
        setJobs(data.jobs || []);
        setJobStats(data.jobStats || { queued: 0, sent: 0, failed: 0, skipped: 0 });
        setNotifyMode(data.notifyMode || 'sandbox');
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // Emergency Run Dispatcher Now
  const handleRunDispatcher = async () => {
    setRunningDispatcher(true);
    setDispatcherResult(null);
    const token = localStorage.getItem('vshma_admin_session');

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-admin-session': token || '',
        },
        body: JSON.stringify({ action: 'run_dispatcher_now' }),
      });

      const data = await res.json();
      if (res.ok) {
        setDispatcherResult(data.message || 'Dispatcher executed successfully.');
        fetchData();
      } else {
        setDispatcherResult(`Error: ${data.error || 'Failed to trigger dispatcher'}`);
      }
    } catch (err: unknown) {
      setDispatcherResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRunningDispatcher(false);
    }
  };

  // Retry single job
  const handleRetryJob = async (jobId: string) => {
    setRetryingJobId(jobId);
    const token = localStorage.getItem('vshma_admin_session');

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ job_id: jobId }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Retry job failed:', err);
    } finally {
      setRetryingJobId(null);
    }
  };

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    if (channelFilter !== 'all' && job.channel !== channelFilter) return false;
    if (statusFilter !== 'all' && job.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Mode Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-serif font-light text-forest tracking-tight">
              Notification &amp; Dispatcher Engine
            </h1>
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                notifyMode === 'sandbox'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : notifyMode === 'dry-run'
                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              <ShieldCheck className="w-3 h-3 text-amber-700" />
              <span>Mode: {notifyMode.toUpperCase()}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal/70 mt-1">
            Idempotent multi-channel notification engine (Email, WhatsApp, SMS) with quiet hours &amp; auto-retry.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunDispatcher}
            disabled={runningDispatcher}
            className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 text-gold ${runningDispatcher ? 'animate-spin' : ''}`} />
            <span>{runningDispatcher ? 'Running Dispatcher...' : 'Run Dispatcher Now'}</span>
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-sage/30 bg-white hover:bg-ivory text-charcoal transition-colors cursor-pointer shadow-2xs"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sandbox Notice Banner */}
      {notifyMode === 'sandbox' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Sandbox Mode Active</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                All outgoing patient emails are redirected to <strong>mahendrart07@gmail.com</strong> and WhatsApp / SMS messages to <strong>+91 7416001477</strong>. Real patients are protected.
              </p>
            </div>
          </div>
          <Link
            href="/admin/emails/preview"
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-white border border-amber-300 font-semibold text-amber-900 hover:bg-amber-100 transition-colors shrink-0 text-xs shadow-2xs"
          >
            Preview Email Templates &rarr;
          </Link>
        </div>
      )}

      {/* Dispatcher Run Feedback */}
      {dispatcherResult && (
        <div className="p-3.5 rounded-2xl bg-white border border-forest/20 text-xs text-forest flex items-center justify-between shadow-xs">
          <span className="font-mono">{dispatcherResult}</span>
          <button onClick={() => setDispatcherResult(null)} className="text-charcoal/50 hover:text-charcoal text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Delivery Health Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-sage/20 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 block">Queued Due</span>
          <p className="text-2xl font-serif text-forest font-light mt-1">{jobStats.queued}</p>
          <span className="text-[10px] text-sage">Awaiting next cron cycle</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sage/20 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 block">Delivered Sent</span>
          <p className="text-2xl font-serif text-emerald-700 font-light mt-1">{jobStats.sent}</p>
          <span className="text-[10px] text-emerald-600/80">Completed successfully</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sage/20 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 block">Failed / Errors</span>
          <p className="text-2xl font-serif text-rose-700 font-light mt-1">{jobStats.failed}</p>
          <span className="text-[10px] text-rose-600/80">Auto-retrying with backoff</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sage/20 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 block">Opt-out Skipped</span>
          <p className="text-2xl font-serif text-charcoal/70 font-light mt-1">{jobStats.skipped}</p>
          <span className="text-[10px] text-sage">STOP / Consent honoured</span>
        </div>
      </div>

      {/* Gmail SMTP Integration & Quota Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white border border-sage/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-700">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-forest">Email via Gmail SMTP</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                smtp.gmail.com:465
              </span>
            </div>
            <p className="text-xs text-charcoal/70 mt-0.5">
              Secure SSL dispatch via Nodemailer using Google App Password. 500 emails/day quota monitored.
            </p>
            {gmailStatus && (
              <p
                className={`text-xs mt-2 font-medium flex items-center gap-1.5 ${
                  gmailStatus.success ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {gmailStatus.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{gmailStatus.message}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={handleTestGmail}
            disabled={testingGmail}
            className="px-4 py-2 rounded-xl bg-ivory hover:bg-sage/30 text-forest text-xs font-semibold border border-sage/40 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 text-[#B89B5E] ${testingGmail ? 'animate-spin' : ''}`} />
            <span>{testingGmail ? 'Testing Handshake...' : 'Test Gmail Connection'}</span>
          </button>

          <Link
            href="/admin/emails/preview"
            className="px-4 py-2 rounded-xl bg-[#121A15] hover:bg-[#1F2B23] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>Preview Templates &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Main Tab Controls & Filters */}
      <div className="bg-white rounded-3xl border border-sage/20 shadow-sm overflow-hidden">
        {/* Tab Switcher Header */}
        <div className="p-4 border-b border-sage/20 bg-ivory/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex bg-white rounded-2xl border border-sage/30 p-1 text-xs font-semibold shadow-2xs">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'jobs' ? 'bg-forest text-white' : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Active Jobs Queue ({jobs.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'logs' ? 'bg-forest text-white' : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Audit History ({logs.length})
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'alerts' ? 'bg-forest text-white' : 'text-charcoal/70 hover:text-charcoal'
              }`}
            >
              Staff Alerts ({unreadCount > 0 ? `${unreadCount} unread` : notifications.length})
            </button>
          </div>

          {/* Filters (For jobs & logs) */}
          {activeTab === 'jobs' && (
            <div className="flex items-center gap-2">
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value as unknown as 'all' | 'email' | 'whatsapp' | 'sms')}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-sage/30 text-xs text-charcoal focus:outline-none"
              >
                <option value="all">All Channels</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as unknown as 'all' | 'queued' | 'sent' | 'failed' | 'skipped')}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-sage/30 text-xs text-charcoal focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="queued">Queued</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="skipped">Skipped</option>
              </select>
            </div>
          )}
        </div>

        {/* Tab 1: Active Jobs Queue */}
        {activeTab === 'jobs' && (
          <div className="divide-y divide-sage/10">
            {filteredJobs.length === 0 ? (
              <div className="p-12 text-center text-charcoal/60 text-xs">
                No notification jobs matching the current filter.
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div key={job.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-ivory/20 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {/* Channel Badge */}
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        job.channel === 'whatsapp'
                          ? 'bg-emerald-100 text-emerald-800'
                          : job.channel === 'email'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {job.channel === 'whatsapp' && <WhatsAppIcon className="w-3 h-3 text-[#25D366]" />}
                        {job.channel === 'email' && <Mail className="w-3 h-3 text-blue-700" />}
                        {job.channel === 'sms' && <Smartphone className="w-3 h-3 text-purple-700" />}
                        <span>{job.channel}</span>
                      </span>

                      {/* Event Tag */}
                      <span className="font-mono text-xs font-semibold text-forest">
                        {job.event_type}
                      </span>

                      {/* Recipient Role */}
                      <span className="text-[10px] text-charcoal/50 uppercase font-bold tracking-wider">
                        ({job.recipient_role})
                      </span>
                    </div>

                    <p className="text-xs text-charcoal/80 font-sans">
                      Target: <span className="font-mono">{job.recipient_target}</span> &bull; Patient:{' '}
                      <strong>{job.appointments?.full_name || 'Patient'}</strong>{' '}
                      {job.appointments?.booking_reference && (
                        <span className="text-sage">[{job.appointments.booking_reference}]</span>
                      )}
                    </p>

                    {job.last_error && (
                      <p className="text-[11px] text-rose-600 font-mono">
                        Error: {job.last_error}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        job.status === 'sent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : job.status === 'queued'
                          ? 'bg-amber-100 text-amber-800'
                          : job.status === 'failed'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {job.status} {job.attempts > 0 ? `(${job.attempts}/${job.max_attempts})` : ''}
                      </span>
                      <p className="text-[10px] text-charcoal/50 mt-1 font-mono">
                        Sched: {new Date(job.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} IST
                      </p>
                    </div>

                    {/* Retry Button for Failed Jobs */}
                    {job.status === 'failed' && (
                      <button
                        onClick={() => handleRetryJob(job.id)}
                        disabled={retryingJobId === job.id}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                        title="Retry Job Now"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${retryingJobId === job.id ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Audit Logs */}
        {activeTab === 'logs' && (
          <div className="divide-y divide-sage/10">
            {logs.length === 0 ? (
              <div className="p-12 text-center text-charcoal/60 text-xs">
                No notification audit logs recorded.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-ivory/20 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-forest">
                        {log.notification_type || log.channel}
                      </span>
                      <span className="text-[10px] text-sage">({log.channel})</span>
                    </div>
                    <p className="text-xs text-charcoal/80 font-sans">
                      Recipient: <span className="font-mono">{log.recipient}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {log.status}
                    </span>
                    <p className="text-[10px] text-charcoal/50 mt-1 font-mono">
                      {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })} IST
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Staff Alerts */}
        {activeTab === 'alerts' && (
          <div className="divide-y divide-sage/10">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-charcoal/60 text-xs">
                No active administrative alerts.
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-ivory/20 transition-colors">
                  <div>
                    <h3 className="font-semibold text-xs text-forest">{n.title}</h3>
                    <p className="text-xs text-charcoal/70 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-sage mt-1 font-mono">{formatDate(n.created_at)}</p>
                  </div>
                  {n.is_read ? (
                    <span className="text-[10px] text-sage font-mono">Read</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest text-white font-semibold">New</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
