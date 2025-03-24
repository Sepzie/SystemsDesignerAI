import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import request from 'supertest';
import { getTestClient } from '../../../utilities/test-helpers/client-factory';
import { testConfig } from '../../../utilities/test-helpers/test-config';
import { createUser } from '../../../utilities/factories/test-data-factory';

describe('Authentication API', () => {
  let server;
  let supabaseClient;

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
  });
  
  afterAll(() => {
    server.close();
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

      const response = await request(server)
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
      const response = await request(server)
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
      const user = createUser();
      const credentials = {
        email: user.email,
        password: 'securePassword123!'
      };

      const response = await request(server)
        .post('/api/auth/login')
        .send(credentials);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('session');
      expect(response.body.session.user_id).toBe(user.id);
    });

    it('rejects login with invalid credentials', async () => {
      const response = await request(server)
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
      const user = createUser();
      const session = await supabaseClient.auth.createSession({
        user_id: user.id
      });

      const response = await request(server)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${session.access_token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    it('handles logout with invalid session', async () => {
      const response = await request(server)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Protected Routes', () => {
    it('allows access to protected route with valid session', async () => {
      const user = createUser();
      const session = await supabaseClient.auth.createSession({
        user_id: user.id
      });

      const response = await request(server)
        .get('/api/projects')
        .set('Authorization', `Bearer ${session.access_token}`);

      expect(response.status).toBe(200);
    });

    it('denies access to protected route without session', async () => {
      const response = await request(server)
        .get('/api/projects');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('denies access to protected route with expired session', async () => {
      const user = createUser();
      const expiredSession = await supabaseClient.auth.createSession({
        user_id: user.id,
        expires_at: new Date(Date.now() - 1000).toISOString() // Expired 1 second ago
      });

      const response = await request(server)
        .get('/api/projects')
        .set('Authorization', `Bearer ${expiredSession.access_token}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Session Management', () => {
    it('refreshes session token', async () => {
      const user = createUser();
      const session = await supabaseClient.auth.createSession({
        user_id: user.id,
        expires_at: new Date(Date.now() + 1000).toISOString() // Expires in 1 second
      });

      const response = await request(server)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${session.access_token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('session');
      expect(response.body.session.access_token).not.toBe(session.access_token);
    });

    it('maintains user session across requests', async () => {
      const user = createUser();
      const session = await supabaseClient.auth.createSession({
        user_id: user.id
      });

      // First request
      const response1 = await request(server)
        .get('/api/projects')
        .set('Authorization', `Bearer ${session.access_token}`);

      expect(response1.status).toBe(200);

      // Second request with same session
      const response2 = await request(server)
        .get('/api/projects')
        .set('Authorization', `Bearer ${session.access_token}`);

      expect(response2.status).toBe(200);
      expect(response2.body).toEqual(response1.body);
    });
  });
}); 