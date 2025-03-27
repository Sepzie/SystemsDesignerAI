describe('Authentication', () => {
  beforeEach(() => {
    // Reset the database state before each test using our custom script
    cy.exec('npm run db:reset', { timeout: 30000 });
  });

  describe('Registration', () => {
    it('should successfully register a new user', () => {
      const testUser = {
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        fullName: 'Test User'
      };

      cy.visit('/register');
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('input[name="name"]').type(testUser.fullName);
      cy.get('button[type="submit"]').click();
      
      // Verify successful registration
      cy.url().should('include', '/dashboard');
    });

    it('should show validation errors for invalid registration', () => {
      cy.visit('/register');
      
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
      //seed test user
      cy.exec('npm run db:seed:test-user');
    })

    it('should successfully login a test user', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type(Cypress.env('testUserEmail'));
      cy.get('input[name="password"]').type(Cypress.env('testUserPassword'));
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

  });

  describe('Logout', () => {
    beforeEach(() => {
      // Create and login a test user
      cy.exec('npm run db:seed:test-user');
      cy.login(Cypress.env('testUserEmail'), Cypress.env('testUserPassword'));
    });


    it('should successfully logout user', () => {
      // Find and click logout button/link
      cy.get('button').contains('Sign out').click();
      
      // Verify redirect to login page
      cy.url().should('include', '/login');
      
      // Try to access protected route
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
    });
  });
}); 