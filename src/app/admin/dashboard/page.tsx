'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { StatCardSkeleton, TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import type { DashboardStats, Appointment } from '@/types';
import { formatDateShort } from '@/lib/utils';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem('vshma_admin_session');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      try {
        const [statsRes, apptRes] = await Promise.all([
          fetch('/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('/api/admin/appointments?limit=5&sort=newest', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (statsRes.status === 401 || statsRes.status === 403 || apptRes.status === 401 || apptRes.status === 403) {
          localStorage.removeItem('vshma_admin_session');
          localStorage.removeItem('vshma_admin_email');
          router.push('/admin/login');
          return;
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        } else {
          setStats({
            total: 0,
            pending: 0,
            confirmed: 0,
            rescheduled: 0,
            completed: 0,
            cancelled: 0,
          });
        }

        if (apptRes.ok) {
          const apptData = await apptRes.json();
          setRecentAppointments(apptData.appointments || []);
        } else {
          setRecentAppointments([]);
        }
      } catch (err) {
        console.error('Error fetching dashboard records:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const statCards = [
    {
      label: 'Total Requests',
      value: stats?.total ?? '—',
      icon: Users,
      color: 'text-forest',
      bg: 'bg-mint',
    },
    {
      label: 'Pending Confirmation',
      value: stats?.pending ?? '—',
      icon: Clock,
      color: 'text-amber-700',
      bg: 'bg-amber-100',
    },
    {
      label: 'Confirmed Bookings',
      value: stats?.confirmed ?? '—',
      icon: CheckCircle2,
      color: 'text-emerald-700',
      bg: 'bg-emerald-100',
    },
    {
      label: 'Completed Visits',
      value: stats?.completed ?? '—',
      icon: CalendarDays,
      color: 'text-blue-700',
      bg: 'bg-blue-100',
    },
    {
      label: 'Cancelled',
      value: stats?.cancelled ?? '—',
      icon: XCircle,
      color: 'text-red-700',
      bg: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900">
            Clinic Operations Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time appointment schedule, patient inquiries, and booking volume
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/appointments">
            <Button size="sm">
              <span>View All Records</span>
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 tracking-wide uppercase">
                      {card.label}
                    </span>
                    <div className={`w-8 h-8 rounded-xl ${card.bg} ${card.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-heading text-2xl sm:text-3xl font-bold text-gray-900">
                    {card.value}
                  </div>
                </div>
              );
            })}
      </div>

      {/* Booking Distribution & Analytics Chart Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simple Bar Distribution Visual */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-gray-900 text-base">Status Breakdown</h3>
            <TrendingUp className="w-4 h-4 text-forest" />
          </div>

          {stats && stats.total > 0 ? (
            <div className="space-y-4 pt-2">
              {[
                { label: 'Pending', count: stats.pending, color: 'bg-amber-500' },
                { label: 'Confirmed', count: stats.confirmed, color: 'bg-emerald-500' },
                { label: 'Completed', count: stats.completed, color: 'bg-blue-500' },
                { label: 'Cancelled', count: stats.cancelled, color: 'bg-red-400' },
              ].map((item) => {
                const percentage = Math.round((item.count / (stats.total || 1)) * 100);
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-gray-600">
                      <span>{item.label}</span>
                      <span>
                        {item.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : stats ? (
            <div className="py-12 text-center text-xs text-gray-400">
              No appointments registered yet to calculate status breakdown.
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-gray-500">
              Appointment data is unavailable. Check the Supabase connection.
            </div>
          )}
        </div>

        {/* Recent Appointment Requests Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-gray-900 text-base">
              Latest Booking Submissions
            </h3>
            <Link
              href="/admin/appointments"
              className="text-xs text-forest hover:text-sage font-semibold underline underline-offset-4"
            >
              See all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Ref ID</th>
                  <th className="pb-3 px-3">Patient</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => <TableRowSkeleton key={i} />)
                ) : recentAppointments.length > 0 ? (
                  recentAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-xs font-bold text-forest">
                        {appt.booking_reference}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-gray-900 text-sm">{appt.full_name}</p>
                        <p className="text-xs text-gray-500">{appt.phone}</p>
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-600">
                        {formatDateShort(appt.appointment_date)}
                      </td>
                      <td className="py-3 px-3">
                        <Badge status={appt.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-xs text-gray-400">
                      {stats ? 'No recent appointment requests found.' : 'Appointment data is unavailable.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
