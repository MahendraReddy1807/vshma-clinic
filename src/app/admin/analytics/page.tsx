'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  Calendar,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';

interface AnalyticsData {
  totalBookings: number;
  pending: number;
  confirmed: number;
  completed: number;
  rescheduled: number;
  cancelled: number;
  conversionRate: number;
  whatsappOptInRate: number;
  channelStats: {
    whatsapp: { total: number; delivered: number; rate: number };
    email: { total: number; delivered: number; rate: number };
  };
  consultationTypes: Record<string, number>;
}

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const refetch = async () => {
    setLoading(true);
    setErrorMessage('');
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
    try {
      const res = await fetch('/api/admin/crm/analytics', {
        headers: { Authorization: `Bearer ${token || ''}` },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('vshma_admin_session');
        localStorage.removeItem('vshma_admin_email');
        router.push('/admin/login');
        return;
      }

      if (res.ok) {
        const json = await res.json();
        setData(json.metrics);
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMessage(errData.error || 'Failed to refresh analytics');
      }
    } catch (err) {
      console.error('[Analytics Error]', err);
      setErrorMessage('Could not connect to analytics service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
      try {
        const res = await fetch('/api/admin/crm/analytics', {
          headers: { Authorization: `Bearer ${token || ''}` },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('vshma_admin_session');
          localStorage.removeItem('vshma_admin_email');
          router.push('/admin/login');
          return;
        }

        if (res.ok) {
          const json = await res.json();
          if (isMounted) setData(json.metrics);
        } else {
          const errData = await res.json().catch(() => ({}));
          if (isMounted) setErrorMessage(errData.error || 'Failed to load analytics metrics.');
        }
      } catch (err) {
        console.error('[Analytics Error]', err);
        if (isMounted) setErrorMessage('Could not connect to analytics service.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-light text-forest tracking-tight">CRM Operational Analytics</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-forest/10 text-forest font-semibold border border-forest/20">
              Live Metrics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal/70 mt-1">
            Conversion funnel, communication channel delivery performance, and consultation distributions.
          </p>
        </div>

        <button
          onClick={refetch}
          disabled={loading}
          className="self-start sm:self-auto p-2.5 rounded-xl border border-sage/30 bg-white text-charcoal hover:bg-ivory hover:text-forest transition-colors shadow-2xs"
          title="Refresh Analytics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Analytics Notice</p>
              <p className="text-[11px] text-amber-800 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={refetch}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 font-semibold text-amber-900 hover:bg-amber-100 transition-colors shrink-0 shadow-2xs"
          >
            Retry
          </button>
        </div>
      )}

      {loading || !data ? (
        <div className="p-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-charcoal/60">Aggregating clinic intelligence...</p>
        </div>
      ) : (
        <>
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sage/20 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-charcoal/60">
                <span>Total Bookings</span>
                <Calendar className="w-4 h-4 text-forest" />
              </div>
              <p className="text-2xl sm:text-3xl font-heading font-bold text-forest">{data.totalBookings}</p>
              <p className="text-[11px] text-sage-dark">Consultation requests</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sage/20 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-charcoal/60">
                <span>Conversion Rate</span>
                <TrendingUp className="w-4 h-4 text-emerald-700" />
              </div>
              <p className="text-2xl sm:text-3xl font-heading font-bold text-emerald-800">{data.conversionRate}%</p>
              <p className="text-[11px] text-emerald-700 font-medium">Confirmed / Completed</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sage/20 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-charcoal/60">
                <span>WhatsApp Delivery</span>
                <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              </div>
              <p className="text-2xl sm:text-3xl font-heading font-bold text-charcoal">
                {data.channelStats.whatsapp.rate}%
              </p>
              <p className="text-[11px] text-charcoal/60">{data.channelStats.whatsapp.delivered} messages delivered</p>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sage/20 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-charcoal/60">
                <span>WhatsApp Opt-In</span>
                <ShieldCheck className="w-4 h-4 text-gold-dark" />
              </div>
              <p className="text-2xl sm:text-3xl font-heading font-bold text-gold-dark">
                {data.whatsappOptInRate}%
              </p>
              <p className="text-[11px] text-charcoal/60">Explicit patient consent</p>
            </div>
          </div>

          {/* Two-Column Analytics Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appointment Lifecycle Breakdown */}
            <div className="bg-white rounded-3xl p-6 border border-sage/20 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-sage/15 pb-3">
                <h3 className="font-heading font-bold text-forest text-base sm:text-lg">
                  Booking Status Breakdown
                </h3>
                <Link
                  href="/admin/appointments"
                  className="text-xs font-semibold text-forest hover:text-gold flex items-center gap-1"
                >
                  <span>View Appointments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-charcoal">Confirmed & Completed</span>
                    <span className="font-bold text-emerald-800">
                      {data.confirmed + data.completed} ({data.conversionRate}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${Math.min(100, data.conversionRate)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-charcoal">Pending Review</span>
                    <span className="font-bold text-amber-700">
                      {data.pending} (
                      {data.totalBookings > 0 ? Math.round((data.pending / data.totalBookings) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{
                        width: `${data.totalBookings > 0 ? (data.pending / data.totalBookings) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-charcoal">Rescheduled Slots</span>
                    <span className="font-bold text-blue-800">
                      {data.rescheduled} (
                      {data.totalBookings > 0 ? Math.round((data.rescheduled / data.totalBookings) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${data.totalBookings > 0 ? (data.rescheduled / data.totalBookings) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-charcoal">Cancelled</span>
                    <span className="font-bold text-red-700">
                      {data.cancelled} (
                      {data.totalBookings > 0 ? Math.round((data.cancelled / data.totalBookings) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-red-400 rounded-full"
                      style={{
                        width: `${data.totalBookings > 0 ? (data.cancelled / data.totalBookings) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Consultation Types Distribution */}
            <div className="bg-white rounded-3xl p-6 border border-sage/20 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-sage/15 pb-3">
                <h3 className="font-heading font-bold text-forest text-base sm:text-lg">
                  Clinical Consultation Distribution
                </h3>
                <span className="text-xs text-charcoal/50">By patient request</span>
              </div>

              <div className="space-y-2.5 pt-1">
                {Object.entries(data.consultationTypes).map(([type, count]) => {
                  const pct = data.totalBookings > 0 ? Math.round((count / data.totalBookings) * 100) : 0;
                  return (
                    <div key={type} className="flex items-center justify-between p-2.5 rounded-xl bg-ivory/60 border border-sage/15 text-xs">
                      <span className="font-semibold text-charcoal">{type}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-charcoal/60">{count} bookings</span>
                        <span className="px-2 py-0.5 rounded-full bg-forest/10 text-forest font-bold text-[10px]">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
