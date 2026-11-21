'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
  XCircle,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import type { Appointment, AppointmentStatus } from '@/types';
import {
  formatDate,
  formatDateShort,
  generatePatientWhatsAppUrl,
  formatTimeTo12h,
  formatTimeTo24h,
  getTodayISO,
} from '@/lib/utils';

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Modals
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [deleteAppt, setDeleteAppt] = useState<Appointment | null>(null);
  
  // Confirm Appointment state
  const [confirmModalAppt, setConfirmModalAppt] = useState<Appointment | null>(null);
  const [confirmDate, setConfirmDate] = useState('');
  const [confirmTime, setConfirmTime] = useState('10:30');

  // Reschedule state
  const [rescheduleModalAppt, setRescheduleModalAppt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('14:20');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Cancel state
  const [cancelModalAppt, setCancelModalAppt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [retryStatus, setRetryStatus] = useState<string | null>(null);

  const handleToggleConsent = async (id: string, currentConsent: boolean) => {
    setActionLoading(true);
    setRetryStatus(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
          whatsapp_opt_in: !currentConsent,
        }),
      });
      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === id
              ? {
                  ...a,
                  whatsapp_opt_in: !currentConsent,
                  whatsapp_opt_in_timestamp: new Date().toISOString(),
                  whatsapp_opt_in_source: 'admin_staff_update',
                }
              : a
          )
        );
        if (selectedAppt && selectedAppt.id === id) {
          setSelectedAppt((prev) =>
            prev
              ? {
                  ...prev,
                  whatsapp_opt_in: !currentConsent,
                  whatsapp_opt_in_timestamp: new Date().toISOString(),
                  whatsapp_opt_in_source: 'admin_staff_update',
                }
              : null
          );
        }
        setRetryStatus(`WhatsApp consent ${!currentConsent ? 'granted' : 'revoked'} successfully.`);
      } else {
        const data = await res.json();
        setRetryStatus(`Consent update failed: ${data.error || 'Server error'}`);
      }
    } catch (err) {
      console.error('Consent toggle failed:', err);
      setRetryStatus('Consent update failed due to network error.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetryNotification = async (logId: string) => {
    setActionLoading(true);
    setRetryStatus(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ log_id: logId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRetryStatus('Notification re-sent successfully!');
        fetchAppointments();
      } else {
        setRetryStatus(`Retry failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setRetryStatus(`Retry failed: ${String(err)}`);
    } finally {
      setActionLoading(false);
    }
  };

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        status: statusFilter,
        date: dateFilter,
        sort: sortOrder,
      });

      const res = await fetch(`/api/admin/appointments?${params.toString()}`, {
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
        setAppointments(data.appointments || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        const errData = await res.json().catch(() => ({}));
        setAppointments([]);
        setTotal(0);
        setTotalPages(1);
        setFetchError(errData.error || 'Failed to fetch appointments.');
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setFetchError('Could not connect to the appointment service.');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, dateFilter, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAppointments();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAppointments]);

  // Update status handler
  const handleUpdateStatus = async (
    id: string,
    newStatus: AppointmentStatus,
    extraData?: {
      confirmed_date?: string;
      confirmed_time?: string;
      rescheduled_date?: string;
      rescheduled_time?: string;
      reason?: string;
    }
  ) => {
    setActionLoading(true);
    const token = localStorage.getItem('vshma_admin_session');
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id,
          status: newStatus,
          ...extraData,
        }),
      });

      if (res.ok) {
        const confirmedTimeFormatted = extraData?.confirmed_time ? formatTimeTo12h(extraData.confirmed_time) : undefined;
        const rescheduledTimeFormatted = extraData?.rescheduled_time ? formatTimeTo12h(extraData.rescheduled_time) : undefined;

        setAppointments((prev) =>
          prev.map((a) => {
            if (a.id !== id) return a;
            return {
              ...a,
              status: newStatus,
              ...(extraData?.confirmed_date ? { appointment_date: extraData.confirmed_date } : {}),
              ...(confirmedTimeFormatted ? { preferred_time: confirmedTimeFormatted } : {}),
              ...(extraData?.rescheduled_date ? { rescheduled_date: extraData.rescheduled_date } : {}),
              ...(rescheduledTimeFormatted ? { rescheduled_time: rescheduledTimeFormatted } : {}),
            };
          })
        );
        if (selectedAppt && selectedAppt.id === id) {
          setSelectedAppt((prev) =>
            prev
              ? {
                  ...prev,
                  status: newStatus,
                  ...(extraData?.confirmed_date ? { appointment_date: extraData.confirmed_date } : {}),
                  ...(confirmedTimeFormatted ? { preferred_time: confirmedTimeFormatted } : {}),
                  ...(extraData?.rescheduled_date ? { rescheduled_date: extraData.rescheduled_date } : {}),
                  ...(rescheduledTimeFormatted ? { rescheduled_time: rescheduledTimeFormatted } : {}),
                }
              : null
          );
        }
        // Close modals
        setConfirmModalAppt(null);
        setRescheduleModalAppt(null);
        setCancelModalAppt(null);
      }
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!deleteAppt) return;
    setActionLoading(true);
    const token = localStorage.getItem('vshma_admin_session');
    try {
      const res = await fetch(`/api/admin/appointments?id=${deleteAppt.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setAppointments((prev) => prev.filter((a) => a.id !== deleteAppt.id));
        setDeleteAppt(null);
        setTotal((t) => Math.max(0, t - 1));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (appointments.length === 0) return;

    const headers = [
      'Booking Reference',
      'Patient Name',
      'Phone Number',
      'Email',
      'Age',
      'Appointment Date',
      'Preferred Time',
      'Rescheduled Date',
      'Rescheduled Time',
      'Consultation Type',
      'Status',
      'Booking Request Time',
      'Patient Message',
    ];

    const rows = appointments.map((a) => [
      `"${a.booking_reference}"`,
      `"${a.full_name}"`,
      `"${a.phone}"`,
      `"${a.email || 'N/A'}"`,
      `"${a.age || 'N/A'}"`,
      `"${a.appointment_date}"`,
      `"${a.preferred_time || 'N/A'}"`,
      `"${a.rescheduled_date || 'N/A'}"`,
      `"${a.rescheduled_time || 'N/A'}"`,
      `"${a.consultation_type}"`,
      `"${a.status}"`,
      `"${a.created_at}"`,
      `"${(a.message || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VSHMA_Appointments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif font-light text-2xl sm:text-3xl text-forest tracking-tight">
            Appointment Records
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Total {total} consultation requests on record &bull; Automated Resend dispatches active
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={exportToCSV} disabled={appointments.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            <span>Export CSV</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={fetchAppointments}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {fetchError && (
        <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl flex items-center gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{fetchError} Showing local demonstration records.</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by name, phone, ref..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 h-10 text-xs"
          />
        </div>

        <div>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'pending', label: 'Pending Request' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'rescheduled', label: 'Rescheduled' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            className="h-10 text-xs"
          />
        </div>

        <div>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 text-xs"
          />
        </div>

        <div>
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            options={[
              { value: 'newest', label: 'Sort: Newest First' },
              { value: 'oldest', label: 'Sort: Oldest First' },
            ]}
            className="h-10 text-xs"
          />
        </div>
      </div>

      {/* Appointment Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-16rem)]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs">
              <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                <th className="py-3.5 px-4 sm:px-6">Patient</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Scheduled For</th>
                <th className="py-3.5 px-4">Consultation</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
              ) : appointments.length > 0 ? (
                appointments.map((appt) => {
                  const targetDate = appt.status === 'rescheduled' && appt.rescheduled_date
                    ? appt.rescheduled_date
                    : appt.appointment_date;
                  const targetTime = appt.status === 'rescheduled' && appt.rescheduled_time
                    ? appt.rescheduled_time
                    : appt.preferred_time || 'Time unspecified';

                  return (
                    <tr key={appt.id} className="hover:bg-gray-50/70 transition-colors duration-150">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-semibold text-gray-900">{appt.full_name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] text-gray-500 font-medium">
                            {appt.booking_reference}
                          </span>
                          {appt.age && (
                            <span className="text-[11px] text-gray-400">&bull; {appt.age} yrs</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <a
                            href={`tel:+91${appt.phone}`}
                            className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-forest transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{appt.phone}</span>
                          </a>
                          {appt.email && (
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 truncate max-w-[150px]">
                              <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="truncate">{appt.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-gray-800 text-xs sm:text-sm">
                          {formatDateShort(targetDate)}
                        </span>
                        <span className="text-gray-400 text-xs ml-1.5 font-normal">
                          &bull; {targetTime}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-600">
                        {appt.consultation_type}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge status={appt.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1 sm:space-x-1.5">
                        {appt.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(appt.id, 'confirmed')}
                            disabled={actionLoading}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors inline-flex"
                            title="Quick Confirm"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedAppt(appt)}
                          className="p-1.5 text-gray-500 hover:text-forest hover:bg-mint rounded-lg transition-colors inline-flex"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setRescheduleModalAppt(appt);
                            setRescheduleDate(appt.appointment_date);
                            setRescheduleTime(appt.preferred_time || 'Morning (9 AM – 12 PM)');
                            setRescheduleReason('');
                          }}
                          className="p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors inline-flex"
                          title="Reschedule Slot"
                        >
                          <CalendarClock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteAppt(appt)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-gray-400">
                    No matching appointment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>
            Page {page} of {Math.max(1, totalPages)} ({total} records)
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Patient Detail Modal */}
      <Modal
        isOpen={!!selectedAppt}
        onClose={() => setSelectedAppt(null)}
        title="Appointment Record Details"
        maxWidth="max-w-xl"
      >
        {selectedAppt && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-mint/50 p-4 rounded-2xl border border-sage/20">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  Booking Reference
                </span>
                <p className="font-heading text-xl font-bold text-forest">
                  {selectedAppt.booking_reference}
                </p>
              </div>
              <Badge status={selectedAppt.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Patient Name</span>
                <p className="font-semibold text-gray-900">{selectedAppt.full_name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Patient Age</span>
                <p className="font-semibold text-gray-900">
                  {selectedAppt.age ? `${selectedAppt.age} years old` : 'Not provided'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Contact Phone</span>
                <p className="font-semibold text-gray-900">{selectedAppt.phone}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Email Address</span>
                <p className="font-semibold text-gray-900 truncate">
                  {selectedAppt.email || 'None on record'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Requested Date</span>
                <p className="font-semibold text-gray-900">
                  {formatDate(selectedAppt.appointment_date)}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Preferred Time</span>
                <p className="font-semibold text-gray-900">
                  {selectedAppt.preferred_time || 'Unspecified'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">WhatsApp Updates</span>
                <p className="font-semibold text-gray-900">
                  {selectedAppt.whatsapp_opt_in ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-semibold">
                      <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" /> Opted In
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs">No (Email / Phone only)</span>
                  )}
                </p>
              </div>

              {selectedAppt.rescheduled_date && (
                <div className="col-span-2 bg-purple-50/70 p-3 rounded-xl border border-purple-100">
                  <span className="text-xs font-semibold text-purple-900">Rescheduled Appointment:</span>
                  <p className="text-xs text-purple-800 mt-1">
                    {formatDate(selectedAppt.rescheduled_date)} &bull; {selectedAppt.rescheduled_time || 'Standard window'}
                  </p>
                </div>
              )}

              <div className="col-span-2 space-y-1">
                <span className="text-xs text-gray-400 font-medium">Consultation Type</span>
                <p className="font-semibold text-gray-900">{selectedAppt.consultation_type}</p>
              </div>
              {selectedAppt.message && (
                <div className="col-span-2 space-y-1 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-400 font-medium">Patient Note</span>
                  <p className="text-gray-700 text-xs leading-relaxed">{selectedAppt.message}</p>
                </div>
              )}
            </div>

            {/* Notification Delivery Audit Status */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Automated Notification Audit Status
                </label>
                {retryStatus && (
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${retryStatus.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {retryStatus}
                  </span>
                )}
              </div>

              <div className="bg-gray-50/90 p-4 rounded-2xl border border-gray-100 space-y-3 text-xs">
                {/* 1. Email Delivery Section */}
                <div className="space-y-1.5 pb-3 border-b border-gray-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      Email Notification Delivery
                    </span>
                    {selectedAppt.email_notification && (
                      <span className="text-[10px] text-gray-400 font-mono">
                        {selectedAppt.email_notification.resend_message_id ? `ID: ${selectedAppt.email_notification.resend_message_id.slice(0, 14)}...` : ''}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {selectedAppt.email ? (
                      <>
                        {selectedAppt.email_notification ? (
                          <>
                            {selectedAppt.email_notification.status === 'delivered' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Delivered to Mailbox
                              </span>
                            )}
                            {selectedAppt.email_notification.status === 'accepted' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                                <Clock className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                                Accepted by Provider (Pending Delivery)
                              </span>
                            )}
                            {selectedAppt.email_notification.status === 'sent' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Sent to Patient
                              </span>
                            )}
                            {selectedAppt.email_notification.status === 'bounced' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                Bounced by Recipient Mail Server
                              </span>
                            )}
                            {selectedAppt.email_notification.status === 'failed' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                Delivery Failed
                              </span>
                            )}
                            {(selectedAppt.email_notification.status === 'queued' || selectedAppt.email_notification.status === 'processing') && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                                Queued for Dispatch
                              </span>
                            )}

                            {(selectedAppt.email_notification.status === 'failed' || selectedAppt.email_notification.status === 'bounced') && (
                              <button
                                onClick={() => handleRetryNotification(selectedAppt.email_notification!.id)}
                                disabled={actionLoading}
                                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-100 hover:bg-red-200 text-red-800 transition-colors flex items-center gap-1"
                              >
                                <RefreshCw className={`w-3 h-3 ${actionLoading ? 'animate-spin' : ''}`} />
                                Retry Email
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                            {selectedAppt.status === 'pending'
                              ? 'Pending Confirmation (No email sent yet)'
                              : 'No notification log found'}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400 text-xs italic">No email address provided by patient</span>
                    )}
                  </div>

                  {/* Resend Sandbox Warning Banner if applicable */}
                  {selectedAppt.email_notification?.error_message?.includes('Resend Test Mode') && (
                    <div className="mt-2 p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block">Resend Sandbox Mode Restriction:</strong>
                        Your clinic is sending from <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">onboarding@resend.dev</code>. In sandbox mode, Resend <strong>ONLY delivers to your registered account owner email</strong>. External recipient <span className="font-semibold">{selectedAppt.email}</span> will not receive emails until your custom domain is verified in Resend.
                      </div>
                    </div>
                  )}

                  {selectedAppt.email_notification?.error_message && !selectedAppt.email_notification.error_message.includes('Resend Test Mode') && (
                    <p className="text-[11px] text-red-600 mt-1 font-mono">
                      Error: {selectedAppt.email_notification.error_message}
                    </p>
                  )}
                </div>

                {/* 2. Patient WhatsApp Consent & Delivery Section */}
                <div className="space-y-1.5 pb-3 border-b border-gray-200/60">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1.5">
                      <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                      Patient WhatsApp Updates
                    </span>
                    <button
                      onClick={() => handleToggleConsent(selectedAppt.id, Boolean(selectedAppt.whatsapp_opt_in))}
                      disabled={actionLoading}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-colors ${
                        selectedAppt.whatsapp_opt_in
                          ? 'bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {selectedAppt.whatsapp_opt_in ? 'Revoke Consent' : 'Grant Patient Consent'}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Consent Badge */}
                    {selectedAppt.whatsapp_opt_in ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Consent Granted
                        {selectedAppt.whatsapp_opt_in_source ? ` (${selectedAppt.whatsapp_opt_in_source})` : ''}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        <span>Not Opted In (Patient Declined / Email Only)</span>
                      </span>
                    )}

                    {/* Delivery Status Badge */}
                    {selectedAppt.whatsapp_notification ? (
                      <>
                        {selectedAppt.whatsapp_notification.status === 'skipped' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs text-gray-500 bg-gray-100 border border-gray-200">
                            Skipped (No Consent)
                          </span>
                        )}
                        {(selectedAppt.whatsapp_notification.status === 'delivered' || selectedAppt.whatsapp_notification.status === 'read') && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Delivered to Patient
                          </span>
                        )}
                        {selectedAppt.whatsapp_notification.status === 'sent' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                            Dispatched via Cloud API
                          </span>
                        )}
                        {selectedAppt.whatsapp_notification.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            WhatsApp Failed
                          </span>
                        )}

                        {selectedAppt.whatsapp_notification.status === 'failed' && selectedAppt.whatsapp_opt_in && (
                          <button
                            onClick={() => handleRetryNotification(selectedAppt.whatsapp_notification!.id)}
                            disabled={actionLoading}
                            className="px-2 py-0.5 rounded text-xs font-medium bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors flex items-center gap-1"
                          >
                            <RefreshCw className={`w-3 h-3 ${actionLoading ? 'animate-spin' : ''}`} />
                            Retry WhatsApp
                          </button>
                        )}
                      </>
                    ) : (
                      !selectedAppt.whatsapp_opt_in && (
                        <span className="text-[11px] text-gray-400 italic">
                          No messages sent (Consent enforced)
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* 3. Clinic Admin WhatsApp Alert Section */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-gray-500">
                      Clinic Reception WhatsApp Alert (+91 7416001477)
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Independent of patient consent
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedAppt.admin_whatsapp_notification ? (
                      <>
                        {(selectedAppt.admin_whatsapp_notification.status === 'delivered' || selectedAppt.admin_whatsapp_notification.status === 'read') && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Alert Delivered to Clinic Reception
                          </span>
                        )}
                        {selectedAppt.admin_whatsapp_notification.status === 'sent' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                            Alert Dispatched to Clinic Reception
                          </span>
                        )}
                        {selectedAppt.admin_whatsapp_notification.status === 'failed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Alert Failed
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-500 text-xs">
                        {selectedAppt.status === 'pending' ? 'Alert dispatched upon patient booking' : 'Admin alert active'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Change Selector */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Update Appointment Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'] as AppointmentStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      if (st === 'confirmed') {
                        setConfirmModalAppt(selectedAppt);
                        setConfirmDate(selectedAppt.appointment_date);
                        setConfirmTime(formatTimeTo24h(selectedAppt.preferred_time) || '10:30');
                      } else if (st === 'rescheduled') {
                        setRescheduleModalAppt(selectedAppt);
                        setRescheduleDate(selectedAppt.appointment_date);
                        setRescheduleTime(formatTimeTo24h(selectedAppt.preferred_time) || '14:20');
                      } else if (st === 'cancelled') {
                        setCancelModalAppt(selectedAppt);
                      } else {
                        handleUpdateStatus(selectedAppt.id, st);
                      }
                    }}
                    disabled={actionLoading || selectedAppt.status === st}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      selectedAppt.status === st
                        ? 'bg-forest text-white border-forest shadow-sm'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Patient WhatsApp Action Button */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              <a
                href={generatePatientWhatsAppUrl(selectedAppt.phone, selectedAppt.booking_reference)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-xl font-medium text-xs hover:bg-[#20ba59] transition-colors"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Message Patient on WhatsApp</span>
              </a>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedAppt(null)}
              >
                Close View
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Appointment Modal with Exact Date & Time Picker */}
      <Modal
        isOpen={!!confirmModalAppt}
        onClose={() => setConfirmModalAppt(null)}
        title="Confirm & Schedule Appointment Slot"
        maxWidth="max-w-lg"
      >
        {confirmModalAppt && (
          <div className="space-y-4">
            <div className="bg-forest/5 border border-forest/15 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gold block">
                    Patient Details
                  </span>
                  <h4 className="font-heading text-base font-bold text-forest">
                    {confirmModalAppt.full_name}
                  </h4>
                  <p className="text-xs text-charcoal/70">
                    Ref: <span className="font-mono font-semibold">{confirmModalAppt.booking_reference}</span> &bull; {confirmModalAppt.consultation_type}
                  </p>
                </div>
                <Badge status={confirmModalAppt.status} />
              </div>

              <div className="text-xs pt-1 border-t border-forest/10 flex flex-wrap gap-x-4 gap-y-1 text-charcoal/80">
                <span>
                  <strong>Patient Requested Date:</strong> {formatDate(confirmModalAppt.appointment_date)}
                </span>
                <span>
                  <strong>Original Preference:</strong> {confirmModalAppt.preferred_time || 'Flexible'}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Confirmed Appointment Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={confirmDate}
                  onChange={(e) => setConfirmDate(e.target.value)}
                  min={getTodayISO()}
                  className="rounded-xl"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Confirmed Exact Time (IST) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs font-mono font-bold text-forest bg-sage/20 px-2 py-0.5 rounded-md">
                    Selected: {formatTimeTo12h(confirmTime) || '10:30 AM'}
                  </span>
                </div>
                <Input
                  type="time"
                  value={confirmTime}
                  onChange={(e) => setConfirmTime(e.target.value)}
                  className="rounded-xl"
                  required
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Presets:</span>
                  {[
                    { label: '9:15 AM', val: '09:15' },
                    { label: '10:30 AM', val: '10:30' },
                    { label: '11:45 AM', val: '11:45' },
                    { label: '2:20 PM', val: '14:20' },
                    { label: '4:30 PM', val: '16:30' },
                    { label: '5:45 PM', val: '17:45' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setConfirmTime(preset.val)}
                      className={`text-[11px] px-2 py-0.5 rounded-lg border transition-colors ${
                        confirmTime === preset.val
                          ? 'bg-forest text-white border-forest font-semibold'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notification Dispatch Preview */}
            <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block">
                Automated Actions on Confirmation:
              </span>
              <div className="flex items-center gap-2 text-charcoal/80">
                <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  Email confirmation will be sent to <strong>{confirmModalAppt.email || 'patient email'}</strong>.
                </span>
              </div>
              <div className="flex items-center gap-2 text-charcoal/80">
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366] shrink-0" />
                <span>
                  {confirmModalAppt.whatsapp_opt_in ? (
                    <span className="text-emerald-800">
                      WhatsApp confirmation will be sent to <strong>+91 {confirmModalAppt.phone}</strong> (Opted In).
                    </span>
                  ) : (
                    <span className="text-gray-500">
                      WhatsApp confirmation skipped (Patient did not opt in).
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-charcoal/80">
                <Clock className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>
                  Automated 24-hour and 2-hour reminders will be scheduled for <strong>{formatTimeTo12h(confirmTime)}</strong>.
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button variant="secondary" size="sm" onClick={() => setConfirmModalAppt(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!confirmDate || !confirmTime || actionLoading}
                onClick={() =>
                  handleUpdateStatus(confirmModalAppt.id, 'confirmed', {
                    confirmed_date: confirmDate,
                    confirmed_time: confirmTime,
                  })
                }
              >
                {actionLoading ? 'Confirming...' : 'Confirm Slot & Notify Patient'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reschedule Modal with Exact Date & Time Picker */}
      <Modal
        isOpen={!!rescheduleModalAppt}
        onClose={() => setRescheduleModalAppt(null)}
        title="Reschedule Appointment Slot"
        maxWidth="max-w-md"
      >
        {rescheduleModalAppt && (
          <div className="space-y-4">
            <p className="text-xs text-gray-600">
              Rescheduling <strong>{rescheduleModalAppt.full_name}</strong> ({rescheduleModalAppt.booking_reference}). This will update the scheduled slot, reset reminder notifications, and trigger email and WhatsApp notifications to the patient.
            </p>

            <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs text-charcoal/70">
              <strong>Current Schedule:</strong> {formatDate(rescheduleModalAppt.appointment_date)} &bull; {rescheduleModalAppt.preferred_time || 'Unspecified'}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                New Appointment Date <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={getTodayISO()}
                className="rounded-xl"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  New Exact Time (IST) <span className="text-red-500">*</span>
                </label>
                <span className="text-xs font-mono font-bold text-forest bg-sage/20 px-2 py-0.5 rounded-md">
                  Selected: {formatTimeTo12h(rescheduleTime) || '2:20 PM'}
                </span>
              </div>
              <Input
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="rounded-xl"
                required
              />
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Presets:</span>
                {[
                  { label: '9:15 AM', val: '09:15' },
                  { label: '10:30 AM', val: '10:30' },
                  { label: '11:45 AM', val: '11:45' },
                  { label: '2:20 PM', val: '14:20' },
                  { label: '4:30 PM', val: '16:30' },
                  { label: '5:45 PM', val: '17:45' },
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setRescheduleTime(preset.val)}
                    className={`text-[11px] px-2 py-0.5 rounded-lg border transition-colors ${
                      rescheduleTime === preset.val
                        ? 'bg-forest text-white border-forest font-semibold'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Reason / Note to Patient (Optional)
              </label>
              <textarea
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="e.g., Doctor clinic schedule adjustment..."
                rows={3}
                className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button variant="secondary" size="sm" onClick={() => setRescheduleModalAppt(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!rescheduleDate || !rescheduleTime || actionLoading}
                onClick={() =>
                  handleUpdateStatus(rescheduleModalAppt.id, 'rescheduled', {
                    rescheduled_date: rescheduleDate,
                    rescheduled_time: rescheduleTime,
                    reason: rescheduleReason,
                  })
                }
              >
                {actionLoading ? 'Updating...' : 'Confirm Reschedule & Notify'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Modal with Reason */}
      <Modal
        isOpen={!!cancelModalAppt}
        onClose={() => setCancelModalAppt(null)}
        title="Cancel Appointment"
        maxWidth="max-w-md"
      >
        {cancelModalAppt && (
          <div className="space-y-4">
            <p className="text-xs text-gray-600">
              Are you sure you want to cancel the appointment for <strong>{cancelModalAppt.full_name}</strong>? An automated cancellation notification will be dispatched if patient email is present.
            </p>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Cancellation Reason (Optional)</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g., Patient requested cancellation / Clinic unavailable..."
                rows={3}
                className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button variant="secondary" size="sm" onClick={() => setCancelModalAppt(null)}>
                Keep Appointment
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={actionLoading}
                onClick={() =>
                  handleUpdateStatus(cancelModalAppt.id, 'cancelled', {
                    reason: cancelReason,
                  })
                }
              >
                {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteAppt}
        onClose={() => setDeleteAppt(null)}
        title="Confirm Record Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to permanently delete the appointment record for{' '}
            <strong className="text-gray-900">{deleteAppt?.full_name}</strong> (Ref:{' '}
            {deleteAppt?.booking_reference})? This action cannot be reversed.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteAppt(null)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
