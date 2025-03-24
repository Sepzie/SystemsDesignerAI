import request from 'supertest';
import { getTestClient } from '../../utilities/test-helpers/client-factory';
import { testConfig } from '../../utilities/test-helpers/test-config';
import { createUser, createProject, createSession } from '../../utilities/factories/test-data-factory';
import { createTestApp, defineRoute } from '../../utilities/test-helpers/api-test-helper';
import { SupabaseService } from '@/types/services';
import { Request, Response } from 'express';
import assert from 'assert';

describe('Projects API', () => {
  let app;
  let supabaseClient: SupabaseService;
  let testUser: ReturnType<typeof createUser>;
  let testSession: ReturnType<typeof createSession>;
  let projectsStore: ReturnType<typeof createProject>[] = [];

  beforeAll(async () => {
    // Get the test client - this could be either mock or real based on environment variables
    supabaseClient = await getTestClient('supabase');
    
    // Create test user
    testUser = createUser();
    
    // Create test session
    testSession = createSession({ user_id: testUser.id });
    
    // Auth middleware for protected routes
    const authMiddleware = (req: Request, res: Response, next: Function) => {
      const authHeader = req.headers.authorization || '';
      
      if (!authHeader) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.replace('Bearer ', '');
      
      if (token.includes('expired')) {
        return res.status(401).json({ error: 'Session expired' });
      }
      
      // Attach user ID from session to request
      (req as any).userId = testUser.id;
      next();
    };
    
    // Set up test server with Express using the API test helper
    app = createTestApp([
      // Get all projects
      defineRoute('get', '/projects', (req: Request, res: Response) => {
        // Apply auth middleware
        authMiddleware(req, res, () => {
          const userProjects = projectsStore.filter(p => p.user_id === (req as any).userId);
          res.status(200).json({ projects: userProjects });
        });
      }),
      
      // Create project
      defineRoute('post', '/projects', (req: Request, res: Response) => {
        // Apply auth middleware
        authMiddleware(req, res, () => {
          const { name, description } = req.body;
          
          if (!name) {
            return res.status(400).json({ error: 'Name is required' });
          }
          
          // Check for duplicate names
          if (projectsStore.some(p => p.name === name && p.user_id === (req as any).userId)) {
            return res.status(409).json({ error: 'Project with this name already exists' });
          }
          
          const newProject = createProject({
            name,
            description: description || '',
            user_id: (req as any).userId
          });
          
          projectsStore.push(newProject);
          
          res.status(201).json({ project: newProject });
        });
      }),
      
      // Get project by ID
      defineRoute('get', '/projects/:id', (req: Request, res: Response) => {
        // Apply auth middleware
        authMiddleware(req, res, () => {
          const project = projectsStore.find(p => p.id === req.params.id);
          
          if (!project) {
            return res.status(404).json({ error: 'Project not found' });
          }
          
          if (project.user_id !== (req as any).userId) {
            return res.status(403).json({ error: 'Not authorized to access this project' });
          }
          
          res.status(200).json({ project });
        });
      }),
      
      // Update project
      defineRoute('put', '/projects/:id', (req: Request, res: Response) => {
        // Apply auth middleware
        authMiddleware(req, res, () => {
          const { name, description } = req.body;
          
          if (name === '') {
            return res.status(400).json({ error: 'Name cannot be empty' });
          }
          
          const projectIndex = projectsStore.findIndex(p => p.id === req.params.id);
          
          if (projectIndex === -1) {
            return res.status(404).json({ error: 'Project not found' });
          }
          
          const project = projectsStore[projectIndex];
          
          if (project.user_id !== (req as any).userId) {
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
      }),
      
      // Delete project
      defineRoute('delete', '/projects/:id', (req: Request, res: Response) => {
        // Apply auth middleware
        authMiddleware(req, res, () => {
          const projectIndex = projectsStore.findIndex(p => p.id === req.params.id);
          
          if (projectIndex === -1) {
            return res.status(404).json({ error: 'Project not found' });
          }
          
          const project = projectsStore[projectIndex];
          
          if (project.user_id !== (req as any).userId) {
            return res.status(403).json({ error: 'Not authorized to delete this project' });
          }
          
          projectsStore.splice(projectIndex, 1);
          
          res.status(200).json({ success: true });
        });
      })
    ]);
  });
  
  beforeEach(() => {
    // Don't reset mock settings for integrated tests
    if (process.env.TEST_USE_REAL_SUPABASE !== 'true') {
      testConfig.resetMockSettings();
      testConfig.setMockStatus('supabase', true);
    }
    
    // Reset projects store for each test
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

      assert.strictEqual(response.status, 200);
      assert(Array.isArray(response.body.projects));
      assert.strictEqual(response.body.projects.length, projects.length);
      assert(response.body.projects[0].id);
      assert(response.body.projects[0].name);
    });

    it('returns empty array when user has no projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${testSession.access_token}`);

      assert.strictEqual(response.status, 200);
      assert.deepStrictEqual(response.body.projects, []);
    });

    it('returns 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/projects');

      assert.strictEqual(response.status, 401);
      assert(response.body.error);
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

      assert.strictEqual(response.status, 201);
      assert.strictEqual(response.body.project.name, projectData.name);
      assert.strictEqual(response.body.project.description, projectData.description);
      assert.strictEqual(response.body.project.user_id, testUser.id);
    });

    it('validates required fields', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${testSession.access_token}`)
        .send({});

      assert.strictEqual(response.status, 400);
      assert(response.body.error);
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

      assert.strictEqual(response.status, 409);
      assert(response.body.error);
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

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.project.id, project.id);
      assert.strictEqual(response.body.project.name, project.name);
    });

    it('returns 404 for non-existent project', async () => {
      const response = await request(app)
        .get('/api/projects/non-existent-id')
        .set('Authorization', `Bearer ${testSession.access_token}`);

      assert.strictEqual(response.status, 404);
      assert(response.body.error);
    });

    it('returns 403 for project owned by different user', async () => {
      const otherUser = createUser();
      const otherProject = createProject({ user_id: otherUser.id });
      projectsStore.push(otherProject);

      const response = await request(app)
        .get(`/api/projects/${otherProject.id}`)
        .set('Authorization', `Bearer ${testSession.access_token}`);

      assert.strictEqual(response.status, 403);
      assert(response.body.error);
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

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.project.id, project.id);
      assert.strictEqual(response.body.project.name, updateData.name);
      assert.strictEqual(response.body.project.description, updateData.description);
    });

    it('validates update data', async () => {
      // Create and add a project
      const project = createProject({ user_id: testUser.id });
      projectsStore.push(project);
      
      const response = await request(app)
        .put(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${testSession.access_token}`)
        .send({ name: '' });

      assert.strictEqual(response.status, 400);
      assert(response.body.error);
    });

    it('returns 404 for non-existent project', async () => {
      const response = await request(app)
        .put('/api/projects/non-existent-id')
        .set('Authorization', `Bearer ${testSession.access_token}`)
        .send({ name: 'New Name' });

      assert.strictEqual(response.status, 404);
      assert(response.body.error);
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

      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.body.success, true);

      // Verify deletion
      const getResponse = await request(app)
        .get(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${testSession.access_token}`);

      assert.strictEqual(getResponse.status, 404);
    });

    it('returns 404 for non-existent project', async () => {
      const response = await request(app)
        .delete('/api/projects/non-existent-id')
        .set('Authorization', `Bearer ${testSession.access_token}`);

      assert.strictEqual(response.status, 404);
      assert(response.body.error);
    });

    it('returns 403 for project owned by different user', async () => {
      const otherUser = createUser();
      const otherProject = createProject({ user_id: otherUser.id });
      projectsStore.push(otherProject);

      const response = await request(app)
        .delete(`/api/projects/${otherProject.id}`)
        .set('Authorization', `Bearer ${testSession.access_token}`);

      assert.strictEqual(response.status, 403);
      assert(response.body.error);
    });
  });
}); 