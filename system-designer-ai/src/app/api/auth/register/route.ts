import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { ApiError, withErrorHandler } from '@/lib/error-handler';

console.log('OUTSIDE HANDLER - THIS RUNS ON IMPORT');

export const POST = withErrorHandler(async (req: Request) => {
  const headersList = await headers();
  console.log(`[${new Date().toISOString()}] Registration request received from ${headersList.get('user-agent')}`);
  try {
    const { email, password, fullName } = await req.json();

    // Create Supabase client with service role for admin operations
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

    let user;
    
    console.log('NODE_ENV:', process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'development') {
      // In development, use admin API to create user directly
      const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (adminError) {
        console.error('Admin user creation error:', adminError);
        throw new ApiError(500, 'Failed to create user');
      }

      user = adminUser.user;
    } else {
      // In production, use regular signup flow
      const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      });

      if (authError) {
        if (authError.message.includes('rate limit')) {
          throw new ApiError(429, 'Too many registration attempts. Please try again later.');
        }
        throw new ApiError(400, authError.message);
      }

      if (!authData.user) {
        throw new ApiError(400, 'Failed to create user');
      }

      user = authData.user;
    }

    // Create user profile in the User table using admin client
    const { error: userError } = await supabaseAdmin
      .from('User')
      .insert([
        {
          id: user.id,
          email: email,
          name: fullName,
        },
      ]);

    if (userError) {
      console.error('User creation error:', userError);
      throw new ApiError(500, 'Failed to create user profile');
    }

    // In development, auto sign in the user
    if (process.env.NODE_ENV === 'development') {
      const { data: { session }, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Auto sign-in error:', signInError);
      } else if (session) {
        return NextResponse.json({
          message: 'Registration successful. You have been automatically signed in.',
          session,
        });
      }
    }

    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}); 