import { setupAIMocks } from '../support/mock-ai-service';

describe('AI Features', () => {
  beforeEach(() => {
    // Reset database and create test user
    cy.exec('npm run db:reset');
    cy.exec('npm run db:seed:test-user');
    cy.login(Cypress.env('testUserEmail'), Cypress.env('testUserPassword'));
    
    // Setup AI mocks
    setupAIMocks();
  });

  describe('System Design Generation', () => {
    it('should generate system design successfully', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="project-card"]').first().click();
      
      // Click generate design button
      cy.get('button').contains('Generate Design').click();
      
      // Wait for AI response
      cy.wait('@generateDesign');
      
      // Verify design components
      cy.get('[data-testid="design-component"]').should('have.length.at.least', 2);
      cy.get('[data-testid="design-component"]').first().within(() => {
        cy.get('h3').contains('User Service').should('be.visible');
        cy.get('p').contains('Handles user authentication').should('be.visible');
      });
    });

    it('should handle AI service errors gracefully', () => {
      // Override mock to simulate error
      cy.intercept('POST', '/api/ai/generate-design', {
        statusCode: 500,
        body: { error: 'AI service error' },
      }).as('generateDesignError');

      cy.visit('/dashboard');
      cy.get('[data-testid="project-card"]').first().click();
      
      // Click generate design button
      cy.get('button').contains('Generate Design').click();
      
      // Wait for error response
      cy.wait('@generateDesignError');
      
      // Verify error message
      cy.get('div').contains('Failed to generate system design').should('be.visible');
    });
  });

  describe('Architecture Analysis', () => {
    it('should analyze architecture successfully', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="project-card"]').first().click();
      
      // Click analyze button
      cy.get('button').contains('Analyze Architecture').click();
      
      // Wait for AI response
      cy.wait('@analyzeArchitecture');
      
      // Verify analysis results
      cy.get('[data-testid="analysis-section"]').within(() => {
        cy.get('h3').contains('Strengths').should('be.visible');
        cy.get('ul').should('have.length.at.least', 1);
        cy.get('li').contains('Scalable microservices architecture').should('be.visible');
      });
    });

    it('should display recommendations', () => {
      cy.visit('/dashboard');
      cy.get('[data-testid="project-card"]').first().click();
      
      // Click analyze button
      cy.get('button').contains('Analyze Architecture').click();
      
      // Wait for AI response
      cy.wait('@analyzeArchitecture');
      
      // Verify recommendations
      cy.get('[data-testid="recommendations-section"]').within(() => {
        cy.get('h3').contains('Recommendations').should('be.visible');
        cy.get('ul').should('have.length.at.least', 1);
        cy.get('li').contains('Implement caching layer').should('be.visible');
      });
    });
  });
}); 