import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Simple Supabase client without SSR cookies
 * Use this for public data that doesn't require authentication
 */
export function createSimpleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
