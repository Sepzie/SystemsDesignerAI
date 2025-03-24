import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  // In test environment, use test credentials if available
  const supabaseUrl = process.env.NODE_ENV === 'test' 
    ? process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
    : process.env.NEXT_PUBLIC_SUPABASE_URL!

  const supabaseKey = process.env.NODE_ENV === 'test'
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'test-anon-key'
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createBrowserClient(supabaseUrl, supabaseKey)
} 