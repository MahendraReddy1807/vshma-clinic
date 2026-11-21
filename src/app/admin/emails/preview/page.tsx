'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Mail,
  Send,
  Eye,
  FileText,
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { LUXURY_EMAIL_TEMPLATES, type LuxuryEmailProps } from '@/lib/notifications/email-templates';

type TemplateKey = keyof typeof LUXURY_EMAIL_TEMPLATES;

const TEMPLATE_METADATA: Array<{ key: TemplateKey; label: string; role: 'patient' | 'clinic' | 'doctor'; desc: string }> = [
  { key: 'booking_received', label: '1. Booking Received', role: 'patient', desc: 'Sent to patient upon web reservation' },
  { key: 'clinic_new_booking_alert', label: '2. Clinic Alert', role: 'clinic', desc: 'Staff alert with patient details & admin button' },
  { key: 'confirmed', label: '3. Confirmed & Calendar', role: 'patient', desc: 'Confirmed slot with .ics & Google Cal links' },
  { key: 'rescheduled', label: '4. Rescheduled', role: 'patient', desc: 'Notifies patient of slot adjustment' },
  { key: 'cancelled', label: '5. Cancelled', role: 'patient', desc: 'Notification of cancelled slot + rebook link' },
  { key: 'completed', label: '6. Post-Visit Completed', role: 'patient', desc: 'Thank-you note & 3-4 week follow-up callout' },
  { key: 'no_show', label: '7. No-Show Rebook', role: 'patient', desc: 'Gentle patient message offering to reschedule' },
  { key: 'reminder_24h', label: '8. Reminder (24h)', role: 'patient', desc: 'Pre-visit reminder day before appointment' },
  { key: 'reminder_2h', label: '9. Reminder (2h)', role: 'patient', desc: 'Pre-visit reminder 2 hours prior to arrival' },
  { key: 'reminder_1h', label: '10. Reminder (1h)', role: 'patient', desc: 'Last hour reminder before consultation' },
  { key: 'reminder_10m', label: '11. Reminder (10m)', role: 'patient', desc: 'Final arrival call to step into consulting room' },
  { key: 'doctor_reminder', label: '12. Doctor Alert (1h)', role: 'doctor', desc: 'Advance alert for Dr. Chihnitha before next patient' },
  { key: 'doctor_daily_digest', label: '13. Doctor Daily Digest', role: 'doctor', desc: 'Morning 8:00 AM IST digest of the full day' },
];

