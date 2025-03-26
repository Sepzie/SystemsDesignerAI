/// <reference types="cypress" />

/**
 * Mock responses for AI service endpoints
 * This file provides predefined responses for AI-related API calls during E2E testing
 * to ensure consistent and predictable test behavior without relying on actual AI services
 */
export const mockAIResponses = {
  /**
   * Mock response for system design generation endpoint
   * Simulates the AI service's response when generating a system design
   */
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

  /**
   * Mock response for architecture analysis endpoint
   * Simulates the AI service's response when analyzing system architecture
   */
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

/**
 * Sets up Cypress interceptors for AI service endpoints
 * This function configures the mock responses for all AI-related API calls
 * 
 * Usage:
 * ```typescript
 * beforeEach(() => {
 *   setupAIMocks();
 * });
 * ```
 */
export const setupAIMocks = () => {
  // Mock successful system design generation endpoint
  cy.intercept('POST', '/api/ai/generate-design', mockAIResponses.generateSystemDesign.success)
    .as('generateDesign');

  // Mock successful architecture analysis endpoint
  cy.intercept('POST', '/api/ai/analyze-architecture', mockAIResponses.analyzeArchitecture.success)
    .as('analyzeArchitecture');

  // Mock error response for any unmatched AI endpoints
  // This ensures we don't have unexpected API calls during tests
  cy.intercept('POST', '/api/ai/*', (req) => {
    req.reply({
      statusCode: 500,
      body: {
        error: 'AI service error',
      },
    });
  }).as('aiError');
}; 