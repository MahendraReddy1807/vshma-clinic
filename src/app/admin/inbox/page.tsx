'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Send,
  Check,
  CheckCheck,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Plus,
  Users,
  MessageSquare,
  X,
  Mail,
  Calendar,
  CheckSquare,
  FileText,
  UserCheck,
  Archive,
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import type { InboxConversationItem } from '@/app/api/admin/crm/inbox/conversations/route';
import type { ConversationMessageItem } from '@/app/api/admin/crm/inbox/conversations/[id]/messages/route';

const QUICK_REPLIES = [
  {
    label: 'Appointment Confirmed',
    text: 'Dear patient, your appointment with Dr. Chihnitha Reddy T at VSHMA Homeopathy Clinic has been confirmed. Please arrive 10 minutes prior to your scheduled slot.',
  },
  {
    label: 'Clinic Location & Directions',
    text: 'VSHMA Homeopathy Clinic is located in Bengaluru, Karnataka, India. Clinic consultations are by prior appointment. Map & directions: https://vshma.in/contact',
  },
  {
    label: 'Clinic Working Hours',
    text: 'Our consultation hours are Monday to Saturday, 9:00 AM to 7:00 PM IST. Sundays are reserved for special appointments.',
  },
  {
    label: 'Consultation Intake Note',
    text: 'Thank you for contacting VSHMA. To help Dr. Chihnitha prepare for your consultation, please share your primary health concern and whether you have previous medical records.',
  },
];

interface QuickPatient {
  id: string;
  full_name: string;
  patient_id: string;
  phone: string;
  whatsapp_opt_in: boolean;
}

