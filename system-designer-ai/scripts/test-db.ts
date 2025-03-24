import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetDatabase() {
  try {
    // Delete all data from tables in reverse order of dependencies
    await supabase.from('project_versions').delete().neq('id', 0);
    await supabase.from('projects').delete().neq('id', 0);
    await supabase.from('user_profiles').delete().neq('id', 0);
    await supabase.from('auth.users').delete().neq('id', 0);
    
    console.log('Database reset successful');
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

async function seedTestUser() {
  try {
    // Create test user
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'testPassword123!',
      email_confirm: true,
    });

    if (userError) throw userError;

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: user.user.id,
          email: user.user.email,
          full_name: 'Test User',
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
    // Get test user
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', process.env.TEST_USER_EMAIL || 'test@example.com')
      .single();

    if (userError) throw userError;

    // Create test project
    const { error: projectError } = await supabase
      .from('projects')
      .insert([
        {
          name: 'Test Project',
          description: 'This is a test project',
          user_id: user.id,
          status: 'active',
        },
      ]);

    if (projectError) throw projectError;

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