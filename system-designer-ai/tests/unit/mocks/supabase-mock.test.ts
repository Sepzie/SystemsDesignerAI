import { SupabaseMock } from '../../mocks/supabase/supabase-mock';

describe('Supabase Mock', () => {
  let supabaseMock: SupabaseMock;
  
  beforeEach(() => {
    supabaseMock = new SupabaseMock();
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
  
  describe('Projects Methods', () => {
    it('should get all projects', async () => {
      const projects = await supabaseMock.projects.getAll();
      expect(Array.isArray(projects)).toBe(true);
      expect(projects.length).toBeGreaterThan(0);
    });
    
    it('should get a project by ID', async () => {
      const project = await supabaseMock.projects.getById('test-project-1');
      expect(project).toBeDefined();
      expect(project.id).toBe('test-project-1');
    });
    
    it('should create a new project', async () => {
      const newProject = {
        name: 'New Test Project',
        description: 'A project created in tests',
        userId: 'test-user-1'
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
      // Create a project
      const project = await supabaseMock.projects.create({
        name: 'Project to Update',
        description: 'This will be updated',
        userId: 'test-user-1'
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
      expect(updatedProject.updatedAt).toBeDefined();
    });
    
    it('should delete a project', async () => {
      // Create a project
      const project = await supabaseMock.projects.create({
        name: 'Project to Delete',
        description: 'This will be deleted',
        userId: 'test-user-1'
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
  
  describe('Error Handling', () => {
    it('should simulate API errors when configured', async () => {
      // Configure mock to fail next request
      supabaseMock.shouldFailNextRequest = true;
      
      // Attempt operation
      await expect(supabaseMock.projects.getAll()).rejects.toThrow('Mock API error');
      
      // Flag should be reset after use
      expect(supabaseMock.shouldFailNextRequest).toBe(false);
      
      // Next request should succeed
      const projects = await supabaseMock.projects.getAll();
      expect(Array.isArray(projects)).toBe(true);
    });
  });
}); 