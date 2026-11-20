import { NextResponse } from 'next/server';
import { verifyAdminAuth } from '@/lib/admin-auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { DashboardStats } from '@/types';

export async function GET(request: Request) {
  const auth = await verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
    return NextResponse.json({ error: 'Dashboard service is not configured.' }, { status: 503 });
  }

  try {
    const supabase = createServerSupabaseClient();

    const { data: appointments, error } = await supabase
      .from('appointments')
      .select('status');

    if (error) {
      console.error('Error fetching appointment stats:', error);
      return NextResponse.json({ error: 'Failed to calculate statistics' }, { status: 500 });
    }

    const stats: DashboardStats = {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === 'pending').length,
      confirmed: appointments.filter((a) => a.status === 'confirmed').length,
      rescheduled: appointments.filter((a) => a.status === 'rescheduled').length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    };

    return NextResponse.json(stats);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
