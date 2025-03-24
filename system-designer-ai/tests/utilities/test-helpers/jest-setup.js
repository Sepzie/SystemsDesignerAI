// Import Jest DOM extensions
import '@testing-library/jest-dom';

// Set up global test timeout
jest.setTimeout(30000);

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