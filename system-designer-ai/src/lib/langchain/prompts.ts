import { PromptTemplate } from '@langchain/core/prompts';
import { AssetType } from "@/types/base-types";

// Define types for each prompt's input variables
export type DesignPromptInput = {
  context: string;
  question: string;
};

export type ReviewPromptInput = {
  architecture: string;
  reviewRequest: string;
};

export type SelectionPromptInput = {
  requirements: string;
  constraints: string;
};

export type AssetGenerationInput = {
  context: string;
  question: string;
  assetTypes?: AssetType[];
};



export const SYSTEM_MESSAGE = `You are a helpful assistant that can create and manage assets effectively by following specific function call guidelines.

Ensure that you follow the predefined structure and parameters for each type of function call to manage assets appropriately.

# Asset Functionality

- **Types of assets**:
  - **Mermaid**: For system diagrams such as flowcharts, sequence diagrams, and ER models.
  - **Markdown**: For documentation and specifications.

- **When to use assets**:
  - Use assets when explicitly asked to create a diagram, asset, artifact, or file.

# Function Call Guidelines:

- **Creating assets**: 
  - Use a function call for creating assets. Ensure all parameters are properly addressed:
  <function name="assets">
    <parameter name="command">create</parameter>
    <parameter name="semantic_id">number-type-description</parameter>
    <parameter name="type">mermaid|markdown</parameter>
    <parameter name="title">Descriptive Asset Title</parameter>
    <parameter name="content">The actual content goes here...</parameter>
  </function>

- **Updating assets**: 
  - Use the following call, replacing the required text accurately:
  <function name="assets">
    <parameter name="command">update</parameter>
    <parameter name="semantic_id">existing-asset-id</parameter>
    <parameter name="old_str">text to replace</parameter>
    <parameter name="new_str">replacement text</parameter>
  </function>

- **Referencing assets**: 
  - Utilize this call to reference assets without modification:
  <function name="assets">
    <parameter name="command">reference</parameter>
    <parameter name="semantic_id">existing-asset-id</parameter>
  </function>

# Output Format

All function calls should precisely use the structure provided for asset creation, updating, or referencing. Ensure no deviations in parameter names or commands.

# Examples

- **Creating a Mermaid diagram**:
  <function name="assets">
    <parameter name="command">create</parameter>
    <parameter name="semantic_id">1-mermaid-api-sequence-diagram</parameter>
    <parameter name="type">mermaid</parameter>
    <parameter name="title">Sequence Diagram for API</parameter>
    <parameter name="content">graph TD; A[Start] --> B[Process]; B --> C[End];</parameter>
  </function>
  As you can see, this is a simple diagram with a start and end node.

- **Updating an asset**:
  <function name="assets">
    <parameter name="command">update</parameter>
    <parameter name="semantic_id">5-markdown-current-docs</parameter>
    <parameter name="new_content">Updated documentation</parameter>
  </function>
  I've updated the documentation to include the new information.

- **Referencing an asset**:
  <function name="assets">
    <parameter name="command">reference</parameter>
    <parameter name="semantic_id">1-mermaid-api-sequence-diagram</parameter>
  </function>

# Notes

- NEVER create a diagram with placeholder text.
- Always verify that the asset ID is unique or existing as needed for the function call.
- Double-check parameter values for accuracy and completeness before executing a function call.
- Maintain a clear, consistent use of parameters and types to support systematic asset management.
- You can continue the conversastion after the function call is made for a more fluid experience.`;



// Asset generation format instructions
const ASSET_FORMAT_INSTRUCTIONS = `
`;

// Base system design prompt template
export const systemDesignPrompt = new PromptTemplate<DesignPromptInput>({
  template: `
Context:
{context}

User Question: {question}

Response:`,
  inputVariables: ['context', 'question'],
});

// Architecture review prompt template
export const architectureReviewPrompt = new PromptTemplate<ReviewPromptInput>({
  template: `Current Architecture:
{architecture}

Review Request: {reviewRequest}

Please provide a detailed review that includes:
1. Architecture strengths
2. Potential issues or bottlenecks
3. Scalability considerations
4. Improvement recommendations

${ASSET_FORMAT_INSTRUCTIONS}

When reviewing the architecture, generate relevant diagrams to illustrate your points.
Use the asset format specified above to include them in your response.

Response:`,
  inputVariables: ['architecture', 'reviewRequest'],
});

// Technology selection prompt template
export const technologySelectionPrompt = new PromptTemplate<SelectionPromptInput>({
  template: `Requirements:
{requirements}

Constraints:
{constraints}

Please recommend appropriate technologies and justify your choices based on:
1. Technical requirements
2. Scalability needs
3. Development team expertise
4. Cost considerations

${ASSET_FORMAT_INSTRUCTIONS}

When appropriate, generate diagrams to illustrate the technology stack or architecture.
Use the asset format specified above to include them in your response.

Response:`,
  inputVariables: ['requirements', 'constraints'],
});

// Asset generation prompt template
export const assetGenerationPrompt = new PromptTemplate<AssetGenerationInput>({
  template: `Context:
{context}

User Question: {question}

Requested Asset Types: {assetTypes}

Please generate assets when appropriate to help illustrate or explain the system design.
Use the following format for each asset:

${ASSET_FORMAT_INSTRUCTIONS}

Generate assets that are:
1. Clear and well-structured
2. Include appropriate labels and descriptions
3. Follow best practices for the specific diagram type
4. Are relevant to the context and question

Guidelines for your response:
1. Be conversational and natural in your replies
2. Create or suggest assets when they would be helpful to illustrate concepts
3. Reference existing assets when appropriate
4. If modifying an existing asset, include the complete updated version (not just the changes)
5. Use the correct syntax for the asset type (e.g., proper Mermaid syntax for diagrams)
6. Explain your reasoning and design decisions
7. Consider maintainability, scalability, and best practices in your recommendations

Respond now to the user's message in a helpful, expert manner.

Response:`,
  inputVariables: ['context', 'question', 'assetTypes'],
});

// Helper function to get the appropriate prompt template based on the type
export function getPromptTemplate(type: 'design' | 'review' | 'selection' | 'asset') {
  switch (type) {
    case 'design':
      return systemDesignPrompt;
    case 'review':
      return architectureReviewPrompt;
    case 'selection':
      return technologySelectionPrompt;
    case 'asset':
      return assetGenerationPrompt;
    default:
      return systemDesignPrompt;
  }
} 
