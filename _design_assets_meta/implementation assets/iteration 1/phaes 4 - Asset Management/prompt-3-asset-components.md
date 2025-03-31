# Prompt 3: Implement Asset Viewer Components

## Objective
Update or create asset viewer components that use the new Asset Context to display and interact with assets. Implement the asset panel that will appear on the right side of the project workspace.

## Project Structure Context
- Asset Context has been implemented in `/contexts/AssetContext.tsx`
- Existing asset components are in `/components/project-workspace/asset`
- Project layout is in `/components/project-workspace/ProjectLayout.tsx`

## Requirements

1. **Update/Create Asset Viewer Component**
   - Update `/components/project-workspace/asset/AssetViewer.tsx` to use the Asset Context
   - Display the currently selected asset
   - Support different asset types (diagrams, documents, etc.)
   - Implement basic interaction capabilities (view, potentially edit)
   - Handle loading and error states appropriately

2. **Update/Create Asset List Component**
   - Update `/components/project-workspace/asset/AssetList.tsx` to use the Asset Context
   - Display a list of available assets for the current project
   - Support selection of assets from the list
   - Show asset metadata (name, type, last updated)
   - Include visual indication of the currently selected asset

3. **Integrate with Project Layout**
   - Update `/components/project-workspace/ProjectLayout.tsx` to include the asset panel
   - Position the asset panel on the right side of the workspace
   - Ensure responsive layout that works on different screen sizes
   - Include basic show/hide functionality if needed

4. **Implement Asset Reference Component (Optional)**
   - Create a component for rendering asset references in messages
   - Support different display modes (link, inline, preview)
   - Handle clicks to select the referenced asset

## Implementation Guidelines

- Use the Asset Context via the useAsset hook
- Follow existing design patterns and component structure
- Ensure components handle loading, error, and empty states
- Implement responsive design for different screen sizes
- Use existing UI components where appropriate

## Acceptance Criteria

1. Functional asset viewer that:
   - Displays the currently selected asset
   - Handles different asset types appropriately
   - Shows loading and error states

2. Asset list that:
   - Shows all assets for the current project
   - Allows selection of assets
   - Indicates the currently selected asset

3. Updated project layout that:
   - Includes the asset panel on the right
   - Maintains responsive design
   - Preserves existing chat functionality

4. (Optional) Asset reference component that:
   - Renders asset references in messages
   - Supports selection of referenced assets

## Important Considerations

- The asset viewer should support at least basic Mermaid diagrams
- Consider how to handle assets that are still loading or failed to load
- Follow accessibility guidelines for all components
- Ensure the layout works well on both desktop and mobile views

## Future Integration Hints

- The asset components will need to update when assets are referenced in chat
- Asset selection will need to be synchronized between chat and asset panel
- Later, assets may be editable directly in the viewer
