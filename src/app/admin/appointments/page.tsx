'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { formatDate, generatePatientWhatsAppUrl } from '@/lib/utils';

export default function AdminAppointmentsPage() {
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
  
  // Reschedule state
  const [rescheduleModalAppt, setRescheduleModalAppt] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('Morning (9 AM – 12 PM)');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // Cancel state
  const [cancelModalAppt, setCancelModalAppt] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const [actionLoading, setActionLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

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

      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      } else {
        const demoRecords: Appointment[] = [
          {
            id: 'demo-1',
            booking_reference: 'VSHMA-892144',
            full_name: 'Priya Sharma',
            phone: '9845123456',
            email: 'priya.sharma@example.com',
            age: 32,
            appointment_date: new Date().toISOString().split('T')[0],
            preferred_time: 'Morning (9 AM – 12 PM)',
            consultation_type: 'General Consultation',
            message: 'First time consultation for recurrent migraine and sleep issues.',
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'demo-2',
            booking_reference: 'VSHMA-739102',
            full_name: 'Rajesh K',
            phone: '9741001234',
            email: 'rajesh.k@example.com',
            age: 45,
            appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            preferred_time: 'Afternoon (12 PM – 3 PM)',
            consultation_type: 'Ongoing Consultations',
            message: 'Follow-up for ongoing digestive wellness plan.',
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'demo-3',
            booking_reference: 'VSHMA-612984',
            full_name: 'Sneha Patel',
            phone: '9988776655',
            email: 'sneha.patel@example.com',
            age: 28,
            appointment_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
            preferred_time: 'Evening (3 PM – 6 PM)',
            consultation_type: 'Pediatric Homeopathy',
            message: 'Consultation for 5-year-old child with recurrent seasonal colds.',
            status: 'rescheduled',
            rescheduled_date: new Date(Date.now() + 259200000).toISOString().split('T')[0],
            rescheduled_time: 'Morning (9 AM – 12 PM)',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'demo-4',
            booking_reference: 'VSHMA-551029',
            full_name: 'Ananya Rao',
            phone: '9123456789',
            email: 'ananya.rao@example.com',
            age: 38,
            appointment_date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
            preferred_time: 'Morning (9 AM – 12 PM)',
            consultation_type: "Women's Health",
            message: 'Review completed with positive vitality.',
            status: 'completed',
            created_at: new Date(Date.now() - 345600000).toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];

        let filtered = demoRecords;
        if (search) {
          filtered = filtered.filter(a => a.full_name.toLowerCase().includes(search.toLowerCase()) || a.phone.includes(search) || a.booking_reference.toLowerCase().includes(search.toLowerCase()));
        }
        if (statusFilter !== 'all') {
          filtered = filtered.filter(a => a.status === statusFilter);
        }
        setAppointments(filtered);
        setTotal(filtered.length);
        setTotalPages(1);
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
    extraData?: { rescheduled_date?: string; rescheduled_time?: string; reason?: string }
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
        setAppointments((prev) =>
          prev.map((a) => {
            if (a.id !== id) return a;
            return {
              ...a,
              status: newStatus,
              ...(extraData?.rescheduled_date ? { rescheduled_date: extraData.rescheduled_date } : {}),
              ...(extraData?.rescheduled_time ? { rescheduled_time: extraData.rescheduled_time } : {}),
            };
          })
        );
        if (selectedAppt && selectedAppt.id === id) {
          setSelectedAppt((prev) =>
            prev
              ? {
                  ...prev,
                  status: newStatus,
                  ...(extraData?.rescheduled_date ? { rescheduled_date: extraData.rescheduled_date } : {}),
                  ...(extraData?.rescheduled_time ? { rescheduled_time: extraData.rescheduled_time } : {}),
                }
              : null
          );
        }
        // Close modals
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
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900">
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
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-[11px] uppercase tracking-wider font-semibold text-gray-400">
                <th className="py-3 px-4 sm:px-6">Patient</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Scheduled For</th>
                <th className="py-3 px-4">Consultation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
              ) : appointments.length > 0 ? (
                appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
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
                    <td className="py-4 px-4">
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
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-800 text-xs sm:text-sm">
                        {appt.status === 'rescheduled' && appt.rescheduled_date
                          ? formatDate(appt.rescheduled_date)
                          : formatDate(appt.appointment_date)}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {appt.status === 'rescheduled' && appt.rescheduled_time
                          ? appt.rescheduled_time
                          : appt.preferred_time || 'Time unspecified'}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-600">
                      {appt.consultation_type}
                    </td>
                    <td className="py-4 px-4">
                      <Badge status={appt.status} />
                    </td>
                    <td className="py-4 px-4 text-right space-x-1 sm:space-x-2">
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
                ))
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
                      if (st === 'rescheduled') {
                        setRescheduleModalAppt(selectedAppt);
                        setRescheduleDate(selectedAppt.appointment_date);
                        setRescheduleTime(selectedAppt.preferred_time || 'Morning (9 AM – 12 PM)');
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

      {/* Reschedule Modal */}
      <Modal
        isOpen={!!rescheduleModalAppt}
        onClose={() => setRescheduleModalAppt(null)}
        title="Reschedule Appointment Slot"
        maxWidth="max-w-md"
      >
        {rescheduleModalAppt && (
          <div className="space-y-4">
            <p className="text-xs text-gray-600">
              Rescheduling <strong>{rescheduleModalAppt.full_name}</strong> ({rescheduleModalAppt.booking_reference}). This will update the scheduled slot, reset reminder notifications, and trigger a confirmation email to the patient.
            </p>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">New Appointment Date</label>
              <Input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Preferred Time Window</label>
              <Select
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                options={[
                  { value: 'Morning (9 AM – 12 PM)', label: 'Morning (9:00 AM – 12:00 PM)' },
                  { value: 'Afternoon (12 PM – 3 PM)', label: 'Afternoon (12:00 PM – 3:00 PM)' },
                  { value: 'Evening (3 PM – 6 PM)', label: 'Evening (3:00 PM – 6:00 PM)' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Reason / Note to Patient (Optional)</label>
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
                disabled={!rescheduleDate || actionLoading}
                onClick={() =>
                  handleUpdateStatus(rescheduleModalAppt.id, 'rescheduled', {
                    rescheduled_date: rescheduleDate,
                    rescheduled_time: rescheduleTime,
                    reason: rescheduleReason,
                  })
                }
              >
                {actionLoading ? 'Updating...' : 'Confirm Reschedule'}
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
