# System Designer AI Testing

This directory contains tests for the System Designer AI application. The tests are organized into different categories and use MSW (Mock Service Worker) to mock Supabase interactions.

## Test Structure

- `unit/`: Contains unit tests for individual components and utilities
- `api/`: Contains tests for API routes
- `utilities/`: Contains test helpers and setup files
- `mocks/`: Contains legacy mock implementations (deprecated in favor of MSW)

## Testing Setup

### Mock Service Worker (MSW)

We use MSW with msw-postgrest to mock Supabase API calls. The setup is defined in:

- `utilities/test-helpers/msw-setup.js`: Configures the MSW server and handlers
- `utilities/test-helpers/jest-setup.js`: Configures Jest and initializes the MSW server

### Test Client

A test Supabase client is created in `utilities/test-helpers/supabase-test-client.js`. This client uses the mock Supabase URL for testing.

## Running Tests

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run API tests
npm run test:api

# Run a specific test file
npx jest path/to/test-file.test.js

# Run tests with coverage
npm test -- --coverage
```

## Writing Tests

### Unit Tests

Unit tests should focus on testing a single component or utility function in isolation. Mock any dependencies using MSW or Jest mocks.

Example:

```javascript
import { createTestClient } from '../../utilities/test-helpers/supabase-test-client';
import { mock } from '../../utilities/test-helpers/msw-setup';

describe('Some Component', () => {
  let supabase;
  
  beforeEach(() => {
    supabase = createTestClient();
    
    // Mock Supabase response
    mock.getHandler('projects').mockData([
      { id: 1, name: 'Test Project' }
    ]);
  });
  
  it('should do something', async () => {
    // Test logic here
  });
});
```

### API Tests

API tests should use supertest to make requests to a Next.js API route and test the response.

Example:

```javascript
import request from 'supertest';
import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import handler from '../../../pages/api/some-endpoint';

describe('API Endpoint', () => {
  let server;
  
  beforeAll(() => {
    server = createServer((req, res) => {
      return apiResolver(req, res, undefined, handler, {}, false);
    });
  });
  
  afterAll(() => {
    server.close();
  });
  
  it('should return expected response', async () => {
    const response = await request(server)
      .get('/')
      .set('Authorization', 'Bearer test-token');
      
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      // expected response
    });
  });
});
```

## Best Practices

1. Keep tests focused on a single piece of functionality
2. Use descriptive test names
3. Mock external dependencies
4. Clean up after each test
5. Use setup and teardown hooks appropriately
6. Avoid testing implementation details
7. Aim for high test coverage of critical paths

## Troubleshooting

If tests are failing, check:

1. MSW setup is correctly configured
2. Mocks are properly set up before each test
3. Assertions are accurate
4. Test timeouts are sufficient for async operations 