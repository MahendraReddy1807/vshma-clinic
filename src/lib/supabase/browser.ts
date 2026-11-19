import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client for auth operations.
 * Uses the anon key only – never the service-role key.
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
