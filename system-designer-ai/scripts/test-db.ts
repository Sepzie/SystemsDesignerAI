import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

import fetch from 'node-fetch';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Constant for delete operations
const ZERO_UUID = '00000000-0000-0000-0000-000000000000';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables');
}

// Create Supabase client with admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Type definitions for API responses
interface SignupResponse {
  user: {
    id: string;
    email: string;
  };
  error?: string;
}

interface ProjectResponse {
  project: {
    id: string;
    name: string;
    description: string;
    user_id: string;
  };
  error?: string;
}

async function resetDatabase() {
  try {
    console.log('Starting database reset...');
    
    // Delete from root tables only - cascading will handle the rest
    const { error: projectsError } = await supabase
      .from('projects')
      .delete()
      .neq('id', ZERO_UUID);
    
    if (projectsError) throw projectsError;
    console.log('Cleared Project table (cascading to related tables)');

    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .neq('id', ZERO_UUID);
    
    if (usersError) throw usersError;
    console.log('Cleared User table (cascading to related tables)');

    // Use the auth API to delete users instead of direct table access
    const { data: users, error: listUsersError } = await supabase.auth.admin.listUsers();
    if (listUsersError) throw listUsersError;

    for (const user of users.users) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) throw deleteError;
    }
    console.log('Cleared auth.users table');
    
    console.log('Database reset successful');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

async function seedTestUser() {
  try {
    console.log('Starting test user seeding...');
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';
    const testPassword = process.env.TEST_USER_PASSWORD || 'testPassword123!';

    // First check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', testEmail)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      throw checkError;
    }

    if (existingUser) {
      console.log('Test user already exists, skipping creation');
      return;
    }

    // Create test user using admin API
    const { data: user, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });

    if (createError) throw createError;
    if (!user) throw new Error('Failed to create test user');

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: user.user.id,
          email: user.user.email,
          name: 'Test User',
        },
      ]);

    if (profileError) throw profileError;

    console.log('Test user seeded successfully');
  } catch (error) {
    console.error('Error seeding test user:', error);
    process.exit(1);
  }
}

async function seedTestProject() {
  try {
    console.log('Starting test project seeding...');
    const testEmail = process.env.TEST_USER_EMAIL || 'test@example.com';

    // Get test user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', testEmail)
      .single();

    if (userError) throw userError;
    if (!user) throw new Error('Test user not found');

    // Test project creation
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([
        {
          user_id: user.id,
          name: 'Test Project',
          description: 'A test project',
          requirements: { features: ['test'] },
          tech_stack: 'test',
        },
      ])
      .select()
      .single();

    if (projectError) {
      console.error('Project creation error:', projectError);
      return;
    }

    // Test user queries
    const { data: userData, error: userQueryError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userQueryError) {
      console.error('User query error:', userQueryError);
      return;
    }

    // Test project queries
    const { data: projectData, error: projectQueryError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', project.id)
      .single();

    if (projectQueryError) {
      console.error('Project query error:', projectQueryError);
      return;
    }

    // Test user updates
    const { data: updatedUser, error: userUpdateError } = await supabase
      .from('users')
      .update({ name: 'Updated Name' })
      .eq('id', user.id)
      .select()
      .single();

    if (userUpdateError) {
      console.error('User update error:', userUpdateError);
      return;
    }

    // Test project updates
    const { data: updatedProject, error: projectUpdateError } = await supabase
      .from('projects')
      .update({ name: 'Updated Project' })
      .eq('id', project.id)
      .select()
      .single();

    if (projectUpdateError) {
      console.error('Project update error:', projectUpdateError);
      return;
    }

    // Test user deletion
    const { error: userDeleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (userDeleteError) {
      console.error('User deletion error:', userDeleteError);
      return;
    }

    // Test project deletion
    const { error: projectDeleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', project.id);

    if (projectDeleteError) {
      console.error('Project deletion error:', projectDeleteError);
      return;
    }

    console.log('Test project seeded successfully');
  } catch (error) {
    console.error('Error seeding test project:', error);
    process.exit(1);
  }
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
  case 'reset':
    resetDatabase();
    break;
  case 'seed:test-user':
    seedTestUser();
    break;
  case 'seed:test-project':
    seedTestProject();
    break;
  default:
    console.error('Invalid command. Available commands: reset, seed:test-user, seed:test-project');
    process.exit(1);
} 