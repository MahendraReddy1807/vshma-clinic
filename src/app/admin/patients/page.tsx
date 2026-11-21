'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Phone,
  Mail,
  AlertTriangle,
  XCircle,
  Tag,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import type { Patient } from '@/types';

export default function PatientsDirectoryPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'whatsapp' | 'multivisit' | 'family'>('all');

  // Create Patient Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newWhatsAppOptIn, setNewWhatsAppOptIn] = useState(false);
  const [newNotes, setNewNotes] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (activeFilter === 'whatsapp') params.set('opt_in', 'true');
      if (activeFilter === 'family') params.set('ambiguous', 'true');

      const res = await fetch(`/api/admin/crm/patients?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token || ''}`,
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('vshma_admin_session');
        localStorage.removeItem('vshma_admin_email');
        router.push('/admin/login');
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setErrorMessage(errData.error || 'Failed to fetch patient records from database.');
        setPatients([]);
        setTotalCount(0);
        return;
      }

      const data = await res.json();
      let list: Patient[] = data.patients || [];

      if (activeFilter === 'multivisit') {
        list = list.filter((p) => p.total_appointments > 1);
      }

      setPatients(list);
      setTotalCount(data.total || list.length);
    } catch (err) {
      console.error('[CRM Patient Directory Error]', err);
      setErrorMessage('Could not connect to patient directory. Please check database connectivity.');
      setPatients([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeFilter, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchPatients]);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateLoading(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;

    try {
      const res = await fetch('/api/admin/crm/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          full_name: newName,
          phone: newPhone,
          email: newEmail,
          age: newAge ? parseInt(newAge, 10) : null,
          city: newCity,
          whatsapp_opt_in: newWhatsAppOptIn,
          internal_notes: newNotes,
        }),
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('vshma_admin_session');
        localStorage.removeItem('vshma_admin_email');
        router.push('/admin/login');
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create patient');
      }

      setIsCreateModalOpen(false);
      setNewName('');
      setNewPhone('');
      setNewEmail('');
      setNewAge('');
      setNewNotes('');
      setNewWhatsAppOptIn(false);
      fetchPatients();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setCreateError(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  // Metrics calculation
  const whatsappOptInCount = patients.filter((p) => p.whatsapp_opt_in).length;
  const multiVisitCount = patients.filter((p) => p.total_appointments > 1).length;
  const familySharedCount = patients.filter((p) => p.is_flagged_ambiguous).length;
  const optInPercentage = totalCount > 0 ? Math.round((whatsappOptInCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-light text-forest tracking-tight">Patient CRM Directory</h1>
          <p className="text-xs sm:text-sm text-charcoal/70 mt-1">
            Search, manage, and inspect patient dossiers, family-shared phone numbers, and appointment histories.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchPatients()}
            disabled={loading}
            className="p-2.5 rounded-xl border border-sage/30 bg-white text-charcoal hover:bg-ivory hover:text-forest transition-colors disabled:opacity-50"
            title="Refresh Patient Directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest text-white text-xs sm:text-sm font-semibold hover:bg-forest-light transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Database Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Patient Directory Database Notice</p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                {errorMessage.includes('relation') || errorMessage.includes('does not exist')
                  ? 'The patients table is not yet initialized in Supabase. Apply migration 20261120100000 in Supabase to activate the directory.'
                  : errorMessage}
              </p>
            </div>
          </div>
          <button
            onClick={() => fetchPatients()}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 font-semibold text-amber-900 hover:bg-amber-100 transition-colors shrink-0 shadow-2xs"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sage/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-charcoal/60">
            <span>Total Patients</span>
            <Users className="w-4 h-4 text-forest" />
          </div>
          <p className="text-2xl sm:text-3xl font-heading font-bold text-forest">{totalCount}</p>
          <p className="text-[11px] text-sage-dark">Registered clinic records</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sage/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-charcoal/60">
            <span>WhatsApp Opt-In</span>
            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
          </div>
          <p className="text-2xl sm:text-3xl font-heading font-bold text-emerald-800">{whatsappOptInCount}</p>
          <p className="text-[11px] text-emerald-700 font-medium">{optInPercentage}% consent rate</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sage/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-charcoal/60">
            <span>Multi-Visit Retention</span>
            <UserCheck className="w-4 h-4 text-gold-dark" />
          </div>
          <p className="text-2xl sm:text-3xl font-heading font-bold text-charcoal">{multiVisitCount}</p>
          <p className="text-[11px] text-charcoal/60">Patients with 2+ visits</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sage/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-charcoal/60">
            <span>Family Phone Grouped</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-heading font-bold text-amber-800">{familySharedCount}</p>
          <p className="text-[11px] text-amber-700 font-medium">Shared family accounts</p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl p-4 border border-sage/20 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
            <input
              type="text"
              placeholder="Search by patient name, mobile number, email, or VSHMA-P code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-sage/30 bg-ivory/50 text-xs sm:text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-forest/30"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === 'all'
                  ? 'bg-forest text-white'
                  : 'bg-ivory text-charcoal/70 hover:bg-sage/20'
              }`}
            >
              All Records ({totalCount})
            </button>

            <button
              onClick={() => setActiveFilter('whatsapp')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                activeFilter === 'whatsapp'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-ivory text-charcoal/70 hover:bg-sage/20'
              }`}
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
              <span>WhatsApp Opted-In</span>
            </button>

            <button
              onClick={() => setActiveFilter('multivisit')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                activeFilter === 'multivisit'
                  ? 'bg-gold-dark text-white'
                  : 'bg-ivory text-charcoal/70 hover:bg-sage/20'
              }`}
            >
              Repeat Visits (2+)
            </button>

            <button
              onClick={() => setActiveFilter('family')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                activeFilter === 'family'
                  ? 'bg-amber-700 text-white'
                  : 'bg-ivory text-charcoal/70 hover:bg-sage/20'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Family Shared Phone</span>
            </button>
          </div>
        </div>
      </div>

      {/* Patient Directory Table / Cards */}
      <div className="bg-white rounded-3xl border border-sage/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-charcoal/60">Loading patient dossiers...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-sage mx-auto" />
            <h3 className="text-base font-heading font-semibold text-forest">No patients found</h3>
            <p className="text-xs text-charcoal/60 max-w-sm mx-auto">
              {searchQuery
                ? 'Try adjusting your search terms or filter criteria.'
                : 'No patient records found. Patients will appear automatically as appointments are booked.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-sage/15">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="p-4 sm:p-5 hover:bg-ivory/50 transition-colors flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                {/* Left: Patient Identifier & Badges */}
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-gold-dark bg-gold/15 px-2 py-0.5 rounded-md">
                      {patient.patient_id}
                    </span>
                    <h3 className="font-heading font-bold text-forest text-base sm:text-lg truncate">
                      {patient.full_name}
                    </h3>
                    {patient.is_flagged_ambiguous && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300"
                        title={patient.ambiguity_reason || 'Family shared phone number'}
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                        <span>Family Phone Shared</span>
                      </span>
                    )}
                  </div>

                  {/* Contact row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal/70">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <Phone className="w-3.5 h-3.5 text-sage-dark" />
                      <span>{patient.phone}</span>
                    </span>

                    {patient.email && (
                      <span className="inline-flex items-center gap-1.5 font-medium truncate max-w-[200px]">
                        <Mail className="w-3.5 h-3.5 text-sage-dark" />
                        <span>{patient.email}</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1.5">
                      <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                      <span className={patient.whatsapp_opt_in ? 'text-emerald-800 font-semibold' : 'text-charcoal/50'}>
                        {patient.whatsapp_opt_in ? 'Opted-In' : 'No WhatsApp Opt-in'}
                      </span>
                    </span>
                  </div>

                  {/* Tags */}
                  {patient.tags && patient.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {patient.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-sage/15 text-forest font-medium"
                        >
                          <Tag className="w-2.5 h-2.5 text-forest/70" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Visits, Last active, Action button */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-sage/15">
                  <div className="text-left md:text-right text-xs">
                    <div className="flex items-center md:justify-end gap-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-forest/10 text-forest font-bold text-[11px]">
                        {patient.total_appointments} {patient.total_appointments === 1 ? 'Visit' : 'Visits'}
                      </span>
                    </div>
                    <p className="text-[11px] text-charcoal/50 mt-1">
                      Last: {new Date(patient.last_interaction_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <Link
                    href={`/admin/patients/${patient.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ivory hover:bg-forest hover:text-white text-forest text-xs font-semibold border border-sage/30 transition-all shadow-xs"
                  >
                    <span>View Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Patient Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-sage/30 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-sage/15 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-forest/10 text-forest flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-forest text-lg">Register New Patient</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-charcoal/40 hover:text-charcoal p-1"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreatePatient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Patient Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-sage/30 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">
                    Mobile Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-sage/30 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                  <p className="text-[10px] text-charcoal/50 mt-0.5">Family shared phones supported.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. ananya@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-sage/30 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    placeholder="e.g. 34"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-sage/30 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">City / Location</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-sage/30 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-ivory border border-sage/20">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newWhatsAppOptIn}
                    onChange={(e) => setNewWhatsAppOptIn(e.target.checked)}
                    className="mt-0.5 rounded text-forest focus:ring-forest"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-charcoal">Patient WhatsApp Opt-In</span>
                    <p className="text-[11px] text-charcoal/60 mt-0.5">
                      Explicit consent received to send automated booking confirmations and clinic reminders via WhatsApp.
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Administrative Intake Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Referred by existing patient, prefers morning consultations..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-sage/30 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-sage/15">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-sage/30 text-xs font-semibold text-charcoal hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
                >
                  {createLoading ? 'Registering...' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
