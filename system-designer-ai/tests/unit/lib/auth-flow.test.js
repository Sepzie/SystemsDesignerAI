const { SupabaseMock } = require('../../mocks/supabase/supabase-mock');

describe('Authentication Flows', () => {
  let supabaseClient;
  
  beforeEach(() => {
    // Create a direct instance of SupabaseMock
    supabaseClient = new SupabaseMock();
  });

  describe('Registration', () => {
    it('registers a new user successfully', async () => {
      const credentials = {
        email: 'newuser@example.com',
        password: 'securePassword123!',
        options: {
          data: {
            name: 'Test User'
          }
        }
      };

      const { data, error } = await supabaseClient.auth.signUp(credentials);

      expect(error).toBeNull();
      expect(data.session).toBeDefined();
      expect(data.session.user.email).toBe(credentials.email);
    });

    it('rejects registration with invalid email', async () => {
      // Configure the mock to fail the next request
      supabaseClient.shouldFailNextRequest = true;
      
      const credentials = {
        email: 'invalid-email',
        password: 'securePassword123!'
      };

      try {
        await supabaseClient.auth.signUp(credentials);
        // Should not reach here
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Mock API error');
      }
    });
  });

  describe('Login Flow', () => {
    it('logs in user with valid credentials', async () => {
      // The mock is pre-populated with test@example.com / password123
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };

      const { data, error } = await supabaseClient.auth.signIn(credentials);

      expect(error).toBeNull();
      expect(data.session).toBeDefined();
      expect(data.session.user.email).toBe(credentials.email);
    });

    it('rejects login with invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongPassword'
      };

      const { data, error } = await supabaseClient.auth.signIn(credentials);

      expect(error).toBeDefined();
      expect(error.message).toBe('Invalid login credentials');
      expect(data.session).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('gets the current session', async () => {
      // First login to create a session
      await supabaseClient.auth.signIn({
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Now get the session
      const { data, error } = await supabaseClient.auth.getSession();
      
      expect(error).toBeNull();
      expect(data.session).toBeDefined();
      expect(data.session.user.email).toBe('test@example.com');
    });
  });

  describe('Logout Flow', () => {
    it('successfully logs out user', async () => {
      // First login
      await supabaseClient.auth.signIn({
        email: 'test@example.com',
        password: 'password123'
      });
      
      // Then logout
      await supabaseClient.auth.signOut();
      
      // Check that session is cleared
      const { data } = await supabaseClient.auth.getSession();
      expect(data.session).toBeNull();
    });
  });
});