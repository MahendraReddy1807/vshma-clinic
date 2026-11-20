import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Patient, Appointment, PatientNote, PatientActivity, PatientWithDetails } from '@/types';

/**
 * GET /api/admin/crm/patients/[id]
 * Fetch complete patient profile, appointment history, notes, and activity timeline.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Patient ID is required.' }, { status: 400 });
  }

  try {
    const supabase = createServerSupabaseClient();

    // 1. Query dedicated patients table
    const { data: patientRow, error: pErr } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (pErr) {
      console.error('[Patient Dossier DB Error]', pErr);
      return NextResponse.json({ error: pErr.message }, { status: 500 });
    }

    if (!patientRow) {
      return NextResponse.json({ error: 'Patient record not found.' }, { status: 404 });
    }

    const patient = patientRow as Patient;

    // Fetch appointments linked directly or by normalized phone (targeted indexed query)
    const { data: apptRows, error: apptErr } = await supabase
      .from('appointments')
      .select('*')
      .or(`patient_id.eq.${id},phone.ilike.%${patient.phone_normalized.slice(-10)}%`)
      .order('appointment_date', { ascending: false });

    if (apptErr) {
      console.error('[Patient Appointments Fetch Error]', apptErr);
    }

    // Fetch notes
    const { data: noteRows, error: noteErr } = await supabase
      .from('patient_notes')
      .select('*')
      .eq('patient_id', id)
      .order('created_at', { ascending: false });

    if (noteErr) {
      console.error('[Patient Notes Fetch Error]', noteErr);
    }

    // Fetch activity timeline
    const { data: activityRows, error: actErr } = await supabase
      .from('patient_activity')
      .select('*')
      .eq('patient_id', id)
      .order('created_at', { ascending: false });

    if (actErr) {
      console.error('[Patient Activity Fetch Error]', actErr);
    }

    const fullDetails: PatientWithDetails = {
      ...patient,
      appointments: (apptRows as Appointment[]) || [],
      notes: (noteRows as PatientNote[]) || [],
      activity: (activityRows as PatientActivity[]) || [],
    };

    return NextResponse.json({
      success: true,
      patient: fullDetails,
      source: 'database_table',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/crm/patients/[id]
 * Update patient contact info, notes, tags, or WhatsApp opt-in status.
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
    return NextResponse.json({ error: 'Patient ID is required.' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { full_name, email, age, city, whatsapp_opt_in, internal_notes, tags } = body;

    const supabase = createServerSupabaseClient();

    const updateFields: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (full_name !== undefined) updateFields.full_name = String(full_name).trim();
    if (email !== undefined) updateFields.email = email ? String(email).trim() : null;
    if (age !== undefined) updateFields.age = age ? parseInt(String(age), 10) : null;
    if (city !== undefined) updateFields.city = String(city).trim();
    if (whatsapp_opt_in !== undefined) updateFields.whatsapp_opt_in = Boolean(whatsapp_opt_in);
    if (internal_notes !== undefined) updateFields.internal_notes = String(internal_notes).trim();
    if (tags !== undefined && Array.isArray(tags)) updateFields.tags = tags;

    const { data: updated, error: updateErr } = await supabase
      .from('patients')
      .update(updateFields)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    // Add activity timeline entry
    await supabase.from('patient_activity').insert({
      patient_id: id,
      activity_type: 'whatsapp_opt_in_updated',
      title: 'Patient Profile Updated by Staff',
      details: {
        updated_by: auth.user?.email || 'admin',
        fields_updated: Object.keys(updateFields).filter((k) => k !== 'updated_at'),
      },
      actor: auth.user?.email || 'admin',
    });

    return NextResponse.json({
      success: true,
      patient: updated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