export default function UnifiedInboxPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<InboxConversationItem[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessageItem[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Status & Channel Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'open' | 'pending' | 'closed'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | 'whatsapp' | 'email'>('all');
  const [dbError, setDbError] = useState('');

  // Mobile View Switcher
  const [mobileTab, setMobileTab] = useState<'list' | 'chat' | 'dossier'>('list');

  // Composer State
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [retryingMsgId, setRetryingMsgId] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = false) => {
    if (messagesContainerRef.current) {
      if (smooth) {
        messagesContainerRef.current.scrollTo({
          top: messagesContainerRef.current.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      }
    }
  };

  // Modals
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [patientList, setPatientList] = useState<QuickPatient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [initialChatMessage, setInitialChatMessage] = useState('');
  const [startingChat, setStartingChat] = useState(false);
  const [newChatError, setNewChatError] = useState('');

  // Appointment Modal
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [apptDate, setApptDate] = useState(new Date().toISOString().split('T')[0]);
  const [apptTime, setApptTime] = useState('10:30 AM');
  const [apptType, setApptType] = useState('General Consultation');
  const [apptNotes, setApptNotes] = useState('');
  const [creatingAppt, setCreatingAppt] = useState(false);
  const [apptSuccess, setApptSuccess] = useState('');
  const [apptError, setApptError] = useState('');

  // Note Modal
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isNotePrivate, setIsNotePrivate] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState('');
  const [noteError, setNoteError] = useState('');

  // Task Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [savingTask, setSavingTask] = useState(false);
  const [taskSuccess, setTaskSuccess] = useState('');
  const [taskError, setTaskError] = useState('');

  // Ambiguity Resolution Modal
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolvingPatientId, setResolvingPatientId] = useState('');
  const [resolvingAmbiguity, setResolvingAmbiguity] = useState(false);

  // 1. Fetch Conversations
  const refetchConversations = useCallback(async () => {
    setLoadingConvs(true);
    setDbError('');
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      if (statusFilter !== 'all') params.set('filter', statusFilter);
      if (channelFilter !== 'all') params.set('channel', channelFilter);

      const res = await fetch(`/api/admin/crm/inbox/conversations?${params.toString()}`, {
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
        setDbError(errData.details || errData.error || 'Failed to load conversations');
        setConversations([]);
        return;
      }

      const data = await res.json();
      const list: InboxConversationItem[] = data.conversations || [];
      setConversations(list);

      if (list.length > 0) {
        setSelectedConvId((prev) => (prev && list.some((c) => c.id === prev) ? prev : list[0].id));
      } else {
        setSelectedConvId(null);
      }
    } catch {
      setDbError('Could not connect to conversation service. Please verify network and database status.');
      setConversations([]);
    } finally {
      setLoadingConvs(false);
    }
  }, [searchQuery, statusFilter, channelFilter, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void refetchConversations();
    }, 0);
    return () => clearTimeout(timer);
  }, [refetchConversations]);

  // 2. Fetch Messages for Selected Thread
  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      if (!selectedConvId) {
        if (isMounted) setMessages([]);
        return;
      }

      setLoadingMsgs(true);
      setSendError('');
      const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;

      try {
        const res = await fetch(`/api/admin/crm/inbox/conversations/${selectedConvId}/messages`, {
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
          if (isMounted) {
            setSendError(errData.error || 'Failed to load messages');
            setMessages([]);
          }
          return;
        }

        const data = await res.json();
        if (isMounted) {
          setMessages(data.messages || []);
          setTimeout(() => {
            scrollToBottom();
          }, 50);
        }
      } catch {
        if (isMounted) {
          setSendError('Failed to fetch messages for this thread.');
          setMessages([]);
        }
      } finally {
        if (isMounted) setLoadingMsgs(false);
      }
    };

    const timer = setTimeout(() => {
      void fetchMessages();
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedConvId, router]);

  const selectedConv = conversations.find((c) => c.id === selectedConvId) || null;

  // 3. Send Staff Reply via Green API
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !selectedConv || isSending) return;

    setIsSending(true);
    setSendError('');
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
    const textToSend = replyText.trim();

    try {
      const res = await fetch(`/api/admin/crm/inbox/conversations/${selectedConv.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          message_text: textToSend,
          recipient_phone: selectedConv.phone,
          patient_id: selectedConv.patient_id,
        }),
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('vshma_admin_session');
        localStorage.removeItem('vshma_admin_email');
        router.push('/admin/login');
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Provider rejected message transmission');
      }

      setReplyText('');
      // Optimistically append outgoing message
      const optimisticMsg: ConversationMessageItem = {
        id: data.messageId || `msg-out-${selectedConv.id}`,
        conversation_id: selectedConv.id,
        patient_id: selectedConv.patient_id,
        channel: selectedConv.channel,
        direction: 'outbound',
        sender_type: 'staff',
        message_body: textToSend,
        message_type: 'text',
        status: data.status || 'sent',
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);
      setTimeout(() => scrollToBottom(true), 50);

      // Refresh thread preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? {
              ...c,
              last_message_preview: textToSend,
              last_message_at: new Date().toISOString(),
              last_message_direction: 'outbound',
            }
            : c
        )
      );
    } catch (err: unknown) {
      setSendError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSending(false);
    }
  };

  // 4. Retry Failed Message
  const handleRetryMessage = async (msg: ConversationMessageItem) => {
    if (!selectedConv || retryingMsgId) return;
    setRetryingMsgId(msg.id);
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;

    try {
      const res = await fetch(`/api/admin/crm/inbox/conversations/${selectedConv.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          message_text: msg.message_body,
          recipient_phone: selectedConv.phone,
          patient_id: selectedConv.patient_id,
          retry_message_id: msg.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, status: 'sent', error_message: null } : m))
        );
      } else {
        setSendError(data.error || 'Retry failed');
      }
    } catch {
      setSendError('Failed to retry message.');
    } finally {
      setRetryingMsgId(null);
    }
  };

  // 5. Toggle Status (Close / Reopen)
  const handleToggleStatus = async () => {
    if (!selectedConv) return;
    const newStatus = selectedConv.status === 'archived' ? 'active' : 'archived';
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;

    try {
      const res = await fetch(`/api/admin/crm/inbox/conversations/${selectedConv.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConv.id ? { ...c, status: newStatus } : c))
        );
      }
    } catch {
      // Safe fallback
    }
  };

  // 6. Schedule Appointment from Conversation
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || creatingAppt) return;
    setCreatingAppt(true);
    setApptError('');
    setApptSuccess('');

    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
    try {
      const res = await fetch(`/api/admin/crm/inbox/conversations/${selectedConv.id}/appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          appointment_date: apptDate,
          preferred_time: apptTime,
          consultation_type: apptType,
          notes: apptNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create appointment');
      }

      setApptSuccess(`Appointment created: ${data.booking_reference} (Status: Pending)`);
      setTimeout(() => {
        setIsApptModalOpen(false);
        setApptSuccess('');
        setApptNotes('');
      }, 1500);
      refetchConversations();
    } catch (err: unknown) {
      setApptError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreatingAppt(false);
    }
  };

  // 7. Add Clinical Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || savingNote) return;
    setSavingNote(true);
    setNoteError('');
    setNoteSuccess('');

    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
    try {
      const res = await fetch(`/api/admin/crm/inbox/conversations/${selectedConv.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          note_content: noteContent,
          is_private: isNotePrivate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save clinical note');
      }

      setNoteSuccess('Note saved successfully to patient dossier.');
      setTimeout(() => {
        setIsNoteModalOpen(false);
        setNoteSuccess('');
        setNoteContent('');
      }, 1200);
    } catch (err: unknown) {
      setNoteError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingNote(false);
    }
  };

  // 8. Create Follow-up Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConv || savingTask) return;
    setSavingTask(true);
    setTaskError('');
    setTaskSuccess('');

    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
    try {
      const res = await fetch(`/api/admin/crm/inbox/conversations/${selectedConv.id}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDesc,
          due_date: taskDueDate,
          priority: taskPriority,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to schedule task');
      }

      setTaskSuccess('Follow-up task created successfully.');
      setTimeout(() => {
        setIsTaskModalOpen(false);
        setTaskSuccess('');
        setTaskTitle('');
        setTaskDesc('');
      }, 1200);
    } catch (err: unknown) {
      setTaskError(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingTask(false);
    }
  };

  // 9. Resolve Ambiguity (Link to specific family member)
  const handleResolveAmbiguity = async () => {
    if (!selectedConv || !resolvingPatientId || resolvingAmbiguity) return;
    setResolvingAmbiguity(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;

    try {
      const res = await fetch(`/api/admin/crm/inbox/conversations/${selectedConv.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ patient_id: resolvingPatientId }),
      });

      if (res.ok) {
        setIsResolveModalOpen(false);
        refetchConversations();
      }
    } catch {
      // Safe fallback
    } finally {
      setResolvingAmbiguity(false);
    }
  };

  // 10. Load Patient Directory for Modals
  const loadPatientDirectory = async () => {
    setLoadingPatients(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
    try {
      const res = await fetch('/api/admin/crm/patients?limit=50', {
        headers: { Authorization: `Bearer ${token || ''}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPatientList(data.patients || []);
      }
    } catch {
      // ignore
    } finally {
      setLoadingPatients(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-light text-forest tracking-tight">Unified Patient Inbox</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-800 text-white font-semibold flex items-center gap-1">
              <WhatsAppIcon className="w-3 h-3 text-[#25D366]" />
              <span>Green API Connected</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal/70 mt-0.5">
            Two-way patient WhatsApp communication, clinical appointment booking, and persistent patient context.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              loadPatientDirectory();
              setIsNewChatModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Conversation</span>
          </button>

          <button
            onClick={refetchConversations}
            disabled={loadingConvs}
            className="p-2.5 rounded-xl border border-sage/30 bg-white text-charcoal hover:bg-ivory hover:text-forest transition-colors shadow-2xs"
            title="Refresh Inbox"
          >
            <RefreshCw className={`w-4 h-4 ${loadingConvs ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Database Error Banner */}
      {dbError && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Inbox Notice</p>
              <p className="text-[11px] text-amber-800 mt-0.5">{dbError}</p>
            </div>
          </div>
          <button
            onClick={() => refetchConversations()}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 font-semibold text-amber-900 hover:bg-amber-100 transition-colors shrink-0 shadow-2xs"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden bg-white p-1 rounded-2xl border border-sage/20 text-xs font-semibold shadow-2xs">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 py-1.5 rounded-xl transition-all ${mobileTab === 'list' ? 'bg-forest text-white' : 'text-charcoal/70'
            }`}
        >
          Conversations ({conversations.length})
        </button>
        <button
          onClick={() => setMobileTab('chat')}
          disabled={!selectedConv}
          className={`flex-1 py-1.5 rounded-xl transition-all ${mobileTab === 'chat' ? 'bg-forest text-white' : 'text-charcoal/70 disabled:opacity-40'
            }`}
        >
          Active Chat
        </button>
        <button
          onClick={() => setMobileTab('dossier')}
          disabled={!selectedConv}
          className={`flex-1 py-1.5 rounded-xl transition-all ${mobileTab === 'dossier' ? 'bg-forest text-white' : 'text-charcoal/70 disabled:opacity-40'
            }`}
        >
          Patient Dossier
        </button>
      </div>

      {/* 3-Panel Layout Container */}
      <div className="bg-white rounded-3xl border border-sage/20 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[calc(100vh-14rem)] min-h-[640px]">
        {/* ============================================================ */}
        {/* PANEL 1 (LEFT): CONVERSATION LIST (4 cols on desktop) */}
        {/* ============================================================ */}
        <div
          className={`md:col-span-4 border-r border-sage/20 flex flex-col bg-ivory/20 h-full min-h-0 overflow-hidden ${mobileTab === 'list' ? 'flex' : 'hidden md:flex'
            }`}
        >
          {/* Search Bar */}
          <div className="p-3 border-b border-sage/15 space-y-2 shrink-0 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                type="text"
                placeholder="Search patient, phone, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-sage/30 bg-ivory/40 text-xs text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-forest/30"
              />
            </div>

            {/* Status & Channel Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[11px] font-semibold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-0.8 rounded-lg whitespace-nowrap transition-colors ${statusFilter === 'all' ? 'bg-forest text-white' : 'bg-ivory text-charcoal/70 hover:bg-sage/15'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter('unread')}
                className={`px-2 py-0.8 rounded-lg whitespace-nowrap transition-colors ${statusFilter === 'unread' ? 'bg-forest text-white' : 'bg-ivory text-charcoal/70 hover:bg-sage/15'
                  }`}
              >
                Unread
              </button>
              <button
                onClick={() => setStatusFilter('open')}
                className={`px-2 py-0.8 rounded-lg whitespace-nowrap transition-colors ${statusFilter === 'open' ? 'bg-forest text-white' : 'bg-ivory text-charcoal/70 hover:bg-sage/15'
                  }`}
              >
                Open
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-2 py-0.8 rounded-lg whitespace-nowrap transition-colors ${statusFilter === 'pending' ? 'bg-forest text-white' : 'bg-ivory text-charcoal/70 hover:bg-sage/15'
                  }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter('closed')}
                className={`px-2 py-0.8 rounded-lg whitespace-nowrap transition-colors ${statusFilter === 'closed' ? 'bg-forest text-white' : 'bg-ivory text-charcoal/70 hover:bg-sage/15'
                  }`}
              >
                Closed
              </button>
              <span className="text-sage/40">|</span>
              <button
                onClick={() => setChannelFilter('all')}
                className={`px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${channelFilter === 'all' ? 'bg-forest/15 text-forest font-bold' : 'text-charcoal/50 hover:text-charcoal'
                  }`}
              >
                All Ch.
              </button>
              <button
                onClick={() => setChannelFilter('whatsapp')}
                className={`px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${channelFilter === 'whatsapp' ? 'bg-emerald-600 text-white font-bold' : 'text-charcoal/50 hover:text-emerald-700'
                  }`}
              >
                WA
              </button>
              <button
                onClick={() => setChannelFilter('email')}
                className={`px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${channelFilter === 'email' ? 'bg-blue-600 text-white font-bold' : 'text-charcoal/50 hover:text-blue-700'
                  }`}
              >
                Email
              </button>
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-sage/10 bg-ivory/10">
            {loadingConvs ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[11px] text-charcoal/60">Loading conversation threads...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <MessageSquare className="w-8 h-8 text-sage mx-auto" />
                <p className="text-xs text-charcoal/60 font-medium">No matching conversations.</p>
                <button
                  onClick={() => {
                    loadPatientDirectory();
                    setIsNewChatModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest text-white text-[11px] font-semibold hover:bg-forest-light transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Start New Chat</span>
                </button>
              </div>
            ) : (
              conversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                const isClosed = conv.status === 'archived';

                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setMobileTab('chat');
                    }}
                    className={`w-full text-left p-3.5 transition-colors cursor-pointer flex items-start gap-2.5 ${isSelected ? 'bg-white border-l-4 border-forest shadow-2xs' : 'hover:bg-white/80'
                      }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-forest text-white flex items-center justify-center shrink-0 font-heading font-bold text-xs">
                      {conv.patient_name.slice(0, 1)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-heading font-bold text-forest text-xs truncate">
                          {conv.patient_name}
                        </span>
                        <span className="text-[10px] text-charcoal/40 shrink-0 font-sans">
                          {new Date(conv.last_message_at).toLocaleTimeString('en-IN', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-[11px] text-charcoal/70 truncate mt-0.5">
                        {conv.last_message_preview}
                      </p>

                      <div className="flex items-center justify-between mt-1.5 text-[10px]">
                        <span className="inline-flex items-center gap-1 font-mono text-sage-dark">
                          {conv.channel === 'whatsapp' ? (
                            <WhatsAppIcon className="w-3 h-3 text-[#25D366]" />
                          ) : (
                            <Mail className="w-3 h-3 text-forest" />
                          )}
                          <span>{conv.phone}</span>
                        </span>

                        <div className="flex items-center gap-1">
                          {conv.is_flagged_ambiguous && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold text-[9px]">
                              Ambiguous
                            </span>
                          )}

                          {isClosed ? (
                            <span className="px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-600 font-semibold text-[9px]">
                              Closed
                            </span>
                          ) : conv.unread_count > 0 ? (
                            <span className="px-1.5 py-0.2 rounded-full bg-emerald-700 text-white font-bold text-[10px]">
                              {conv.unread_count}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* PANEL 2 (MIDDLE): CHAT THREAD & COMPOSER (5 cols on desktop) */}
        {/* ============================================================ */}
        <div
          className={`md:col-span-5 flex flex-col border-r border-sage/20 bg-white h-full min-h-0 overflow-hidden ${mobileTab === 'chat' ? 'flex' : 'hidden md:flex'
            }`}
        >
          {/* Thread Header */}
          <div className="p-3.5 border-b border-sage/15 flex items-center justify-between bg-white shrink-0">
            {selectedConv ? (
              <>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setMobileTab('list')}
                    className="md:hidden p-1 rounded-lg text-charcoal/60 hover:bg-ivory"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {selectedConv.patient_name.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-forest text-sm flex items-center gap-1.5">
                      <span>{selectedConv.patient_name}</span>
                      {selectedConv.status === 'archived' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-gray-100 text-gray-600 font-sans font-normal">
                          Closed
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-charcoal/60">
                      <span className="font-mono">{selectedConv.phone}</span>
                      <span>&bull;</span>
                      <span className="text-emerald-800 font-semibold flex items-center gap-1">
                        <WhatsAppIcon className="w-3 h-3 text-[#25D366]" />
                        <span>Green API Direct</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleStatus}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 border ${selectedConv.status === 'archived'
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'border-sage/30 bg-white text-charcoal/70 hover:bg-ivory'
                      }`}
                  >
                    {selectedConv.status === 'archived' ? (
                      <>
                        <RotateCcw className="w-3 h-3" />
                        <span>Reopen</span>
                      </>
                    ) : (
                      <>
                        <Archive className="w-3 h-3" />
                        <span>Close</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setMobileTab('dossier')}
                    className="md:hidden px-2 py-1 rounded-lg bg-forest/10 text-forest text-[11px] font-semibold"
                  >
                    Profile
                  </button>
                </div>
              </>
            ) : (
              <span className="text-xs text-charcoal/50">Select a conversation thread</span>
            )}
          </div>

          {/* Shared Family Phone Ambiguity Banner */}
          {selectedConv?.is_flagged_ambiguous && (
            <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900 shrink-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[11px] font-medium leading-tight">
                  Shared family phone number. Manual staff review required before linking records.
                </span>
              </div>
              <button
                onClick={() => {
                  loadPatientDirectory();
                  setIsResolveModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 font-semibold text-[10px] text-amber-900 hover:bg-amber-100 shrink-0"
              >
                Link Member
              </button>
            </div>
          )}

          {/* Messages Feed */}
          <div ref={messagesContainerRef} className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3 bg-[#FAF8F5]">
            {!selectedConv && !loadingConvs ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
                  <WhatsAppIcon className="w-6 h-6 text-[#25D366]" />
                </div>
                <h3 className="font-heading font-bold text-forest text-base">No Conversation Selected</h3>
                <p className="text-xs text-charcoal/60 max-w-xs">
                  Choose a thread from the left or initiate a new WhatsApp conversation with a registered patient.
                </p>
              </div>
            ) : loadingMsgs ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-forest border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[11px] text-charcoal/60">Retrieving message history...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal/50">
                No previous messages found in this communication thread.
              </div>
            ) : (
              messages.map((m) => {
                const isOutbound = m.direction === 'outbound';
                const isFailed = m.status === 'failed';

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs ${isOutbound
                        ? isFailed
                          ? 'bg-red-800 text-white rounded-br-xs'
                          : 'bg-forest text-white rounded-br-xs'
                        : 'bg-white text-charcoal border border-sage/20 rounded-bl-xs'
                        }`}
                    >
                      <p className="whitespace-pre-line">{m.message_body}</p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-charcoal/50 mt-1 px-1">
                      <span>
                        {new Date(m.created_at).toLocaleTimeString('en-IN', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>

                      {isOutbound && (
                        <div className="flex items-center gap-1">
                          {m.status === 'read' ? (
                            <span title="Read by patient"><CheckCheck className="w-3.5 h-3.5 text-[#25D366]" /></span>
                          ) : m.status === 'delivered' ? (
                            <span title="Delivered to WhatsApp"><CheckCheck className="w-3.5 h-3.5 text-charcoal/50" /></span>
                          ) : isFailed ? (
                            <div className="flex items-center gap-1">
                              <span className="text-red-600 font-semibold">Failed</span>
                              <button
                                onClick={() => handleRetryMessage(m)}
                                disabled={retryingMsgId === m.id}
                                className="text-forest hover:underline font-semibold flex items-center gap-0.5 ml-1"
                              >
                                <RotateCcw className={`w-3 h-3 ${retryingMsgId === m.id ? 'animate-spin' : ''}`} />
                                <span>Retry</span>
                              </button>
                            </div>
                          ) : (
                            <span title="Sent from CRM"><Check className="w-3.5 h-3.5 text-charcoal/40" /></span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Replies Tray */}
          <div className="px-3 py-2 bg-white border-t border-sage/15 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
            <span className="text-[10px] font-bold text-gold uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-gold" />
              <span>Quick:</span>
            </span>
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr.label}
                type="button"
                disabled={!selectedConv || isSending}
                onClick={() => setReplyText(qr.text)}
                className="px-2.5 py-1 rounded-lg bg-ivory hover:bg-forest/10 border border-sage/25 text-[11px] text-charcoal font-medium whitespace-nowrap transition-colors disabled:opacity-40"
              >
                {qr.label}
              </button>
            ))}
          </div>

          {/* Reply Composer */}
          <div className="p-3 bg-white border-t border-sage/15 shrink-0 space-y-2">
            {sendError && (
              <div className="text-[11px] text-red-700 bg-red-50/90 border border-red-200/80 p-2.5 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-0.5">
                  <p className="font-semibold text-red-800">WhatsApp Delivery Failed</p>
                  <p className="leading-relaxed">{sendError}</p>
                </div>
                <button
                  onClick={() => setSendError('')}
                  className="text-red-400 hover:text-red-700 p-0.5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={selectedConv ? 'Type your WhatsApp reply...' : 'Select a conversation...'}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={!selectedConv || isSending}
                className="flex-1 px-3.5 py-2 rounded-xl bg-ivory/60 border border-sage/30 text-xs sm:text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/30 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!selectedConv || !replyText.trim() || isSending}
                className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-gold" />
                <span>{isSending ? 'Sending...' : 'Send'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PANEL 3 (RIGHT): PATIENT DOSSIER CONTEXT (3 cols on desktop) */}
        {/* ============================================================ */}
        <div
          className={`md:col-span-3 p-4 bg-white border-l border-sage/20 space-y-4 h-full min-h-0 overflow-y-auto ${mobileTab === 'dossier' ? 'block' : 'hidden md:block'
            }`}
        >
          {selectedConv ? (
            <>
              {/* Header Profile */}
              <div>
                <span className="font-mono text-[10px] font-semibold text-gold-dark bg-gold/15 px-2 py-0.5 rounded-md">
                  {selectedConv.patient_code}
                </span>
                <h3 className="font-heading font-bold text-forest text-base sm:text-lg mt-1">
                  {selectedConv.patient_name}
                </h3>
                <p className="text-xs text-charcoal/60 mt-0.5">{selectedConv.phone}</p>
                {selectedConv.email && (
                  <p className="text-[11px] text-charcoal/50 truncate">{selectedConv.email}</p>
                )}
              </div>

              {/* Patient Dossier Stats */}
              <div className="p-3 rounded-2xl bg-ivory border border-sage/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-charcoal/60">WhatsApp Consent:</span>
                  <span
                    className={`font-semibold ${selectedConv.whatsapp_opt_in ? 'text-emerald-800' : 'text-amber-800'
                      }`}
                  >
                    {selectedConv.whatsapp_opt_in ? 'Opted In' : 'Not Opted In'}
                  </span>
                </div>

                {selectedConv.whatsapp_opt_in_source && (
                  <div className="flex items-center justify-between border-t border-sage/15 pt-1.5 text-[11px]">
                    <span className="text-charcoal/60">Consent Source:</span>
                    <span className="font-mono text-charcoal/80">
                      {selectedConv.whatsapp_opt_in_source}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-sage/15 pt-1.5">
                  <span className="text-charcoal/60">Appointments:</span>
                  <span className="font-bold text-forest">
                    {selectedConv.total_appointments || 0}
                  </span>
                </div>

                {selectedConv.latest_appointment && (
                  <div className="border-t border-sage/15 pt-1.5 space-y-1">
                    <span className="text-charcoal/60 text-[11px] block">Latest Appointment:</span>
                    <div className="p-2 rounded-xl bg-white border border-sage/15">
                      <p className="font-semibold text-forest text-[11px]">
                        {selectedConv.latest_appointment.date} &bull; {selectedConv.latest_appointment.time}
                      </p>
                      <p className="text-[10px] text-charcoal/60">
                        {selectedConv.latest_appointment.consultationType} ({selectedConv.latest_appointment.status})
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions Action Grid */}
              <div className="space-y-2 pt-2 border-t border-sage/15">
                <p className="text-[10px] font-bold text-charcoal/50 uppercase tracking-wider">
                  Quick Actions
                </p>

                {/* 1. Schedule Appointment */}
                <button
                  onClick={() => setIsApptModalOpen(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold transition-colors shadow-2xs"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gold" />
                    <span>Create Appointment</span>
                  </span>
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {/* 2. Add Internal Clinical Note */}
                <button
                  onClick={() => setIsNoteModalOpen(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-ivory hover:bg-forest/10 border border-sage/30 text-charcoal text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-forest" />
                    <span>Add Internal Note</span>
                  </span>
                  <Plus className="w-3.5 h-3.5 text-charcoal/50" />
                </button>

                {/* 3. Create Follow-up Task */}
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-ivory hover:bg-forest/10 border border-sage/30 text-charcoal text-xs font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-forest" />
                    <span>Create Follow-up</span>
                  </span>
                  <Plus className="w-3.5 h-3.5 text-charcoal/50" />
                </button>

                {/* 4. Open Full Patient Dossier */}
                {selectedConv.patient_id && (
                  <Link
                    href={`/admin/patients/${selectedConv.patient_id}`}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-forest/5 hover:bg-forest/10 text-forest text-xs font-semibold transition-colors"
                  >
                    <span>View Full Patient Dossier</span>
                    <Users className="w-3.5 h-3.5" />
                  </Link>
                )}

                {/* 5. Direct WhatsApp Web */}
                <a
                  href={`https://wa.me/${selectedConv.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors"
                >
                  <span>Open in WhatsApp Web</span>
                  <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                </a>
              </div>
            </>
          ) : (
            <div className="p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-forest/10 text-forest flex items-center justify-center mx-auto">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-bold text-forest text-sm">Patient Context</h4>
              <p className="text-xs text-charcoal/60">
                Select a thread to view appointment history, WhatsApp consent records, and trigger clinic actions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Schedule Appointment Directly from Conversation */}
      {isApptModalOpen && selectedConv && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-sage/30">
            <div className="flex items-center justify-between border-b border-sage/20 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-forest" />
                <h3 className="font-heading font-bold text-forest text-base">Create Appointment Request</h3>
              </div>
              <button
                onClick={() => setIsApptModalOpen(false)}
                className="p-1 rounded-lg text-charcoal/50 hover:bg-ivory hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-charcoal/70">
              Booking for <strong>{selectedConv.patient_name}</strong> ({selectedConv.phone}). Follows standard clinic workflow: starts as <strong>Pending</strong>.
            </p>

            {apptSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                {apptSuccess}
              </div>
            )}
            {apptError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                {apptError}
              </div>
            )}

            <form onSubmit={handleCreateAppointment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Appointment Date *</label>
                <input
                  type="date"
                  value={apptDate}
                  onChange={(e) => setApptDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-sage/30 bg-white text-xs text-charcoal focus:ring-2 focus:ring-forest/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Preferred Time Window *</label>
                <input
                  type="text"
                  value={apptTime}
                  onChange={(e) => setApptTime(e.target.value)}
                  required
                  placeholder="e.g. 10:30 AM or 2:00 PM - 4:00 PM"
                  className="w-full px-3.5 py-2 rounded-xl border border-sage/30 bg-white text-xs text-charcoal focus:ring-2 focus:ring-forest/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Consultation Type *</label>
                <select
                  value={apptType}
                  onChange={(e) => setApptType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-sage/30 bg-white text-xs text-charcoal focus:ring-2 focus:ring-forest/30"
                >
                  <option value="General Consultation">General Consultation</option>
                  <option value="Chronic Condition Totality">Chronic Condition Totality</option>
                  <option value="Pediatric Homeopathy">Pediatric Homeopathy</option>
                  <option value="Women Health Consultation">Women Health Consultation</option>
                  <option value="Follow-up Review">Follow-up Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Notes / Primary Complaint</label>
                <textarea
                  rows={2}
                  value={apptNotes}
                  onChange={(e) => setApptNotes(e.target.value)}
                  placeholder="Details mentioned by patient in chat..."
                  className="w-full px-3.5 py-2 rounded-xl border border-sage/30 bg-white text-xs text-charcoal focus:ring-2 focus:ring-forest/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApptModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-sage/30 text-xs font-semibold text-charcoal hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAppt}
                  className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold disabled:opacity-50"
                >
                  {creatingAppt ? 'Creating...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Clinical Note */}
      {isNoteModalOpen && selectedConv && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-sage/30">
            <div className="flex items-center justify-between border-b border-sage/20 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-forest" />
                <h3 className="font-heading font-bold text-forest text-base">Add Clinical Note</h3>
              </div>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1 rounded-lg text-charcoal/50 hover:bg-ivory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {noteSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                {noteSuccess}
              </div>
            )}
            {noteError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                {noteError}
              </div>
            )}

            <form onSubmit={handleAddNote} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Internal Note Content *</label>
                <textarea
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  required
                  placeholder="Record patient complaint, medicine reaction, or case-taking observation..."
                  className="w-full px-3.5 py-2 rounded-xl border border-sage/30 bg-white text-xs text-charcoal focus:ring-2 focus:ring-forest/30"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notePrivate"
                  checked={isNotePrivate}
                  onChange={(e) => setIsNotePrivate(e.target.checked)}
                  className="rounded text-forest focus:ring-forest"
                />
                <label htmlFor="notePrivate" className="text-xs text-charcoal/80 cursor-pointer">
                  Private clinical note (Doctor/Admin only)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-sage/30 text-xs font-semibold text-charcoal hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingNote || !noteContent.trim()}
                  className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold disabled:opacity-50"
                >
                  {savingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Create Follow-up Task */}
      {isTaskModalOpen && selectedConv && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-sage/30">
            <div className="flex items-center justify-between border-b border-sage/20 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-forest" />
                <h3 className="font-heading font-bold text-forest text-base">Create Follow-up Task</h3>
              </div>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 rounded-lg text-charcoal/50 hover:bg-ivory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {taskSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
                {taskSuccess}
              </div>
            )}
            {taskError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                {taskError}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Task Title *</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  placeholder="e.g. Check skin remedy reaction in 3 days"
                  className="w-full px-3.5 py-2 rounded-xl border border-sage/30 bg-white text-xs text-charcoal focus:ring-2 focus:ring-forest/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Due Date *</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-sage/30 bg-white text-xs text-charcoal focus:ring-2 focus:ring-forest/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                  className="w-full px-3.5 py-2 rounded-xl border border-sage/30 bg-white text-xs text-charcoal focus:ring-2 focus:ring-forest/30"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="Details for the clinic receptionist or doctor..."
                  className="w-full px-3.5 py-2 rounded-xl border border-sage/30 bg-white text-xs text-charcoal focus:ring-2 focus:ring-forest/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-sage/30 text-xs font-semibold text-charcoal hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingTask || !taskTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold disabled:opacity-50"
                >
                  {savingTask ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Start New Chat */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-sage/30">
            <div className="flex items-center justify-between border-b border-sage/20 pb-3">
              <div className="flex items-center gap-2">
                <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                <h3 className="font-heading font-bold text-forest text-base">New WhatsApp Conversation</h3>
              </div>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1 rounded-lg text-charcoal/50 hover:bg-ivory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {newChatError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs">
                {newChatError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Select Patient *</label>
              {loadingPatients ? (
                <div className="text-xs text-charcoal/60 py-2">Loading directory...</div>
              ) : patientList.length === 0 ? (
                <div className="text-xs text-charcoal/60 py-2">
                  No registered patients found.
                </div>
              ) : (
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-sage/30 bg-white text-xs text-charcoal focus:ring-2 focus:ring-forest/30"
                >
                  <option value="">-- Choose Patient --</option>
                  {patientList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.phone})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Opening Message</label>
              <textarea
                rows={3}
                value={initialChatMessage}
                onChange={(e) => setInitialChatMessage(e.target.value)}
                placeholder="Hello! Reaching out from VSHMA Homeopathy Clinic regarding your consultation..."
                className="w-full px-3.5 py-2 rounded-xl border border-sage/30 bg-white text-xs text-charcoal focus:ring-2 focus:ring-forest/30"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-sage/30 text-xs font-semibold text-charcoal hover:bg-ivory"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedPatientId || startingChat}
                onClick={async () => {
                  setStartingChat(true);
                  setNewChatError('');
                  const token = typeof window !== 'undefined' ? localStorage.getItem('vshma_admin_session') : null;
                  try {
                    const res = await fetch('/api/admin/crm/inbox/conversations', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token || ''}`,
                      },
                      body: JSON.stringify({
                        patient_id: selectedPatientId,
                        initial_message: initialChatMessage,
                      }),
                    });
                    const data = await res.json();
                    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to start chat');
                    setIsNewChatModalOpen(false);
                    await refetchConversations();
                    if (data.conversation?.id) setSelectedConvId(data.conversation.id);
                  } catch (err: unknown) {
                    setNewChatError(err instanceof Error ? err.message : String(err));
                  } finally {
                    setStartingChat(false);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold disabled:opacity-50"
              >
                {startingChat ? 'Starting...' : 'Open Thread'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Resolve Ambiguity (Link Shared Phone) */}
      {isResolveModalOpen && selectedConv && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-sage/30">
            <div className="flex items-center justify-between border-b border-sage/20 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-forest" />
                <h3 className="font-heading font-bold text-forest text-base">Link to Patient Profile</h3>
              </div>
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="p-1 rounded-lg text-charcoal/50 hover:bg-ivory"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-charcoal/70">
              This WhatsApp thread ({selectedConv.phone}) is shared across multiple family members. Select which family member this thread belongs to:
            </p>

            <div>
              <select
                value={resolvingPatientId}
                onChange={(e) => setResolvingPatientId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-sage/30 bg-white text-xs text-charcoal focus:ring-2 focus:ring-forest/30"
              >
                <option value="">-- Choose Member --</option>
                {patientList
                  .filter((p) => p.phone === selectedConv.phone || p.phone.includes(selectedConv.phone.slice(-10)))
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.patient_id})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-sage/30 text-xs font-semibold text-charcoal hover:bg-ivory"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!resolvingPatientId || resolvingAmbiguity}
                onClick={handleResolveAmbiguity}
                className="px-5 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-semibold disabled:opacity-50"
              >
                {resolvingAmbiguity ? 'Linking...' : 'Confirm Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
