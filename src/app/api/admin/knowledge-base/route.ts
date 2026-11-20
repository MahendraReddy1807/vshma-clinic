import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { ClinicFaq, KnowledgeCategory } from '@/types';

// Default initial knowledge base fallback for development / initial seed
const DEFAULT_FAQS: ClinicFaq[] = [
  {
    id: 'kb-1',
    category: 'doctor_information',
    question: 'What are Dr. Chihnitha Reddy T’s medical qualifications?',
    answer: 'Dr. Chihnitha Reddy T holds a Bachelor of Homeopathic Medicine and Surgery (BHMS). She is a certified homeopathic physician practicing in Bengaluru, Karnataka, India.',
    is_active: true,
    is_doctor_approved: true,
    last_reviewed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kb-2',
    category: 'clinic_information',
    question: 'Where is VSHMA Homeopathy Clinic located?',
    answer: 'VSHMA Homeopathy Clinic is located in Bengaluru, Karnataka, India. Consultations are available both in-person at the clinic and virtually via secured video for patients across India.',
    is_active: true,
    is_doctor_approved: true,
    last_reviewed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kb-3',
    category: 'clinic_timings',
    question: 'What are the clinic operating hours?',
    answer: 'The clinic is open Monday through Saturday from 9:00 AM to 7:00 PM IST. Sunday consultations are available strictly by prior appointment.',
    is_active: true,
    is_doctor_approved: true,
    last_reviewed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kb-4',
    category: 'consultation_process',
    question: 'How long does an initial consultation take?',
    answer: 'An initial comprehensive consultation takes approximately 45 to 60 minutes. This unhurried duration allows Dr. Chihnitha to thoroughly evaluate physical symptoms, constitutional vitality, lifestyle rhythms, and emotional factors.',
    is_active: true,
    is_doctor_approved: true,
    last_reviewed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'kb-5',
    category: 'booking_policies',
    question: 'Is a booking request immediately confirmed?',
    answer: 'No. Submitting an appointment request records your preferred slot. The clinic coordination desk reviews availability and confirms your scheduled appointment directly with you via WhatsApp or phone call.',
    is_active: true,
    is_doctor_approved: true,
    last_reviewed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// GET: List all FAQ entries with category filtering
export async function GET(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'
  ) {
    let list = DEFAULT_FAQS;
    if (category && category !== 'all') {
      list = list.filter((f) => f.category === category);
    }
    return NextResponse.json({ faqs: list });
  }

  try {
    const supabase = createServerSupabaseClient();
    let query = supabase.from('clinic_knowledge_base').select('*').order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If table is empty on first load, seed with default approved FAQs
    if (!data || data.length === 0) {
      await supabase.from('clinic_knowledge_base').insert(
        DEFAULT_FAQS.map(({ id, ...rest }) => rest)
      );
      return NextResponse.json({ faqs: DEFAULT_FAQS });
    }

    return NextResponse.json({ faqs: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// POST: Create a new FAQ entry
export async function POST(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { category, question, answer, is_active, is_doctor_approved } = body;

    if (!category || !question?.trim() || !answer?.trim()) {
      return NextResponse.json({ error: 'Category, question, and answer are required' }, { status: 400 });
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'
    ) {
      const newFaq: ClinicFaq = {
        id: `mock-${Date.now()}`,
        category,
        question: question.trim(),
        answer: answer.trim(),
        is_active: is_active ?? true,
        is_doctor_approved: is_doctor_approved ?? true,
        last_reviewed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, faq: newFaq });
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('clinic_knowledge_base')
      .insert({
        category,
        question: question.trim(),
        answer: answer.trim(),
        is_active: is_active ?? true,
        is_doctor_approved: is_doctor_approved ?? true,
        last_reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, faq: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// PUT / PATCH: Update existing FAQ entry
export async function PUT(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, category, question, answer, is_active, is_doctor_approved } = body;

    if (!id) {
      return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 });
    }

    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'
    ) {
      return NextResponse.json({ success: true, id });
    }

    const supabase = createServerSupabaseClient();
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (category) updates.category = category;
    if (question) updates.question = question.trim();
    if (answer) updates.answer = answer.trim();
    if (typeof is_active === 'boolean') updates.is_active = is_active;
    if (typeof is_doctor_approved === 'boolean') {
      updates.is_doctor_approved = is_doctor_approved;
      if (is_doctor_approved) {
        updates.last_reviewed_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('clinic_knowledge_base')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, faq: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE: Remove FAQ entry
export async function DELETE(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'FAQ ID is required' }, { status: 400 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'
  ) {
    return NextResponse.json({ success: true, id });
  }

  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from('clinic_knowledge_base').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
