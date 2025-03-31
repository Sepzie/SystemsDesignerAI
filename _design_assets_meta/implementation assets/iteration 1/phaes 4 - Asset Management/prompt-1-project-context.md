# Prompt 1: Create Project Context Foundation

## Objective
Create a Project Context that will serve as the parent context for the existing Chat Context and the upcoming Asset Context. This foundation will coordinate communication between contexts while preserving all existing chat functionality.

## Project Structure Context
Review the existing project structure in `/src`:
- Current `ChatContext.tsx` is in `/contexts` directory
- Chat components are in `/components/project-workspace/chat`
- Project components are in `/components/project`
- Types are defined in `/types` directory

## Requirements

1. **Create Project Context Provider**
   - Create `/contexts/ProjectContext.tsx` as a new React context provider
   - The provider should maintain basic project information (id, name, description)
   - Implement a simple event system for cross-context communication
   - Include methods for notifying about asset selection, creation, and updates

2. **Wrap Existing Chat Context**
   - Modify the current project workspace to use the new Project Context as a parent
   - Ensure ChatContext continues to work with its existing functionality
   - Update imports in components that use ChatContext

3. **Add Type Definitions**
   - Add a new file `/types/project.ts` or update existing ones with Project Context types
   - Define interfaces for ProjectContext, Project data, and cross-context events
   - Ensure TypeScript type safety across the integration

4. **Update Project Components**
   - Update `/components/project-workspace/ProjectLayout.tsx` to use the new context
   - Leave actual ChatContext functionality intact - only add the Project Context wrapper

## Implementation Guidelines

- Start by examining the existing ChatContext implementation thoroughly
- Take an incremental approach that doesn't break existing functionality
- Create a minimal viable implementation first, then enhance
- Follow the existing patterns for context creation, provider implementation, and custom hooks
- Use React's useContext, createContext, and useState/useReducer appropriately

## Acceptance Criteria

1. A functional ProjectContext provider that includes:
   - Project state management
   - Simple event system for cross-context communication
   - Methods for notifying about asset-related events

2. Type definitions for all new interfaces and types

3. All existing chat functionality continues to work without issues

4. Project components updated to use the new context structure

5. A custom hook (useProject) for consuming the Project Context

## Important Considerations

- The Project Context should be designed to work with both the existing Chat Context and the future Asset Context
- Review all components that currently use ChatContext to ensure compatibility
- Maintain consistent error handling approaches
- Follow the existing project patterns for TypeScript usage

## Future Integration Hints

- The Project Context will eventually coordinate between Chat Context and Asset Context
- Asset references in messages will need to be handled by this coordination
- Changes to assets will need to be communicated to components showing message history
