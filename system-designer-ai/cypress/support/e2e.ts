/// <reference types="cypress" />

// Import commands.js using ES2015 syntax:
import './commands';

// Import the mock AI service
import { setupAIMocks } from './mock-ai-service';

beforeEach(() => {
  // Reset any previous mocks/stubs
  cy.then(() => {
    setupAIMocks();
  });

  // Set up session to preserve auth state
  cy.session('auth', () => {
    // Session will be preserved automatically
  });
});

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err) => {
  // Returning false here prevents Cypress from failing the test
  // We do this because some third-party scripts might throw errors we don't care about
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  return true;
});

// Add custom assertions
chai.Assertion.addMethod('containsProject', function (projectName) {
  const obj = this._obj;
  new chai.Assertion(obj).to.exist;
  new chai.Assertion(obj.find('[data-testid="project-card"]')
    .contains(projectName)).to.be.true;
});

// Configure global behavior
Cypress.config('defaultCommandTimeout', 10000);

// Log custom commands for better debugging
Cypress.Commands.overwrite('log', (subject, message) => {
  Cypress.log({
    name: 'console',
    displayName: 'Console Log',
    message: [`${message}`],
  });
});

// Custom command for user login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Custom command for user registration
Cypress.Commands.add('register', (email: string, password: string) => {
  cy.visit('/register');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Custom command for creating a project
Cypress.Commands.add('createProject', (name: string, description: string) => {
  cy.visit('/dashboard');
  cy.get('button').contains('New Project').click();
  cy.get('input[name="name"]').type(name);
  cy.get('textarea[name="description"]').type(description);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/projects/');
});

// Custom command for logging out
Cypress.Commands.add('logout', () => {
  cy.get('button').contains('Logout').click();
  cy.url().should('include', '/login');
});

// Type definitions for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      register(email: string, password: string): Chainable<void>;
      createProject(name: string, description: string): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
} 