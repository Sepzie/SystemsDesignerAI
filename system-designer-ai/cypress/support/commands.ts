/// <reference types="cypress" />

// Load test data fixture
let testData: any;
before(() => {
  cy.fixture('test-data.json').then((data) => {
    testData = data;
  });
});

// Custom command for user login
Cypress.Commands.add('login', (email?: string, password?: string) => {
  const user = testData?.testUser || { email: 'test@example.com', password: 'testPassword123!' };
  cy.visit('/login');
  cy.get('input[name="email"]').type(email || user.email);
  cy.get('input[name="password"]').type(password || user.password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Custom command for user registration
Cypress.Commands.add('register', (email?: string, password?: string, fullName?: string) => {
  const user = testData?.testUser || { email: 'test@example.com', password: 'testPassword123!', fullName: 'Test User' };
  cy.visit('/register');
  cy.get('input[name="email"]').type(email || user.email);
  cy.get('input[name="password"]').type(password || user.password);
  cy.get('input[name="fullName"]').type(fullName || user.fullName);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Custom command for creating a project
Cypress.Commands.add('createProject', (name?: string, description?: string) => {
  const project = testData?.testProject || { name: 'Test Project', description: 'Test Description' };
  cy.visit('/dashboard');
  cy.get('button').contains('New Project').click();
  cy.get('input[name="name"]').type(name || project.name);
  cy.get('textarea[name="description"]').type(description || project.description);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/projects/');
});

// Custom command for logging out
Cypress.Commands.add('logout', () => {
  cy.get('button').contains('Logout').click();
  cy.url().should('include', '/login');
});

// Custom command for database reset
Cypress.Commands.add('resetDb', () => {
  cy.exec('npm run db:reset');
});

// Custom command for seeding test data
Cypress.Commands.add('seedTestData', () => {
  cy.exec('npm run db:seed:test-user');
  cy.exec('npm run db:seed:test-project');
});

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>;
      register(email?: string, password?: string, fullName?: string): Chainable<void>;
      createProject(name?: string, description?: string): Chainable<void>;
      logout(): Chainable<void>;
      resetDb(): Chainable<void>;
      seedTestData(): Chainable<void>;
    }
  }
} 