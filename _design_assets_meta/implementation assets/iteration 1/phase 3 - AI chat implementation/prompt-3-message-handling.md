# Prompt 3: Message Handling Implementation

## Objective
Connect the chat UI components to the conversation API endpoints, implementing complete message handling functionality.

## Project Structure Context
Examine these key directories for implementation:
- `src/components/chat/` - Location for chat UI components (ChatInterface, MessageInput, MessageItem, MessageList)
- `src/app/api/projects/[id]/conversations/` - API routes for conversations
- `src/app/api/projects/[id]/conversations/[conversationId]/messages/` - API routes for messages
- `src/lib/supabase/` - Database access utilities
- `src/contexts/` - For potential ChatContext implementation
- `src/types/` - TypeScript interfaces (api.ts, chat.ts, project.ts)

## Requirements

### Core Functionality
1. **Message Sending**
   - Capture user input from message form
   - Submit messages to the API endpoint
   - Handle loading states during submission

2. **Message Display**
   - Fetch and display message history
   - Auto-scroll to new messages
   - Update UI when new messages arrive

3. **State Management**
   - Manage conversation state
   - Implement optimistic updates
   - Handle error recovery

### Technical Specifications
- Use `api/projects/[id]/conversations/[conversationId]/messages/route.ts` endpoint for message operations
- Check existing API patterns in `src/lib/api-client.ts` and `src/lib/api-utils.ts`
- Utilize type definitions from `src/types/chat.ts` and `src/types/api.ts`
- Implement proper error handling using patterns from `src/lib/error-handler.ts`

## API Integration Functions
Implement these core functions:
```typescript
// Create a new conversation
function createConversation(projectId: string): Promise<Conversation>

// Get conversation details
function getConversation(projectId: string, conversationId: string): Promise<Conversation>

// Fetch message history
function getMessages(projectId: string, conversationId: string): Promise<Message[]>

// Send a new user message
function sendMessage(projectId: string, conversationId: string, content: string): Promise<Message>
```

## Deliverables
1. Client-side API integration functions
2. UI component connections to the API
3. Complete message sending and receiving implementation
4. State management for conversation data
5. Error handling for API operations

## Acceptance Criteria
- Users can create and open conversations
- Message history loads and displays correctly
- Users can send messages and see them in the conversation
- Loading states display during API requests
- Errors are handled with appropriate user feedback