# AI System Designer

AI System Designer is a web application that helps software engineers design complex software systems with AI assistance. The platform allows users to create system diagrams, API specifications, data models, and more using AI-generated suggestions.

## Features

- Create and manage software design projects
- Generate system architecture diagrams
- Define API specifications
- Design database schemas
- Interactive conversations with AI to refine designs
- Export designs for implementation

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/system-designer-ai.git
cd system-designer-ai
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Set up the Supabase database by creating the following tables:

- User
- Project
- DesignAsset
- AssetVersion
- Conversation
- Message
- ExportedPrompt

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
system-designer-ai/
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── api/         # API routes
│   │   ├── dashboard/   # Dashboard page
│   │   ├── login/       # Login page
│   │   ├── register/    # Registration page
│   │   └── projects/    # Project-related pages
│   ├── components/      # React components
│   ├── lib/             # Utility libraries
│   │   └── supabase/    # Supabase client
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── public/              # Static assets
└── ...
```

## API Endpoints

The application provides the following API endpoints:

- **Authentication**: Login, registration, and session management
- **Projects**: Create, read, update, and delete projects
- **Design Assets**: Manage various design assets within projects
- **Conversations**: Interactive sessions with AI for system design

## License

This project is licensed under the MIT License.
