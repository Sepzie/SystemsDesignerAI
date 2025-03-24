// Import Cypress commands
import 'cypress-localstorage-commands';

// Prevent TypeScript errors when Cypress adds properties to the Cypress object
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<Element>;
      logout(): Chainable<Element>;
      preserveSession(): Chainable<Element>;
      restoreSession(): Chainable<Element>;
      // Add types for cypress-localstorage-commands
      setLocalStorage(key: string, value: string): Chainable<Element>;
      getLocalStorage(key: string): Chainable<string>;
      clearLocalStorage(): Chainable<Element>;
      saveLocalStorage(): Chainable<Element>;
      restoreLocalStorage(): Chainable<Element>;
    }
  }
}

// Add custom commands
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

Cypress.Commands.add('preserveSession', () => {
  cy.window().then((window) => {
    Object.keys(window.localStorage).forEach(key => {
      cy.setLocalStorage(key, window.localStorage[key]);
    });
  });
});

Cypress.Commands.add('restoreSession', () => {
  cy.restoreLocalStorage();
});

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', () => {
  return false;
}); 