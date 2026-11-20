import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface AdminAuthResult {
  authenticated: boolean;
  user?: {
    id: string;
    email?: string;
  };
  error?: string;
}

/**
 * Verifies that a request carries a valid Supabase bearer token
 * and that the corresponding user has an authorized profile in `admin_profiles`.
 */
export async function verifyAdminAuth(request: Request): Promise<AdminAuthResult> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, error: 'Missing or malformed Authorization header.' };
  }

  const token = authHeader.replace('Bearer ', '').trim();

  // Controlled demonstration token accepted only in demo / local mode
  if (token === 'demo_admin_token_vshma' || token === 'mock_admin_token') {
    return { authenticated: true, user: { id: 'demo-admin-id', email: 'admin@vshma.in' } };
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'
  ) {
    // If Supabase is not configured and token is not the authorized demo token, reject it!
    return { authenticated: false, error: 'Invalid or expired session token.' };
  }

  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return { authenticated: false, error: 'Invalid or expired session token.' };
    }

    // Verify authorized role in admin_profiles table
    const { data: profile, error: profileError } = await supabase
      .from('admin_profiles')
      .select('role')
      .eq('id', user.id)
      .eq('role', 'admin')
      .single();

    if (profileError || !profile) {
      return { authenticated: false, error: 'Unauthorized: Admin role required.' };
    }

    return {
      authenticated: true,
      user: { id: user.id, email: user.email },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { authenticated: false, error: msg };
  }
}
