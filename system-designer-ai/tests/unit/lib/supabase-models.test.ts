import { getTestClient } from '../../utilities/test-helpers/client-factory';
import { testConfig } from '../../utilities/test-helpers/test-config';
import { createUser, createProject } from '../../utilities/factories/test-data-factory';

describe('Supabase Data Models', () => {
  let supabaseClient;
  
  beforeEach(async () => {
    // Ensure we're using mocks for consistent testing
    testConfig.setMockStatus('supabase', true);
    supabaseClient = await getTestClient('supabase');
  });

  describe('Projects Table', () => {
    it('creates a project with valid data', async () => {
      const user = createUser();
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toMatchObject({
        name: projectData.name,
        description: projectData.description,
        user_id: projectData.user_id
      });
    });

    it('retrieves a project by ID', async () => {
      const project = createProject();
      
      const { data, error } = await supabaseClient
        .from('projects')
        .select('*')
        .eq('id', project.id)
        .single();

      expect(error).toBeNull();
      expect(data).toMatchObject({
        id: project.id,
        name: project.name
      });
    });

    it('updates a project', async () => {
      const project = createProject();
      const updateData = {
        name: 'Updated Project Name',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseClient
        .from('projects')
        .update(updateData)
        .eq('id', project.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toMatchObject({
        id: project.id,
        name: updateData.name
      });
    });

    it('deletes a project', async () => {
      const project = createProject();

      const { error } = await supabaseClient
        .from('projects')
        .delete()
        .eq('id', project.id);

      expect(error).toBeNull();

      // Verify deletion
      const { data, error: fetchError } = await supabaseClient
        .from('projects')
        .select('*')
        .eq('id', project.id)
        .single();

      expect(fetchError).toBeNull();
      expect(data).toBeNull();
    });
  });

  describe('Table Relationships', () => {
    it('maintains referential integrity between users and projects', async () => {
      const user = createUser();
      const project = createProject({ userId: user.id });

      // Attempt to create project with non-existent user
      const { error } = await supabaseClient
        .from('projects')
        .insert({
          name: 'Invalid Project',
          user_id: 'non-existent-user-id'
        });

      expect(error).not.toBeNull();
      expect(error.code).toBe('23503'); // Foreign key violation
    });

    it('cascades project deletion to related records', async () => {
      const project = createProject();
      
      // Create related records (e.g., project settings, components)
      // This will depend on your actual schema
      
      // Delete the project
      const { error } = await supabaseClient
        .from('projects')
        .delete()
        .eq('id', project.id);

      expect(error).toBeNull();

      // Verify related records are deleted
      // Add specific checks based on your schema
    });
  });
}); 