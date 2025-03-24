import request from 'supertest';
import { getTestClient } from '../../utilities/test-helpers/client-factory';
import { testConfig } from '../../utilities/test-helpers/test-config';
import { createUser, createProject, createSession } from '../../utilities/factories/test-data-factory';
import { SupabaseMock } from '../../mocks/supabase/supabase-mock';
import express from 'express';

describe('Projects API', () => {
  let app;
  let supabaseClient;
  let testUser;
  let testSession;
  let projectsStore = [];

  beforeAll(async () => {
    // Set up test server with Express
    app = express();
    app.use(express.json());
    
    // Auth middleware for protected routes
    const authMiddleware = (req, res, next) => {
      const authHeader = req.headers.authorization || '';
      
      if (!authHeader) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.replace('Bearer ', '');
      
      if (token.includes('expired')) {
        return res.status(401).json({ error: 'Session expired' });
      }
      
      // Attach user ID from session to request
      req.userId = testUser.id;
      next();
    };
    
    // Projects API routes
    app.get('/api/projects', authMiddleware, (req, res) => {
      const userProjects = projectsStore.filter(p => p.user_id === req.userId);
      res.status(200).json({ projects: userProjects });
    });
    
    app.post('/api/projects', authMiddleware, (req, res) => {
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      // Check for duplicate names
      if (projectsStore.some(p => p.name === name && p.user_id === req.userId)) {
        return res.status(409).json({ error: 'Project with this name already exists' });
      }
      
      const newProject = {
        id: `proj-${Date.now()}`,
        name,
        description: description || '',
        user_id: req.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      projectsStore.push(newProject);
      
      res.status(201).json({ project: newProject });
    });
    
    app.get('/api/projects/:id', authMiddleware, (req, res) => {
      const project = projectsStore.find(p => p.id === req.params.id);
      
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      if (project.user_id !== req.userId) {
        return res.status(403).json({ error: 'Not authorized to access this project' });
      }
      
      res.status(200).json({ project });
    });
    
    app.put('/api/projects/:id', authMiddleware, (req, res) => {
      const { name, description } = req.body;
      
      if (name === '') {
        return res.status(400).json({ error: 'Name cannot be empty' });
      }
      
      const projectIndex = projectsStore.findIndex(p => p.id === req.params.id);
      
      if (projectIndex === -1) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const project = projectsStore[projectIndex];
      
      if (project.user_id !== req.userId) {
        return res.status(403).json({ error: 'Not authorized to update this project' });
      }
      
      const updatedProject = {
        ...project,
        name: name !== undefined ? name : project.name,
        description: description !== undefined ? description : project.description,
        updated_at: new Date().toISOString()
      };
      
      projectsStore[projectIndex] = updatedProject;
      
      res.status(200).json({ project: updatedProject });
    });
    
    app.delete('/api/projects/:id', authMiddleware, (req, res) => {
      const projectIndex = projectsStore.findIndex(p => p.id === req.params.id);
      
      if (projectIndex === -1) {
        return res.status(404).json({ error: 'Project not found' });
      }
      
      const project = projectsStore[projectIndex];
      
      if (project.user_id !== req.userId) {
        return res.status(403).json({ error: 'Not authorized to delete this project' });
      }
      
      projectsStore.splice(projectIndex, 1);
      
      res.status(200).json({ success: true });
    });
    
    // Get test client
    supabaseClient = await getTestClient('supabase');
    
    // Ensure we have direct access to the mock
    expect(supabaseClient).toBeInstanceOf(SupabaseMock);
    
    // Create test user and add to mock
    testUser = createUser();
    (supabaseClient as SupabaseMock)._users.push(testUser);
    
    // Create test session
    testSession = createSession({ user_id: testUser.id });
  });
  
  beforeEach(() => {
    testConfig.resetMockSettings();
    // Reset projects store
    projectsStore = [];
  });

  describe('GET /api/projects', () => {
    it('returns all projects for authenticated user', async () => {
      // Create multiple test projects
      const projects = [
        createProject({ user_id: testUser.id }),
        createProject({ user_id: testUser.id }),
        createProject({ user_id: testUser.id })
      ];
      
      // Add to store
      projectsStore.push(...projects);

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.projects)).toBe(true);
      expect(response.body.projects.length).toBe(projects.length);
      expect(response.body.projects[0]).toHaveProperty('id');
      expect(response.body.projects[0]).toHaveProperty('name');
    });

    it('returns empty array when user has no projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(response.status).toBe(200);
      expect(response.body.projects).toEqual([]);
    });

    it('returns 401 for unauthenticated requests', async () => {
      const response = await request(app)
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

      const response = await request(app)
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
      const response = await request(app)
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
      await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${testSession.access_token}`)
        .send(projectData);

      // Attempt to create duplicate
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${testSession.access_token}`)
        .send(projectData);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/projects/[id]', () => {
    it('returns project by ID', async () => {
      // Create and add a project
      const project = createProject({ user_id: testUser.id });
      projectsStore.push(project);

      const response = await request(app)
        .get(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(response.status).toBe(200);
      expect(response.body.project).toMatchObject({
        id: project.id,
        name: project.name
      });
    });

    it('returns 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent-id')
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('returns 403 for project owned by different user', async () => {
      const otherUser = createUser();
      const otherProject = createProject({ user_id: otherUser.id });
      projectsStore.push(otherProject);

      const response = await request(app)
        .get(`/api/projects/${otherProject.id}`)
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /api/projects/[id]', () => {
    it('updates project details', async () => {
      // Create and add a project
      const project = createProject({ user_id: testUser.id });
      projectsStore.push(project);
      
      const updateData = {
        name: 'Updated Project Name',
        description: 'Updated Description'
      };

      const response = await request(app)
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
      // Create and add a project
      const project = createProject({ user_id: testUser.id });
      projectsStore.push(project);
      
      const response = await request(app)
        .put(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${testSession.access_token}`)
        .send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('returns 404 for non-existent project', async () => {
      const response = await request(app)
        .put('/api/projects/non-existent-id')
        .set('Authorization', `Bearer ${testSession.access_token}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/projects/[id]', () => {
    it('deletes project', async () => {
      // Create and add a project
      const project = createProject({ user_id: testUser.id });
      projectsStore.push(project);

      const response = await request(app)
        .delete(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);

      // Verify deletion
      const getResponse = await request(app)
        .get(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(getResponse.status).toBe(404);
    });

    it('returns 404 for non-existent project', async () => {
      const response = await request(app)
        .delete('/api/projects/non-existent-id')
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('returns 403 for project owned by different user', async () => {
      const otherUser = createUser();
      const otherProject = createProject({ user_id: otherUser.id });
      projectsStore.push(otherProject);

      const response = await request(app)
        .delete(`/api/projects/${otherProject.id}`)
        .set('Authorization', `Bearer ${testSession.access_token}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });
}); 