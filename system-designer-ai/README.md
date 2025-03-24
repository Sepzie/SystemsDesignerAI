# AI System Designer

A powerful AI-assisted tool for designing software systems, architecture diagrams, and technical specifications.

## Overview

AI System Designer helps you create detailed system designs with the power of AI. The application offers:

- AI-powered system design conversations
- Automatic diagram generation
- Requirements extraction
- Technology stack recommendations
- Code snippet generation
- Export capabilities

## Development

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account (for database and auth)
- OpenAI API key (for AI functionalities)

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (copy `.env.example` to `.env.local`)
4. Run the development server: `npm run dev`

### Testing

The project uses a progressive mock-to-real implementation approach for testing:

- **Unit tests**: Fast tests with mocked dependencies
  - Run with: `npm test:unit`

- **API tests**: Tests for API routes
  - Run with: `npm test:api`

- **E2E tests**: Cypress-based end-to-end tests
  - Run with: `npm test:e2e` or `npm test:e2e:open` for interactive mode

- **Integration tests**: Tests with some real dependencies
  - Run with: `npm test:integrated` 

- **Full tests**: Tests with all real dependencies
  - Run with: `npm test:full`

For more details on testing approach, see:

- [Testing Infrastructure Documentation](docs/testing/manual/testing-infrastructure.md)
- [Adding Tests Procedures](docs/testing/procedures/adding-tests.md)

### Test Environment Setup

To run integration tests with a real Supabase database, you need to set up a `.env.test` file:

1. Copy the example environment file:
   ```bash
   cp .env.test.example .env.test
   ```

2. Edit `.env.test` with your test Supabase credentials
   
3. Run the environment check:
   ```bash
   npm run test:check-env
   ```

4. If the check passes, you can run integration tests:
   ```bash
   npm run test:integrated
   ```

### Running Tests

- **Unit Tests**: `npm test` - Runs all tests with mocked dependencies
- **API Tests**: `npm run test:api` - Tests API routes with mocked dependencies
- **Integration Tests**: `npm run test:integrated` - Tests with real Supabase database
- **E2E Tests**: `npm run test:e2e` - Runs Cypress end-to-end tests
- **All Tests**: `npm run test:full` - Runs all tests with real dependencies

### Technology Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL via Supabase
- **AI**: OpenAI API, LangChain
- **Testing**: Jest, React Testing Library, Cypress

## License

[MIT License](LICENSE)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
