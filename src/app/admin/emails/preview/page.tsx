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
  Moon,
  Sun,
} from 'lucide-react';
import { LUXURY_EMAIL_TEMPLATES, type LuxuryEmailProps } from '@/lib/notifications/email-templates';

type TemplateKey = keyof typeof LUXURY_EMAIL_TEMPLATES;

const TEMPLATE_METADATA: Array<{ key: TemplateKey; label: string; role: 'patient' | 'clinic' | 'doctor'; desc: string }> = [
  { key: 'booking_received', label: '1. Booking Received', role: 'patient', desc: 'Sent to patient upon web reservation' },
  { key: 'clinic_new_booking_alert', label: '2. Clinic Alert', role: 'clinic', desc: 'Staff alert with patient details & portal link' },
  { key: 'doctor_new_booking_alert', label: '3. Doctor Schedule Alert', role: 'doctor', desc: 'Schedule alert for Dr. Chihnitha with patient details' },
  { key: 'booking_confirmed', label: '4. Booking Confirmed', role: 'patient', desc: 'Confirmed slot with calendar invite and clinic address' },
  { key: 'booking_rescheduled', label: '5. Booking Rescheduled', role: 'patient', desc: 'Notifies patient of slot change with new time' },
  { key: 'booking_cancelled', label: '6. Booking Cancelled', role: 'patient', desc: 'Notification of cancelled slot + rebook link' },
  { key: 'reminder_24h', label: '7. Reminder (24h Ahead)', role: 'patient', desc: 'Pre-visit reminder the day before consultation' },
  { key: 'reminder_2h', label: '8. Reminder (2h Ahead)', role: 'patient', desc: 'Final arrival call 2 hours prior to appointment' },
  { key: 'post_consultation_followup', label: '9. Post-Consultation Followup', role: 'patient', desc: 'Care notes, remedy instructions & follow-up guide' },
  { key: 'remedy_tracking_checkin', label: '10. Weekly Remedy Check-In', role: 'patient', desc: '7-day check-in on natural vitality response' },
  { key: 'daily_clinic_digest', label: '11. Daily Clinic Digest', role: 'doctor', desc: 'Morning schedule roster for clinic & doctor' },
  { key: 'opt_out_confirmed', label: '12. Opt-Out Confirmed', role: 'patient', desc: 'Confirmation of communication preferences' },
  { key: 'inactivity_reengagement', label: '13. Seasonal Care Review', role: 'patient', desc: '90-day check-in for recurring health reviews' },
];

