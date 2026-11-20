import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CLINIC_INFO } from '@/lib/constants';

export interface InboxConversationItem {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_code: string;
  phone: string;
  email?: string;
  channel: 'whatsapp' | 'email';
  last_message_preview: string;
  last_message_at: string;
  last_message_direction: 'inbound' | 'outbound';
  unread_count: number;
  status: 'active' | 'archived' | 'assigned' | 'pending';
  assigned_to?: string | null;
  customer_service_window_expires_at?: string | null;
  whatsapp_opt_in: boolean;
  whatsapp_opt_in_source?: string | null;
  first_interaction_at?: string | null;
  last_interaction_at?: string | null;
  total_appointments?: number;
  booking_reference?: string;
  confirmed_slot?: string;
  is_flagged_ambiguous?: boolean;
  ambiguity_reason?: string | null;
  latest_appointment?: {
    date: string;
    time: string;
    status: string;
    consultationType: string;
    bookingReference: string;
  } | null;
}

/**
 * GET /api/admin/crm/inbox/conversations
 * List conversation threads with filtering, unread counts, and patient summary.
 */
interface DbConversationRow {
  id: string;
  patient_id?: string | null;
  channel: 'whatsapp' | 'email';
  external_chat_id?: string | null;
  last_message_preview?: string | null;
  last_message_at?: string | null;
  last_message_direction?: 'inbound' | 'outbound' | null;
  unread_count?: number | null;
  status: 'active' | 'archived' | 'pending';
  assigned_to?: string | null;
  is_flagged_ambiguous?: boolean | null;
  ambiguity_reason?: string | null;
  customer_service_window_expires_at?: string | null;
  patients?: {
    id: string;
    full_name: string;
    patient_id: string;
    phone: string;
    email?: string | null;
    whatsapp_opt_in?: boolean | null;
    whatsapp_opt_in_source?: string | null;
    first_interaction_at?: string | null;
    last_interaction_at?: string | null;
    total_appointments?: number | null;
  } | null;
}

