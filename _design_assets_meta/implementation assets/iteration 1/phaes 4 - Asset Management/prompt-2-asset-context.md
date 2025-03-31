# Prompt 2: Implement Asset Context

## Objective
Create an Asset Context that will manage the asset registry, asset selection, and asset operations for the AI System Designer. This context will be a sibling to the existing Chat Context and will be coordinated by the Project Context.

## Project Structure Context
- The Project Context has been implemented in `/contexts/ProjectContext.tsx`
- Asset-related components are in `/components/project-workspace/asset`
- Existing asset types should be in `/types/asset.ts`

## Requirements

1. **Create Asset Context Provider**
   - Create `/contexts/AssetContext.tsx` as a new React context provider
   - The provider should maintain a registry of assets for the current project
   - Track the currently selected asset
   - Provide CRUD operations for assets (create, read, update, delete)
   - Connect to the Project Context for cross-context communication

2. **Implement Asset State Management**
   - Maintain a collection of assets with their metadata
   - Track the currently selected asset ID
   - Handle loading, error, and success states
   - Support asset versioning (at least current version tracking)

3. **Add/Update Type Definitions**
   - Update `/types/asset.ts` with Asset Context types if needed
   - Define interfaces for AssetContext, Asset data, and asset operations
   - Include types for asset references that will appear in messages

4. **Connect to Project Context**
   - Subscribe to relevant events from Project Context
   - Notify Project Context of asset changes
   - Implement selection synchronization via Project Context

## Implementation Guidelines

- Review the existing AssetViewer and AssetList components to understand requirements
- Keep the Asset Context focused on asset management only
- Follow the same patterns used in Project Context and Chat Context
- Create a custom hook (useAsset) for consuming the Asset Context
- Implement proper loading and error states for asynchronous operations

## Acceptance Criteria

1. A functional AssetContext provider that includes:
   - Asset state management (registry of assets, selected asset)
   - CRUD operations for assets
   - Loading and error states

2. Complete type definitions for all asset-related interfaces

3. Connection to Project Context for cross-context communication

4. A custom hook (useAsset) for consuming the Asset Context

5. Asset state persistence during the session

## Important Considerations

- Assets will need to be loaded from and saved to the backend
- The Asset Context should handle different asset types (diagrams, documents, etc.)
- Consider how assets created by the AI will be handled
- Follow existing patterns for error handling and loading states

## Future Integration Hints

- Asset references in messages will need to be resolved via the Asset Context
- When an asset is selected in the chat, the Asset Context will need to update its state
- Assets may be created directly from chat messages
