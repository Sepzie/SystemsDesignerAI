import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client configured for server-side operations.
 * This is the single source of truth for server-side Supabase client creation.
 * 
 * @returns A configured Supabase client instance
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          // In Next.js 14, we can't set cookies directly in server components
          // This is handled by the middleware instead
          console.warn('Cookie setting is handled by middleware')
        },
        remove(name: string, options: any) {
          // In Next.js 14, we can't remove cookies directly in server components
          // This is handled by the middleware instead
          console.warn('Cookie removal is handled by middleware')
        },
      },
    }
  )
} 