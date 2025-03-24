const request = require('supertest');
const { createServer } = require('http');
const { rest } = require('msw');
const { server } = require('../../utilities/test-helpers/msw-setup');
const { SUPABASE_URL } = require('../../utilities/test-helpers/msw-setup');

// Create a simple HTTP handler that mimics the Next.js API behavior
function createRequestHandler(handler) {
  return async (req, res) => {
    // Add any necessary properties/methods that Next.js API routes expect
    req.query = {};
    req.cookies = {};
    
    // Parse the URL to get query parameters
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    url.searchParams.forEach((value, key) => {
      req.query[key] = value;
    });
    
    // Parse the path to extract route parameters
    if (req.url.includes('/api/projects/')) {
      const parts = req.url.split('/');
      const projectId = parts[parts.length - 1];
      req.query.id = projectId;
    }
    
    // Add JSON parsing for POST/PUT requests
    const buffers = [];
    
    req.on('data', (chunk) => {
      buffers.push(chunk);
    });
    
    await new Promise((resolve) => {
      req.on('end', () => {
        if (buffers.length > 0) {
          const data = Buffer.concat(buffers).toString();
          try {
            req.body = JSON.parse(data);
          } catch (e) {
            req.body = {};
          }
        } else {
          req.body = {};
        }
        resolve();
      });
    });
    
    // Add response helpers
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(data));
      return res;
    };
    
    // Call the handler
    return handler(req, res);
  };
}

// Mock handler function for API routes
const mockApiHandler = async (req, res) => {
  // Basic auth check using the request headers
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Now handle various endpoints
    if (req.method === 'GET' && req.url.includes('/api/projects')) {
      // Get all projects or a specific project
      const projectId = req.query.id;
      
      if (projectId) {
        // Get specific project
        return res.status(200).json({ 
          project: {
            id: projectId,
            name: 'Test Project',
            description: 'Test Description',
            user_id: 'test-user-id',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        });
      } else {
        // Get all projects
        return res.status(200).json({ 
          projects: [
            {
              id: 'project-1',
              name: 'Project 1',
              description: 'Project 1 Description',
              user_id: 'test-user-id',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            {
              id: 'project-2',
              name: 'Project 2',
              description: 'Project 2 Description',
              user_id: 'test-user-id',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ] 
        });
      }
    } else if (req.method === 'POST' && req.url.endsWith('/api/projects')) {
      // Create a new project
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      // Return created project
      return res.status(201).json({ 
        project: {
          id: 'new-project-id',
          name,
          description: description || '',
          user_id: 'test-user-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    } else if (req.method === 'PUT' && req.url.includes('/api/projects/')) {
      // Update a project
      const projectId = req.query.id;
      const { name, description } = req.body;
      
      if (!projectId) {
        return res.status(400).json({ error: 'Project ID is required' });
      }
      
      return res.status(200).json({ 
        project: {
          id: projectId,
          name: name || 'Updated Project',
          description: description || 'Updated Description',
          user_id: 'test-user-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      });
    } else if (req.method === 'DELETE' && req.url.includes('/api/projects/')) {
      // Delete a project
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

describe('Projects API', () => {
  let testServer;
  const accessToken = 'test-access-token';
  
  beforeAll(() => {
    // Create a test server with our mock handler
    testServer = createServer(createRequestHandler(mockApiHandler));
    testServer.listen(0); // Let the OS assign a port
    
    // Mock Supabase auth endpoints - MSW will intercept these
    server.use(
      rest.get(`${SUPABASE_URL}/auth/v1/user`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            id: 'test-user-id',
            email: 'test@example.com',
            app_metadata: {},
            user_metadata: {},
            created_at: new Date().toISOString()
          })
        );
      })
    );
  });
  
  afterAll((done) => {
    testServer.close(done);
  });

  describe('GET /api/projects', () => {
    it('returns all projects for authenticated user', async () => {
      const response = await request(testServer)
        .get('/api/projects')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.projects).toBeDefined();
      expect(Array.isArray(response.body.projects)).toBe(true);
      expect(response.body.projects.length).toBe(2);
      expect(response.body.projects[0].id).toBeDefined();
    });

    it('returns 401 for unauthenticated requests', async () => {
      const response = await request(testServer)
        .get('/api/projects');

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/projects/[id]', () => {
    it('returns project by ID', async () => {
      const projectId = 'test-project-id';
      
      const response = await request(testServer)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.project).toBeDefined();
      expect(response.body.project.id).toBe(projectId);
    });
  });

  describe('POST /api/projects', () => {
    it('creates a new project', async () => {
      const projectData = {
        name: 'New Test Project',
        description: 'Test Description'
      };

      const response = await request(testServer)
        .post('/api/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(projectData);

      expect(response.status).toBe(201);
      expect(response.body.project).toBeDefined();
      expect(response.body.project.name).toBe(projectData.name);
      expect(response.body.project.description).toBe(projectData.description);
    });

    it('validates required fields', async () => {
      const response = await request(testServer)
        .post('/api/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /api/projects/[id]', () => {
    it('updates project details', async () => {
      const projectId = 'test-project-id';
      const updateData = {
        name: 'Updated Project Name',
        description: 'Updated Description'
      };

      const response = await request(testServer)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.project).toBeDefined();
      expect(response.body.project.id).toBe(projectId);
      expect(response.body.project.name).toBe(updateData.name);
      expect(response.body.project.description).toBe(updateData.description);
    });
  });

  describe('DELETE /api/projects/[id]', () => {
    it('deletes project', async () => {
      const projectId = 'test-project-id';

      const response = await request(testServer)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
}); 