export default function EmailPreviewPage() {
  const [selectedKey, setSelectedKey] = useState<TemplateKey>('booking_confirmed');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [tabMode, setTabMode] = useState<'html' | 'text'>('html');
  const [simulateDarkMode, setSimulateDarkMode] = useState(false);
  const [testEmail, setTestEmail] = useState('mahendrart07@gmail.com');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // Sample data (zero medical jargon)
  const sampleData: LuxuryEmailProps = {
    patientName: 'Rajesh Sharma',
    referenceNumber: 'VSHMA-2026-8941',
    appointmentDate: 'Saturday, 28 Nov 2026',
    appointmentTime: '10:30 AM IST',
    consultationType: 'Comprehensive Homeopathic Intake',
    mode: 'In-Clinic Consultation',
    doctorName: 'Dr. Chihnitha Reddy T (BHMS)',
    location: 'VSHMA Homeopathy Clinic, Bengaluru, Karnataka (By Prior Appt)',
    notes: 'Mild eczema flare-up, previous records available.',
    phone: '+91 98765 43210',
    email: 'rajesh.sharma@example.com',
    oldDate: 'Friday, 27 Nov 2026',
    oldTime: '4:00 PM IST',
    calendarUrl: 'https://vshma.in/contact',
    rescheduleUrl: 'https://vshma.in/book',
    cancelUrl: 'https://vshma.in/book',
    totalAppointments: 5,
    digestListHtml: `
      <div style="background:#FAF8F5;padding:12px;border-radius:10px;border:1px solid #D4D8BA;margin-bottom:8px;">
        <strong>10:30 AM</strong> - Rajesh Sharma (First-Time Intake)<br>
        <span style="font-size:11px;color:#5A635B;">Ref: VSHMA-8941 &bull; Phone: +91 98xxx</span>
      </div>
      <div style="background:#FAF8F5;padding:12px;border-radius:10px;border:1px solid #D4D8BA;margin-bottom:8px;">
        <strong>11:45 AM</strong> - Sneha Rao (Follow-up Care)<br>
        <span style="font-size:11px;color:#5A635B;">Ref: VSHMA-8945 &bull; Phone: +91 97xxx</span>
      </div>
      <div style="background:#FAF8F5;padding:12px;border-radius:10px;border:1px solid #D4D8BA;">
        <strong>03:00 PM</strong> - Vikram Desai (Health Assessment)<br>
        <span style="font-size:11px;color:#5A635B;">Ref: VSHMA-8950 &bull; Phone: +91 94xxx</span>
      </div>
    `,
  };

  const rendered = useMemo(() => {
    const generator = LUXURY_EMAIL_TEMPLATES[selectedKey];
    return generator(sampleData);
  }, [selectedKey]);

  // Replace cid: with actual public web URL for local browser preview in iframe
  const previewHtml = useMemo(() => {
    return rendered.html.replace(/src="cid:vshma-logo"/g, 'src="/logo-transparent.png"');
  }, [rendered.html]);

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
        setSendResult({ success: false, message: data.error || 'Failed to dispatch test email' });
      } else {
        setSendResult({ success: true, message: data.message || `Test email dispatched to ${testEmail}` });
      }
    } catch (err: unknown) {
      setSendResult({ success: false, message: err instanceof Error ? err.message : 'Network error' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-sage/20 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/notifications"
            className="w-10 h-10 rounded-2xl bg-ivory hover:bg-sage/30 flex items-center justify-center text-forest transition-colors shrink-0"
            title="Back to Notifications"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif text-forest font-normal leading-tight">
              Email Template Gallery
            </h1>
            <p className="text-xs text-charcoal/60 mt-0.5">
              13 light-first luxury email templates with Gmail SMTP & embedded CID logo
            </p>
          </div>
        </div>

        {/* Test Send Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Recipient email..."
            className="px-3.5 py-2 rounded-xl bg-ivory border border-sage/30 text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30 w-56"
          />
          <button
            onClick={handleSendTest}
            disabled={isSending}
            className="px-4 py-2 rounded-xl bg-[#121A15] hover:bg-[#1F2B23] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-[#B89B5E]" />
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
                      ? 'bg-[#121A15] text-white shadow-xs'
                      : 'hover:bg-ivory text-charcoal'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs tracking-tight">{tmpl.label}</span>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded-md font-bold tracking-wider ${
                        isSelected
                          ? 'bg-[#B89B5E]/30 text-[#D4D8BA]'
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
                      isSelected ? 'text-[#D4D8BA]/80' : 'text-charcoal/60'
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
          <div className="p-4 border-b border-sage/20 bg-ivory/40 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-forest flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-[#B89B5E] shrink-0" />
                <span className="truncate">Subject: {rendered.subject}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Simulate Dark Mode Toggle */}
              <button
                type="button"
                onClick={() => setSimulateDarkMode(!simulateDarkMode)}
                title="Toggle forced dark mode simulation"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                  simulateDarkMode
                    ? 'bg-[#121A15] text-[#EDE6D3] border-[#B89B5E]'
                    : 'bg-white text-charcoal/80 border-sage/30 hover:bg-ivory'
                }`}
              >
                {simulateDarkMode ? <Moon className="w-3.5 h-3.5 text-[#B89B5E]" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                <span>{simulateDarkMode ? 'Dark Sim ON' : 'Dark Sim OFF'}</span>
              </button>

              {/* HTML / Plain Text Toggle */}
              <div className="flex bg-white rounded-xl border border-sage/30 p-0.5 text-xs font-medium">
                <button
                  onClick={() => setTabMode('html')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                    tabMode === 'html' ? 'bg-[#121A15] text-white shadow-2xs' : 'text-charcoal/70 hover:text-charcoal'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>HTML</span>
                </button>
                <button
                  onClick={() => setTabMode('text')}
                  className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                    tabMode === 'text' ? 'bg-[#121A15] text-white shadow-2xs' : 'text-charcoal/70 hover:text-charcoal'
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span>Plain Text</span>
                </button>
              </div>

              {/* Desktop / Mobile Device Viewport Switcher */}
              <div className="flex bg-white rounded-xl border border-sage/30 p-0.5 text-xs">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'desktop' ? 'bg-sage/40 text-forest' : 'text-charcoal/50 hover:text-charcoal'
                  }`}
                  title="Desktop View (640px)"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'mobile' ? 'bg-sage/40 text-forest' : 'text-charcoal/50 hover:text-charcoal'
                  }`}
                  title="Mobile View (375px)"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Render Area */}
          <div
            className={`p-4 sm:p-8 flex justify-center min-h-[640px] transition-colors duration-300 ${
              simulateDarkMode ? 'bg-[#0E1410]' : 'bg-[#EFECE5]'
            }`}
          >
            {tabMode === 'html' ? (
              <div
                style={{
                  width: viewMode === 'mobile' ? '375px' : '100%',
                  maxWidth: viewMode === 'mobile' ? '375px' : '640px',
                  transition: 'all 0.3s ease',
                  filter: simulateDarkMode ? 'invert(0.92) hue-rotate(180deg)' : 'none',
                }}
                className="rounded-2xl overflow-hidden shadow-xl border border-sage/20 bg-white"
              >
                <iframe
                  title="Email Template Preview"
                  srcDoc={previewHtml}
                  className="w-full h-[620px] border-0"
                />
              </div>
            ) : (
              <div
                style={{
                  width: viewMode === 'mobile' ? '375px' : '100%',
                  maxWidth: viewMode === 'mobile' ? '375px' : '640px',
                }}
                className="bg-white rounded-2xl p-6 font-mono text-xs text-charcoal/85 whitespace-pre-wrap border border-sage/20 shadow-sm leading-relaxed overflow-y-auto max-h-[620px]"
              >
                {rendered.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
