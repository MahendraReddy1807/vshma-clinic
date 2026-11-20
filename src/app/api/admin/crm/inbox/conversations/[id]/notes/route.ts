import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/admin/crm/inbox/conversations/[id]/notes
 * Adds an internal clinical or administrative note to the patient dossier.
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
    const { note_content, is_private = false } = body;

    if (!note_content || !String(note_content).trim()) {
      return NextResponse.json({ error: 'Note content cannot be empty' }, { status: 400 });
    }

    // Locate conversation & patient ID
    const { data: conv } = await supabase
      .from('conversations')
      .select('patient_id')
      .eq('id', id)
      .single();

    if (!conv?.patient_id) {
      return NextResponse.json({ error: 'Conversation is not yet linked to a patient profile' }, { status: 400 });
    }

    const { data: note, error: noteErr } = await supabase
      .from('patient_notes')
      .insert({
        patient_id: conv.patient_id,
        content: String(note_content).trim(),
        author_id: auth.user?.id || null,
        is_private: Boolean(is_private),
      })
      .select('*')
      .single();

    if (noteErr) {
      return NextResponse.json({ error: noteErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
