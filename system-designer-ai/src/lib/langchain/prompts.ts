import { PromptTemplate } from '@langchain/core/prompts';
import { config } from './config';
import { AssetType } from '@/types/asset';

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


export const SYSTEM_MESSAGE =`You are an expert AI Systems Designer. Your role is to help users design, 
analyze, and improve their software systems. You should provide clear, practical advice while 
considering scalability, maintainability, and best practices.`;

// Asset generation format instructions
const ASSET_FORMAT_INSTRUCTIONS = `
When generating assets, use the following format:
{{asset_type:ASSET_TYPE}}
{{asset_name:ASSET_NAME}}
\`\`\`
[asset content]
\`\`\`
[optional description]

Available asset types:
- mermaid_diagram: For Mermaid syntax diagrams
- system_context: For system context diagrams
- component_diagram: For component diagrams
- data_model: For data model diagrams
- sequence_diagram: For sequence diagrams
- state_diagram: For state diagrams
- deployment_diagram: For deployment diagrams

Example:
{{asset_type:mermaid_diagram}}
{{asset_name:high_level_architecture}}
\`\`\`
graph TD
    A[Client] --> B[API Gateway]
    B --> C[Service 1]
    B --> D[Service 2]
\`\`\`
This diagram shows the high-level system architecture.

When referencing assets in your response, use the format: [See asset: ASSET_NAME]
For example: "The system architecture is shown in [See asset: high_level_architecture]"
`;

// Base system design prompt template
export const systemDesignPrompt = new PromptTemplate<DesignPromptInput>({
  template: `Context:
{context}

User Question: {question}

Please provide a detailed response that includes:
1. Analysis of the requirements
2. Key components and their interactions
3. Potential challenges and solutions
4. Recommendations for implementation

${ASSET_FORMAT_INSTRUCTIONS}

When appropriate, generate relevant diagrams or models to illustrate your points.
Use the asset format specified above to include them in your response.

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