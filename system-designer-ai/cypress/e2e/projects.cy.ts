describe('Project Management', () => {
  beforeEach(() => {
    // Reset database and create test user
    cy.exec('npm run db:reset');
    cy.exec('npm run db:seed:test-user');
    cy.login(Cypress.env('testUserEmail'), Cypress.env('testUserPassword'));
  });

  describe('Project Creation', () => {
    it('should successfully create a new project', () => {
      const projectName = 'Test Project';
      const projectDescription = 'This is a test project description';

      cy.createProject(projectName, projectDescription);
      
      // Verify project creation
      cy.get('h1').contains(projectName).should('be.visible');
      cy.get('p').contains(projectDescription).should('be.visible');
    });

    it('should show validation errors for invalid project creation', () => {
      cy.visit('/dashboard');
      cy.get('button').contains('New Project').click();
      
      // Try to submit without name
      cy.get('textarea[name="description"]').type('Test description');
      cy.get('button[type="submit"]').click();
      
      // Verify validation message
      cy.get('div').contains('Project name is required').should('be.visible');
    });
  });

  describe('Project Listing', () => {
    beforeEach(() => {
      // Create a test project
      cy.exec('npm run db:seed:test-project');
    });

    it('should display user projects in dashboard', () => {
      cy.visit('/dashboard');
      
      // Verify project card exists
      cy.get('[data-testid="project-card"]').should('have.length.at.least', 1);
      cy.get('[data-testid="project-card"]').first().within(() => {
        cy.get('h3').should('be.visible');
        cy.get('p').should('be.visible');
      });
    });

    it('should show empty state when no projects exist', () => {
      // Clear projects from database
      cy.exec('npm run db:reset');
      cy.exec('npm run db:seed:test-user');
      cy.login(Cypress.env('testUserEmail'), Cypress.env('testUserPassword'));
      
      cy.visit('/dashboard');
      
      // Verify empty state
      cy.get('div').contains('No projects yet').should('be.visible');
      cy.get('button').contains('Create your first project').should('be.visible');
    });
  });

  describe('Project Details', () => {
    beforeEach(() => {
      // Create a test project
      cy.exec('npm run db:seed:test-project');
    });

    it('should display project details correctly', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="project-card"]').first().click();
      
      // Verify project details
      cy.get('h1').should('be.visible');
      cy.get('p').should('be.visible');
      cy.get('[data-testid="project-metadata"]').should('be.visible');
    });

    it('should allow project metadata updates', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="project-card"]').first().click();
      
      // Click edit button
      cy.get('button').contains('Edit').click();
      
      // Update project name
      const newName = 'Updated Project Name';
      cy.get('input[name="name"]').clear().type(newName);
      cy.get('button[type="submit"]').click();
      
      // Verify update
      cy.get('h1').contains(newName).should('be.visible');
    });
  });
}); 