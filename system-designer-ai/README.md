# AI System Designer - Technical Documentation

This directory contains the main Next.js application for the AI System Designer platform.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.x or higher
- **npm** or **yarn**: Package manager
- **Supabase account**: For database and authentication
- **OpenAI API key**: For AI functionality
- **Supabase CLI**: For database operations (optional but recommended)

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd system-designer-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   
   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Optional: Development overrides
   NEXT_PUBLIC_USE_MOCK_AI=true
   NEXT_PUBLIC_USE_MOCK_DB=true
   ```

4. **Set up the database**:
   ```bash
   # Install Supabase CLI globally (if not already installed)
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link your project (replace with your project reference)
   supabase link --project-ref your-project-ref
   
   # Run migrations
   supabase db push
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

### Manual Setup (Alternative to Supabase CLI)

If you prefer to set up the database manually:

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run the SQL migrations** in your Supabase SQL editor:

   **Users and Projects** (`20250329000000_create_users_table.sql`):
   ```sql
   -- Enable UUID extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   
   -- Create users table
   CREATE TABLE users (
       id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
       email text UNIQUE NOT NULL,
       created_at timestamptz DEFAULT now(),
       updated_at timestamptz DEFAULT now()
   );
   
   -- Create projects table
   CREATE TABLE projects (
       id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
       user_id uuid REFERENCES users(id) ON DELETE CASCADE,
       name text NOT NULL,
       description text,
       metadata jsonb DEFAULT '{}'::jsonb,
       created_at timestamptz DEFAULT now(),
       updated_at timestamptz DEFAULT now()
   );
   ```

   **Conversations and Messages** (`20250404000000_create_conversations_and_messages.sql`):
   ```sql
   -- Create conversations table
   CREATE TABLE conversations (
       id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
       project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
       title text,
       created_at timestamptz DEFAULT now(),
       updated_at timestamptz DEFAULT now()
   );
   
   -- Create messages table
   CREATE TABLE messages (
       id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
       conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
       role text NOT NULL CHECK (role IN ('user', 'assistant')),
       content text NOT NULL,
       referenced_assets uuid[] DEFAULT '{}',
       metadata jsonb DEFAULT '{}'::jsonb,
       created_at timestamptz DEFAULT now(),
       updated_at timestamptz DEFAULT now()
   );
   ```

   **Assets and Versioning** (`20250404000001_create_assets_and_versioning.sql`):
   ```sql
   -- Create assets table
   CREATE TABLE assets (
       id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
       project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
       semantic_id text NOT NULL,
       name text NOT NULL,
       type text NOT NULL CHECK (type IN ('mermaid', 'markdown')),
       content text NOT NULL,
       metadata jsonb DEFAULT '{}'::jsonb,
       created_at timestamptz DEFAULT now(),
       updated_at timestamptz DEFAULT now()
   );
   
   -- Create asset_versions table
   CREATE TABLE asset_versions (
       id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
       asset_id uuid REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
       version_number integer NOT NULL,
       content text NOT NULL,
       metadata jsonb DEFAULT '{}'::jsonb,
       created_at timestamptz DEFAULT now()
   );
   ```

3. **Set up Row Level Security (RLS)** policies for each table

4. **Enable Supabase Auth** and configure authentication settings

### Database Schema Overview

The application uses the following main tables:

- **`users`**: User accounts and authentication
- **`projects`**: User projects containing design assets
- **`conversations`**: AI chat sessions within projects
- **`messages`**: Individual messages in conversations
- **`assets`**: Design artifacts (diagrams, docs)
- **`asset_versions`**: Version history for assets

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run dev:debug        # Start development server on port 4000

# Building
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm run test            # Run Cypress tests
npm run test:open       # Open Cypress test runner
npm run test:ci         # Run tests in CI mode

# Database
npm run db:reset        # Reset database (development only)
npm run db:seed:test-user    # Seed test user
npm run db:seed:test-project # Seed test project

# Linting
npm run lint            # Run ESLint
```

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── projects/      # Project management
│   │   └── export/        # Export functionality
│   ├── dashboard/         # Dashboard page
│   ├── login/            # Authentication pages
│   ├── register/
│   └── projects/         # Project workspace
├── components/           # React components
│   ├── common/           # Shared components
│   ├── layout/           # Layout components
│   ├── project/          # Project-related components
│   ├── project-workspace/ # Workspace components
│   └── ui/               # UI components
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── api-client.ts     # API client utilities
│   ├── langchain/        # AI integration
│   ├── supabase/         # Database client
│   └── validators/       # Validation utilities
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

### Key Technologies

- **Next.js 15**: React framework with App Router
- **React 19**: UI library with latest features
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Supabase**: Backend-as-a-Service (database, auth, storage)
- **LangChain**: AI/LLM orchestration framework
- **OpenAI**: GPT-4 integration
- **Mermaid**: Diagram rendering
- **Cypress**: End-to-end testing

### AI Integration

The application uses LangChain to orchestrate AI interactions:

- **Conversation Management**: Maintains context across chat sessions
- **Asset Generation**: Creates Mermaid diagrams and Markdown docs
- **Prompt Templates**: Structured prompts for consistent AI responses
- **Streaming Responses**: Real-time AI response streaming

### Testing

The project includes comprehensive testing:

- **Cypress E2E Tests**: Full user journey testing
- **Component Testing**: Individual component validation
- **API Testing**: Backend endpoint validation
- **Database Testing**: Data integrity and operations

Run tests with:
```bash
npm run test:open  # Interactive test runner
npm run test       # Headless test execution
```

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ...` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_USE_MOCK_AI` | Use mock AI responses | `false` |
| `NEXT_PUBLIC_USE_MOCK_DB` | Use mock database | `false` |

## 🚀 Deployment

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Manual Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm run start
   ```

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors**:
- Verify Supabase credentials in `.env.local`
- Check if Supabase project is active
- Ensure RLS policies are properly configured

**AI Integration Issues**:
- Verify OpenAI API key is valid
- Check API rate limits
- Ensure proper prompt formatting

**Authentication Problems**:
- Verify Supabase Auth is enabled
- Check redirect URLs in Supabase settings
- Clear browser cache and cookies

### Getting Help

1. Check the [Issues](../../issues) page for known problems
2. Review the [Design Assets](../../_design_assets) for implementation details
3. Consult the [Implementation Tracker](../../implementation-tracker) for development status

## 📚 Additional Resources

- [Design Assets](../../_design_assets): System design documentation
- [Implementation Guide](../../_design_assets_meta/implementation_process_guide.md): Development process
- [API Specification](../../_design_assets/api-specification-v2.md): API documentation
- [Database Schema](../../_design_assets/database-schema.mermaid): Database design

## 🤝 Contributing

See the [Contributing Guidelines](../../CONTRIBUTING.md) for development guidelines and code standards.
