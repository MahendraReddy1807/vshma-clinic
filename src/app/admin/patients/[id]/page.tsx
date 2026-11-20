'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  Calendar,
  AlertTriangle,
  Clock,
  Send,
  Lock,
  Tag,
  XCircle,
  FileText,
  Activity,
  CalendarDays,
  ExternalLink,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import type { PatientWithDetails, AppointmentStatus } from '@/types';

function getStatusBadge(status: AppointmentStatus) {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'pending':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'rescheduled':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'completed':
      return 'bg-forest/10 text-forest border-forest/20';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export default function PatientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [patient, setPatient] = useState<PatientWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'appointments' | 'notes' | 'timeline'>('appointments');

  // New Note Form State
  const [noteContent, setNoteContent] = useState('');
  const [isConfidential, setIsConfidential] = useState(false);
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteNotice, setNoteNotice] = useState('');

  // Toggle Opt-in State
  const [optInToggling, setOptInToggling] = useState(false);

  const refetch = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
    try {
      const res = await fetch(`/api/admin/crm/patients/${id}`, {
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('vshma_admin_session');
        localStorage.removeItem('vshma_admin_email');
        router.push('/admin/login');
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setPatient(data.patient);
      }
    } catch {
      // silently ignore refetch errors
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
      try {
        const res = await fetch(`/api/admin/crm/patients/${id}`, {
          headers: { Authorization: `Bearer ${token || ''}` },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('vshma_admin_session');
          localStorage.removeItem('vshma_admin_email');
          router.push('/admin/login');
          return;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to load patient dossier.');
        }

        const data = await res.json();
        if (isMounted) setPatient(data.patient);
      } catch (err: unknown) {
        if (isMounted) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [id, router]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || noteSubmitting) return;

    setNoteSubmitting(true);
    setNoteNotice('');

    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;

    try {
      const res = await fetch(`/api/admin/crm/patients/${id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          content: noteContent.trim(),
          is_confidential: isConfidential,
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
        throw new Error(data.error || 'Failed to record note');
      }

      setNoteContent('');
      setIsConfidential(false);
      if (data.notice) {
        setNoteNotice(data.notice);
      }
      refetch();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setNoteNotice(`Error: ${msg}`);
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleToggleWhatsAppConsent = async () => {
    if (!patient || optInToggling) return;
    setOptInToggling(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
    const newStatus = !patient.whatsapp_opt_in;

    try {
      const res = await fetch(`/api/admin/crm/patients/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          whatsapp_opt_in: newStatus,
        }),
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('vshma_admin_session');
        localStorage.removeItem('vshma_admin_email');
        router.push('/admin/login');
        return;
      }

      if (res.ok) {
        setPatient((prev) => (prev ? { ...prev, whatsapp_opt_in: newStatus } : prev));
      }
    } catch (err) {
      console.error('[WhatsApp Opt-in Toggle Error]', err);
    } finally {
      setOptInToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-forest">Loading Patient Dossier...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto border border-sage/30 shadow-sm space-y-4">
        <XCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-heading font-bold text-forest">Patient Record Not Found</h2>
        <p className="text-xs text-charcoal/70">{error || 'Unable to locate patient record.'}</p>
        <Link
          href="/admin/patients"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-light"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Directory</span>
        </Link>
      </div>
    );
  }

  const cleanPhone = patient.phone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}`;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/patients"
            className="p-2 rounded-xl bg-white border border-sage/30 text-charcoal/70 hover:text-forest hover:bg-ivory transition-colors"
            title="Return to Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-gold-dark bg-gold/15 px-2 py-0.5 rounded-md">
                {patient.patient_id}
              </span>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-forest">
                {patient.full_name}
              </h1>
              {patient.is_flagged_ambiguous && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Family Shared Phone</span>
                </span>
              )}
            </div>
            <p className="text-xs text-charcoal/60 mt-0.5">
              First visit: {new Date(patient.first_interaction_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })} &bull; Total visits: {patient.total_appointments}
            </p>
          </div>
        </div>

        {/* Quick Contact & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] text-xs font-semibold border border-[#25D366]/30 transition-all"
          >
            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            <span>Open WhatsApp</span>
          </a>

          <a
            href={`tel:${patient.phone}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest/10 hover:bg-forest/20 text-forest text-xs font-semibold border border-forest/20 transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Patient</span>
          </a>

          <Link
            href={`/admin/appointments?search=${encodeURIComponent(patient.full_name)}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-light transition-all shadow-xs"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Manage Slots</span>
          </Link>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Dossier Summary & Contact Card */}
        <div className="space-y-6">
          {/* Contact Details Card */}
          <div className="bg-white rounded-3xl p-6 border border-sage/20 shadow-sm space-y-4">
            <h3 className="font-heading font-bold text-forest text-base border-b border-sage/15 pb-2">
              Contact & Profile
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-charcoal/50 block text-[11px] font-medium">Primary Mobile</span>
                <span className="font-semibold text-charcoal text-sm">{patient.phone}</span>
                <span className="text-[10px] text-sage-dark block font-mono">Norm: {patient.phone_normalized}</span>
              </div>

              <div>
                <span className="text-charcoal/50 block text-[11px] font-medium">Email Address</span>
                <span className="font-semibold text-charcoal">
                  {patient.email || <span className="text-charcoal/40 italic">Not provided</span>}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-charcoal/50 block text-[11px] font-medium">Age</span>
                  <span className="font-semibold text-charcoal">{patient.age ? `${patient.age} yrs` : '—'}</span>
                </div>
                <div>
                  <span className="text-charcoal/50 block text-[11px] font-medium">City</span>
                  <span className="font-semibold text-charcoal">{patient.city || 'Bengaluru'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Channel & Consent Card */}
          <div className="bg-white rounded-3xl p-6 border border-sage/20 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-sage/15 pb-2">
              <h3 className="font-heading font-bold text-forest text-base">Communication Channels</h3>
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-ivory border border-sage/20">
                <div>
                  <span className="font-semibold text-charcoal block">WhatsApp Channel</span>
                  <span className="text-[11px] text-charcoal/60">
                    {patient.whatsapp_opt_in ? 'Consented to updates' : 'No active consent'}
                  </span>
                </div>
                <button
                  onClick={handleToggleWhatsAppConsent}
                  disabled={optInToggling}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-xl transition-colors ${
                    patient.whatsapp_opt_in
                      ? 'bg-emerald-800 text-white hover:bg-emerald-900'
                      : 'bg-gray-200 text-charcoal hover:bg-gray-300'
                  }`}
                >
                  {optInToggling ? 'Saving...' : patient.whatsapp_opt_in ? 'Opted In' : 'Enable Opt-In'}
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-ivory border border-sage/20">
                <span className="font-semibold text-charcoal block">Resend Email Channel</span>
                <span className="text-[11px] text-charcoal/60">
                  {patient.email ? `Transactional alerts active for ${patient.email}` : 'No email registered'}
                </span>
              </div>
            </div>
          </div>

          {/* Family Shared Phone Notice (if flagged) */}
          {patient.is_flagged_ambiguous && (
            <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Family Shared Phone Resolution</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                {patient.ambiguity_reason ||
                  'Multiple patients in the system are registered with this phone number. Records are kept distinct to prevent overwriting family health appointments.'}
              </p>
            </div>
          )}

          {/* Tags Card */}
          <div className="bg-white rounded-3xl p-6 border border-sage/20 shadow-sm space-y-3">
            <h3 className="font-heading font-bold text-forest text-base border-b border-sage/15 pb-2">
              Patient Tags
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {patient.tags && patient.tags.length > 0 ? (
                patient.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-forest/10 text-forest font-semibold"
                  >
                    <Tag className="w-3 h-3" />
                    <span>{tag}</span>
                  </span>
                ))
              ) : (
                <p className="text-xs text-charcoal/40 italic">No tags assigned yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Tabs for Appointments, Notes, and Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-sage/20 shadow-xs">
            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'appointments'
                  ? 'bg-forest text-white shadow-xs'
                  : 'text-charcoal/70 hover:bg-ivory'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Appointments ({patient.appointments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'notes'
                  ? 'bg-forest text-white shadow-xs'
                  : 'text-charcoal/70 hover:bg-ivory'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Administrative Notes ({patient.notes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'timeline'
                  ? 'bg-forest text-white shadow-xs'
                  : 'text-charcoal/70 hover:bg-ivory'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Activity Timeline ({patient.activity.length})</span>
            </button>
          </div>

          {/* TAB 1: APPOINTMENTS HISTORY */}
          {activeTab === 'appointments' && (
            <div className="bg-white rounded-3xl p-6 border border-sage/20 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-sage/15 pb-3">
                <h3 className="font-heading font-bold text-forest text-base sm:text-lg">
                  Clinical Consultations & Bookings
                </h3>
                <Link
                  href={`/admin/appointments?search=${encodeURIComponent(patient.full_name)}`}
                  className="text-xs font-semibold text-forest hover:text-gold flex items-center gap-1"
                >
                  <span>Open Appointments Hub</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {patient.appointments.length === 0 ? (
                <p className="text-xs text-charcoal/60 py-6 text-center">No appointments on record.</p>
              ) : (
                <div className="divide-y divide-sage/15">
                  {patient.appointments.map((appt) => (
                    <div key={appt.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-forest bg-forest/10 px-2.5 py-0.5 rounded-md">
                            {appt.booking_reference}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusBadge(appt.status)}`}>
                            {appt.status}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-charcoal">
                          {appt.consultation_type}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal/70">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-forest" />
                          <span>
                            {new Date(appt.appointment_date).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-forest" />
                          <span>{appt.preferred_time || 'Slot TBD'}</span>
                        </span>
                      </div>

                      {appt.message && (
                        <div className="p-2.5 rounded-xl bg-ivory text-xs text-charcoal/80 border border-sage/15 italic">
                          &ldquo;{appt.message}&rdquo;
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ADMINISTRATIVE NOTES */}
          {activeTab === 'notes' && (
            <div className="bg-white rounded-3xl p-6 border border-sage/20 shadow-sm space-y-6">
              <div className="border-b border-sage/15 pb-3">
                <h3 className="font-heading font-bold text-forest text-base sm:text-lg">
                  Staff Administrative Notes
                </h3>
                <p className="text-xs text-charcoal/60 mt-0.5">
                  Internal notes accessible by clinic administrators only. Never shared with patients.
                </p>
              </div>

              {/* Note Composer */}
              <form onSubmit={handleAddNote} className="space-y-3 p-4 rounded-2xl bg-ivory border border-sage/20">
                <textarea
                  required
                  rows={3}
                  placeholder="Record an administrative note (e.g. Patient prefers evening call-backs, fee discussed, follow-up scheduled)..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sage/30 text-xs sm:text-sm text-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-forest/30"
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-charcoal/70">
                    <input
                      type="checkbox"
                      checked={isConfidential}
                      onChange={(e) => setIsConfidential(e.target.checked)}
                      className="rounded text-forest focus:ring-forest"
                    />
                    <span className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-gold-dark" />
                      <span>Confidential (Staff restricted)</span>
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={!noteContent.trim() || noteSubmitting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-gold" />
                    <span>{noteSubmitting ? 'Saving...' : 'Add Note'}</span>
                  </button>
                </div>

                {noteNotice && (
                  <p className="text-[11px] text-forest font-medium pt-1">{noteNotice}</p>
                )}
              </form>

              {/* Notes List */}
              <div className="space-y-3">
                {patient.notes.length === 0 ? (
                  <p className="text-xs text-charcoal/60 py-4 text-center">No administrative notes recorded yet.</p>
                ) : (
                  patient.notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 rounded-2xl bg-white border border-sage/20 shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-forest">
                          <span>{note.author_email}</span>
                          {note.is_confidential && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Confidential</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-charcoal/50">
                          {new Date(note.created_at).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-charcoal whitespace-pre-line leading-relaxed">
                        {note.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="bg-white rounded-3xl p-6 border border-sage/20 shadow-sm space-y-4">
              <div className="border-b border-sage/15 pb-3">
                <h3 className="font-heading font-bold text-forest text-base sm:text-lg">
                  Patient Interaction Timeline
                </h3>
                <p className="text-xs text-charcoal/60 mt-0.5">
                  Chronological trail of appointment bookings, confirmations, notes, and profile actions.
                </p>
              </div>

              {patient.activity.length === 0 ? (
                <p className="text-xs text-charcoal/60 py-6 text-center">No recorded activity timeline events.</p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-sage/30">
                  {patient.activity.map((act) => (
                    <div key={act.id} className="relative space-y-1">
                      <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-forest ring-4 ring-white" />
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-forest">{act.title}</p>
                        <span className="text-[10px] text-charcoal/50">
                          {new Date(act.created_at).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal/70">
                        Actor: <span className="font-medium text-charcoal">{act.actor}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
