'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import Button from '@/components/ui/Button';
import type { NotificationLog, AdminNotification } from '@/types';
import { formatDate } from '@/lib/utils';

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [emergencyPause, setEmergencyPause] = useState(false);

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
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleMarkAsRead = async (id?: string) => {
    const token = localStorage.getItem('vshma_admin_session');
    try {
      if (!id) {
        // Mark all as read
        await fetch('/api/admin/notifications', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ mark_all: true }),
        });
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
      } else {
        await fetch('/api/admin/notifications', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ id }),
        });
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
        setUnreadCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleRetryEmail = async (logId: string) => {
    setActionLoading(true);
    const token = localStorage.getItem('vshma_admin_session');
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ log_id: logId }),
      });

      if (res.ok) {
        alert('Retry email dispatched successfully.');
        fetchData();
      } else {
        const data = await res.json();
        alert(`Retry failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Retry request failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-forest" />
            <span>Notifications &amp; Delivery Logs</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Audit transactional email status, reminder executions, and clinical alert history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={() => handleMarkAsRead()}>
              Mark All as Read ({unreadCount})
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={fetchData}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* System Status Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Email Dispatch Engine</p>
            <p className="font-semibold text-gray-900 text-sm">Resend API (Active)</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Reminder Cadence</p>
            <p className="font-semibold text-gray-900 text-sm">24h &bull; 2h Prior</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Emergency Email Killswitch</p>
            <p className="font-semibold text-emerald-600 text-sm">Normal (Ready)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Clinic In-Dashboard Alerts */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h2 className="font-heading text-base font-bold text-gray-900">
              System Alerts
            </h2>
            {unreadCount > 0 && (
              <span className="bg-red-50 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {loading ? (
              <p className="text-xs text-gray-400 text-center py-8">Loading alerts...</p>
            ) : notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.is_read && handleMarkAsRead(item.id)}
                  className={`p-3.5 rounded-2xl border transition-colors cursor-pointer text-xs space-y-1.5 ${
                    item.is_read
                      ? 'bg-gray-50/50 border-gray-100 text-gray-600'
                      : 'bg-mint/40 border-sage/30 text-gray-900 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[13px]">{item.title}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-[11px]">{item.message}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 text-center py-8">No recent alerts recorded.</p>
            )}
          </div>
        </div>

        {/* Right Column: Transactional Email Delivery Logs */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="font-heading text-base font-bold text-gray-900">
                Transactional Email Audit Logs
              </h2>
              <p className="text-[11px] text-gray-400">
                Detailed record of appointment receipts, doctor confirmations, and automated reminders
              </p>
            </div>
            <span className="text-xs text-gray-500 font-mono">{logs.length} logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[10px] uppercase font-semibold text-gray-400">
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Recipient</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      Loading audit logs...
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] font-semibold text-forest">
                          {log.notification_type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-gray-800">{log.recipient}</p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[200px]">
                          {log.subject}
                        </p>
                      </td>
                      <td className="py-3 px-3">
                        {log.status === 'sent' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Delivered</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Failed</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-gray-500">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {log.status === 'failed' && (
                          <button
                            onClick={() => handleRetryEmail(log.id)}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest hover:underline"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">
                      No email delivery logs recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