export default function EmailPreviewPage() {
  const [selectedKey, setSelectedKey] = useState<TemplateKey>('confirmed');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [tabMode, setTabMode] = useState<'html' | 'text'>('html');
  const [testEmail, setTestEmail] = useState('mahendrart07@gmail.com');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Sample data
  const sampleData: LuxuryEmailProps = {
    patientName: 'Rajesh Sharma',
    referenceNumber: 'VSHMA-2026-8941',
    appointmentDate: 'Saturday, 28 Nov 2026',
    appointmentTime: '10:30 AM IST',
    consultationType: 'Comprehensive Constitutional Intake',
    mode: 'In-Clinic Consultation',
    doctorName: 'Dr. Chihnitha Reddy T (BHMS)',
    location: 'VSHMA Homeopathy Clinic, Bengaluru, Karnataka (By Prior Appt)',
    notes: 'Mild eczema flare-up, past records available.',
    phone: '+91 98765 43210',
    email: 'rajesh.sharma@example.com',
    oldDate: 'Friday, 27 Nov 2026',
    oldTime: '4:00 PM IST',
    calendarUrl: 'https://calendar.google.com',
    rescheduleUrl: 'https://vshma.in/book/reschedule?token=demo',
    cancelUrl: 'https://vshma.in/book/cancel?token=demo',
    totalAppointments: 5,
    digestListHtml: `
      <div style="background:#FAF8F5;padding:12px;border-radius:10px;border:1px solid #E5E0D4;margin-bottom:8px;">
        <strong>10:30 AM</strong> - Rajesh Sharma (Constitutional Intake)<br>
        <span style="font-size:11px;color:#8F9489;">Ref: VSHMA-8941 &bull; Phone: +91 98xxx</span>
      </div>
      <div style="background:#FAF8F5;padding:12px;border-radius:10px;border:1px solid #E5E0D4;margin-bottom:8px;">
        <strong>11:45 AM</strong> - Sneha Rao (PCOS Follow-up)<br>
        <span style="font-size:11px;color:#8F9489;">Ref: VSHMA-8945 &bull; Phone: +91 97xxx</span>
      </div>
      <div style="background:#FAF8F5;padding:12px;border-radius:10px;border:1px solid #E5E0D4;">
        <strong>03:00 PM</strong> - Vikram Desai (Migraine Assessment)<br>
        <span style="font-size:11px;color:#8F9489;">Ref: VSHMA-8950 &bull; Phone: +91 94xxx</span>
      </div>
    `,
  };

  const rendered = useMemo(() => {
    const generator = LUXURY_EMAIL_TEMPLATES[selectedKey];
    return generator(sampleData);
  }, [selectedKey]);

  const handleSendTest = async () => {
    if (!testEmail || isSending) return;
    setIsSending(true);
    setSendResult(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;

    try {
      const res = await fetch('/api/admin/emails/test-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          templateKey: selectedKey,
          toEmail: testEmail,
          sampleData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch test email');
      }

      setSendResult({
        success: true,
        message: data.message || `Test email sent to ${testEmail}!`,
      });
    } catch (err: unknown) {
      setSendResult({
        success: false,
        message: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-sage/20">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/settings"
              className="p-1.5 rounded-lg bg-forest/5 hover:bg-forest/10 text-forest transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-serif font-light text-forest tracking-tight">
              Luxury Email Templates Preview
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-charcoal/70 mt-1">
            Production 600px bulletproof table layout with dark-mode support and plain text fallback.
          </p>
        </div>

        {/* Test Send Form */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-sage/30 shadow-2xs">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Recipient email..."
            className="px-3 py-1.5 rounded-xl bg-ivory/50 border border-sage/30 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30 w-52"
          />
          <button
            onClick={handleSendTest}
            disabled={isSending}
            className="px-3.5 py-1.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-gold" />
            <span>{isSending ? 'Sending...' : 'Send Test'}</span>
          </button>
        </div>
      </div>

      {/* Test Send Result Banner */}
      {sendResult && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs ${
            sendResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {sendResult.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{sendResult.message}</span>
        </div>
      )}

      {/* Main Preview Grid: Template Selector (Left) & Preview Iframe (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Template Selector Sidebar (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-sage/20 p-4 shadow-sm space-y-2 max-h-[820px] overflow-y-auto">
          <p className="text-[10px] font-bold text-charcoal/50 uppercase tracking-wider px-2">
            Catalog ({TEMPLATE_METADATA.length} Templates)
          </p>

          <div className="space-y-1">
            {TEMPLATE_METADATA.map((tmpl) => {
              const isSelected = selectedKey === tmpl.key;
              return (
                <button
                  key={tmpl.key}
                  onClick={() => {
                    setSelectedKey(tmpl.key);
                    setSendResult(null);
                  }}
                  className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex flex-col gap-0.5 ${
                    isSelected
                      ? 'bg-forest text-white shadow-xs'
                      : 'hover:bg-ivory text-charcoal'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs tracking-tight">{tmpl.label}</span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded-md font-bold tracking-wider ${
                        isSelected
                          ? 'bg-gold/20 text-gold'
                          : tmpl.role === 'patient'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tmpl.role === 'clinic'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {tmpl.role}
                    </span>
                  </div>
                  <p
                    className={`text-[11px] truncate ${
                      isSelected ? 'text-sage-light/80' : 'text-charcoal/60'
                    }`}
                  >
                    {tmpl.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview Frame Container (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-sage/20 shadow-sm overflow-hidden flex flex-col">
          {/* Preview Toolbar */}
          <div className="p-4 border-b border-sage/20 bg-ivory/30 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-forest flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gold" />
                <span>Subject: {rendered.subject}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* HTML / Plain Text Toggle */}
              <div className="flex bg-white rounded-xl border border-sage/30 p-0.5 text-xs font-medium">
                <button
                  onClick={() => setTabMode('html')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    tabMode === 'html' ? 'bg-forest text-white' : 'text-charcoal/70'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>HTML</span>
                </button>
                <button
                  onClick={() => setTabMode('text')}
                  className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    tabMode === 'text' ? 'bg-forest text-white' : 'text-charcoal/70'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Plain Text</span>
                </button>
              </div>

              {/* Desktop / Mobile Frame Viewport */}
              {tabMode === 'html' && (
                <div className="flex bg-white rounded-xl border border-sage/30 p-0.5 text-xs">
                  <button
                    onClick={() => setViewMode('desktop')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'desktop' ? 'bg-forest text-white' : 'text-charcoal/70'
                    }`}
                    title="Desktop Preview (600px)"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('mobile')}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      viewMode === 'mobile' ? 'bg-forest text-white' : 'text-charcoal/70'
                    }`}
                    title="Mobile Preview (375px)"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview Canvas Area */}
          <div className="p-6 bg-[#EBE7DF] min-h-[640px] flex items-center justify-center overflow-auto">
            {tabMode === 'html' ? (
              <div
                className={`transition-all duration-300 shadow-xl rounded-2xl overflow-hidden bg-white border border-sage/30 ${
                  viewMode === 'desktop' ? 'w-[640px]' : 'w-[375px]'
                }`}
              >
                <iframe
                  title="Email Preview"
                  srcDoc={rendered.html}
                  className="w-full h-[720px] border-none"
                />
              </div>
            ) : (
              <div className="w-full max-w-2xl bg-white p-6 rounded-2xl border border-sage/30 shadow-md">
                <p className="text-[10px] uppercase font-bold text-brass tracking-wider mb-2 font-mono">
                  Plain-Text MIME Alternative:
                </p>
                <pre className="text-xs text-charcoal/80 font-mono whitespace-pre-wrap leading-relaxed bg-ivory/50 p-4 rounded-xl border border-sage/20">
                  {rendered.text}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
