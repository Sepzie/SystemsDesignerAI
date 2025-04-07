import { Project } from "@/types/base-types";

describe('Project Creation Workflow', () => {
  beforeEach(() => {
    // Reset database and create test user before each test
    cy.exec('npm run db:reset');
    cy.exec('npm run db:seed:test-user');
    cy.login(Cypress.env('testUserEmail'), Cypress.env('testUserPassword'));
  });

  // describe('Navigation and Form Access', () => {
  //   it('should navigate to project creation form from dashboard', () => {
  //     // Start from dashboard
  //     cy.visit('/dashboard');
      
  //     // Verify "Create New Project" button exists and click it
  //     cy.get('a').contains('Create New Project')
  //       .should('be.visible')
  //       .click();
      
  //     // Verify we're on the project creation page
  //     cy.url().should('include', '/projects/new');
  //     cy.get('h2').contains('Create New Project').should('be.visible');
  //   });
  // });

  // describe('Form Validation', () => {
  //   beforeEach(() => {
  //     cy.visit('/projects/new');
  //   });

  //   it('should show validation errors for empty required fields', () => {
  //     // Try to submit empty form
  //     cy.get('button[type="submit"]').click();

  //     // Verify validation messages
  //     cy.get('div').contains('Project name is required').should('be.visible');
  //     cy.get('div').contains('Description is required').should('be.visible');
  //     cy.get('div').contains('At least one functional requirement is required').should('be.visible');
  //   });

  //   it('should clear validation errors when fields are filled', () => {
  //     // Submit empty form to trigger validation
  //     cy.get('button[type="submit"]').click();
  //     cy.get('div').contains('Project name is required').should('be.visible');

  //     // Fill the name field
  //     cy.get('input#name').type('Test Project');
  //     cy.get('div').contains('Project name is required').should('not.exist');
  //   });
  // });

  describe('Project Creation', () => {
    beforeEach(() => {
      cy.visit('/projects/new');
    });

    it('should successfully create a project with all fields', () => {
      // Debug: Log all buttons to see what we have
      cy.get('button').then(($buttons: JQuery<HTMLButtonElement>) => {
        cy.log('Found buttons:', $buttons.length);
        $buttons.each((i: number, button: HTMLButtonElement) => {
          cy.log(`Button ${i}:`, button.type, button.textContent?.trim(), button.className);
          // Log the button's HTML to see its full structure
          cy.log(`Button ${i} HTML:`, button.outerHTML);
        });
      });

      // Debug: Specifically log submit buttons
      cy.get('button[type="submit"]').then(($submitButtons: JQuery<HTMLButtonElement>) => {
        cy.log('Found submit buttons:', $submitButtons.length);
        $submitButtons.each((i: number, button: HTMLButtonElement) => {
          cy.log(`Submit button ${i}:`, button.outerHTML);
        });
      });

      // Fill all fields
      cy.get('input#name').type('Test Project');
      cy.get('textarea#description').type('This is a test project description\nWith multiple paragraphs\nAnd more details');
      cy.get('input#techStack').type('React, Node.js, PostgreSQL');

      // Submit form
      cy.get('button[type="submit"]').click();

      // Verify successful creation and redirect
      cy.url().should('match', /\/projects\/[\w-]+$/);

      // go to dashboard
      cy.visit('/dashboard');

      // Verify that the project is displayed in the dashboard
      cy.contains('Test Project').should('be.visible');
    });

    // it('should handle form validation correctly', () => {
    //   // Try to submit empty form
    //   cy.get('form').within(() => {
    //     cy.get('button[type="submit"]').click();
    //   });

    //   // Verify validation messages
    //   cy.contains('Project name is required').should('be.visible');
    //   cy.contains('Description is required').should('be.visible');

    //   // Fill required fields
    //   cy.get('input#name').type('Complete Test Project');
    //   cy.get('textarea#description').type('A comprehensive test project description');

    //   // Verify validation messages are gone
    //   cy.contains('Project name is required').should('not.exist');
    //   cy.contains('Description is required').should('not.exist');

    //   // Add tech stack
    //   cy.get('input#techStack').type('React, Node.js, PostgreSQL');

    //   // Submit form
    //   cy.get('form').within(() => {
    //     cy.get('button[type="submit"]').click();
    //   });

    //   // Verify successful creation and redirect
    //   cy.url().should('match', /\/projects\/[\w-]+$/);
      
    //   // Verify project details are displayed correctly
    //   cy.get('h1').contains('Complete Test Project').should('be.visible');
    //   cy.contains('A comprehensive test project description').should('be.visible');
    //   cy.contains('React, Node.js, PostgreSQL').should('be.visible');
    // });
  });

  // describe('Project List Integration', () => {
  //   it('should show newly created project in the dashboard', () => {
  //     const projectName = 'Dashboard Test Project';
      
  //     // Create a new project
  //     cy.visit('/projects/new');
  //     cy.get('input#name').type(projectName);
  //     cy.get('input#description').type('Project for dashboard test');
  //     cy.get('input').first().type('Functional requirement');
  //     cy.get('input').eq(1).type('Non-functional requirement');
  //     cy.get('button[type="submit"]').click();

  //     // Navigate back to dashboard
  //     cy.visit('/dashboard');

  //     // Verify project appears in list
  //     cy.contains(projectName).should('be.visible');
  //     cy.contains('Project for dashboard test').should('be.visible');
  //   });
  // });

  // Future test suggestions in comments:
  /*
  Additional tests to consider as features are implemented:
  
  1. Error Handling:
  - Test API failure scenarios
  - Test network connectivity issues
  - Test concurrent project creation
  
  2. Performance:
  - Test form responsiveness with many requirements
  - Test project list loading with many projects
  
  3. Accessibility:
  - Test keyboard navigation
  - Test screen reader compatibility
  - Test color contrast compliance
  
  4. Edge Cases:
  - Test very long input values
  - Test special characters in project names
  - Test duplicate project names
  
  5. State Management:
  - Test form state persistence
  - Test navigation away and back
  - Test browser refresh handling
  */
}); 