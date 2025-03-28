import { PromptTemplate } from '@langchain/core/prompts';
import { config } from './config';

// Define types for each prompt's input variables
export type DesignPromptInput = {
  systemMessage: string;
  context: string;
  question: string;
};

export type ReviewPromptInput = {
  systemMessage: string;
  architecture: string;
  reviewRequest: string;
};

export type SelectionPromptInput = {
  systemMessage: string;
  requirements: string;
  constraints: string;
};

// Base system design prompt template
export const systemDesignPrompt = new PromptTemplate<DesignPromptInput>({
  template: `{systemMessage}

Context:
{context}

User Question: {question}

Please provide a detailed response that includes:
1. Analysis of the requirements
2. Key components and their interactions
3. Potential challenges and solutions
4. Recommendations for implementation

Response:`,
  inputVariables: ['systemMessage', 'context', 'question'],
});

// Architecture review prompt template
export const architectureReviewPrompt = new PromptTemplate<ReviewPromptInput>({
  template: `{systemMessage}

Current Architecture:
{architecture}

Review Request: {reviewRequest}

Please provide a detailed review that includes:
1. Architecture strengths
2. Potential issues or bottlenecks
3. Scalability considerations
4. Improvement recommendations

Response:`,
  inputVariables: ['systemMessage', 'architecture', 'reviewRequest'],
});

// Technology selection prompt template
export const technologySelectionPrompt = new PromptTemplate<SelectionPromptInput>({
  template: `{systemMessage}

Requirements:
{requirements}

Constraints:
{constraints}

Please recommend appropriate technologies and justify your choices based on:
1. Technical requirements
2. Scalability needs
3. Development team expertise
4. Cost considerations

Response:`,
  inputVariables: ['systemMessage', 'requirements', 'constraints'],
});

// Helper function to get the appropriate prompt template based on the type
export function getPromptTemplate(type: 'design' | 'review' | 'selection') {
  switch (type) {
    case 'design':
      return systemDesignPrompt;
    case 'review':
      return architectureReviewPrompt;
    case 'selection':
      return technologySelectionPrompt;
    default:
      return systemDesignPrompt;
  }
} 