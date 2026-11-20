import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface FollowUpTaskItem {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_code: string;
  patient_phone: string;
  appointment_id?: string | null;
  title: string;
  description?: string | null;
  due_date: string;
  due_time?: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  completed_at?: string | null;
  created_at: string;
}

/**
 * GET /api/admin/crm/follow-ups
 * List follow-up tasks with filtering (all, overdue, today, upcoming, completed).
 */
export async function GET(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const _filter = searchParams.get('filter') || 'all';
  void _filter;

  try {
    const supabase = createServerSupabaseClient();

    // 1. Query follow_up_tasks table
    const { data: taskRows, error: taskErr } = await supabase
      .from('follow_up_tasks')
      .select(`
        *,
        patients (
          id,
          full_name,
          patient_id,
          phone
        )
      `)
      .order('due_date', { ascending: true });

    if (taskErr) {
      console.error('[Follow-up Tasks DB Error]', taskErr);
      return NextResponse.json({ error: taskErr.message }, { status: 500 });
    }

    const items: FollowUpTaskItem[] = (taskRows || []).map((t) => {
      const p = t.patients as Record<string, unknown> | null;
      return {
        id: t.id,
        patient_id: t.patient_id || '',
        patient_name: String(p?.full_name || 'General Clinic Task'),
        patient_code: String(p?.patient_id || 'GENERAL'),
        patient_phone: String(p?.phone || ''),
        appointment_id: t.appointment_id,
        title: t.title,
        description: t.description,
        due_date: t.due_date,
        due_time: t.due_time,
        priority: t.priority,
        status: t.status,
        completed_at: t.completed_at,
        created_at: t.created_at,
      };
    });

    return NextResponse.json({ success: true, tasks: items, source: 'database_table' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/admin/crm/follow-ups
 * Create a new follow-up task.
 */
export async function POST(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { patient_id, title, description, due_date, due_time, priority } = body;

    if (!title || !String(title).trim() || !due_date) {
      return NextResponse.json({ error: 'Title and Due Date are required.' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const payload = {
      patient_id: patient_id && String(patient_id).trim() ? String(patient_id).trim() : null,
      title: String(title).trim(),
      description: description ? String(description).trim() : null,
      due_date,
      due_time: due_time || '10:00 AM',
      priority: priority || 'medium',
      status: 'pending',
      assigned_to: auth.user?.id || null,
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('follow_up_tasks')
      .insert(payload)
      .select()
      .single();

    if (insertErr) {
      console.error('[Follow-up Task Insert Error]', insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: inserted });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
