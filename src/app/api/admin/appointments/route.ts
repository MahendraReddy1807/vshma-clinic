import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { AppointmentStatus } from '@/types';

export async function GET(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim() || '';
  const status = searchParams.get('status') || '';
  const date = searchParams.get('date') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    return NextResponse.json({ error: 'Invalid pagination values.' }, { status: 400 });
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'
  ) {
    const demoAppointments = [
      {
        id: 'demo-1',
        booking_reference: 'VSHMA-892144',
        full_name: 'Priya Sharma',
        phone: '9845123456',
        appointment_date: new Date().toISOString().split('T')[0],
        preferred_time: 'Morning (9 AM – 12 PM)',
        consultation_type: 'General Consultation',
        message: 'First time consultation for recurrent migraine and sleep issues.',
        status: 'pending' as AppointmentStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'demo-2',
        booking_reference: 'VSHMA-739102',
        full_name: 'Rajesh K',
        phone: '9741001234',
        appointment_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        preferred_time: 'Afternoon (12 PM – 3 PM)',
        consultation_type: 'Ongoing Consultations',
        message: 'Follow-up for ongoing digestive wellness plan.',
        status: 'confirmed' as AppointmentStatus,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'demo-3',
        booking_reference: 'VSHMA-612984',
        full_name: 'Sneha Patel',
        phone: '9988776655',
        appointment_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        preferred_time: 'Evening (3 PM – 6 PM)',
        consultation_type: 'Pediatric Homeopathy',
        message: 'Consultation for 5-year-old child with recurrent seasonal colds.',
        status: 'confirmed' as AppointmentStatus,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'demo-4',
        booking_reference: 'VSHMA-551029',
        full_name: 'Ananya Rao',
        phone: '9123456789',
        appointment_date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
        preferred_time: 'Morning (9 AM – 12 PM)',
        consultation_type: "Women's Health",
        message: 'Review completed with positive vitality.',
        status: 'completed' as AppointmentStatus,
        created_at: new Date(Date.now() - 345600000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    let filtered = demoAppointments;
    if (status && status !== 'all') {
      filtered = filtered.filter((a) => a.status === status);
    }
    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.full_name.toLowerCase().includes(search.toLowerCase()) ||
          a.phone.includes(search) ||
          a.booking_reference.toLowerCase().includes(search.toLowerCase())
      );
    }
    return NextResponse.json({
      appointments: filtered,
      total: filtered.length,
      page: 1,
      totalPages: 1,
    });
  }

  try {
    const supabase = createServerSupabaseClient();
    let query = supabase.from('appointments').select('*', { count: 'exact' });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (date) {
      query = query.eq('appointment_date', date);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,booking_reference.ilike.%${search}%`);
    }

    if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('Appointments query error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      appointments: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();

    const allowedStatuses: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!id || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: 'Valid appointment ID and status are required' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
      return NextResponse.json({ success: true, id, status });
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, appointment: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
    return NextResponse.json({ success: true, id });
  }

  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from('appointments').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
