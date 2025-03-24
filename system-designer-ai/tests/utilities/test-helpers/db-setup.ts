import { createUser, createProject } from '../factories/test-data-factory';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';

interface TestData {
  user: {
    id: string;
    email: string;
    name: string;
  };
  projects?: any[];
}

/**
 * Creates test data in the Supabase test database
 * This should only be called when running in integrated test mode
 */
export async function setupTestData(): Promise<TestData> {
  // Only run this if we're in integrated test mode
  if (process.env.TEST_USE_REAL_SUPABASE !== 'true') {
    throw new Error('setupTestData should only be called when TEST_USE_REAL_SUPABASE=true');
  }

  // Create a direct Supabase client instead of using the browser client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Validate environment variables
  if (!supabaseUrl || !supabaseKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    throw new Error(`Missing Supabase environment variables: ${missingVars.join(', ')}`);
  }
  
  // Create direct client with service role if available (for admin operations)
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseClient = createClient(supabaseUrl, serviceRoleKey || supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  // Create a test user
  // We'll just create user data manually without using auth API
  // This is because we just need the ID for references with projects
  const testUser = createUser();
  console.log(`Setting up test user: ${testUser.email}`);

  try {
    // Create test projects
    const projects = [];
    
    // Create a test project
    const projectData = createProject({ 
      user_id: testUser.id,
      name: `Test Project ${uuidv4().substring(0, 8)}`
    });
    
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .insert(projectData)
      .select()
      .single();
      
    if (projectError) {
      console.error('Error creating test project:', projectError);
    } else if (project) {
      projects.push(project);
    }

    return {
      user: testUser,
      projects
    };
  } catch (error) {
    console.error('Error in setupTestData:', error);
    throw error;
  }
}

/**
 * Cleans up test data from the Supabase test database
 * This should only be called when running in integrated test mode
 */
export async function cleanupTestData(testData: TestData): Promise<void> {
  // Only run this if we're in integrated test mode
  if (process.env.TEST_USE_REAL_SUPABASE !== 'true') {
    return;
  }

  // Create a direct Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  // Validate environment variables
  if (!supabaseUrl || !supabaseKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.error(`Missing Supabase environment variables: ${missingVars.join(', ')}`);
    return;
  }
  
  // Create direct client with appropriate options
  const supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    console.log(`Cleaning up test data for user: ${testData.user.email}`);
    
    // Delete test projects
    if (testData.projects && testData.projects.length > 0) {
      for (const project of testData.projects) {
        const { error } = await supabaseClient
          .from('projects')
          .delete()
          .eq('id', project.id);
          
        if (error) {
          console.error(`Error deleting project ${project.id}:`, error);
        }
      }
    }
    
    // We don't need to delete the user since we're not creating real auth users
    console.log('Test data cleanup complete');
  } catch (error) {
    console.error('Error in cleanupTestData:', error);
  }
} 