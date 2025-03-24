import { setupServer } from 'msw/node';
import { mswPostgrest } from 'msw-postgrest';
import { rest } from 'msw';

// Define the Supabase URL that will be used in the tests
const SUPABASE_URL = 'https://fake-supabase-url.supabase.co';

// Create the MSW Postgrest handler
const { mock: originalMock, workers } = mswPostgrest({
  postgrestUrl: `${SUPABASE_URL}/rest/v1`,
  debug: false, // Set to true to debug MSW requests
});

// Add a reset method to the mock object
const mock = {
  ...originalMock,
  reset: () => {
    // Reset is handled by server.resetHandlers() in jest-setup.js
    console.log('Mock reset called - using server.resetHandlers() instead');
  }
};

// Set up auth endpoint handlers
const authHandlers = [
  // Sign up handler
  rest.post(`${SUPABASE_URL}/auth/v1/signup`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: 'default-test-user-id',
          email: req.body?.email || 'test@example.com',
          app_metadata: {},
          user_metadata: req.body?.options?.data || {},
          created_at: new Date().toISOString()
        },
        session: {
          access_token: 'default-test-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'default-test-refresh-token',
          user: {
            id: 'default-test-user-id',
            email: req.body?.email || 'test@example.com'
          }
        }
      })
    );
  }),
  
  // Sign in handler
  rest.post(`${SUPABASE_URL}/auth/v1/token`, (req, res, ctx) => {
    if (req.body?.grant_type === 'refresh_token') {
      return res(
        ctx.status(200),
        ctx.json({
          access_token: 'new-test-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'new-test-refresh-token',
          user: {
            id: 'default-test-user-id',
            email: 'test@example.com'
          }
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        access_token: 'default-test-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'default-test-refresh-token',
        user: {
          id: 'default-test-user-id',
          email: req.body?.email || 'test@example.com',
          app_metadata: {},
          user_metadata: {},
          created_at: new Date().toISOString()
        }
      })
    );
  }),
  
  // User info handler
  rest.get(`${SUPABASE_URL}/auth/v1/user`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 'default-test-user-id',
        email: 'test@example.com',
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString()
      })
    );
  }),
  
  // Logout handler
  rest.post(`${SUPABASE_URL}/auth/v1/logout`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({})
    );
  })
];

// Set up the MSW server with both Postgrest and Auth handlers
const server = setupServer(...workers, ...authHandlers);

// Export everything needed for tests
export { server, mock, SUPABASE_URL }; 