# Implement Enhanced Prompt Templates for Asset Generation

## Project Structure Context
- Examine: `/lib/langchain/prompts.ts` - Current prompt templates
- Examine: `/lib/langchain/client.ts` - How prompts are used
- Examine: `/types/langchain.ts` - Types for LangChain responses

## Objective
Enhance the prompt template system to support unified conversation and asset generation capabilities.

## Requirements
- Create a new prompt template specifically for asset generation
- Update the existing prompt template to include instructions for identifying when to generate assets
- Add support for different asset types (mermaid diagrams, data models, etc.)
- Create a structured format for the AI to signal asset generation in its response

## Expected Files
- Update `/lib/langchain/prompts.ts` to add new prompt templates
- Update `/types/langchain.ts` to add types for asset-related responses
- Create `/lib/langchain/asset-extraction.ts` for parsing AI responses for assets

## Implementation Notes
- The AI should explicitly signal asset generation in a parsable format
- Consider using a specific format like: "{{asset_type:mermaid_diagram}}\n```\n[content]\n```"
- Asset types should include: `mermaid_diagram`, `system_context`, `component_diagram`, `data_model`, etc.

## Acceptance Criteria
- New prompt templates successfully guide the AI to generate assets when appropriate
- The AI response format allows for reliable extraction of asset content
- Asset type identification is consistent and standardized
- The system maintains conversation quality while enabling asset generation