# Testing Guide for System Designer AI

This guide explains the different testing approaches in this project and how to use them effectively.

## Testing Approaches

There are two main approaches to testing the Supabase integration:

1. **Direct Mock** - Uses the `SupabaseMock` class to mock Supabase functionality in-memory (**default**)
2. **MSW (Mock Service Worker)** - Intercepts HTTP requests to mock the Supabase API (optional)

## Test Scripts

The following npm scripts are available for running tests:

| Script | Description |
|--------|-------------|
| `npm test` | Run all tests using the default direct mock |
| `npm run test:unit` | Run all unit tests using the default direct mock |
| `npm run test:api` | Run all API tests using the default direct mock |
| `npm run test:msw` | Run all tests using MSW for HTTP interception |
| `npm run test:msw:unit` | Run unit tests using MSW |
| `npm run test:msw:api` | Run API tests using MSW |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:integrated` | Run tests with a real Supabase instance |
| `npm run test:full` | Run all tests with real Supabase, OpenAI and LangChain |
| `./test-msw.sh` | Shell script to run specific tests with MSW and custom output formatting |

## Environment Variables

Tests can be configured with the following environment variables:

| Variable | Description |
|----------|-------------|
| `USE_MSW_SUPABASE=true` | Use MSW to intercept HTTP requests instead of the direct mock |
| `TEST_USE_REAL_SUPABASE=true` | Use a real Supabase instance instead of mocks |
| `TEST_USE_REAL_OPENAI=true` | Use real OpenAI API instead of mocks |
| `TEST_USE_REAL_LANGCHAIN=true` | Use real LangChain instead of mocks |

## Mocking Supabase

### Direct Mock (`SupabaseMock`) - Default Approach

The `SupabaseMock` class mimics the Supabase API with in-memory storage:

```javascript
const { SupabaseMock } = require('../../mocks/supabase/supabase-mock');

describe('Authentication Tests', () => {
  let supabaseClient;
  
  beforeEach(() => {
    // Create a direct instance of SupabaseMock
    supabaseClient = new SupabaseMock();
  });

  it('signs up a user', async () => {
    const { data, error } = await supabaseClient.auth.signUp({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(error).toBeNull();
    expect(data.session).toBeDefined();
  });
});
```

### MSW (Mock Service Worker) - Optional Approach

MSW intercepts HTTP requests to the Supabase API. This can be useful for integration or API tests:

```javascript
// First set the environment variable: USE_MSW_SUPABASE=true
const { createTestClient } = require('../../utilities/test-helpers/supabase-test-client');
const { rest } = require('msw');
const { server } = require('../../utilities/test-helpers/msw-setup');
const { SUPABASE_URL } = require('../../utilities/test-helpers/msw-setup');

describe('Authentication Tests', () => {
  let supabaseClient;
  
  beforeEach(() => {
    supabaseClient = createTestClient();
  });

  it('signs up a user', async () => {
    // Set up the mock response 
    server.use(
      rest.post(`${SUPABASE_URL}/auth/v1/signup`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            user: { id: 'test-id', email: 'test@example.com' },
            session: { access_token: 'test-token' }
          })
        );
      })
    );

    const { data, error } = await supabaseClient.auth.signUp({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(error).toBeNull();
    expect(data.session).toBeDefined();
  });
});
```

## Best Practices

1. **Use Direct Mocks for Fast Unit Tests** (Default):
   - Faster and more reliable for pure unit tests
   - Simpler setup and debugging
   - This is the default approach in this project

2. **Use MSW for Integration Testing** (Optional):
   - Better for testing the HTTP layer
   - More realistic simulation of API behavior
   - Use when you need to test specific HTTP interactions

3. **Test Data Consistency**:
   - Ensure test data is consistent across both approaches
   - Use shared test fixtures where possible

4. **Clean Up After Each Test**:
   - Reset mocks between tests to avoid cross-test contamination

5. **Foreign Key Relationships**:
   - When testing models with foreign key relationships, set up parent entities first
   - Example: Create users before creating projects that reference those users 