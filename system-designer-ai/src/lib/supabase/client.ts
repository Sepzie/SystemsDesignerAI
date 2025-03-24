import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  // In test environment, use test credentials if available
  const supabaseUrl = process.env.NODE_ENV === 'test' 
    ? process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
    : process.env.NEXT_PUBLIC_SUPABASE_URL!

  // Use service role key in test environment to bypass RLS
  const supabaseKey = process.env.NODE_ENV === 'test'
    ? process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key'
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createBrowserClient(supabaseUrl, supabaseKey)
} 