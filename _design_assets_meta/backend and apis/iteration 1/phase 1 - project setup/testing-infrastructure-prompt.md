# AI System Designer: Testing Infrastructure Setup

## Task Overview
Set up the testing infrastructure for the AI System Designer project with a progressive mock-to-real implementation approach. This infrastructure will serve as the foundation for all testing throughout the project lifecycle.

## Testing Infrastructure Components

### 1. Mock Switching System

Implement a feature flag-based system that allows tests to gradually transition from mocks to real implementations:

- Create a central test configuration that controls which dependencies use mocks versus real implementations
- Design dependency injection patterns that abstract away the source of dependencies
- Include environment variable overrides to control mock switching
- Set up different test commands for running with varying levels of integration

Example implementation approach:
```typescript
// test-config.ts
export const testConfig = {
  useMocks: {
    supabase: process.env.TEST_USE_REAL_SUPABASE !== 'true',
    openai: process.env.TEST_USE_REAL_OPENAI !== 'true',
    langchain: process.env.TEST_USE_REAL_LANGCHAIN !== 'true',
    // Add more components as needed
  }
};

// client-factory.ts
export function getTestClient(clientType: 'supabase' | 'openai' | 'langchain') {
  if (testConfig.useMocks[clientType]) {
    return getMockClient(clientType);
  }
  return getRealClient(clientType);
}
```

### 2. Unit Testing Setup
- Configure Jest with TypeScript support
- Set up React Testing Library for component testing
- Create test utilities for common testing patterns
- Implement detailed mocks for external services
- Ensure that mocks implement the same interfaces as real services

### 3. API Testing Setup
- Configure Supertest for API route testing
- Set up database test fixtures and seeding mechanisms
- Create authentication helpers for testing protected routes
- Implement request/response mocking utilities
- Design tests to work with both mocked and real databases

### 4. End-to-End Testing Foundation
- Set up Cypress for basic E2E testing
- Configure environment variables for test environments
- Create a minimal example test for the authentication flow
- Implement test isolation even when using real services

### 5. Test Directory Structure
Implement the following test structure:
```
/tests
  /unit
    /components
    /lib
    /utils
  /api
    /auth
    /projects
  /e2e
    /workflows
  /mocks
    /supabase
    /openai
    /langchain
  /utilities
    /test-helpers
    /fixtures
    /factories
/docs
  /testing
    /manual
    /procedures
```

### 6. Abstract Service Interfaces
- Define clear interfaces for all external services
- Ensure both mocks and real implementations adhere to these interfaces
- Implement factory patterns for creating service instances
- Document interface contracts for consistent implementation

### 7. Mock Implementation 
- Create detailed mock implementations of:
  - Supabase client
  - OpenAI client
  - LangChain orchestration
- Ensure mocks can simulate both success and error conditions
- Include controllable latency for testing loading states
- Add options to trigger specific edge cases for thorough testing

### 8. Test Data Management
- Create data factories for generating test entities
- Implement database seeding utilities
- Set up test data cleanup to ensure test isolation
- Design data factories to work with both mocked and real databases

### 9. CI/CD Integration
- Configure test running in pre-commit hooks
- Set up test reporting and code coverage tracking
- Create separate test commands for different integration levels:
  - `npm test:unit`: Fast tests with all mocks
  - `npm test:integrated`: Tests with real database but mocked external APIs
  - `npm test:e2e`: Full integration tests with minimal mocking

## Technical Requirements
- Tests should run in isolation without side effects
- Mock implementations should closely mirror real behavior
- Switching between mocked and real dependencies should require no test changes
- The system should support partial integration (some real, some mocked)
- Tests should clearly indicate which dependencies are mocked vs. real
- Mock switching should be controllable via environment variables

## Implementation Strategy
1. Start by building the mock switching infrastructure
2. Implement comprehensive mocks for all external services
3. Create initial tests using fully mocked dependencies
4. Gradually enable real implementations as components are completed
5. Document the process for adding new services to the mock switching system

## Deliverables
- Fully configured testing environment with mock switching capability
- Comprehensive mock implementations of all external services
- Example tests demonstrating the transition from mocked to real dependencies
- Documentation explaining the mock switching system
- CI/CD configurations for different test integration levels