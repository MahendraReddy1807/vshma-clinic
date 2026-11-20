import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface AdminAuthResult {
  authenticated: boolean;
  status: 200 | 401 | 403 | 503;
  user?: {
    id: string;
    email?: string;
    role: string;
  };
  error?: string;
}

/**
 * Verifies that a request carries a valid Supabase bearer token
 * and that the corresponding user has an authorized profile in `admin_profiles` (role: 'admin').
 *
 * Enforces strict fail-closed security:
 * - Missing / malformed / forged / expired / demo tokens -> HTTP 401 Unauthorized
 * - Valid Supabase user but not in admin_profiles or role !== 'admin' -> HTTP 403 Forbidden
 * - Missing Supabase configuration -> HTTP 503 Service Unavailable (Fail closed)
 */
export async function verifyAdminAuth(request: Request): Promise<AdminAuthResult> {
  // Fail closed if Supabase server credentials are not configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url'
  ) {
    return {
      authenticated: false,
      status: 503,
      error: 'Supabase authentication service is not configured.',
    };
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      status: 401,
      error: 'Missing or malformed Authorization header.',
    };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return {
      authenticated: false,
      status: 401,
      error: 'Authorization token is empty.',
    };
  }

  // Explicitly reject any legacy or hardcoded demo tokens
  if (
    token === 'demo_admin_token_vshma' ||
    token === 'mock_admin_token' ||
    token.startsWith('demo-')
  ) {
    return {
      authenticated: false,
      status: 401,
      error: 'Invalid or unauthorized session token.',
    };
  }

  try {
    const supabase = createServerSupabaseClient();

    // Verify token validity with Supabase Auth server-side
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return {
        authenticated: false,
        status: 401,
        error: 'Invalid or expired session token.',
      };
    }

    // Verify user has an explicit active 'admin' record in admin_profiles
    const { data: profile, error: profileError } = await supabase
      .from('admin_profiles')
      .select('role')
      .eq('id', user.id)
      .eq('role', 'admin')
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return {
        authenticated: false,
        status: 403,
        error: 'Forbidden: Admin authorization required.',
      };
    }

    return {
      authenticated: true,
      status: 200,
      user: {
        id: user.id,
        email: user.email,
        role: profile.role,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      authenticated: false,
      status: 401,
      error: `Authentication failed: ${msg}`,
    };
  }
}
