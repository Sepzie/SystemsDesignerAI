# Prompt 4: Enhance Chat Context for Asset References

## Objective
Enhance the existing Chat Context to support asset references in messages. This includes parsing message content for references, rendering them as interactive elements, and handling interactions with asset references.

## Project Structure Context
- Existing Chat Context is in `/contexts/ChatContext.tsx`
- Message components are in `/components/project-workspace/chat`
- Project Context and Asset Context have been implemented
- Type definitions are in `/types` directory

## Requirements

1. **Update Chat Context**
   - Enhance `/contexts/ChatContext.tsx` to work with the Project Context
   - Add support for parsing and extracting asset references from messages
   - Implement methods for handling asset reference interactions
   - Update the context to respond to asset changes from Project Context

2. **Create Asset Reference Parser**
   - Create a utility function for parsing asset references in message content
   - Define a consistent format for asset references (e.g., `[[asset:id:type:display:label]]`)
   - Handle various reference types and display modes
   - Validate references against the available assets

3. **Update Message Components**
   - Enhance `/components/project-workspace/chat/MessageItem.tsx` to render asset references
   - Create or update a component for displaying asset references within messages
   - Implement click handling to select referenced assets
   - Support different display modes for references (link, inline, preview)

4. **Integrate with Project and Asset Contexts**
   - Subscribe to asset change events from Project Context
   - Notify Project Context when asset references are clicked
   - Update message rendering when referenced assets change

## Implementation Guidelines

- Preserve all existing chat functionality
- Implement an incremental approach to adding asset reference support
- Follow the existing patterns for context updates and component rendering
- Create modular, reusable components for asset references
- Use the Project Context for cross-context communication

## Acceptance Criteria

1. Enhanced Chat Context that:
   - Parses messages for asset references
   - Responds to asset changes
   - Maintains all existing functionality

2. Asset reference parser that:
   - Reliably identifies and extracts references
   - Validates references against available assets
   - Handles different reference formats and types

3. Updated message components that:
   - Render asset references as interactive elements
   - Support different display modes
   - Handle clicks to select referenced assets

4. Integration with other contexts:
   - Proper coordination through the Project Context
   - Updates message display when assets change
   - Notifies of reference interactions

## Important Considerations

- Consider both AI-generated and user-created asset references
- Handle cases where referenced assets don't exist or can't be loaded
- Ensure the parsing doesn't affect the performance of message rendering
- Maintain accessibility for all interactive elements

## Future Integration Hints

- Asset references may need to be updated when assets are modified
- Messages might contain multiple asset references
- References might need to support versioning of assets
