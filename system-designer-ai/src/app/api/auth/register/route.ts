import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ApiError, withErrorHandler } from '@/lib/error-handler'

/**
 * This is the registration endpoint that handles new user signups.
 * The flow is:
 * 1. Create user account in Supabase Auth
 * 2. Create user profile in our database
 * 3. Sign in the user immediately
 * 4. Set up session cookies for authentication
 * 5. Return success response with redirect
 */

export async function POST(request: Request) {
  const cookieStore = await cookies()
  
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

  const { email, password } = await request.json()

  // Step 1: Create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 })
  }

  if (!authData.user) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 400 })
  }

  // Step 2: Create the user record in the User table
  const { error: userError } = await supabase
    .from('User')
    .insert([
      {
        id: authData.user.id,
        email: email,
        name: email.split('@')[0], // Use part of email as default name
      },
    ])

  if (userError) {
    console.error('User creation error:', userError)
    return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
  }

  return NextResponse.json({ 
    message: 'Registration successful. Please check your email to verify your account.',
    user: authData.user 
  })
} 