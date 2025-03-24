const { createTestClient } = require('../../utilities/test-helpers/supabase-test-client');
const { SupabaseMock } = require('../../mocks/supabase/supabase-mock');

describe('Supabase Data Models', () => {
  let supabaseClient;
  const testUserId = 'test-user-id';
  
  beforeEach(() => {
    // Create a direct instance of SupabaseMock
    supabaseClient = new SupabaseMock();
    
    // Add a test user to avoid foreign key violations
    supabaseClient._users = [
      { id: testUserId, email: 'test@example.com', password: 'password123' }
    ];
  });

  describe('Projects Table', () => {
    it('creates a project with valid data', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
        user_id: testUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Use the projects.create method directly
      const result = await supabaseClient.projects.create(projectData);

      expect(result).toBeDefined();
      expect(result.name).toBe(projectData.name);
      expect(result.description).toBe(projectData.description);
      expect(result.user_id).toBe(projectData.user_id);
    });

    it('retrieves a project by ID', async () => {
      // First create a project
      const project = await supabaseClient.projects.create({
        name: 'Test Project',
        description: 'Test Description',
        user_id: testUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Now retrieve it by ID
      const retrievedProject = await supabaseClient.projects.getById(project.id);

      expect(retrievedProject).toBeDefined();
      expect(retrievedProject.id).toBe(project.id);
      expect(retrievedProject.name).toBe(project.name);
    });

    it('updates a project', async () => {
      // First create a project
      const project = await supabaseClient.projects.create({
        name: 'Test Project',
        description: 'Test Description',
        user_id: testUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      const updateData = {
        name: 'Updated Project Name'
      };

      // Update the project
      const updatedProject = await supabaseClient.projects.update(project.id, updateData);

      expect(updatedProject).toBeDefined();
      expect(updatedProject.id).toBe(project.id);
      expect(updatedProject.name).toBe(updateData.name);
      expect(updatedProject.description).toBe(project.description); // Unchanged field
    });

    it('deletes a project', async () => {
      // First create a project
      const project = await supabaseClient.projects.create({
        name: 'Test Project',
        description: 'Test Description',
        user_id: testUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      // Delete the project
      await supabaseClient.projects.delete(project.id);
      
      // Verify deletion
      const allProjects = await supabaseClient.projects.getAll();
      const deletedProject = allProjects.find(p => p.id === project.id);
      
      expect(deletedProject).toBeUndefined();
    });
  });

  describe('Table Relationships', () => {
    it('maintains referential integrity between users and projects', async () => {
      // Try to create a project with a non-existent user ID
      const nonExistentUserId = 'non-existent-user-id';
      
      // This should throw a foreign key error
      await expect(
        supabaseClient.projects.create({
          name: 'Invalid Project',
          user_id: nonExistentUserId
        })
      ).rejects.toThrow(/foreign key violation/);
    });

    it('retrieves all projects for a user', async () => {
      // Create multiple projects for the same user
      await supabaseClient.projects.create({
        name: 'Project 1',
        description: 'Project 1 Description',
        user_id: testUserId
      });
      
      await supabaseClient.projects.create({
        name: 'Project 2',
        description: 'Project 2 Description',
        user_id: testUserId
      });
      
      // Get all projects
      const allProjects = await supabaseClient.projects.getAll();
      
      // Filter for the test user's projects
      const userProjects = allProjects.filter(p => p.user_id === testUserId);
      
      expect(userProjects.length).toBeGreaterThanOrEqual(2);
      expect(userProjects[0].user_id).toBe(testUserId);
      expect(userProjects[1].user_id).toBe(testUserId);
    });
  });
}); 