import { resetTestDb } from '../support/db-reset';

describe('Authentication', () => {
  beforeEach(() => {
    // Reset the database state before each test using Supabase CLI
    cy.exec('supabase db reset --force', { timeout: 30000 });
  });

  describe('Registration', () => {
    it('should successfully register a new user', () => {
      const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        fullName: 'Test User'
      };

      cy.visit('/auth/register');
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('input[name="name"]').type(testUser.fullName);
      cy.get('button[type="submit"]').click();
      
      // Verify successful registration
      cy.url().should('include', '/dashboard');
    });

    it('should show validation errors for invalid registration', () => {
      cy.visit('/auth/register');
      
      // Try to submit without filling in fields
      cy.get('button[type="submit"]').click();
      
      // Verify validation messages
      cy.get('input[name="email"]:invalid').should('exist');
      cy.get('input[name="password"]:invalid').should('exist');
      cy.get('input[name="name"]:invalid').should('exist');
    });
  });

  describe('Login', () => {
    beforeEach(() => {
      // Create a test user before each login test
      const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        fullName: 'Test User'
      };

      cy.visit('/auth/register');
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('input[name="name"]').type(testUser.fullName);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      cy.visit('/auth/login'); // Go back to login page
    });

    it('should successfully login with valid credentials', () => {
      cy.get('input[name="email"]').type(Cypress.env('testUserEmail'));
      cy.get('input[name="password"]').type(Cypress.env('testUserPassword'));
      cy.get('button[type="submit"]').click();
      
      // Verify successful login
      cy.url().should('include', '/dashboard');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/auth/login');
      cy.get('input[name="email"]').type('wrong@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      // Verify error message
      cy.get('div').contains('Invalid email or password').should('be.visible');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      // Create and login a test user
      const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        fullName: 'Test User'
      };

      cy.visit('/auth/register');
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('input[name="name"]').type(testUser.fullName);
      cy.get('button[type="submit"]').click();
    });

    it('should successfully logout user', () => {
      // Find and click logout button/link
      cy.get('button').contains('Logout').click();
      
      // Verify redirect to login page
      cy.url().should('include', '/login');
      
      // Try to access protected route
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
    });
  });
}); 