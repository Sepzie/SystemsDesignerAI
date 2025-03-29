import { PromptTemplate } from '@langchain/core/prompts';
import { config } from './config';

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

Response:`,
  inputVariables: ['requirements', 'constraints'],
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