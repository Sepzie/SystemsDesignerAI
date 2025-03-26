import { createClient } from '@supabase/supabase-js';

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

export async function resetTestDb() {
  try {
    // Delete all data from tables in reverse order of dependencies
    await supabaseAdmin.from('Project').delete().neq('id', '');
    await supabaseAdmin.from('User').delete().neq('id', '');
    
    // Delete all auth users (except our test user if it exists)
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const deletePromises = users?.users.map(user => 
      supabaseAdmin.auth.admin.deleteUser(user.id)
    ) || [];
    await Promise.all(deletePromises);

    return { success: true };
  } catch (error) {
    console.error('Failed to reset test database:', error);
    return { success: false, error };
  }
} 