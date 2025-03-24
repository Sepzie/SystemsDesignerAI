# Adding Tests to the AI System Designer Project

This document outlines the procedures for adding different types of tests to the project.

## Table of Contents

1. [Unit Tests](#unit-tests)
2. [API Tests](#api-tests)
3. [End-to-End Tests](#end-to-end-tests)
4. [Adding New Mock Services](#adding-new-mock-services)

## Unit Tests

### Adding a Component Test

1. Create a test file in `tests/unit/components` with the naming convention `ComponentName.test.tsx`
2. Import the necessary testing utilities:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { getTestClient } from '../../../utilities/test-helpers/client-factory';
import ComponentName from '@/components/ComponentName';
```

3. Set up the test suite with appropriate mocks:

```typescript
describe('ComponentName', () => {
  // Setup mocks if needed
  beforeEach(async () => {
    // Get mock clients
    const supabaseClient = await getTestClient('supabase');
    
    // Mock any required context providers if needed
    jest.mock('@/lib/supabase/client', () => ({
      getSupabaseClient: () => supabaseClient
    }));
  });
  
  it('renders correctly', () => {
    render(<ComponentName prop1="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
  
  it('handles user interaction', () => {
    render(<ComponentName prop1="value" />);
    fireEvent.click(screen.getByRole('button', { name: 'Button Text' }));
    expect(screen.getByText('Changed Text')).toBeInTheDocument();
  });
});
```

### Adding a Utility Function Test

1. Create a test file in `tests/unit/utils` with the naming convention `utilityName.test.ts`
2. Import the function to test:

```typescript
import { utilityFunction } from '@/utils/utilityName';

describe('utilityFunction', () => {
  it('returns expected result for valid input', () => {
    const result = utilityFunction('valid input');
    expect(result).toBe('expected output');
  });
  
  it('throws error for invalid input', () => {
    expect(() => utilityFunction(null)).toThrow('Invalid input');
  });
});
```

## API Tests

### Adding an API Route Test

1. Create a test file in `tests/api/[route-group]` with the naming convention `endpoint-name.test.ts`
2. Set up the test with supertest:

```typescript
import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import request from 'supertest';
import handler from '@/app/api/[route-group]/[endpoint]/route';
import { getTestClient } from '../../../utilities/test-helpers/client-factory';
import { testConfig } from '../../../utilities/test-helpers/test-config';

describe('API: /api/[route-group]/[endpoint]', () => {
  let server;
  
  // Create a test server for this specific handler
  beforeAll(() => {
    const requestHandler = (req, res) => {
      return apiResolver(
        req,
        res,
        undefined,
        handler,
        {} /* params */,
        false /* preflightMode */
      );
    };
    
    server = createServer(requestHandler);
  });
  
  afterAll(() => {
    server.close();
  });
  
  beforeEach(() => {
    // Ensure we're using mocks
    testConfig.resetMockSettings();
  });
  
  it('returns 200 for valid request', async () => {
    const response = await request(server)
      .post('/api/[route-group]/[endpoint]')
      .send({ key: 'value' });
      
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
  
  it('returns 400 for invalid request', async () => {
    const response = await request(server)
      .post('/api/[route-group]/[endpoint]')
      .send({}); // Missing required field
      
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
  
  it('works with real dependencies when configured', async () => {
    // Configure to use real Supabase for this test
    testConfig.setMockStatus('supabase', false);
    
    // This test would only run if appropriate env vars are set
    if (process.env.TEST_USE_REAL_SUPABASE === 'true') {
      const response = await request(server)
        .post('/api/[route-group]/[endpoint]')
        .send({ key: 'value' });
        
      expect(response.status).toBe(200);
    }
  });
});
```

## End-to-End Tests

### Adding an E2E Test

1. Create a test file in `tests/e2e/workflows` with the naming convention `feature-name.cy.ts`
2. Write the Cypress test:

```typescript
describe('Feature Name Workflow', () => {
  beforeEach(() => {
    // Visit the starting URL
    cy.visit('/starting-path');
    
    // Optional: Log in if needed
    // cy.login('test@example.com', 'password123');
  });
  
  it('completes the workflow successfully', () => {
    // Find and interact with elements
    cy.get('[data-testid="feature-button"]').click();
    
    // Verify expected state
    cy.url().should('include', '/expected-path');
    cy.get('[data-testid="success-message"]').should('be.visible');
    
    // Perform more actions
    cy.get('input[name="fieldName"]').type('test value');
    cy.get('button[type="submit"]').click();
    
    // Verify final state
    cy.contains('Success').should('be.visible');
  });
  
  it('handles error conditions', () => {
    cy.get('[data-testid="feature-button"]').click();
    cy.get('input[name="fieldName"]').type('invalid value');
    cy.get('button[type="submit"]').click();
    
    // Verify error handling
    cy.contains('Error message').should('be.visible');
  });
});
```

## Adding New Mock Services

### Steps to Add a New Mock Service

1. Define the service interface in `src/types/services.ts`:

```typescript
export interface NewService {
  methodOne: (param: any) => Promise<any>;
  methodTwo: (param: any) => Promise<any>;
  // Add more methods as needed
}
```

2. Create the mock implementation in `tests/mocks/new-service/new-service-mock.ts`:

```typescript
import { NewService } from '@/types/services';

export class NewServiceMock implements NewService {
  // Add mock properties
  private mockDelay = 100;
  public shouldFailNextRequest = false;
  private mockData = [/* initial test data */];
  
  // Helper methods
  private async delay<T>(data: T): Promise<T> {
    if (this.shouldFailNextRequest) {
      this.shouldFailNextRequest = false;
      throw new Error('Mock API error');
    }
    
    return new Promise(resolve => 
      setTimeout(() => resolve(data), this.mockDelay)
    );
  }
  
  // Implement interface methods
  methodOne = async (param: any) => {
    // Mock implementation
    return this.delay({ result: 'mock result' });
  };
  
  methodTwo = async (param: any) => {
    // Mock implementation
    return this.delay({ result: 'mock result two' });
  };
}
```

3. Update the test configuration in `tests/utilities/test-helpers/test-config.ts`:

```typescript
export const testConfig = {
  useMocks: {
    // Existing services
    supabase: process.env.TEST_USE_REAL_SUPABASE !== 'true',
    openai: process.env.TEST_USE_REAL_OPENAI !== 'true',
    langchain: process.env.TEST_USE_REAL_LANGCHAIN !== 'true',
    // Add new service
    newService: process.env.TEST_USE_REAL_NEW_SERVICE !== 'true',
  },
  // Update other methods to include the new service
  setMockStatus: (
    service: 'supabase' | 'openai' | 'langchain' | 'newService',
    useMock: boolean
  ) => {
    testConfig.useMocks[service] = useMock;
  },
  // ...
};
```

4. Update the client factory in `tests/utilities/test-helpers/client-factory.ts`:

```typescript
export type ClientType = 'supabase' | 'openai' | 'langchain' | 'newService';

// Update getMockClient function
function getMockClient(clientType: ClientType): any {
  switch (clientType) {
    // Existing cases
    case 'supabase':
      // ...
    case 'openai':
      // ...
    case 'langchain':
      // ...
    // Add new case
    case 'newService':
      return import('../../mocks/new-service/new-service-mock').then(
        (module) => new module.NewServiceMock()
      );
    default:
      throw new Error(`Unknown client type: ${clientType}`);
  }
}

// Update getRealClient function
function getRealClient(clientType: ClientType): any {
  switch (clientType) {
    // Existing cases
    case 'supabase':
      // ...
    case 'openai':
      // ...
    case 'langchain':
      // ...
    // Add new case
    case 'newService':
      return import('@/lib/new-service/client').then(
        (module) => module.getNewServiceClient()
      );
    default:
      throw new Error(`Unknown client type: ${clientType}`);
  }
}
```

5. Create a unit test for the mock in `tests/unit/mocks/new-service-mock.test.ts`

6. Implement the real client in `src/lib/new-service/client.ts` when ready

## Continuous Integration Best Practices

1. **Run All Tests Before Merging**: Ensure all tests pass locally before pushing changes.

2. **Run with Mocks First**: Always run tests with mocks first to catch basic issues quickly.

3. **Set Up CI Pipeline**: Configure the CI pipeline to run:
   - Linting
   - Unit tests with mocks
   - API tests with mocks
   - E2E tests with mocks
   - Integration tests with real dependencies (if credentials are available)

4. **Test Coverage**: Aim for high test coverage of critical paths and components.

5. **Update Mocks**: When changing real service behavior, update the corresponding mocks to match. 