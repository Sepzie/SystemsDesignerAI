import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import request from 'supertest';
import { getTestClient } from '../../../utilities/test-helpers/client-factory';
import { testConfig } from '../../../utilities/test-helpers/test-config';
import { createUser, createProject } from '../../../utilities/factories/test-data-factory';

describe('Projects API', () => {
  let server;
  let supabaseClient;
  let testUser;
  let testSession;

  beforeAll(async () => {
    // Set up test server
    const requestHandler = (req, res) => {
      return apiResolver(
        req,
        res,
        undefined,
        handler,
        {} /* params */,
        false /* preflightMode */
      );
    };
    
    server = createServer(requestHandler);
    supabaseClient = await getTestClient('supabase');
    
    // Create test user and session
    testUser = createUser();
    testSession = await supabaseClient.auth.createSession({
      user_id: testUser.id
    });
  });
  
  afterAll(() => {
    server.close();
  });
  
  beforeEach(() => {
    testConfig.resetMockSettings();
  });

  describe('GET /api/projects', () => {
    it('returns all projects for authenticated user', async () => {
      // Create multiple test projects
      const projects = [
        createProject({ userId: testUser.id }),
        createProject({ userId: testUser.id }),
        createProject({ userId: testUser.id })
      ];

      const response = await request(server)
        .get('/api/projects')
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.projects)).toBe(true);
      expect(response.body.projects.length).toBeGreaterThanOrEqual(projects.length);
      expect(response.body.projects[0]).toHaveProperty('id');
      expect(response.body.projects[0]).toHaveProperty('name');
    });

    it('returns empty array when user has no projects', async () => {
      const response = await request(server)
        .get('/api/projects')
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(response.status).toBe(200);
      expect(response.body.projects).toEqual([]);
    });

    it('returns 401 for unauthenticated requests', async () => {
      const response = await request(server)
        .get('/api/projects');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/projects', () => {
    it('creates a new project', async () => {
      const projectData = {
        name: 'New Test Project',
        description: 'Test Description'
      };

      const response = await request(server)
        .post('/api/projects')
        .set('Authorization', `Bearer ${testSession.access_token}`)
        .send(projectData);

      expect(response.status).toBe(201);
      expect(response.body.project).toMatchObject({
        name: projectData.name,
        description: projectData.description,
        user_id: testUser.id
      });
    });

    it('validates required fields', async () => {
      const response = await request(server)
        .post('/api/projects')
        .set('Authorization', `Bearer ${testSession.access_token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('handles duplicate project names', async () => {
      const projectData = {
        name: 'Duplicate Project',
        description: 'Test Description'
      };

      // Create first project
      await request(server)
        .post('/api/projects')
        .set('Authorization', `Bearer ${testSession.access_token}`)
        .send(projectData);

      // Attempt to create duplicate
      const response = await request(server)
        .post('/api/projects')
        .set('Authorization', `Bearer ${testSession.access_token}`)
        .send(projectData);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/projects/[id]', () => {
    it('returns project by ID', async () => {
      const project = createProject({ userId: testUser.id });

      const response = await request(server)
        .get(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(response.status).toBe(200);
      expect(response.body.project).toMatchObject({
        id: project.id,
        name: project.name
      });
    });

    it('returns 404 for non-existent project', async () => {
      const response = await request(server)
        .get('/api/projects/non-existent-id')
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('returns 403 for project owned by different user', async () => {
      const otherUser = createUser();
      const otherProject = createProject({ userId: otherUser.id });

      const response = await request(server)
        .get(`/api/projects/${otherProject.id}`)
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/projects/[id]', () => {
    it('updates project details', async () => {
      const project = createProject({ userId: testUser.id });
      const updateData = {
        name: 'Updated Project Name',
        description: 'Updated Description'
      };

      const response = await request(server)
        .put(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${testSession.access_token}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.project).toMatchObject({
        id: project.id,
        name: updateData.name,
        description: updateData.description
      });
    });

    it('validates update data', async () => {
      const project = createProject({ userId: testUser.id });
      const response = await request(server)
        .put(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${testSession.access_token}`)
        .send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('returns 404 for non-existent project', async () => {
      const response = await request(server)
        .put('/api/projects/non-existent-id')
        .set('Authorization', `Bearer ${testSession.access_token}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/projects/[id]', () => {
    it('deletes project', async () => {
      const project = createProject({ userId: testUser.id });

      const response = await request(server)
        .delete(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      // Verify deletion
      const getResponse = await request(server)
        .get(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(getResponse.status).toBe(404);
    });

    it('returns 404 for non-existent project', async () => {
      const response = await request(server)
        .delete('/api/projects/non-existent-id')
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('returns 403 for project owned by different user', async () => {
      const otherUser = createUser();
      const otherProject = createProject({ userId: otherUser.id });

      const response = await request(server)
        .delete(`/api/projects/${otherProject.id}`)
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 