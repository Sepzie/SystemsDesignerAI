import { createBrowserClient, type CookieOptions } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${name}=`))
          return cookie ? cookie.split('=')[1] : undefined
        },
        set(name: string, value: string, options: CookieOptions) {
          document.cookie = `${name}=${value}; path=/; max-age=${options.maxAge || 31536000}`
        },
        remove(name: string, options: CookieOptions) {
          void options;
          document.cookie = `${name}=; path=/; max-age=0`
        },
      },
    }
  )
} 
