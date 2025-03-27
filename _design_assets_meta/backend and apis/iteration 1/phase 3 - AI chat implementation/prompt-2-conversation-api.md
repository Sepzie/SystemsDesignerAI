# Prompt 2: Conversation API Implementation

## Objective
Implement the backend API routes for conversation management in the AI System Designer application, enabling the creation, retrieval, and management of conversations and messages.

## Background
With the chat UI components created in the previous prompt, we now need to implement the backend API routes that will handle conversation data. These routes will allow the frontend to create new conversations, fetch existing conversations, and manage messages within conversations.

## Requirements

### API Routes to Implement
1. **Create Conversation**
   - Endpoint: `POST /api/projects/{projectId}/conversations`
   - Creates a new conversation associated with a project
   - Returns the created conversation data

2. **List Conversations**
   - Endpoint: `GET /api/projects/{projectId}/conversations`
   - Retrieves all conversations for a specific project
   - Returns an array of conversation objects

3. **Get Conversation**
   - Endpoint: `GET /api/projects/{projectId}/conversations/{conversationId}`
   - Retrieves a single conversation by ID
   - Returns the conversation object with its messages

4. **Add Message**
   - Endpoint: `POST /api/projects/{projectId}/conversations/{conversationId}/messages`
   - Adds a new message to a conversation
   - Returns the created message data

5. **List Messages**
   - Endpoint: `GET /api/projects/{projectId}/conversations/{conversationId}/messages`
   - Retrieves all messages for a specific conversation
   - Returns an array of message objects

### Data Structures
Based on the database schema, implement the following data structures:

**Conversation:**
```typescript
interface Conversation {
  id: string;
  projectId: string;
  startedAt: Date;
  updatedAt: Date;
}
```

**Message:**
```typescript
interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, any>; // Optional metadata such as references to assets
  createdAt: Date;
}
```

### Technical Requirements
- Implement these routes using NextJS API routes
- Use proper request validation and error handling
- Ensure all routes are properly authenticated
- Implement appropriate status codes for success and error responses
- Follow RESTful API design principles
- Create TypeScript interfaces for request and response types

## Implementation Guidelines

### Route Structure
Follow this structure for API routes:
```
/pages/api/projects/[projectId]/conversations/index.ts          # List/Create conversations
/pages/api/projects/[projectId]/conversations/[conversationId].ts # Get conversation
/pages/api/projects/[projectId]/conversations/[conversationId]/messages/index.ts # List/Create messages
```

### Database Interactions
- Use the existing database access methods (Supabase or your project's DB layer)
- Implement proper transactions where needed
- Include error handling for database operations
- Consider pagination for listing routes if messages might be numerous

### Authentication & Authorization
- Ensure all routes verify that the user is authenticated
- Verify that the user has access to the specified project
- Use the existing authentication middleware

### Mock Implementation
For initial testing, you may want to:
- Create a mock database layer if needed for testing
- Implement simple data validation before database integration
- Use the feature flag system to toggle between mock and real implementations

## Deliverables
1. Implementation of all specified API routes
2. TypeScript interfaces for all request and response types
3. Proper error handling and status codes
4. Database integration for conversation and message persistence
5. Documentation comments explaining the route functionality

## Acceptance Criteria
- All routes handle CRUD operations correctly
- Routes return appropriate status codes for success and errors
- Authentication is properly implemented
- Database operations correctly persist and retrieve data
- API responses match expected formats
- Routes are well-tested with appropriate error cases
- Code follows project standards and conventions

## References
- Review the `database-schema.mermaid` file for database structure
- Reference the `design-generation-workflow.mermaid` diagram for message flow
- See the `API Specification.txt` file for API format consistency
- Check the authentication implementation in existing API routes

## Implementation Tips
- Start with route structure and interfaces before implementing functionality
- Consider implementing a conversation service layer if the logic is complex
- Use consistent error handling patterns across all routes
- Document any deviations from the API specification for future reference
- Consider rate limiting for message creation to prevent abuse