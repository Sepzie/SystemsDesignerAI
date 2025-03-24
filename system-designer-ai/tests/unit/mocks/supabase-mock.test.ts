import { SupabaseMock } from '../../mocks/supabase/supabase-mock';

describe('Supabase Mock', () => {
  let supabaseMock: SupabaseMock;
  const testUserId = 'test-user-1'; // Match the ID used in the mock's constructor
  
  beforeEach(() => {
    supabaseMock = new SupabaseMock();
    
    // Make sure mock initialization completes
    expect(supabaseMock).toBeDefined();
    expect(supabaseMock.auth).toBeDefined();
    expect(typeof supabaseMock.auth.signUp).toBe('function');
    
    // Ensure a test user exists - the SupabaseMock constructor should already add this user
    expect(supabaseMock['_users'].some(u => u.id === testUserId)).toBeTruthy();
  });
  
  describe('Auth Methods', () => {
    it('should sign up a user', async () => {
      const result = await supabaseMock.auth.signUp({
        email: 'newuser@example.com',
        password: 'password123'
      });
      
      expect(result.data.session).toBeDefined();
      expect(result.data.session.user.email).toBe('newuser@example.com');
      expect(result.error).toBeNull();
    });
    
    it('should sign in a user with valid credentials', async () => {
      // The mock is pre-populated with test@example.com / password123
      const result = await supabaseMock.auth.signIn({
        email: 'test@example.com',
        password: 'password123'
      });
      
      expect(result.data.session).toBeDefined();
      expect(result.data.session.user.email).toBe('test@example.com');
      expect(result.error).toBeNull();
    });
    
    it('should return an error for invalid login', async () => {
      const result = await supabaseMock.auth.signIn({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      
      expect(result.data.session).toBeNull();
      expect(result.error.message).toBe('Invalid login credentials');
    });
    
    it('should sign out a user', async () => {
      // Sign in first
      await supabaseMock.auth.signIn({
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Verify session exists
      let session = await supabaseMock.auth.getSession();
      expect(session.data.session).toBeTruthy();
      
      // Sign out
      await supabaseMock.auth.signOut();
      
      // Verify session is gone
      session = await supabaseMock.auth.getSession();
      expect(session.data.session).toBeNull();
    });
  });
  
  // Projects tests are now enabled
  describe('Projects Methods', () => {
    it('should get all projects', async () => {
      // Verify the projects property exists and has methods
      expect(supabaseMock.projects).toBeDefined();
      expect(typeof supabaseMock.projects.getAll).toBe('function');
      
      const projects = await supabaseMock.projects.getAll();
      expect(Array.isArray(projects)).toBe(true);
      // The constructor should create at least one test project
      expect(projects.length).toBeGreaterThan(0);
    });
    
    it('should get a project by ID', async () => {
      // Use the ID of the project that's created in the constructor
      const project = await supabaseMock.projects.getById('test-project-1');
      expect(project).toBeDefined();
      expect(project.id).toBe('test-project-1');
    });
    
    it('should create a new project', async () => {
      // Note: using user_id instead of userId to match the implementation
      const newProject = {
        name: 'New Test Project',
        description: 'A project created in tests',
        user_id: testUserId
      };
      
      const createdProject = await supabaseMock.projects.create(newProject);
      expect(createdProject.id).toBeDefined();
      expect(createdProject.name).toBe(newProject.name);
      expect(createdProject.description).toBe(newProject.description);
      
      // Verify it's in the list of all projects
      const allProjects = await supabaseMock.projects.getAll();
      const foundProject = allProjects.find(p => p.id === createdProject.id);
      expect(foundProject).toBeDefined();
    });
    
    it('should update a project', async () => {
      // Create a project with correct field names
      const project = await supabaseMock.projects.create({
        name: 'Project to Update',
        description: 'This will be updated',
        user_id: testUserId
      });
      
      // Update it
      const updatedData = {
        name: 'Updated Project Name',
        description: 'This has been updated'
      };
      
      const updatedProject = await supabaseMock.projects.update(project.id, updatedData);
      expect(updatedProject.id).toBe(project.id);
      expect(updatedProject.name).toBe(updatedData.name);
      expect(updatedProject.description).toBe(updatedData.description);
      expect(updatedProject.updated_at).toBeDefined(); // Using updated_at instead of updatedAt
    });
    
    it('should delete a project', async () => {
      // Create a project with correct field names
      const project = await supabaseMock.projects.create({
        name: 'Project to Delete',
        description: 'This will be deleted',
        user_id: testUserId
      });
      
      // Get count before deletion
      const projectsBefore = await supabaseMock.projects.getAll();
      const countBefore = projectsBefore.length;
      
      // Delete it
      await supabaseMock.projects.delete(project.id);
      
      // Verify it's gone
      const projectsAfter = await supabaseMock.projects.getAll();
      expect(projectsAfter.length).toBe(countBefore - 1);
      
      const deletedProject = await supabaseMock.projects.getById(project.id);
      expect(deletedProject).toBeNull();
    });
  });
  
  // Error handling tests are now enabled
  describe('Error Handling', () => {
    it('should simulate API errors when configured', async () => {
      // Configure mock to fail next request
      supabaseMock.shouldFailNextRequest = true;
      
      // Attempt operation
      try {
        await supabaseMock.projects.getAll();
        fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('Mock API error');
      }
      
      // Flag should be reset after use
      expect(supabaseMock.shouldFailNextRequest).toBe(false);
      
      // Next request should succeed
      const projects = await supabaseMock.projects.getAll();
      expect(Array.isArray(projects)).toBe(true);
    });
    
    it('should reject projects with invalid user IDs', async () => {
      // Try to create a project with non-existent user
      try {
        await supabaseMock.projects.create({
          name: 'Invalid Project',
          description: 'This should fail',
          user_id: 'non-existent-user-id'
        });
        fail('Should have thrown a foreign key error');
      } catch (error) {
        expect((error as Error).message).toContain('foreign key violation');
      }
    });
  });
}); 