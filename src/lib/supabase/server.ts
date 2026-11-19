import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client using the service-role key.
 * NEVER import this in client-side code / components.
 */
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
