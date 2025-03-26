import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * This is the authentication callback endpoint that handles OAuth redirects and email verification.
 * It's called by Supabase after:
 * 1. Email verification (when user clicks the link in their email)
 * 2. OAuth sign-in (when user signs in with Google, GitHub, etc.)
 * 
 * The flow is:
 * 1. Extract the authorization code from the URL
 * 2. Exchange the code for a session
 * 3. Set up the session cookies
 * 4. Redirect to the appropriate page
 */

export async function GET(request: Request) {
  // Parse the URL to get the authorization code and redirect destination
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  if (code) {
    /**
     * Create a Supabase client configured for server-side rendering
     * This client is used to handle cookie management and session exchange
     */
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    /**
     * Exchange the authorization code for a session
     * This is a crucial step in the OAuth flow where we:
     * 1. Send the code to Supabase
     * 2. Receive access and refresh tokens
     * 3. Set up the session cookies automatically
     */
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If successful, redirect to the intended destination (defaults to dashboard)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If there's no code or an error occurred, redirect to error page
  return NextResponse.redirect(`${origin}/auth-error`)
} 