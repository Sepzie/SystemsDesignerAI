# System Designer AI Test Directory

This directory contains the test implementation for the System Designer AI application. For comprehensive documentation, see:
- [Main Testing Documentation](../TESTING.md)
- [Guide for Adding Tests](../docs/testing/procedures/adding-tests.md)

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Generate MSW service worker (if using MSW):
```bash
npx msw init public/
```

## Directory Structure Quick Reference

- `unit/`: Unit tests (components, utilities)
  - Test files should end with `.test.ts` or `.test.tsx`
  - Place tests close to the code they test
  
- `api/`: API route tests
  - Follow the same structure as your API routes
  - Use `supertest` for HTTP testing
  
- `mocks/`: Service mocks
  - Each service has its own directory
  - Implement the same interface as the real service
  
- `utilities/`:
  - `test-helpers/`: Test setup and configuration
  - `fixtures/`: Test data templates
  - `factories/`: Test data generation

## Key Files

- `utilities/test-helpers/msw-setup.js`: MSW configuration
- `utilities/test-helpers/jest-setup.js`: Jest configuration
- `utilities/test-helpers/test-config.ts`: Mock/real service switching
- `utilities/test-helpers/client-factory.ts`: Service client factory
- `utilities/factories/test-data-factory.ts`: Test data generation

## Debugging Tests

1. Debug specific test file:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand [test-file]
```

2. Debug in VS Code:
   - Add a `debugger` statement in your test
   - Use the "Jest Current File" launch configuration
   - Set breakpoints in VS Code

3. Common debugging commands:
```bash
# Run single test file
npx jest path/to/test.test.ts

# Run tests matching pattern
npx jest -t "test pattern"

# Run with detailed logging
npm test -- --verbose

# Update snapshots
npm test -- -u
```

## Troubleshooting

1. **MSW Issues**
   - Check `mockServiceWorker.js` exists in public/
   - Verify MSW handlers match your API routes
   - Check network tab for intercepted requests

2. **Test Data Issues**
   - Use `console.log` or `debug` statements
   - Check test data factory output
   - Verify database state in beforeEach/afterEach

3. **Timeouts**
   - Increase timeout in jest.config.js
   - Add `jest.setTimeout(milliseconds)` in test
   - Check for hanging promises or connections

4. **Memory Leaks**
   - Clean up subscriptions and listeners
   - Close database connections
   - Reset mocks between tests 