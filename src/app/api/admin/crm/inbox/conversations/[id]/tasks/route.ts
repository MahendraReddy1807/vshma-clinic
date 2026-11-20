import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/crm/inbox/conversations/[id]/tasks
 * Creates a follow-up task directly from a patient communication thread.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
  }

  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json();
    const {
      title,
      description = '',
      due_date,
      due_time = '10:00 AM',
      priority = 'medium',
    } = body;

    if (!title || !String(title).trim()) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }
    if (!due_date) {
      return NextResponse.json({ error: 'Due date is required' }, { status: 400 });
    }

    const { data: conv } = await supabase
      .from('conversations')
      .select('patient_id')
      .eq('id', id)
      .single();

    const { data: task, error: taskErr } = await supabase
      .from('follow_up_tasks')
      .insert({
        patient_id: conv?.patient_id || null,
        title: String(title).trim(),
        description: description ? String(description).trim() : null,
        due_date,
        due_time,
        priority: ['low', 'medium', 'high', 'urgent'].includes(priority) ? priority : 'medium',
        status: 'pending',
        assigned_to: auth.user?.id || null,
      })
      .select('*')
      .single();

    if (taskErr) {
      return NextResponse.json({ error: taskErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      task,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
