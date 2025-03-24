describe('Authentication', () => {
  beforeEach(() => {
    // Reset the database state before each test
    cy.exec('npm run db:reset');
  });

  describe('Registration', () => {
    it('should successfully register a new user', () => {
      const email = 'newuser@example.com';
      const password = 'TestPassword123!';

      cy.register(email, password);
      
      // Verify successful registration
      cy.get('div').contains('Welcome to your dashboard').should('be.visible');
      cy.url().should('include', '/dashboard');
    });

    it('should show validation errors for invalid registration', () => {
      cy.visit('/register');
      
      // Try to submit without filling in fields
      cy.get('button[type="submit"]').click();
      
      // Verify validation messages
      cy.get('div').contains('Email is required').should('be.visible');
      cy.get('div').contains('Password is required').should('be.visible');
    });
  });

  describe('Login', () => {
    beforeEach(() => {
      // Create a test user before each login test
      cy.exec('npm run db:seed:test-user');
    });

    it('should successfully login with valid credentials', () => {
      cy.login(Cypress.env('testUserEmail'), Cypress.env('testUserPassword'));
      
      // Verify successful login
      cy.get('div').contains('Welcome to your dashboard').should('be.visible');
      cy.url().should('include', '/dashboard');
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type('wrong@example.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      // Verify error message
      cy.get('div').contains('Invalid email or password').should('be.visible');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      // Login before each logout test
      cy.exec('npm run db:seed:test-user');
      cy.login(Cypress.env('testUserEmail'), Cypress.env('testUserPassword'));
    });

    it('should successfully logout user', () => {
      cy.logout();
      
      // Verify redirect to login page
      cy.url().should('include', '/login');
      
      // Try to access protected route
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
    });
  });
}); 