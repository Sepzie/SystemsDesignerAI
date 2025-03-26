import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { ApiError, withErrorHandler } from '@/lib/error-handler';

/**
 * This is the registration endpoint that handles new user signups.
 * The flow is:
 * 1. Create user account in Supabase Auth
 * 2. Create user profile in our database
 * 3. Sign in the user immediately
 * 4. Set up session cookies for authentication
 * 5. Return success response with redirect
 */

export const POST = withErrorHandler(async (req: Request) => {
  const { email, password, fullName } = await req.json();

  /**
   * Create a Supabase admin client with service role key
   * This client has elevated privileges to:
   * - Create users
   * - Manage sessions
   * - Access database directly
   * We use this instead of the regular client for admin operations
   */
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  /**
   * Step 1: Create the user account in Supabase Auth
   * This creates the authentication record for the user
   * We set emailRedirectTo to dashboard since we're auto-signing in
   */
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    },
  });

  // Handle various authentication errors
  if (authError) {
    if (authError.message.includes('rate limit')) {
      throw new ApiError(429, 'Too many registration attempts. Please try again later.');
    }
    throw new ApiError(400, authError.message);
  }

  if (!authData.user) {
    throw new ApiError(400, 'Failed to create user');
  }

  /**
   * Step 2: Create the user's profile in our database
   * This stores additional user information like full name
   * We use the user's ID from Supabase Auth as the primary key
   */
  const { error: userError } = await supabaseAdmin
    .from('User')
    .insert([
      {
        id: authData.user.id,
        email: email,
        name: fullName,
      },
    ]);

  if (userError) {
    console.error('User creation error:', userError);
    throw new ApiError(500, 'Failed to create user profile');
  }

  /**
   * Step 3: Sign in the user immediately
   * This creates a session that we'll use to maintain their logged-in state
   * We use the same credentials they just registered with
   */
  const { data: { session }, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    console.error('Auto sign-in error:', signInError);
    throw new ApiError(500, 'Failed to sign in after registration');
  }

  if (!session) {
    throw new ApiError(500, 'Failed to create session');
  }

  /**
   * Step 4: Set up the session cookies
   * This is crucial for maintaining the user's authenticated state
   * The cookies will be automatically included in subsequent requests
   */
  const response = NextResponse.json({
    message: 'Registration successful. You have been signed in.',
    session,
    redirectTo: '/dashboard'
  });

  // Set the session cookie using the route handler client
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token
  });

  return response;
}); 