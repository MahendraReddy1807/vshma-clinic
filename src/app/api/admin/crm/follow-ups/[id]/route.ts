import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * PATCH /api/admin/crm/follow-ups/[id]
 * Update follow-up task status (e.g. mark completed), priority, or due date.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Task ID is required.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status, priority, due_date, due_time } = body;

    const supabase = createServerSupabaseClient();
    const updateFields: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) {
      updateFields.status = status;
      if (status === 'completed') {
        updateFields.completed_at = new Date().toISOString();
        updateFields.completed_by = auth.user?.id || null;
      }
    }
    if (priority !== undefined) updateFields.priority = priority;
    if (due_date !== undefined) updateFields.due_date = due_date;
    if (due_time !== undefined) updateFields.due_time = due_time;

    const { data: updated, error: updateErr } = await supabase
      .from('follow_up_tasks')
      .update(updateFields)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (updateErr) {
      console.error('[Follow-up Task Update Error]', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    if (!updated) {
      return NextResponse.json({ error: 'Follow-up task not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: updated });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/crm/follow-ups/[id]
 * Remove follow-up task.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Task ID is required.' }, { status: 400 });
  }

  try {
    const supabase = createServerSupabaseClient();
    const { error: delErr } = await supabase
      .from('follow_up_tasks')
      .delete()
      .eq('id', id);

    if (delErr) {
      console.error('[Follow-up Task Delete Error]', delErr);
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Follow-up task deleted' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
