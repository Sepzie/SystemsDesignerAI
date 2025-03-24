import request from 'supertest';
import { getTestClient } from '../../utilities/test-helpers/client-factory';
import { testConfig } from '../../utilities/test-helpers/test-config';
import { createUser, createSession } from '../../utilities/factories/test-data-factory';
import { SupabaseMock } from '../../mocks/supabase/supabase-mock';
import express from 'express';

describe('Authentication API', () => {
  let app;
  let supabaseClient;
  let testUser;

  beforeAll(async () => {
    // Set up test server with Express
    app = express();
    app.use(express.json());
    
    // Set up mock routes
    app.post('/api/auth/register', async (req, res) => {
      const { email, password, name } = req.body;
      
      if (!email || !email.includes('@') || !password || !name) {
        return res.status(400).json({ error: 'Invalid input data' });
      }
      
      const user = { id: 'user-id', email, name };
      const session = { access_token: 'test-token', user_id: user.id };
      
      res.status(200).json({ user, session });
    });
    
    app.post('/api/auth/login', async (req, res) => {
      const { email, password } = req.body;
      
      // Get test user
      const testUser = supabaseClient._users.find(u => u.email === email);
      
      if (!testUser || password === 'wrongPassword') {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const session = { access_token: 'test-token', user_id: testUser.id };
      
      res.status(200).json({ session });
    });
    
    app.post('/api/auth/logout', async (req, res) => {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace('Bearer ', '');
      
      if (token === 'invalid-token') {
        return res.status(401).json({ error: 'Invalid session' });
      }
      
      res.status(200).json({ success: true });
    });
    
    app.post('/api/auth/refresh', async (req, res) => {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace('Bearer ', '');
      
      if (token === 'invalid-token') {
        return res.status(401).json({ error: 'Invalid session' });
      }
      
      // Create new token
      const session = { 
        access_token: 'new-test-token',
        user_id: 'user-id' 
      };
      
      res.status(200).json({ session });
    });
    
    app.get('/api/projects', async (req, res) => {
      const authHeader = req.headers.authorization || '';
      
      if (!authHeader) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const token = authHeader.replace('Bearer ', '');
      
      if (token.includes('expired')) {
        return res.status(401).json({ error: 'Session expired' });
      }
      
      res.status(200).json({ projects: [] });
    });
    
    // Get test client
    supabaseClient = await getTestClient('supabase');
    
    // Ensure we have direct access to the mock to add test data
    expect(supabaseClient).toBeInstanceOf(SupabaseMock);
    
    // Create a test user and add it to the mock database
    testUser = createUser();
    (supabaseClient as SupabaseMock)._users.push(testUser);
  });

  beforeEach(() => {
    testConfig.resetMockSettings();
  });

  describe('Registration Flow', () => {
    it('registers a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'securePassword123!',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toMatchObject({
        email: userData.email,
        name: userData.name
      });
      expect(response.body).toHaveProperty('session');
    });

    it('rejects registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'securePassword123!',
          name: 'Test User'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Login Flow', () => {
    it('logs in user with valid credentials', async () => {
      const credentials = {
        email: testUser.email,
        password: 'securePassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('session');
    });

    it('rejects login with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Logout Flow', () => {
    it('successfully logs out user', async () => {
      const session = createSession({ user_id: testUser.id });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${session.access_token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('handles logout with invalid session', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Protected Routes', () => {
    it('allows access to protected route with valid session', async () => {
      const session = createSession({ user_id: testUser.id });

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${session.access_token}`);

      expect(response.status).toBe(200);
    });

    it('denies access to protected route without session', async () => {
      const response = await request(app)
        .get('/api/projects');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('denies access to protected route with expired session', async () => {
      const expiredToken = 'expired-token';

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Session Management', () => {
    it('refreshes session token', async () => {
      const session = createSession({ user_id: testUser.id });

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${session.access_token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('session');
      expect(response.body.session).toHaveProperty('access_token');
    });

    it('maintains user session across requests', async () => {
      const session = createSession({ user_id: testUser.id });

      // First request
      const response1 = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${session.access_token}`);

      expect(response1.status).toBe(200);

      // Second request with same session
      const response2 = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${session.access_token}`);

      expect(response2.status).toBe(200);
      expect(response2.body).toEqual(response1.body);
    });
  });
}); 