# Prompt 5: Implement Asset Creation Flow from Chat

## Objective
Implement the flow for creating new assets from chat messages, particularly from AI responses. This includes extracting asset content from messages, creating assets in the Asset Context, and updating messages with proper references.

## Project Structure Context
- Chat, Project, and Asset Contexts have been implemented
- Message and asset components have been updated for asset references
- Types and utilities have been defined

## Requirements

1. **Enhance Chat Context for Asset Creation**
   - Add asset extraction functionality to ChatContext
   - Implement methods for creating assets from message content
   - Update message processing to identify potential assets in AI responses
   - Connect to Project Context for asset creation

2. **Implement Asset Extraction Logic**
   - Create utility functions for identifying asset content in messages
   - Support extraction of different asset types (diagrams, documents, etc.)
   - Parse content into the appropriate format for asset creation
   - Validate extracted content before asset creation

3. **Update Asset Creation Flow**
   - Implement the flow from message content to asset creation
   - Connect extracted assets to the Asset Context via Project Context
   - Update messages with proper references after asset creation
   - Handle errors in the asset creation process

4. **Enhance Message Processing**
   - Update how AI responses are processed to identify embedded assets
   - Support automatic extraction of assets from structured content
   - Implement fallbacks if asset extraction or creation fails
   - Handle partial updates for streaming responses

## Implementation Guidelines

- Focus on the most common asset type first (likely Mermaid diagrams)
- Consider how to handle both complete and partial assets in streaming responses
- Follow existing patterns for asynchronous operations and error handling
- Implement clean separation between extraction logic and UI components

## Acceptance Criteria

1. Asset extraction functionality that:
   - Identifies potential assets in message content
   - Properly extracts and formats asset content
   - Supports different asset types
   - Validates content before asset creation

2. Asset creation flow that:
   - Creates assets from extracted content
   - Updates messages with proper references
   - Handles errors gracefully
   - Works with the existing contexts

3. Enhanced message processing that:
   - Automatically identifies assets in AI responses
   - Supports streaming responses
   - Falls back gracefully if extraction fails

4. Proper integration across contexts:
   - Chat Context extracts assets
   - Project Context coordinates creation
   - Asset Context stores and manages assets
   - UI components reflect the new assets

## Important Considerations

- Consider how to handle large assets or multiple assets in a single message
- Implement proper error handling for failed extractions or creations
- Ensure good performance even with complex extraction logic
- Support both automatic and manual asset extraction

## Future Integration Hints

- This flow will be critical for the AI to generate design assets
- The extraction logic might need to become more sophisticated over time
- User feedback on extraction might be needed for complex cases
