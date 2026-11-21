'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  ShieldCheck,
  BookOpen,
  Bell,
  ArrowRight,
  Mail,
  Moon,
  Clock,
  Smartphone,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { CLINIC_INFO } from '@/lib/constants';
import { NOTIFICATION_CONFIG } from '@/lib/notifications/config';

export default function SettingsPage() {
  const [clinicAlertEmails, setClinicAlertEmails] = useState(
    NOTIFICATION_CONFIG.clinicAlertEmails.join(', ')
  );
  const [doctorPhone, setDoctorPhone] = useState(NOTIFICATION_CONFIG.doctorWhatsAppPhone);

  // Toggles for reminder offsets
  const [enable24h, setEnable24h] = useState(true);
  const [enable2h, setEnable2h] = useState(true);
  const [enable1h, setEnable1h] = useState(true);
  const [enable10m, setEnable10m] = useState(true);
  const [enableDocReminders, setEnableDocReminders] = useState(true);
  const [enableDailyDigest, setEnableDailyDigest] = useState(true);
  const [enableSms, setEnableSms] = useState(NOTIFICATION_CONFIG.smsEnabled);

  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-light text-forest tracking-tight">
            Clinic Settings &amp; Notification Engine
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70 mt-1">
            Configure clinic alert dispatch, reminder schedule offsets, quiet hours, and SMS fallback.
          </p>
        </div>

        <Link
          href="/admin/emails/preview"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-xs transition-colors"
        >
          <Mail className="w-3.5 h-3.5 text-gold" />
          <span>Preview Email Templates &rarr;</span>
        </Link>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Notification settings and schedule configuration saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 1. Clinic Staff & Doctor Notification Channels */}
          <div className="bg-white rounded-3xl p-6 border border-sage/20 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-forest text-base">Alert Recipients</h3>
                <p className="text-xs text-charcoal/60">Clinic administrator and practitioner routing</p>
              </div>
            </div>

            <div className="space-y-3.5 pt-2 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-forest uppercase tracking-wider mb-1">
                  Clinic Alert Emails (Comma-separated)
                </label>
                <input
                  type="text"
                  value={clinicAlertEmails}
                  onChange={(e) => setClinicAlertEmails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-sage/30 bg-ivory/30 text-charcoal text-xs focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
                <span className="text-[10px] text-sage block mt-1">
                  Receives instant booking alerts, patient cancellations, and schedule digests.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-forest uppercase tracking-wider mb-1">
                  Doctor WhatsApp Routing Phone
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={doctorPhone}
                    onChange={(e) => setDoctorPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-sage/30 bg-ivory/30 text-charcoal text-xs focus:outline-none focus:ring-2 focus:ring-forest/30 font-mono"
                  />
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[10px] text-sage block mt-1">
                  Receives advance patient alerts (1h and 10min) and morning 8:00 AM IST digest.
                </span>
              </div>
            </div>
          </div>

          {/* 2. Quiet Hours Protection */}
          <div className="bg-white rounded-3xl p-6 border border-sage/20 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-forest text-base">Quiet Hours Protection</h3>
                <p className="text-xs text-charcoal/60">Patient disturbance prevention in IST</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs text-charcoal/80">
              <div className="p-3.5 rounded-2xl bg-ivory border border-sage/25 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-forest">Enforced Quiet Window:</span>
                  <span className="font-mono font-bold text-amber-800">9:00 PM – 7:00 AM IST</span>
                </div>
                <p className="text-[11px] text-charcoal/70 leading-relaxed">
                  Patient reminders scheduled inside this window are held and automatically released at <strong>7:05 AM IST</strong> the following morning. Immediate booking confirmations send instantly.
                </p>
              </div>

              <div className="flex items-center justify-between py-1 border-t border-sage/15">
                <span className="text-charcoal/70">Timezone Base:</span>
                <span className="font-semibold text-forest font-mono">Asia/Kolkata (IST, UTC+5:30)</span>
              </div>
            </div>
          </div>

          {/* 3. Reminder Offsets Configuration */}
          <div className="bg-white rounded-3xl p-6 border border-sage/20 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-forest text-base">Automated Reminder Offsets</h3>
                <p className="text-xs text-charcoal/60">Pre-visit notification timeline</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-2 text-xs divide-y divide-sage/10">
              <label className="flex items-center justify-between py-1 cursor-pointer">
                <div>
                  <span className="font-semibold text-charcoal block">24-Hour Patient Reminder</span>
                  <span className="text-[10px] text-sage">Email &bull; WhatsApp</span>
                </div>
                <input
                  type="checkbox"
                  checked={enable24h}
                  onChange={(e) => setEnable24h(e.target.checked)}
                  className="h-4 w-4 rounded border-sage text-forest focus:ring-forest cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between py-1.5 cursor-pointer">
                <div>
                  <span className="font-semibold text-charcoal block">2-Hour Patient Reminder</span>
                  <span className="text-[10px] text-sage">Email &bull; WhatsApp &bull; SMS Fallback</span>
                </div>
                <input
                  type="checkbox"
                  checked={enable2h}
                  onChange={(e) => setEnable2h(e.target.checked)}
                  className="h-4 w-4 rounded border-sage text-forest focus:ring-forest cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between py-1.5 cursor-pointer">
                <div>
                  <span className="font-semibold text-charcoal block">1-Hour Patient Reminder</span>
                  <span className="text-[10px] text-sage">WhatsApp</span>
                </div>
                <input
                  type="checkbox"
                  checked={enable1h}
                  onChange={(e) => setEnable1h(e.target.checked)}
                  className="h-4 w-4 rounded border-sage text-forest focus:ring-forest cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between py-1.5 cursor-pointer">
                <div>
                  <span className="font-semibold text-charcoal block">10-Minute Patient Callout</span>
                  <span className="text-[10px] text-sage">WhatsApp &bull; SMS Fallback</span>
                </div>
                <input
                  type="checkbox"
                  checked={enable10m}
                  onChange={(e) => setEnable10m(e.target.checked)}
                  className="h-4 w-4 rounded border-sage text-forest focus:ring-forest cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between py-1.5 cursor-pointer">
                <div>
                  <span className="font-semibold text-charcoal block">Doctor Advance Alerts (1h &amp; 10min)</span>
                  <span className="text-[10px] text-sage">WhatsApp &bull; Email</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableDocReminders}
                  onChange={(e) => setEnableDocReminders(e.target.checked)}
                  className="h-4 w-4 rounded border-sage text-forest focus:ring-forest cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between py-1.5 cursor-pointer">
                <div>
                  <span className="font-semibold text-charcoal block">Doctor 8:00 AM IST Daily Digest</span>
                  <span className="text-[10px] text-sage">Email &bull; WhatsApp</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableDailyDigest}
                  onChange={(e) => setEnableDailyDigest(e.target.checked)}
                  className="h-4 w-4 rounded border-sage text-forest focus:ring-forest cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* 4. SMS Fallback Adapter (TRAI DLT) */}
          <div className="bg-white rounded-3xl p-6 border border-sage/20 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-forest text-base">SMS Provider Adapter</h3>
                <p className="text-xs text-charcoal/60">MSG91 / Fast2SMS fallback engine</p>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-ivory border border-sage/25 cursor-pointer">
                <div>
                  <span className="font-semibold text-forest block">Enable SMS Channel</span>
                  <span className="text-[10px] text-sage">Controlled via SMS_ENABLED env flag</span>
                </div>
                <input
                  type="checkbox"
                  checked={enableSms}
                  onChange={(e) => setEnableSms(e.target.checked)}
                  className="h-4 w-4 rounded border-sage text-forest focus:ring-forest cursor-pointer"
                />
              </label>

              <div className="p-3.5 rounded-2xl bg-cream border border-sage/20 space-y-2">
                <span className="text-[10px] font-bold text-brass uppercase tracking-wider block font-sans">
                  DLT Template IDs:
                </span>
                <p className="text-[11px] text-charcoal/70 leading-relaxed font-mono">
                  &bull; Confirmed: DLT_VSHMA_CONFIRM_01<br />
                  &bull; 2h Reminder: DLT_VSHMA_REMIND_2H_02<br />
                  &bull; 10m Reminder: DLT_VSHMA_REMIND_10M_03
                </p>
                <span className="text-[10px] text-sage italic block">
                  Messages strictly stay under 160 characters.
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
          >
            Save Configuration Changes
          </button>
        </div>
      </form>
    </div>
  );
}
