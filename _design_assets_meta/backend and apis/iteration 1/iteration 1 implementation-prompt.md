# AI System Designer: Iteration 1 Implementation Prompt

## Project Context
You are developing the first iteration of an AI System Designer platform - a specialized tool that helps developers and architects create comprehensive system designs for full-stack applications through an AI-assisted approach. The platform guides users from initial requirements through to complete system architecture, generating diagrams, documentation, and implementation prompts.

Per the iterative development approach outlined in the project roadmap, we're starting with **Iteration 1: Basic Chatbot** to establish a functional foundation.

## Iteration 1 Goal: Basic Chatbot Interface
Create a functional chat interface with simple AI responses, focusing on user experience, message handling, and basic AI integration. Users should be able to have basic conversations with the AI assistant.

## Technical Architecture Overview
The application will be a NextJS-based web application with:
- React-based UI components
- NextJS API routes for backend functionality
- LangChain for AI orchestration
- Supabase for database, authentication, and storage
- OpenAI integration via LangChain

## Implementation Tasks

### 1. Project Setup
1. Initialize a NextJS application with TypeScript
2. Set up ESLint, Prettier, and TypeScript configuration
3. Install dependencies:
   - `langchain` for AI orchestration
   - `@supabase/supabase-js` for database and auth
   - Required UI libraries (e.g., tailwindcss)
4. Create basic folder structure:
   ```
   /app
     /api
       /auth
       /projects
       /conversations
     /components
       /ui
       /chat
       /layout
     /lib
       /supabase
       /langchain
       /utils
     /types
     /styles
   ```

### 2. Authentication System

#### 2.1 Supabase Setup
1. Create a Supabase project
2. Configure email/password authentication
3. Set up required database tables (following the database schema provided)

#### 2.2 Auth Components
1. Create login/registration forms
2. Implement authentication state management
3. Create protected routes/layouts

### 3. Project Management

#### 3.1 Project Creation
1. Implement project creation form with fields:
   - Project name
   - Description
   - Requirements (text area)
   - Technology preferences (optional checkboxes)

#### 3.2 Project Database Schema
Implement the following tables in Supabase:
- Users
- Projects
- Conversations
- Messages

Use the database schema from the diagrams as reference.

#### 3.3 Project API Routes
1. Create API route for project creation
2. Create API route for fetching user projects
3. Create API route for fetching a single project

### 4. Chat Interface

#### 4.1 UI Components
1. Create a responsive chat interface component
2. Implement message display with different styles for user and assistant messages
3. Create a message input form with send button
4. Add basic loading state indication

#### 4.2 Chat Functionality
1. Implement conversation creation for a project
2. Implement message sending and receiving
3. Store messages in the database
4. Create API routes for:
   - Starting a new conversation
   - Fetching conversation history
   - Sending a message
   - Receiving an AI response

### 5. Basic AI Integration

#### 5.1 LangChain Setup
1. Set up OpenAI integration with LangChain
2. Create a basic prompt template for the AI System Designer assistant
3. Implement simple context preservation between messages

#### 5.2 AI Response Handler
1. Create an API route that sends user messages to the LLM
2. Parse and format AI responses
3. Implement error handling for AI requests
4. Set up streaming responses if possible

### 6. User Interface

#### 6.1 Layout
1. Create a main application layout
2. Implement a sidebar for project navigation
3. Create a header with authentication status

#### 6.2 Project Dashboard
1. Create a dashboard showing user projects
2. Implement a project creation button/form
3. Add project cards with basic details

#### 6.3 Chat Page
1. Create a chat page layout
2. Implement conversation history
3. Create a message input component

### 7. Testing

1. Implement unit tests for key components
2. Set up API route testing
3. Test the chat functionality with realistic use cases
4. Test authentication flows

## Technical Requirements

### Frontend
- Implement with React and TypeScript
- Use Tailwind CSS for styling
- Create responsive layouts for desktop and mobile
- Implement loading states and error handling

### Backend
- Use NextJS API routes
- Implement proper error handling and status codes
- Validate all input data
- Secure routes with authentication middleware

### AI Integration
- Use the OpenAI API via LangChain
- Keep the implementation simple for this iteration
- Focus on getting basic chat functionality working
- Maintain conversation context between messages

### Database
- Follow the provided database schema
- Implement proper data relationships
- Use Supabase for authentication and database

## Code Quality Guidelines
- Use TypeScript for all code
- Follow ESLint rules
- Write clean, commented code
- Use meaningful variable and function names
- Implement proper error handling
- Follow a consistent code style

## Deliverables
1. A functional NextJS application with:
   - User authentication (login/register)
   - Project creation and management
   - Basic chat interface with AI responses
2. Documentation for:
   - Project setup instructions
   - API routes and their usage
   - Database schema

## Future Iterations (for reference)
In future iterations, we will extend this foundation to include:
- **Iteration 2**: Asset generation (diagrams) based on conversations
- **Iteration 3**: Advanced multi-agent system with specialized diagram generators

## Development Approach
- Start with a minimal viable implementation
- Get the basic chat functionality working first
- Implement project management features
- Add authentication once the core functionality works
- Refine the UI/UX as the last step

Please commit code regularly with descriptive commit messages. Focus on delivering a working prototype of the chat interface with basic AI responses as the primary goal of this iteration.
