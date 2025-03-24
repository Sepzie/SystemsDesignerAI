# AI System Designer Testing Infrastructure

This document describes the testing infrastructure for the AI System Designer project, which follows a progressive mock-to-real implementation approach.

## Overview

The testing infrastructure is designed to allow for gradually transitioning from mock implementations to real implementations as the project evolves. This approach enables:

1. Fast, reliable tests during early development
2. Easy transition to integration tests with real dependencies
3. Flexibility to mix mocked and real dependencies as needed
4. Different test integration levels for different scenarios

## Test Configuration

The test configuration system is located in `tests/utilities/test-helpers/test-config.ts` and controls which dependencies use mocks versus real implementations.

```typescript
// Control which services use mocks or real implementations
testConfig.useMocks.supabase = true; // Use mock
testConfig.useMocks.openai = false; // Use real
```

### Environment Variables

Test behavior can be controlled via environment variables:

- `TEST_USE_REAL_SUPABASE` - Set to 'true' to use real Supabase
- `TEST_USE_REAL_OPENAI` - Set to 'true' to use real OpenAI
- `TEST_USE_REAL_LANGCHAIN` - Set to 'true' to use real LangChain
- `USE_MSW_SUPABASE` - Set to 'true' to use MSW for HTTP interception

These variables are used in the npm scripts defined in package.json to run different test configurations.

## Mock Implementations

The project supports two main approaches to mocking:

### 1. Direct Mock (Default)

Mock implementations of all external services are provided in the `tests/mocks` directory:

- `tests/mocks/supabase/supabase-mock.ts` - Mock Supabase client
- `tests/mocks/openai/openai-mock.ts` - Mock OpenAI client
- `tests/mocks/langchain/langchain-mock.ts` - Mock LangChain orchestration

All mocks implement the same interfaces as their real counterparts, as defined in `src/types/services.ts`.

Features:
- In-memory data storage
- Controllable response latency
- Simulated error conditions
- Realistic response formats
- Deterministic behavior for reliable testing

### 2. MSW (Mock Service Worker)

For HTTP-level mocking, we use MSW with msw-postgrest. The setup is defined in:
- `utilities/test-helpers/msw-setup.js`: Configures MSW server and handlers
- `utilities/test-helpers/jest-setup.js`: Configures Jest and initializes MSW

## Client Factory

The client factory system in `tests/utilities/test-helpers/client-factory.ts` provides a unified way to get either mock or real client implementations based on the current test configuration.

```typescript
// Get a client (either mock or real based on configuration)
const supabaseClient = await getTestClient('supabase');
```

The factory abstracts away the source of the dependency, making it transparent to the test code whether it's using a mock or real implementation.

## Running Tests

The project includes several npm scripts for running tests at different integration levels:

- `npm test` - Run all tests with full mocking (fastest)
- `npm test:unit` - Run unit tests only
- `npm test:api` - Run API tests only
- `npm test:e2e` - Run end-to-end tests with Cypress
- `npm test:integrated` - Run with real database but mocked external APIs
- `npm test:full` - Run with all real dependencies (slowest, requires all credentials)
- `npm test:coverage` - Run tests with coverage report

## Test Directory Structure

```
/tests
  /unit            - Unit tests
    /components    - React component tests
    /lib           - Utility function tests
    /utils         - Helper function tests
  /api             - API route tests
    /auth          - Authentication API tests
    /projects      - Projects API tests
  /e2e             - End-to-end tests
    /workflows     - User workflow tests
  /mocks           - Mock implementations
    /supabase      - Supabase mock
    /openai        - OpenAI mock
    /langchain     - LangChain mock
  /utilities       - Testing utilities
    /test-helpers  - Test helper functions
    /fixtures      - Test fixtures
    /factories     - Test data factories
```

## Test Data Management

Test data factories in `tests/utilities/factories/test-data-factory.ts` provide helper functions for generating consistent test entities across all tests.

```typescript
// Create a test user
const user = createUser({ name: 'Custom Name' });

// Create a test project
const project = createProject({ userId: user.id });

// Generate bulk test data
const testData = generateBulkTestData(user.id);
```

## Best Practices

1. **Use the Client Factory**: Always use the `getTestClient` function to get dependencies rather than importing them directly.

2. **Prefer Interface over Implementation**: Code against the interfaces defined in `src/types/services.ts` rather than specific implementations.

3. **Test with Different Configurations**: Test critical paths with both mocked and real dependencies.

4. **Leverage Test Data Factories**: Use the provided factories to create test data consistently.

5. **Control Mock Behavior**: Use the built-in control mechanisms in mocks to test error conditions and edge cases.

6. **Keep Tests Focused**: Focus on testing a single piece of functionality per test.

7. **Clean Up**: Always clean up test data and reset mocks between tests.

## Adding New Services

To add a new service to the mock switching system:

1. Define the service interface in `src/types/services.ts`
2. Create a mock implementation in `tests/mocks/[service-name]`
3. Add the service to the testConfig in `tests/utilities/test-helpers/test-config.ts`
4. Add the service to the client factory in `tests/utilities/test-helpers/client-factory.ts`
5. Create real service client in `src/lib/[service-name]/client.ts`

## Example: Testing with Different Configurations

```typescript
import { testConfig } from '../../utilities/test-helpers/test-config';
import { getTestClient } from '../../utilities/test-helpers/client-factory';

describe('Project Service', () => {
  it('works with mocked dependencies', async () => {
    // Ensure we use mocks
    testConfig.setMockStatus('supabase', true);
    
    const supabase = await getTestClient('supabase');
    // Test with mock...
  });
  
  it('works with real dependencies', async () => {
    // Use real Supabase (requires valid credentials)
    testConfig.setMockStatus('supabase', false);
    
    const supabase = await getTestClient('supabase');
    // Test with real service...
  });
}); 
```

## Additional Resources

- [Test Directory README](./tests/README.md) - Specific details about the test directory
- [Adding Tests Guide](./docs/testing/procedures/adding-tests.md) - Detailed procedures for adding new tests 