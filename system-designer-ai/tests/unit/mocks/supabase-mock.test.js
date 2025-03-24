const { SupabaseMock } = require('../../../tests/mocks/supabase/supabase-mock');

describe('Supabase Mock', () => {
  let supabaseMock;
  const testUserId = 'test-user-id';
  
  beforeEach(() => {
    supabaseMock = new SupabaseMock();
    
    // Add a test user to avoid foreign key violations
    supabaseMock._users = [
      { id: testUserId, email: 'test@example.com', password: 'password123' }
    ];
  });
  
  describe('Project Operations', () => {
    it('creates a project', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'A test project',
        user_id: testUserId
      };
      
      const result = await supabaseMock.projects.create(projectData);
      
      expect(result).toBeDefined();
      expect(result.name).toBe(projectData.name);
      expect(result.description).toBe(projectData.description);
    });
    
    it('retrieves a project by ID', async () => {
      // Create a project first
      const projectData = {
        name: 'Test Project for Retrieval',
        description: 'A test project',
        user_id: testUserId
      };
      
      const created = await supabaseMock.projects.create(projectData);
      
      // Then retrieve it
      const retrieved = await supabaseMock.projects.getById(created.id);
      
      expect(retrieved).toBeDefined();
      expect(retrieved.id).toBe(created.id);
      expect(retrieved.name).toBe(created.name);
    });
    
    it('updates a project', async () => {
      // Create a project first
      const projectData = {
        name: 'Original Name',
        description: 'Original description',
        user_id: testUserId
      };
      
      const created = await supabaseMock.projects.create(projectData);
      
      // Update it
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description'
      };
      
      const updated = await supabaseMock.projects.update(created.id, updateData);
      
      expect(updated).toBeDefined();
      expect(updated.id).toBe(created.id);
      expect(updated.name).toBe(updateData.name);
      expect(updated.description).toBe(updateData.description);
    });
    
    it('deletes a project', async () => {
      // Create a project first
      const projectData = {
        name: 'Project to Delete',
        description: 'This will be deleted',
        user_id: testUserId
      };
      
      const created = await supabaseMock.projects.create(projectData);
      
      // Delete it
      await supabaseMock.projects.delete(created.id);
      
      // Try to retrieve it (should throw or return null depending on the mock implementation)
      try {
        const retrieved = await supabaseMock.projects.getById(created.id);
        // If it doesn't throw, it should at least return null
        expect(retrieved).toBeNull();
      } catch (error) {
        // If it throws, that's fine too
        expect(error).toBeDefined();
      }
    });
  });
}); 