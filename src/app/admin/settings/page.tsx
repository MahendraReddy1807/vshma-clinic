'use client';

import Link from 'next/link';
import { Settings, ShieldCheck, BookOpen, Bell, ArrowRight } from 'lucide-react';
import { CLINIC_INFO } from '@/lib/constants';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-light text-forest tracking-tight">Clinic CRM Settings</h1>
          <p className="text-xs sm:text-sm text-charcoal/70 mt-1">
            System configuration, communication rules, staff access, and operational policies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clinic Identity Card */}
        <div className="bg-white rounded-3xl p-6 border border-sage/20 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-forest text-base">Practice Identity</h3>
              <p className="text-xs text-charcoal/60">Configured clinic details</p>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-sage/15 pt-3">
            <div className="flex justify-between py-1 border-b border-sage/10">
              <span className="text-charcoal/60">Clinic Name:</span>
              <span className="font-semibold text-charcoal">{CLINIC_INFO.fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-sage/10">
              <span className="text-charcoal/60">Lead Doctor:</span>
              <span className="font-semibold text-charcoal">{CLINIC_INFO.doctor} ({CLINIC_INFO.qualification})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-sage/10">
              <span className="text-charcoal/60">Location:</span>
              <span className="font-semibold text-charcoal">{CLINIC_INFO.location}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-charcoal/60">Timezone:</span>
              <span className="font-semibold text-charcoal">Asia/Kolkata (IST, UTC+5:30)</span>
            </div>
          </div>
        </div>

        {/* Quick Links Card */}
        <div className="bg-white rounded-3xl p-6 border border-sage/20 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gold/15 text-gold-dark flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-forest text-base">Administrative Resources</h3>
              <p className="text-xs text-charcoal/60">Fast navigation to clinic controls</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/admin/knowledge-base"
              className="flex items-center justify-between p-3 rounded-2xl bg-ivory hover:bg-forest/5 border border-sage/20 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-forest" />
                <span className="text-xs font-semibold text-charcoal">Knowledge Base & FAQs</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-sage" />
            </Link>

            <Link
              href="/admin/notifications"
              className="flex items-center justify-between p-3 rounded-2xl bg-ivory hover:bg-forest/5 border border-sage/20 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-forest" />
                <span className="text-xs font-semibold text-charcoal">Notification Logs & Dispatch Audit</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-sage" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
