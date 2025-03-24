/// <reference types="cypress" />

// Mock responses for AI service
export const mockAIResponses = {
  generateSystemDesign: {
    success: {
      status: 200,
      body: {
        design: {
          components: [
            {
              name: 'User Service',
              description: 'Handles user authentication and management',
              dependencies: ['Database', 'Auth Service'],
            },
            {
              name: 'Auth Service',
              description: 'Manages authentication tokens and sessions',
              dependencies: ['Database'],
            },
          ],
          relationships: [
            {
              from: 'User Service',
              to: 'Database',
              type: 'reads/writes',
            },
            {
              from: 'Auth Service',
              to: 'Database',
              type: 'reads/writes',
            },
          ],
        },
      },
    },
    error: {
      status: 500,
      body: {
        error: 'Failed to generate system design',
      },
    },
  },
  analyzeArchitecture: {
    success: {
      status: 200,
      body: {
        analysis: {
          strengths: [
            'Scalable microservices architecture',
            'Clear separation of concerns',
            'Resilient design',
          ],
          weaknesses: [
            'Potential network latency between services',
            'Complex deployment process',
          ],
          recommendations: [
            'Implement caching layer',
            'Add monitoring and alerting',
          ],
        },
      },
    },
    error: {
      status: 500,
      body: {
        error: 'Failed to analyze architecture',
      },
    },
  },
};

// Intercept AI service calls
export const setupAIMocks = () => {
  // Mock system design generation
  cy.intercept('POST', '/api/ai/generate-design', mockAIResponses.generateSystemDesign.success).as('generateDesign');

  // Mock architecture analysis
  cy.intercept('POST', '/api/ai/analyze-architecture', mockAIResponses.analyzeArchitecture.success).as('analyzeArchitecture');

  // Mock error responses
  cy.intercept('POST', '/api/ai/*', (req: Cypress.Interception) => {
    req.reply({
      statusCode: 500,
      body: {
        error: 'AI service error',
      },
    });
  }).as('aiError');
}; 