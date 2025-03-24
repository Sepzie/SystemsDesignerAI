import { setupTestData, cleanupTestData } from '../utilities/test-helpers/db-setup';
import { createClient } from '@supabase/supabase-js';
import assert from 'assert';

describe('Project Setup Integration Tests', () => {
  let testData: any;
  let supabaseClient: any;

  beforeAll(async () => {
    // This test should only run with real Supabase
    if (process.env.TEST_USE_REAL_SUPABASE !== 'true') {
      console.log('Skipping integration tests - requires TEST_USE_REAL_SUPABASE=true');
      return;
    }

    try {
      // Create a direct Supabase client instead of using the browser client
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      
      // Validate environment variables
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase environment variables');
      }
      
      // Create client with appropriate options for Node.js environment
      supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      
      // Set up test data
      testData = await setupTestData();
      console.log(`Set up test data with user ID ${testData.user.id} and ${testData.projects?.length || 0} projects`);
    } catch (error) {
      console.error('Error setting up tests:', error);
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (testData) {
      await cleanupTestData(testData);
    }
  });

  describe('Supabase Schema Validation', () => {
    it('validates the projects table schema', async () => {
      // Skip if not running integrated tests or setup failed
      if (process.env.TEST_USE_REAL_SUPABASE !== 'true' || !supabaseClient) {
        return;
      }

      const { data, error } = await supabaseClient
        .from('Project')
        .select()
        .limit(1);

      assert(!error, `Database query error: ${error?.message}`);
      assert(Array.isArray(data), 'Projects table query should return an array');
      
      // If we have a project, validate its structure
      if (data && data.length > 0) {
        const project = data[0];
        assert(project.id, 'Project should have an ID field');
        assert(project.name, 'Project should have a name field');
        assert(project.user_id, 'Project should have a user_id field');
        assert(project.created_at, 'Project should have a created_at field');
        assert(project.updated_at, 'Project should have an updated_at field');
      }
    });
  });

  describe('Project CRUD Operations', () => {
    it('creates, retrieves, updates, and deletes a project', async () => {
      // Skip if not running integrated tests or setup failed
      if (process.env.TEST_USE_REAL_SUPABASE !== 'true' || !supabaseClient || !testData) {
        return;
      }

      // Create a project
      const projectName = `Test Project ${Date.now()}`;
      const projectDescription = 'Created during integration testing';
      
      const { data: createdProject, error: createError } = await supabaseClient
        .from('Project')
        .insert({
          name: projectName,
          description: projectDescription,
          user_id: testData.user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      assert(!createError, `Create project error: ${createError?.message}`);
      assert(createdProject?.id, 'Created project should have an ID');
      assert.strictEqual(createdProject?.name, projectName);
      
      // Retrieve the project
      const { data: retrievedProject, error: retrieveError } = await supabaseClient
        .from('Project')
        .select()
        .eq('id', createdProject.id)
        .single();

      assert(!retrieveError, `Retrieve project error: ${retrieveError?.message}`);
      assert.strictEqual(retrievedProject?.id, createdProject.id);
      assert.strictEqual(retrievedProject?.name, projectName);
      
      // Update the project
      const updatedName = `${projectName} (Updated)`;
      const { data: updatedProject, error: updateError } = await supabaseClient
        .from('Project')
        .update({
          name: updatedName,
          updated_at: new Date().toISOString()
        })
        .eq('id', createdProject.id)
        .select()
        .single();

      assert(!updateError, `Update project error: ${updateError?.message}`);
      assert.strictEqual(updatedProject?.id, createdProject.id);
      assert.strictEqual(updatedProject?.name, updatedName);
      
      // Delete the project
      const { error: deleteError } = await supabaseClient
        .from('Project')
        .delete()
        .eq('id', createdProject.id);

      assert(!deleteError, `Delete project error: ${deleteError?.message}`);
      
      // Verify deletion
      const { data: shouldBeEmpty, error: verifyError } = await supabaseClient
        .from('Project')
        .select()
        .eq('id', createdProject.id);

      assert(!verifyError, `Verify deletion error: ${verifyError?.message}`);
      assert(shouldBeEmpty.length === 0, 'Project should be deleted');
    });
  });
}); 