import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * PATCH /api/admin/crm/inbox/conversations/[id]
 * Updates conversation status ('active' | 'archived'), assignment ('assigned_to'),
 * or associates a patient when resolving family-shared ambiguity.
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
    return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { status, assigned_to, patient_id } = body;

    const supabase = createServerSupabaseClient();
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) {
      if (!['active', 'archived', 'assigned', 'pending'].includes(status)) {
        return NextResponse.json({ error: 'Invalid conversation status' }, { status: 400 });
      }
      updatePayload.status = status;
    }

    if (assigned_to !== undefined) {
      updatePayload.assigned_to = assigned_to || null;
    }

    if (patient_id !== undefined) {
      updatePayload.patient_id = patient_id;
      updatePayload.is_flagged_ambiguous = false;
      updatePayload.requires_staff_review = false;
      updatePayload.ambiguity_reason = null;

      // Also link any unlinked conversation_messages in this thread to this patient
      await supabase
        .from('conversation_messages')
        .update({ patient_id, is_flagged_ambiguous: false })
        .eq('conversation_id', id)
        .is('patient_id', null);
    }

    const { data: updated, error } = await supabase
      .from('conversations')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      conversation: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
