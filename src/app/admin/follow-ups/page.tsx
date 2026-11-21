'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  XCircle,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import type { FollowUpTaskItem } from '@/app/api/admin/crm/follow-ups/route';

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800 border-red-300 font-bold';
    case 'high':
      return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
    case 'medium':
      return 'bg-blue-100 text-blue-800 border-blue-200 font-medium';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200 font-medium';
  }
}

export default function FollowUpsPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<FollowUpTaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'overdue' | 'today' | 'upcoming' | 'completed'>('all');
  const [errorMessage, setErrorMessage] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPatientId, setNewPatientId] = useState('');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newDesc, setNewDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [patientsList, setPatientsList] = useState<{ id: string; full_name: string; patient_id: string }[]>([]);

  const refetchTasks = async () => {
    setLoading(true);
    setErrorMessage('');
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
    try {
      const res = await fetch('/api/admin/crm/follow-ups', {
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
        setTasks(data.tasks || []);
      } else {
        const data = await res.json();
        setErrorMessage(data.error || 'Failed to load follow-up tasks');
      }
    } catch (err) {
      console.error('[Follow-up Tasks Error]', err);
      setErrorMessage('Database connection failed. Unable to fetch follow-ups.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
      try {
        const [taskRes, patRes] = await Promise.all([
          fetch('/api/admin/crm/follow-ups', { headers: { Authorization: `Bearer ${token || ''}` } }),
          fetch('/api/admin/crm/patients?limit=50', { headers: { Authorization: `Bearer ${token || ''}` } }),
        ]);

        if (taskRes.status === 401 || taskRes.status === 403 || patRes.status === 401 || patRes.status === 403) {
          localStorage.removeItem('vshma_admin_session');
          localStorage.removeItem('vshma_admin_email');
          router.push('/admin/login');
          return;
        }

        if (taskRes.ok) {
          const data = await taskRes.json();
          if (isMounted) setTasks(data.tasks || []);
        } else {
          const data = await taskRes.json();
          if (isMounted) setErrorMessage(data.error || 'Failed to load follow-up tasks');
        }

        if (patRes.ok) {
          const patData = await patRes.json();
          if (isMounted) {
            setPatientsList(
              (patData.patients || []).map((p: { id: string; full_name: string; patient_id: string }) => ({
                id: p.id,
                full_name: p.full_name,
                patient_id: p.patient_id,
              }))
            );
          }
        }
      } catch (err) {
        console.error('[Follow-up Tasks Error]', err);
        if (isMounted) setErrorMessage('Database connection failed. Unable to fetch tasks.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    const nextStatus: 'pending' | 'completed' = currentStatus === 'completed' ? 'pending' : 'completed';
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );

    try {
      const res = await fetch(`/api/admin/crm/follow-ups/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErrorMessage(data.error || 'Failed to update task status');
        refetchTasks();
      }
    } catch (err) {
      console.error('[Update Task Status Error]', err);
      refetchTasks();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this follow-up task?')) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;

    try {
      const res = await fetch(`/api/admin/crm/follow-ups/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete task');
      }
    } catch (err) {
      console.error('[Delete Task Error]', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || submitting) return;

    setSubmitting(true);
    setModalError('');
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;

    try {
      const res = await fetch('/api/admin/crm/follow-ups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          patient_id: newPatientId || undefined,
          title: newTitle.trim(),
          description: newDesc.trim() || undefined,
          due_date: newDueDate,
          due_time: '11:00 AM',
          priority: newPriority,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        setNewTitle('');
        setNewPatientId('');
        setNewDesc('');
        refetchTasks();
      } else {
        setModalError(data.error || 'Failed to create follow-up task.');
      }
    } catch (err) {
      console.error('[Create Task Error]', err);
      setModalError('Failed to create task due to connection error.');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const overdueTasks = tasks.filter((t) => t.status !== 'completed' && t.due_date < todayStr);
  const todayTasks = tasks.filter((t) => t.status !== 'completed' && t.due_date === todayStr);
  const upcomingTasks = tasks.filter((t) => t.status !== 'completed' && t.due_date > todayStr);
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  let displayedTasks = tasks;
  if (activeFilter === 'overdue') displayedTasks = overdueTasks;
  if (activeFilter === 'today') displayedTasks = todayTasks;
  if (activeFilter === 'upcoming') displayedTasks = upcomingTasks;
  if (activeFilter === 'completed') displayedTasks = completedTasks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-light text-forest tracking-tight">Follow-up Manager</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-forest/10 text-forest font-semibold border border-forest/20">
              Outreach & Tasks
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal/70 mt-1">
            Proactive patient outreach for post-consultation checks, lab test reviews, and scheduling follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={refetchTasks}
            disabled={loading}
            className="p-2.5 rounded-xl border border-sage/30 bg-white text-charcoal hover:bg-ivory hover:text-forest transition-colors"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest text-white text-xs sm:text-sm font-semibold hover:bg-forest-light transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Database Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={refetchTasks}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sage/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-charcoal/60">
            <span>Total Tasks</span>
            <CheckSquare className="w-4 h-4 text-forest" />
          </div>
          <p className="text-2xl sm:text-3xl font-heading font-bold text-forest">{tasks.length}</p>
          <p className="text-[11px] text-sage-dark">All follow-up items</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-red-200 bg-red-50/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-red-800">
            <span>Overdue Tasks</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-heading font-bold text-red-700">{overdueTasks.length}</p>
          <p className="text-[11px] text-red-600 font-medium">Needs immediate call</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 bg-amber-50/30 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-800">
            <span>Due Today</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-heading font-bold text-amber-800">{todayTasks.length}</p>
          <p className="text-[11px] text-amber-700 font-medium">Scheduled for today</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sage/20 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-charcoal/60">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-heading font-bold text-emerald-800">{completedTasks.length}</p>
          <p className="text-[11px] text-emerald-700 font-medium">Resolved tasks</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-sage/20 shadow-xs">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeFilter === 'all' ? 'bg-forest text-white' : 'text-charcoal/70 hover:bg-ivory'
          }`}
        >
          All Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveFilter('overdue')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeFilter === 'overdue' ? 'bg-red-700 text-white' : 'text-charcoal/70 hover:bg-ivory'
          }`}
        >
          Overdue ({overdueTasks.length})
        </button>
        <button
          onClick={() => setActiveFilter('today')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeFilter === 'today' ? 'bg-amber-700 text-white' : 'text-charcoal/70 hover:bg-ivory'
          }`}
        >
          Due Today ({todayTasks.length})
        </button>
        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeFilter === 'upcoming' ? 'bg-forest text-white' : 'text-charcoal/70 hover:bg-ivory'
          }`}
        >
          Upcoming ({upcomingTasks.length})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeFilter === 'completed' ? 'bg-emerald-800 text-white' : 'text-charcoal/70 hover:bg-ivory'
          }`}
        >
          Completed ({completedTasks.length})
        </button>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-3xl border border-sage/20 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-charcoal/60">Loading follow-up tasks...</p>
          </div>
        ) : displayedTasks.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-heading font-bold text-forest text-base">No tasks in this view</h3>
            <p className="text-xs text-charcoal/60">Great job! All patient follow-up duties are up to date.</p>
          </div>
        ) : (
          <div className="divide-y divide-sage/15">
            {displayedTasks.map((t) => {
              const isCompleted = t.status === 'completed';
              return (
                <div
                  key={t.id}
                  className={`p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors ${
                    isCompleted ? 'bg-gray-50/60 opacity-70' : 'hover:bg-ivory/40'
                  }`}
                >
                  {/* Left: Checkbox & Task details */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(t.id, t.status)}
                      className={`mt-1 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-700 border-emerald-700 text-white'
                          : 'border-sage/40 hover:border-forest'
                      }`}
                    >
                      {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getPriorityBadge(t.priority)}`}>
                          {t.priority}
                        </span>
                        <h4 className={`font-heading font-bold text-forest text-sm sm:text-base ${isCompleted ? 'line-through text-charcoal/60' : ''}`}>
                          {t.title}
                        </h4>
                      </div>

                      {t.description && (
                        <p className="text-xs text-charcoal/70 leading-relaxed">
                          {t.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-charcoal/60 pt-1">
                        <span className="font-semibold text-charcoal flex items-center gap-1">
                          <span>Patient: {t.patient_name}</span>
                          <span className="font-mono text-[10px] text-gold-dark">({t.patient_code})</span>
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-forest" />
                          <span>Due: {t.due_date} {t.due_time ? `at ${t.due_time}` : ''}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Quick Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-sage/15">
                    {t.patient_phone && (
                      <a
                        href={`https://wa.me/${t.patient_phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] transition-all"
                        title="Chat on WhatsApp"
                      >
                        <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                      </a>
                    )}

                    {t.patient_id ? (
                      <Link
                        href={`/admin/patients/${t.patient_id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ivory hover:bg-forest hover:text-white text-forest text-xs font-semibold border border-sage/30 transition-all"
                      >
                        <span>Patient Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 text-[11px] font-medium">
                        Clinic Task
                      </span>
                    )}

                    <button
                      onClick={() => handleDeleteTask(t.id)}
                      className="p-1.5 rounded-lg text-charcoal/40 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-sage/30">
            <div className="flex items-center justify-between border-b border-sage/15 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-forest" />
                <h3 className="font-heading font-bold text-forest text-lg">Create Follow-up Task</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-charcoal/40 hover:text-charcoal">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Link to Patient (Optional)
                </label>
                <select
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-sage/30 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30 bg-white"
                >
                  <option value="">General Clinic Task (No Patient)</option>
                  {patientsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.patient_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call patient to check post-consultation response"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-sage/30 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-sage/30 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                    className="w-full px-3.5 py-2 rounded-xl border border-sage/30 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">Task Instructions / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Review chronic skin complaint notes before calling..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-sage/30 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-sage/15">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-sage/30 text-xs font-semibold text-charcoal hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
