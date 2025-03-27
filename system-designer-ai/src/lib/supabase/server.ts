import { createServerClient } from '@supabase/ssr'

export async function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return '';
        },
        set(name: string, value: string, options: any) {
          // Server-side cookies are not needed
        },
        remove(name: string, options: any) {
          // Server-side cookies are not needed
        },
      },
    }
  )
} 