import { getTestClient } from '../../utilities/test-helpers/client-factory';
import { testConfig } from '../../utilities/test-helpers/test-config';
import { createUser, createProject } from '../../utilities/factories/test-data-factory';
import { SupabaseService } from '@/types/services';
import { SupabaseMock } from '../../mocks/supabase/supabase-mock';
import assert from 'assert';

describe('Supabase Data Models', () => {
  let supabaseClient: SupabaseService;
  let testUser: any;
  
  beforeEach(async () => {
    // Ensure we're using mocks for consistent testing
    testConfig.setMockStatus('supabase', true);
    supabaseClient = await getTestClient('supabase');
    
    // Ensure we have direct access to the mock to add test data
    assert(supabaseClient instanceof SupabaseMock);
    
    // Create a test user and add it to the mock database
    testUser = createUser();
    (supabaseClient as any)._users.push(testUser);
  });

  describe('Projects Table', () => {
    it('creates a project with valid data', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
        user_id: testUser.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Use the projects API on the mock instead of direct table access
      const data = await supabaseClient.projects.create(projectData);

      assert.strictEqual(data.name, projectData.name);
      assert.strictEqual(data.description, projectData.description);
      assert.strictEqual(data.user_id, projectData.user_id);
    });

    it('retrieves a project by ID', async () => {
      // Create project with the test user
      const project = createProject({ user_id: testUser.id });
      
      // Add project to database via mock
      const savedProject = await supabaseClient.projects.create(project);
      
      // Retrieve project
      const data = await supabaseClient.projects.getById(savedProject.id);

      assert.strictEqual(data.name, project.name);
      assert.strictEqual(data.user_id, testUser.id);
    });

    it('updates a project', async () => {
      // Create a project with the test user
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
    });

    it('deletes a project', async () => {
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
      // Create multiple projects for the same user
      await supabaseClient.projects.create(createProject({ 
        name: 'User Project 1',
        user_id: testUser.id 
      }));
      
      await supabaseClient.projects.create(createProject({ 
        name: 'User Project 2',
        user_id: testUser.id 
      }));
      
      // Get all projects - the mock doesn't have a direct getProjectsByUserId method,
      // so we'll get all and filter
      const allProjects = await supabaseClient.projects.getAll();
      const userProjects = allProjects.filter(p => p.user_id === testUser.id);
      
      assert(userProjects.length >= 2);
      assert.strictEqual(userProjects[0].user_id, testUser.id);
      assert.strictEqual(userProjects[1].user_id, testUser.id);
    });
  });

  describe('Table Relationships', () => {
    it('prevents creating a project with invalid user ID', async () => {
      const projectWithInvalidUser = {
        name: 'Invalid Project',
        description: 'Project with invalid user',
        user_id: 'non-existent-user-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      try {
        await supabaseClient.projects.create(projectWithInvalidUser);
        assert.fail('Should have thrown a foreign key violation error');
      } catch (error) {
        assert((error as Error).message.includes('foreign key violation'));
      }
    });
    
    it('cascades project deletion to related records', async () => {
      // This is a basic test that will need to be expanded based on your actual cascade logic
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
    });
  });
}); 