export async function GET(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') || 'all'; // 'all' | 'unread' | 'whatsapp' | 'email' | 'archived'
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  try {
    const supabase = createServerSupabaseClient();

    // 1. Attempt query from conversations table with patient join
    let convRows: DbConversationRow[] | null = null;
    let convErr: { message?: string; code?: string } | null = null;

    const res = await supabase
      .from('conversations')
      .select(`
        *,
        patients (
          id,
          full_name,
          patient_id,
          phone,
          email,
          whatsapp_opt_in,
          whatsapp_opt_in_source,
          first_interaction_at,
          last_interaction_at,
          total_appointments
        )
      `)
      .order('last_message_at', { ascending: false });

    if (res.error && res.error.message?.includes('relationship')) {
      // Fallback: If PostgREST schema cache does not recognize the foreign key relationship
      const flatRes = await supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (flatRes.data && flatRes.data.length > 0) {
        const patientIds = Array.from(new Set(flatRes.data.map((c) => c.patient_id).filter(Boolean)));
        const { data: patientRows } = await supabase
          .from('patients')
          .select('id, full_name, patient_id, phone, email, whatsapp_opt_in, whatsapp_opt_in_source, first_interaction_at, last_interaction_at, total_appointments')
          .in('id', patientIds);

        const patientMap = new Map((patientRows || []).map((p) => [p.id, p]));
        convRows = (flatRes.data as unknown as DbConversationRow[]).map((c) => ({
          ...c,
          patients: c.patient_id ? patientMap.get(c.patient_id) || null : null,
        }));
      } else {
        convRows = (flatRes.data as unknown as DbConversationRow[]) || null;
        convErr = flatRes.error;
      }
    } else {
      convRows = (res.data as unknown as DbConversationRow[]) || null;
      convErr = res.error;
    }

    if (!convErr && convRows && convRows.length > 0) {
      // Also fetch latest appointment for each patient
      const patientIds = Array.from(new Set(convRows.map((c) => c.patient_id).filter(Boolean))) as string[];
      const appointmentsMap = new Map<string, { date: string; time: string; status: string; consultationType: string; bookingReference: string }>();

      if (patientIds.length > 0) {
        const { data: apptRows } = await supabase
          .from('appointments')
          .select('patient_id, appointment_date, preferred_time, status, consultation_type, booking_reference')
          .in('patient_id', patientIds)
          .order('appointment_date', { ascending: false });

        if (apptRows) {
          for (const a of apptRows) {
            if (a.patient_id && !appointmentsMap.has(a.patient_id)) {
              appointmentsMap.set(a.patient_id, {
                date: a.appointment_date,
                time: a.preferred_time || '10:30 AM',
                status: a.status,
                consultationType: a.consultation_type,
                bookingReference: a.booking_reference,
              });
            }
          }
        }
      }

      let items: InboxConversationItem[] = convRows.map((c) => {
        const p = c.patients as Record<string, unknown> | null;
        const patientId = c.patient_id || '';
        const latestAppt = patientId ? appointmentsMap.get(patientId) || null : null;

        return {
          id: c.id,
          patient_id: patientId,
          patient_name: String(p?.full_name || 'Patient'),
          patient_code: String(p?.patient_id || 'VSHMA-P'),
          phone: String(p?.phone || c.external_chat_id || ''),
          email: p?.email ? String(p.email) : undefined,
          channel: c.channel,
          last_message_preview: c.last_message_preview || 'No messages yet',
          last_message_at: c.last_message_at || new Date().toISOString(),
          last_message_direction: c.last_message_direction || 'inbound',
          unread_count: c.unread_count || 0,
          status: c.status,
          assigned_to: c.assigned_to ? String(c.assigned_to) : null,
          customer_service_window_expires_at: c.customer_service_window_expires_at,
          whatsapp_opt_in: Boolean(p?.whatsapp_opt_in),
          whatsapp_opt_in_source: p?.whatsapp_opt_in_source ? String(p.whatsapp_opt_in_source) : null,
          first_interaction_at: p?.first_interaction_at ? String(p.first_interaction_at) : null,
          last_interaction_at: p?.last_interaction_at ? String(p.last_interaction_at) : null,
          total_appointments: typeof p?.total_appointments === 'number' ? p.total_appointments : (latestAppt ? 1 : 0),
          is_flagged_ambiguous: Boolean(c.is_flagged_ambiguous),
          ambiguity_reason: c.ambiguity_reason ? String(c.ambiguity_reason) : null,
          latest_appointment: latestAppt,
        };
      });

      if (q) {
        items = items.filter(
          (i) =>
            i.patient_name.toLowerCase().includes(q) ||
            i.phone.includes(q) ||
            i.patient_code.toLowerCase().includes(q)
        );
      }

      if (filter === 'unread') {
        items = items.filter((i) => i.unread_count > 0);
      } else if (filter === 'open') {
        items = items.filter((i) => i.status === 'active' || i.status === 'assigned');
      } else if (filter === 'pending') {
        items = items.filter((i) => i.last_message_direction === 'outbound' && i.status === 'active');
      } else if (filter === 'closed' || filter === 'archived') {
        items = items.filter((i) => i.status === 'archived');
      } else if (filter === 'whatsapp') {
        items = items.filter((i) => i.channel === 'whatsapp');
      } else if (filter === 'email') {
        items = items.filter((i) => i.channel === 'email');
      }

      return NextResponse.json({
        success: true,
        conversations: items,
        source: 'database_table',
      });
    }

    if (convErr) {
      console.error('[Inbox Conversations DB Error]', convErr);
      return NextResponse.json(
        {
          error: convErr.message,
          code: convErr.code,
          details: convErr.message?.includes('does not exist')
            ? 'CRM database tables are not yet initialized. Please apply migrations 20261120100000 and 20261120110000 in Supabase.'
            : convErr.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conversations: [],
      source: 'database_table',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/admin/crm/inbox/conversations
 * Initiate or locate a conversation thread with an existing patient.
 */
export async function POST(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    const { patient_id, channel = 'whatsapp', initial_message } = body;

    if (!patient_id) {
      return NextResponse.json({ error: 'Patient ID is required.' }, { status: 400 });
    }

    // Locate patient
    const { data: patient, error: patErr } = await supabase
      .from('patients')
      .select('id, full_name, patient_id, phone, whatsapp_opt_in')
      .eq('id', patient_id)
      .single();

    if (patErr || !patient) {
      return NextResponse.json({ error: 'Patient record not found.' }, { status: 404 });
    }

    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('*')
      .eq('patient_id', patient_id)
      .eq('channel', channel)
      .maybeSingle();

    if (existingConv) {
      return NextResponse.json({
        success: true,
        conversation: {
          ...existingConv,
          patient_name: patient.full_name,
          patient_code: patient.patient_id,
          phone: patient.phone,
          whatsapp_opt_in: patient.whatsapp_opt_in,
        },
      });
    }

    // Create new conversation
    const now = new Date().toISOString();
    const { data: newConv, error: createErr } = await supabase
      .from('conversations')
      .insert({
        patient_id: patient.id,
        channel,
        external_chat_id: patient.phone,
        last_message_preview: initial_message || 'Conversation initiated by clinic',
        last_message_at: now,
        last_message_direction: 'outbound',
        unread_count: 0,
        status: 'active',
      })
      .select('*')
      .single();

    if (createErr) {
      return NextResponse.json({ error: createErr.message }, { status: 500 });
    }

    if (initial_message && String(initial_message).trim()) {
      await supabase.from('conversation_messages').insert({
        conversation_id: newConv.id,
        patient_id: patient.id,
        channel,
        direction: 'outbound',
        sender_phone: CLINIC_INFO.phone || '917416001477',
        recipient_phone: patient.phone,
        sender_type: 'staff',
        message_body: String(initial_message).trim(),
        message_type: 'text',
        status: 'sent',
      });
    }

    return NextResponse.json({
      success: true,
      conversation: {
        ...newConv,
        patient_name: patient.full_name,
        patient_code: patient.patient_id,
        phone: patient.phone,
        whatsapp_opt_in: patient.whatsapp_opt_in,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
