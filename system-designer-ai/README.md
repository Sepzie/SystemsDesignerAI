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
