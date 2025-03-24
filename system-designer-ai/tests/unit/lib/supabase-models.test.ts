import { getTestClient } from '../../utilities/test-helpers/client-factory';
import { testConfig } from '../../utilities/test-helpers/test-config';
import { createUser, createProject } from '../../utilities/factories/test-data-factory';
import { SupabaseService } from '@/types/services';
import { setupTestData, cleanupTestData } from '../../utilities/test-helpers/db-setup';
import assert from 'assert';
import { SupabaseClient } from '@supabase/supabase-js';

describe('Supabase Data Models', () => {
  let supabaseClient: SupabaseClient;
  let testUser: any;
  let testData: any;
  
  beforeAll(async () => {
    // Set up test data in the real database if we're running integrated tests
    if (process.env.TEST_USE_REAL_SUPABASE === 'true') {
      try {
        testData = await setupTestData();
        console.log('Test data set up successfully for integrated tests');
      } catch (error) {
        console.error('Failed to set up test data:', error);
      }
    }
  });
  
  afterAll(async () => {
    // Clean up test data in the real database if we're running integrated tests
    if (process.env.TEST_USE_REAL_SUPABASE === 'true' && testData) {
      await cleanupTestData(testData);
    }
  });
  
  beforeEach(async () => {
    // Get test client (could be mock or real)
    supabaseClient = await getTestClient('supabase') as SupabaseClient;
    
    if (process.env.TEST_USE_REAL_SUPABASE === 'true' && testData) {
      // Use the test user created in the beforeAll hook
      testUser = testData.user;
    } else {
      // Create a test user for mock testing
      testUser = createUser();
      
      // If we're using mocks, add the user to mock database
      if (testConfig.useMocks.supabase) {
        const mockClient = supabaseClient as any;
        if (typeof mockClient._users !== 'undefined') {
          mockClient._users.push(testUser);
        }
      }
    }
  });

  describe('Projects Table', () => {
    it('creates a project with valid data', async () => {
      // Skip if using real DB without proper setup
      if (process.env.TEST_USE_REAL_SUPABASE === 'true' && !testData) {
        console.log('Skipping test with real Supabase - requires user setup');
        return;
      }
      
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
        user_id: testUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Use the projects API on the mock or proper Supabase API in integrated mode
      let projectResponse;
      
      if (process.env.TEST_USE_REAL_SUPABASE === 'true') {
        projectResponse = await supabaseClient
          .from('Project')
          .insert(projectData)
          .select()
          .single();
          
        assert(!projectResponse.error, `Error creating project: ${projectResponse.error?.message}`);
        assert(projectResponse.data);
      } else {
        // Use the projects API on the mock
        const mockClient = supabaseClient as any;
        // Check if the mock client has the projects method
        if (mockClient.projects && typeof mockClient.projects.create === 'function') {
          const data = await mockClient.projects.create(projectData);
          assert.strictEqual(data.name, projectData.name);
          assert.strictEqual(data.description, projectData.description);
          assert.strictEqual(data.user_id, projectData.user_id);
        } else {
          // Fall back to using Supabase client for mocked client without projects method
          const { data } = await supabaseClient
            .from('Project')
            .insert(projectData)
            .select()
            .single();
          
          assert(data);
          assert.strictEqual(data.name, projectData.name);
          assert.strictEqual(data.description, projectData.description);
        }
      }
    });

    it('retrieves a project by ID', async () => {
      // Skip if using real DB without proper setup
      if (process.env.TEST_USE_REAL_SUPABASE === 'true' && !testData) {
        console.log('Skipping test with real Supabase - no test data available');
        return;
      }
      
      let project;
      
      if (process.env.TEST_USE_REAL_SUPABASE === 'true' && testData.projects && testData.projects.length > 0) {
        // Use the first project from our test data
        project = testData.projects[0];
        
        // Retrieve the project
        const { data, error } = await supabaseClient
          .from('Project')
          .select()
          .eq('id', project.id)
          .single();
          
        assert(!error, `Error retrieving project: ${error?.message}`);
        assert(data);
        assert.strictEqual(data.id, project.id);
        assert.strictEqual(data.name, project.name);
      } else {
        // Create project with the test user for mock testing
        project = createProject({ user_id: testUser.id });
        
        // Add project to database via mock
        const mockClient = supabaseClient as any;
        
        // Check if the mock client has the projects method
        if (mockClient.projects && typeof mockClient.projects.create === 'function') {
          const savedProject = await mockClient.projects.create(project);
          
          // Retrieve project
          const data = await mockClient.projects.getById(savedProject.id);
          assert.strictEqual(data.name, project.name);
          assert.strictEqual(data.user_id, testUser.id);
        } else {
          // Fall back to using Supabase client for mocked client without projects method
          const { data: savedProject } = await supabaseClient
            .from('Project')
            .insert(project)
            .select()
            .single();
            
          const { data } = await supabaseClient
            .from('Project')
            .select()
            .eq('id', savedProject.id)
            .single();
            
          assert(data);
          assert.strictEqual(data.name, project.name);
        }
      }
    });

    it('updates a project', async () => {
      // Skip if using real DB without proper setup
      if (process.env.TEST_USE_REAL_SUPABASE === 'true' && !testData) {
        console.log('Skipping test with real Supabase - requires proper setup');
        return;
      }
      
      if (process.env.TEST_USE_REAL_SUPABASE === 'true') {
        // Get a new client with service role key to bypass RLS
        const serviceRoleClient = await getTestClient('supabase', true);
        
        // Create a test project
        const project = createProject({ user_id: testUser.id });
        const { data: savedProject, error: createError } = await serviceRoleClient
          .from('Project')
          .insert(project)
          .select()
          .single();
          
        assert(!createError, `Error creating project: ${createError?.message}`);
        assert(savedProject);
        
        // Update data
        const updateData = {
          name: 'Updated Project Name',
          description: 'Updated Description'
        };
        
        // Update the project
        const { data: updatedProject, error: updateError } = await serviceRoleClient
          .from('Project')
          .update(updateData)
          .eq('id', savedProject.id)
          .select()
          .single();
          
        assert(!updateError, `Error updating project: ${updateError?.message}`);
        assert(updatedProject);
        
        assert.strictEqual(updatedProject.id, savedProject.id);
        assert.strictEqual(updatedProject.name, updateData.name);
        assert.strictEqual(updatedProject.description, updateData.description);
        assert.strictEqual(updatedProject.user_id, testUser.id);
        
        // Clean up
        const { error: deleteError } = await serviceRoleClient
          .from('Project')
          .delete()
          .eq('id', savedProject.id);
          
        assert(!deleteError, `Error cleaning up project: ${deleteError?.message}`);
      } else {
        // Mock test implementation
        const project = createProject({ user_id: testUser.id });
        const savedProject = await supabaseClient.projects.create(project);
        
        // Update data
        const updateData = {
          name: 'Updated Project Name',
          description: 'Updated Description'
        };
        
        // Update the project
        const updatedProject = await supabaseClient.projects.update(savedProject.id, updateData);
        
        assert.strictEqual(updatedProject.id, savedProject.id);
        assert.strictEqual(updatedProject.name, updateData.name);
        assert.strictEqual(updatedProject.description, updateData.description);
        assert.strictEqual(updatedProject.user_id, testUser.id);
      }
    });

    it('deletes a project', async () => {
      // Skip if using real DB without user creation
      if (process.env.TEST_USE_REAL_SUPABASE === 'true') {
        console.log('Skipping test with real Supabase - requires user setup');
        return;
      }
      
      // Create a project with the test user
      const project = createProject({ user_id: testUser.id });
      const savedProject = await supabaseClient.projects.create(project);
      
      // Delete the project
      await supabaseClient.projects.delete(savedProject.id);
      
      // Try to retrieve it - should be null or undefined
      const retrievedProject = await supabaseClient.projects.getById(savedProject.id);
      assert(!retrievedProject);
    });
  });

  describe('User Projects Relationship', () => {
    it('retrieves all projects for a user', async () => {
      // Skip if using real DB without proper setup
      if (process.env.TEST_USE_REAL_SUPABASE === 'true' && !testData) {
        console.log('Skipping test with real Supabase - no test data available');
        return;
      }
      
      if (process.env.TEST_USE_REAL_SUPABASE === 'true') {
        // Create a test user if not exists
        const testUser = createUser();
        console.log(`Testing with user ID: ${testUser.id}`);
        
        // Clean up any existing projects for this user
        const { data: existingProjects, error: fetchError } = await supabaseClient
          .from('Project')
          .select()
          .eq('user_id', testUser.id);
          
        if (fetchError) {
          console.error('Error fetching existing projects:', fetchError);
        } else if (existingProjects && existingProjects.length > 0) {
          console.log(`Found ${existingProjects.length} existing projects to clean up`);
        }
        
        const { error: cleanupError } = await supabaseClient
          .from('Project')
          .delete()
          .eq('user_id', testUser.id);
        assert(!cleanupError, `Error cleaning up existing projects: ${cleanupError?.message}`);
        
        // Verify cleanup
        const { data: verifyCleanup, error: verifyError } = await supabaseClient
          .from('Project')
          .select()
          .eq('user_id', testUser.id);
          
        if (verifyError) {
          console.error('Error verifying cleanup:', verifyError);
        } else {
          console.log(`After cleanup, found ${verifyCleanup?.length || 0} projects`);
        }
        
        // Create multiple projects for the test user
        const projects = [
          createProject({ user_id: testUser.id, name: 'Test Project 1' }),
          createProject({ user_id: testUser.id, name: 'Test Project 2' }),
          createProject({ user_id: testUser.id, name: 'Test Project 3' })
        ];
        
        // Insert projects using service role key to bypass RLS
        for (const project of projects) {
          const { error } = await supabaseClient
            .from('Project')
            .insert(project);
          assert(!error, `Error creating project: ${error?.message}`);
        }
        
        // Get projects for the user
        const { data: userProjects, error } = await supabaseClient
          .from('Project')
          .select()
          .eq('user_id', testUser.id);
          
        assert(!error, `Error retrieving projects: ${error?.message}`);
        assert(userProjects);
        console.log(`Found ${userProjects.length} projects for user`);
        
        assert.strictEqual(userProjects.length, projects.length);
        
        // Check that the projects belong to our test user
        for (const project of userProjects) {
          assert.strictEqual(project.user_id, testUser.id);
        }
        
        // Clean up
        const { error: deleteError } = await supabaseClient
          .from('Project')
          .delete()
          .eq('user_id', testUser.id);
        assert(!deleteError, `Error cleaning up projects: ${deleteError?.message}`);
      } else {
        const mockClient = supabaseClient as any;
        
        // Check if the mock client has the projects method
        if (mockClient.projects && typeof mockClient.projects.create === 'function') {
          // Create multiple projects for the same user
          await mockClient.projects.create(createProject({ 
            name: 'User Project 1',
            user_id: testUser.id 
          }));
          
          await mockClient.projects.create(createProject({ 
            name: 'User Project 2',
            user_id: testUser.id 
          }));
          
          // Get all projects and filter
          const allProjects = await mockClient.projects.getAll();
          const userProjects = allProjects.filter(p => p.user_id === testUser.id);
          
          assert(userProjects.length >= 2);
          assert.strictEqual(userProjects[0].user_id, testUser.id);
          assert.strictEqual(userProjects[1].user_id, testUser.id);
        } else {
          // Fall back to using Supabase client for mocked client without projects method
          await supabaseClient
            .from('Project')
            .insert([
              createProject({ name: 'User Project 1', user_id: testUser.id }),
              createProject({ name: 'User Project 2', user_id: testUser.id })
            ]);
            
          const { data: projects } = await supabaseClient
            .from('Project')
            .select()
            .eq('user_id', testUser.id);
            
          assert(projects && projects.length >= 2);
          assert.strictEqual(projects[0].user_id, testUser.id);
          assert.strictEqual(projects[1].user_id, testUser.id);
        }
      }
    });
  });

  describe('Table Relationships', () => {
    it('prevents creating a project with invalid user ID', async () => {
      // Skip if using real DB without user creation
      if (process.env.TEST_USE_REAL_SUPABASE === 'true' && !testData) {
        console.log('Skipping test with real Supabase - requires proper setup');
        return;
      }
      
      const projectWithInvalidUser = {
        name: 'Invalid Project',
        description: 'Project with invalid user',
        user_id: '00000000-0000-0000-0000-000000000001', // Valid UUID format that doesn't exist
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      if (process.env.TEST_USE_REAL_SUPABASE === 'true') {
        // Get a new client with service role key to bypass RLS
        const serviceRoleClient = await getTestClient('supabase', true);
        
        // Try to create project with invalid user ID
        const { error } = await serviceRoleClient
          .from('Project')
          .insert(projectWithInvalidUser);
          
        assert(error, 'Should have returned an error');
        assert(
          error.message.includes('foreign key violation') || 
          error.message.includes('user_id'),
          `Expected foreign key violation error, got: ${error.message}`
        );
      } else {
        try {
          await supabaseClient.projects.create(projectWithInvalidUser);
          assert.fail('Should have thrown a foreign key violation error');
        } catch (error) {
          assert((error as Error).message.includes('foreign key violation') || 
                 (error as Error).message.includes('user_id'));
        }
      }
    });
    
    it('cascades project deletion to related records', async () => {
      // Skip if using real DB without user creation
      if (process.env.TEST_USE_REAL_SUPABASE === 'true' && !testData) {
        console.log('Skipping test with real Supabase - requires proper setup');
        return;
      }
      
      if (process.env.TEST_USE_REAL_SUPABASE === 'true') {
        // Get a new client with service role key to bypass RLS
        const serviceRoleClient = await getTestClient('supabase', true);
        
        // Create a test project
        const project = createProject({ user_id: testUser.id });
        const { data: savedProject, error: createError } = await serviceRoleClient
          .from('Project')
          .insert(project)
          .select()
          .single();
          
        assert(!createError, `Error creating project: ${createError?.message}`);
        assert(savedProject);
        
        // Create a related record (DesignAsset)
        const { error: assetError } = await serviceRoleClient
          .from('DesignAsset')
          .insert({
            project_id: savedProject.id,
            name: 'Test Asset',
            asset_type: 'system_context'
          });
          
        assert(!assetError, `Error creating design asset: ${assetError?.message}`);
        
        // Delete the project
        const { error: deleteError } = await serviceRoleClient
          .from('Project')
          .delete()
          .eq('id', savedProject.id);
          
        assert(!deleteError, `Error deleting project: ${deleteError?.message}`);
        
        // Verify project was deleted
        const { data: deletedProject, error: fetchError } = await serviceRoleClient
          .from('Project')
          .select()
          .eq('id', savedProject.id)
          .single();
          
        assert(!fetchError || fetchError.code === 'PGRST116', 'Project should be deleted');
        assert(!deletedProject);
        
        // Verify related record was also deleted
        const { data: deletedAsset, error: assetFetchError } = await serviceRoleClient
          .from('DesignAsset')
          .select()
          .eq('project_id', savedProject.id)
          .single();
          
        assert(!assetFetchError || assetFetchError.code === 'PGRST116', 'Design asset should be deleted');
        assert(!deletedAsset);
      } else {
        // Mock test implementation
        const project = createProject({ user_id: testUser.id });
        const savedProject = await supabaseClient.projects.create(project);
        
        // Create some related records if needed
        // ...
        
        // Delete the project
        await supabaseClient.projects.delete(savedProject.id);
        
        // Verify project was deleted
        const retrievedProject = await supabaseClient.projects.getById(savedProject.id);
        assert(!retrievedProject);
        
        // Verify related records were also deleted if cascade is implemented
        // ...
      }
    });
  });
}); 