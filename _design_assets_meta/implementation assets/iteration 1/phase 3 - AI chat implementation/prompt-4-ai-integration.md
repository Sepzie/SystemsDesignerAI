# Prompt 4: Basic AI Integration

## Project Structure Context
Examine these key directories for implementation:
- `src/app/api/projects/[id]/conversations/[conversationId]/messages/route.ts` - Existing message handler
- `src/app/api/projects/[id]/conversations/[conversationId]/stream/route.ts` - Existing streaming endpoint
- `src/lib/langchain/` - Create this directory for LangChain implementation
- `src/lib/supabase/` - Database access utilities for retrieving conversation history

## Part 1: Basic LangChain Setup

### Objective
Create a minimal LangChain implementation for the AI assistant.

### Requirements
1. Create basic LangChain configuration file
2. Implement a simple prompt template for the AI assistant
3. Set up OpenAI integration (or mock implementation)

### Expected Files
- `src/lib/langchain/config.ts` - Configuration settings
- `src/lib/langchain/prompts.ts` - Assistant prompt templates
- `src/lib/langchain/client.ts` - LangChain client implementation

### Acceptance Criteria
- Configuration supports both mock and real implementation
- Prompt template includes basic formatting for AI system designer assistant
- Client can process a message and return an appropriate response

## Part 2: Integration with Existing Message Handlers

### Objective
Integrate the LangChain implementation with existing message endpoints.

### Requirements
1. Modify existing message handler to trigger AI response after storing user message
2. Connect to LangChain client for response generation
3. Store AI-generated response in the database

### Expected Files
- Updates to `src/app/api/projects/[id]/conversations/[conversationId]/messages/route.ts`
- Updates to `src/app/api/projects/[id]/conversations/[conversationId]/stream/route.ts` (if using streaming)

### Implementation Notes
- After storing a user message, call LangChain client
- Pass basic message to LangChain for AI response generation
- Store the AI response as a new message with role="assistant"

### Acceptance Criteria
- User messages automatically trigger AI responses
- AI responses are properly stored in the database
- Frontend receives and displays AI responses correctly

## Part 3: Conversation Context Management

### Objective
Add conversation history context to improve AI responses.

### Requirements
1. Create utility to fetch conversation history from database
2. Format previous messages for inclusion in AI context
3. Extract relevant project details to include in context

### Expected Files
- `src/lib/langchain/context.ts` - Context management utilities
- Updates to message handlers to include context

### Implementation Notes
- Use Supabase client to query messages for a given conversation
- Limit context to recent messages (e.g., last 10 messages)
- Include project metadata relevant to the conversation

### Acceptance Criteria
- Successfully retrieves conversation history from database
- Formats messages into appropriate context structure
- AI responses reflect awareness of conversation history

## Part 4: Response Enhancement

### Objective
Improve AI responses with system design knowledge and error handling.

### Requirements
1. Enhance prompt templates with system design expertise
2. Implement error handling for failed AI calls
3. Add retry mechanism for transient errors

### Expected Files
- Updates to prompt templates and LangChain implementation
- Error handling additions to message handlers

### Implementation Notes
- Add system design expertise and guidelines to the prompt templates
- Implement graceful fallbacks for AI service failures
- Consider adding response validation to ensure quality

### Acceptance Criteria
- AI responses demonstrate understanding of system design concepts
- Failed AI calls are handled gracefully with appropriate user feedback
- System recovers from transient errors without user intervention