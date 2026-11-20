import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Patient } from '@/types';

function normalizePhoneDigits(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
}

function generatePatientCode(): string {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `VSHMA-P-${yearMonth}-${randomSuffix}`;
}

/**
 * GET /api/admin/crm/patients
 * List patients with search, filtering, and safe fallback from appointments.
 */
export async function GET(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const optInFilter = searchParams.get('opt_in'); // 'true' | 'false' | null
  const ambiguousFilter = searchParams.get('ambiguous'); // 'true' | 'false' | null
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '25', 10)));

  try {
    const supabase = createServerSupabaseClient();

    // 1. Query dedicated patients table
    const { data: patientRows, error: patientErr } = await supabase
      .from('patients')
      .select('*')
      .order('last_interaction_at', { ascending: false });

    if (patientErr) {
      console.error('[Patients DB Query Error]', patientErr);
      return NextResponse.json({ error: patientErr.message }, { status: 500 });
    }

    let filtered = (patientRows || []) as Patient[];

    if (q) {
      filtered = filtered.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.phone_normalized.includes(q) ||
          (p.email && p.email.toLowerCase().includes(q)) ||
          p.patient_id.toLowerCase().includes(q)
      );
    }

    if (optInFilter === 'true') {
      filtered = filtered.filter((p) => p.whatsapp_opt_in === true);
    } else if (optInFilter === 'false') {
      filtered = filtered.filter((p) => p.whatsapp_opt_in === false);
    }

    if (ambiguousFilter === 'true') {
      filtered = filtered.filter((p) => p.is_flagged_ambiguous === true);
    }

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      patients: paginated,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      source: 'database_table',
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/admin/crm/patients
 * Manually register a new patient in the CRM.
 */
export async function POST(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { full_name, phone, email, age, city, whatsapp_opt_in, internal_notes, tags } = body;

    if (!full_name || !full_name.trim()) {
      return NextResponse.json({ error: 'Patient full name is required.' }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: 'Patient phone number is required.' }, { status: 400 });
    }

    const normPhone = normalizePhoneDigits(phone);
    const code = generatePatientCode();

    const supabase = createServerSupabaseClient();

    // Check if other patients share this phone number (Family shared phone support)
    const { data: existingWithPhone } = await supabase
      .from('patients')
      .select('full_name')
      .eq('phone_normalized', normPhone);

    const isFamilyShared = existingWithPhone && existingWithPhone.length > 0;
    const familyNames = isFamilyShared
      ? existingWithPhone.map((p) => p.full_name).join(', ')
      : null;

    const newPatientData = {
      patient_id: code,
      full_name: full_name.trim(),
      phone: phone.trim(),
      phone_normalized: normPhone,
      email: email ? email.trim() : null,
      age: age ? parseInt(String(age), 10) : null,
      city: city ? city.trim() : 'Bengaluru',
      whatsapp_opt_in: Boolean(whatsapp_opt_in),
      first_interaction_at: new Date().toISOString(),
      last_interaction_at: new Date().toISOString(),
      total_appointments: 0,
      internal_notes: internal_notes ? internal_notes.trim() : null,
      tags: Array.isArray(tags) ? tags : [],
      is_flagged_ambiguous: Boolean(isFamilyShared),
      ambiguity_reason: isFamilyShared
        ? `Shared family phone number with: ${familyNames}`
        : null,
    };

    const { data: inserted, error: insertErr } = await supabase
      .from('patients')
      .insert(newPatientData)
      .select()
      .single();

    if (insertErr) {
      // If table doesn't exist, fail gracefully with clear explanation
      return NextResponse.json(
        {
          error: `Patient creation in database failed: ${insertErr.message}. Ensure CRM schema migration is applied.`,
        },
        { status: 400 }
      );
    }

    // Add activity record
    await supabase.from('patient_activity').insert({
      patient_id: inserted.id,
      activity_type: 'patient_created',
      title: 'Patient Profile Manually Created in CRM',
      details: {
        created_by: auth.user?.email || 'admin',
        family_shared_phone: Boolean(isFamilyShared),
      },
      actor: auth.user?.email || 'admin',
    });

    return NextResponse.json({
      success: true,
      patient: inserted,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
