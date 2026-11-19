'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  Phone,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
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
            appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            preferred_time: 'Afternoon (12 PM – 3 PM)',
            consultation_type: 'Ongoing Consultations',
            message: 'Follow-up for ongoing digestive wellness plan.',
            status: 'confirmed',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'demo-3',
            booking_reference: 'VSHMA-612984',
            full_name: 'Sneha Patel',
            phone: '9988776655',
            appointment_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
            preferred_time: 'Evening (3 PM – 6 PM)',
            consultation_type: 'Pediatric Homeopathy',
            message: 'Consultation for 5-year-old child with recurrent seasonal colds.',
            status: 'confirmed',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'demo-4',
            booking_reference: 'VSHMA-551029',
            full_name: 'Ananya Rao',
            phone: '9123456789',
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
          filtered = filtered.filter(a => a.full_name.toLowerCase().includes(search.toLowerCase()) || a.phone.includes(search));
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
  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    setActionLoading(true);
    const token = localStorage.getItem('vshma_admin_session');
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
        if (selectedAppt && selectedAppt.id === id) {
          setSelectedAppt((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
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
      'Appointment Date',
      'Preferred Time',
      'Consultation Type',
      'Status',
      'Booking Request Time',
      'Patient Message',
    ];

    const rows = appointments.map((a) => [
      `"${a.booking_reference}"`,
      `"${a.full_name}"`,
      `"${a.phone}"`,
      `"${a.appointment_date}"`,
      `"${a.preferred_time || 'N/A'}"`,
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
            Total {total} consultation requests on record
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={exportToCSV} disabled={appointments.length === 0}>
            <Download className="w-4 h-4 mr-2" />
            <span>Export CSV</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => fetchAppointments()}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Control / Filter Bar */}
      {fetchError && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{fetchError}</p>}
      <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search name, phone, ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>

          <div>
            <Select
              options={[
                { label: 'All Statuses', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Confirmed', value: 'confirmed' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-sm"
            />
          </div>

          <div>
            <Select
              options={[
                { label: 'Sort: Newest First', value: 'newest' },
                { label: 'Sort: Oldest First', value: 'oldest' },
              ]}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Appointment Data Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-4">Ref ID</th>
                <th className="py-4 px-4">Patient</th>
                <th className="py-4 px-4">Appt Date &amp; Slot</th>
                <th className="py-4 px-4">Consultation Type</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
              ) : appointments.length > 0 ? (
                appointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-xs text-forest">
                      {appt.booking_reference}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-gray-900">{appt.full_name}</p>
                      <a
                        href={`tel:${appt.phone}`}
                        className="text-xs text-gray-500 hover:text-forest flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{appt.phone}</span>
                      </a>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-800 text-xs sm:text-sm">
                        {formatDate(appt.appointment_date)}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {appt.preferred_time || 'Time unspecified'}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-600">
                      {appt.consultation_type}
                    </td>
                    <td className="py-4 px-4">
                      <Badge status={appt.status} />
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedAppt(appt)}
                        className="p-1.5 text-gray-500 hover:text-forest hover:bg-mint rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteAppt(appt)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                <span className="text-xs text-gray-400 font-medium">Contact Phone</span>
                <p className="font-semibold text-gray-900">{selectedAppt.phone}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-medium">Scheduled Date</span>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['pending', 'confirmed', 'completed', 'cancelled'] as AppointmentStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedAppt.id, st)}
                    disabled={actionLoading || selectedAppt.status === st}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize border transition-all ${
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
                className="flex-1"
              >
                <Button className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white border-none flex items-center justify-center gap-2">
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>Message Patient on WhatsApp</span>
                </Button>
              </a>
              <Button variant="secondary" onClick={() => setSelectedAppt(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteAppt}
        onClose={() => setDeleteAppt(null)}
        title="Confirm Appointment Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 text-red-700">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              Are you sure you want to delete the record for <strong>{deleteAppt?.full_name}</strong> (Ref: {deleteAppt?.booking_reference})? This action cannot be reversed.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setDeleteAppt(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" loading={actionLoading} onClick={handleDelete}>
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
