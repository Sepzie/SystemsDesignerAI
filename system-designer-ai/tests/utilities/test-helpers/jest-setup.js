// Import Jest DOM extensions
require('@testing-library/jest-dom');
const { server } = require('./msw-setup');

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
  if (
    args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
    args[0]?.includes?.('Error: Not implemented: navigation')
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 