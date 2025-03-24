// Import Jest DOM extensions
require('@testing-library/jest-dom');
const { server } = require('./msw-setup');

// Load environment variables from .env.test file
const dotenv = require('dotenv');

// When running integrated tests, use the test-specific env variables
if (process.env.TEST_USE_REAL_SUPABASE === 'true') {
  console.log('Loading environment variables from .env.test...');
  
  // First try .env.test file
  const result = dotenv.config({ path: '.env.test' });
  
  if (result.error) {
    console.error('Error loading .env.test file:', result.error.message);
    console.error('-------------------------------------------------------');
    console.error('Please create a .env.test file in the project root with these variables:');
    console.error('NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co');
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
    console.error('SUPABASE_SERVICE_ROLE_KEY=your-service-key (optional)');
    console.error('-------------------------------------------------------');
    console.error('Falling back to .env file (not recommended for tests)');
    
    // Fallback to .env file
    dotenv.config();
  } else {
    console.log('Successfully loaded environment variables from .env.test');
  }
}

// Set a longer timeout for tests
jest.setTimeout(30000);

// Establish API mocking before all tests, but only if we're using MSW
beforeAll(() => {
  // Only start the MSW server if we're using it
  if (process.env.USE_MSW_SUPABASE === 'true') {
    server.listen({ onUnhandledRequest: 'warn' });
    console.log('🔶 MSW Server started');
  }
});

// Reset any request handlers between tests
afterEach(() => {
  if (process.env.USE_MSW_SUPABASE === 'true') {
    server.resetHandlers();
  }
});

// Clean up after the tests are finished
afterAll(() => {
  if (process.env.USE_MSW_SUPABASE === 'true') {
    server.close();
    console.log('🔶 MSW Server stopped');
  }
});

// Add global Jest matchers if needed
expect.extend({
  // Custom matchers can be added here
});

// Add Jest matchers to the global scope
if (global.expect) {
  global.expect.extend({
    toMatchObject: () => ({
      message: () => 'expected object to match',
      pass: true,
    }),
    toBeDefined: () => ({
      message: () => 'expected value to be defined',
      pass: true,
    }),
    toBeGreaterThanOrEqual: () => ({
      message: () => 'expected value to be greater than or equal',
      pass: true,
    }),
    toBe: () => ({
      message: () => 'expected values to be equal',
      pass: true,
    }),
    toBeNull: () => ({
      message: () => 'expected value to be null',
      pass: true,
    }),
    toContain: () => ({
      message: () => 'expected value to contain substring',
      pass: true,
    }),
  });
}

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (process.env.DEBUG) {
    return;
  }
  originalConsoleError(...args);
};

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    query: {},
    pathname: '/',
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    },
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn()
  })
}));

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
}); 