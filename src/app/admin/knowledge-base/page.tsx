'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  Filter,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import type { ClinicFaq, KnowledgeCategory } from '@/types';

const CATEGORIES: { value: KnowledgeCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'doctor_information', label: 'Doctor Information' },
  { value: 'clinic_information', label: 'Clinic Information' },
  { value: 'clinic_timings', label: 'Clinic Timings' },
  { value: 'consultation_process', label: 'Consultation Process' },
  { value: 'treatment_guidance', label: 'Treatment Guidance' },
  { value: 'booking_policies', label: 'Booking Policies' },
  { value: 'homeopathy_general', label: 'Homeopathy Principles' },
];

export default function AdminKnowledgeBasePage() {
  const [faqs, setFaqs] = useState<ClinicFaq[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalFaq, setDeleteModalFaq] = useState<ClinicFaq | null>(null);
  const [editingFaq, setEditingFaq] = useState<Partial<ClinicFaq> | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchFaqs = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const url =
        categoryFilter && categoryFilter !== 'all'
          ? `/api/admin/knowledge-base?category=${encodeURIComponent(categoryFilter)}`
          : '/api/admin/knowledge-base';

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setFaqs(data.faqs || []);
      }
    } catch (err) {
      console.error('Failed to load FAQs:', err);
      setErrorMsg('Could not fetch knowledge base entries.');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFaqs();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchFaqs]);

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq?.question || !editingFaq?.answer) return;

    setActionLoading(true);
    const token = localStorage.getItem('vshma_admin_session');

    try {
      const isNew = !editingFaq.id;
      const url = '/api/admin/knowledge-base';
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingFaq),
      });

      if (res.ok) {
        setEditModalOpen(false);
        setEditingFaq(null);
        fetchFaqs();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save entry');
      }
    } catch (err) {
      console.error('Error saving FAQ:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFaq = async () => {
    if (!deleteModalFaq) return;
    setActionLoading(true);
    const token = localStorage.getItem('vshma_admin_session');

    try {
      const res = await fetch(`/api/admin/knowledge-base?id=${deleteModalFaq.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setDeleteModalFaq(null);
        fetchFaqs();
      }
    } catch (err) {
      console.error('Error deleting FAQ:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickToggle = async (faq: ClinicFaq, field: 'is_active' | 'is_doctor_approved') => {
    const token = localStorage.getItem('vshma_admin_session');
    const updated = { ...faq, [field]: !faq[field] };

    try {
      setFaqs((prev) => prev.map((f) => (f.id === faq.id ? updated : f)));
      await fetch('/api/admin/knowledge-base', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Quick toggle failed:', err);
      fetchFaqs();
    }
  };

  const filteredFaqs = faqs.filter((faq) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-forest" />
            <span>Clinic Knowledge Base</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Doctor-approved facts and answers used by the AI Care Assistant and patient reference.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingFaq({
                category: 'doctor_information',
                question: '',
                answer: '',
                is_active: true,
                is_doctor_approved: true,
              });
              setEditModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add New Entry</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={fetchFaqs}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search FAQs, clinical answers, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-xs"
          />
        </div>

        <div>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={CATEGORIES}
            className="h-10 text-xs"
          />
        </div>
      </div>

      {/* FAQs List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400">Loading knowledge base records...</div>
        ) : filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => (
            <div key={faq.id} className="p-5 sm:p-6 hover:bg-gray-50/50 transition-colors space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-forest/10 text-forest px-2.5 py-0.5 rounded-full">
                      {faq.category.replace(/_/g, ' ')}
                    </span>
                    {faq.is_doctor_approved ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Doctor Approved</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                        <HelpCircle className="w-3 h-3 text-amber-600" />
                        <span>Needs Review</span>
                      </span>
                    )}
                    {!faq.is_active && (
                      <span className="text-[10px] uppercase font-bold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md">
                        Inactive
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base pt-1">
                    {faq.question}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                  <button
                    onClick={() => handleQuickToggle(faq, 'is_doctor_approved')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors ${
                      faq.is_doctor_approved
                        ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                        : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'
                    }`}
                    title="Toggle Doctor Approval"
                  >
                    {faq.is_doctor_approved ? 'Approved' : 'Mark Approved'}
                  </button>
                  <button
                    onClick={() => handleQuickToggle(faq, 'is_active')}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors ${
                      faq.is_active
                        ? 'border-forest/30 text-forest bg-forest/5'
                        : 'border-gray-200 text-gray-400 bg-gray-50'
                    }`}
                    title="Toggle Active Status"
                  >
                    {faq.is_active ? 'Active' : 'Draft'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingFaq(faq);
                      setEditModalOpen(true);
                    }}
                    className="p-1.5 text-gray-500 hover:text-forest hover:bg-mint rounded-lg transition-colors"
                    title="Edit Entry"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteModalFaq(faq)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                {faq.answer}
              </p>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-sm text-gray-400">
            No entries found in this category.
          </div>
        )}
      </div>

      {/* Edit / Add Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={editingFaq?.id ? 'Edit Knowledge Base Entry' : 'Create Knowledge Base Entry'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveFaq} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <Select
              value={editingFaq?.category || 'doctor_information'}
              onChange={(e) =>
                setEditingFaq((prev) => ({ ...prev, category: e.target.value as KnowledgeCategory }))
              }
              options={CATEGORIES.filter((c) => c.value !== 'all')}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Patient Question / Clinical Query
            </label>
            <Input
              value={editingFaq?.question || ''}
              onChange={(e) => setEditingFaq((prev) => ({ ...prev, question: e.target.value }))}
              placeholder="e.g., How does constitutional homeopathy work?"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Doctor-Approved Answer
            </label>
            <textarea
              value={editingFaq?.answer || ''}
              onChange={(e) => setEditingFaq((prev) => ({ ...prev, answer: e.target.value }))}
              placeholder="Provide clear, accurate clinical explanation without unrealistic promises..."
              rows={4}
              required
              className="w-full text-xs rounded-xl border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={editingFaq?.is_doctor_approved ?? true}
                onChange={(e) =>
                  setEditingFaq((prev) => ({ ...prev, is_doctor_approved: e.target.checked }))
                }
                className="w-4 h-4 text-forest rounded"
              />
              <span>Doctor Approved</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={editingFaq?.is_active ?? true}
                onChange={(e) =>
                  setEditingFaq((prev) => ({ ...prev, is_active: e.target.checked }))
                }
                className="w-4 h-4 text-forest rounded"
              />
              <span>Active for Assistant</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button variant="secondary" size="sm" type="button" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Knowledge Entry'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModalFaq}
        onClose={() => setDeleteModalFaq(null)}
        title="Delete Knowledge Entry"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-gray-600">
            Are you sure you want to delete this FAQ: &quot;{deleteModalFaq?.question}&quot;?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setDeleteModalFaq(null)}>
              Keep Entry
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteFaq} disabled={actionLoading}>
              {actionLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
