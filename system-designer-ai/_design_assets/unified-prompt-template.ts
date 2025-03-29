import { PromptTemplate } from "langchain/prompts";

/**
 * The unified system design prompt template that supports both conversational
 * responses and asset generation in a single interaction.
 */
export const systemDesignPromptTemplate = `
You are an AI System Designer, an expert in software architecture and design.
You help users design, analyze, and improve their software systems through conversation
and by creating design artifacts when needed.

## Project Context
{project_context}

## Relevant Assets
{relevant_assets}

## Conversation History
{conversation_history}

## User Message
{user_message}

When you need to create or update design assets as part of your response, include them
in the following format:

--- ASSET: [ASSET_TYPE] ---
CONTENT GOES HERE
--- END ASSET ---

Where ASSET_TYPE is one of:
- mermaid_diagram: For any type of diagram using Mermaid syntax
- project_description: For high-level project descriptions or overviews
- roadmap: For implementation roadmaps or phase planning
- technical_documentation: For detailed technical specifications
- implementation_prompt: For prompts that guide implementation details

Guidelines for your response:
1. Be conversational and natural in your replies
2. Create or suggest assets when they would be helpful to illustrate concepts
3. Reference existing assets when appropriate
4. If modifying an existing asset, include the complete updated version (not just the changes)
5. Use the correct syntax for the asset type (e.g., proper Mermaid syntax for diagrams)
6. Explain your reasoning and design decisions
7. Consider maintainability, scalability, and best practices in your recommendations

Respond now to the user's message in a helpful, expert manner.
`;

/**
 * Creates the LangChain PromptTemplate for the system design assistant
 */
export const createSystemDesignPrompt = () => {
  return new PromptTemplate({
    template: systemDesignPromptTemplate,
    inputVariables: ["project_context", "relevant_assets", "conversation_history", "user_message"]
  });
};

/**
 * Formats project details into a consistent structure for the prompt
 */
export function formatProjectContext(project: any): string {
  if (!project) return "No project information available.";
  
  return `
Project Name: ${project.name || 'Untitled Project'}
Description: ${project.description || 'No description provided.'}
${project.tech_stack ? `Technology Stack: ${project.tech_stack}` : ''}
${project.requirements ? `Requirements: ${project.requirements}` : ''}
`;
}

/**
 * Formats the conversation history for inclusion in the prompt
 */
export function formatConversationHistory(messages: any[]): string {
  if (!messages || messages.length === 0) return "No previous conversation.";
  
  return messages.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n\n');
}

/**
 * Formats relevant assets for inclusion in the prompt
 */
export function formatRelevantAssets(assets: any[]): string {
  if (!assets || assets.length === 0) return "No existing assets.";
  
  return assets.map(asset => {
    return `
ASSET: ${asset.name} (Type: ${asset.asset_type})
${asset.content}
---
`;
  }).join('\n');
}

/**
 * Prepares the complete context for an AI request
 */
export async function prepareAIContext(
  projectId: string,
  conversationId: string,
  userMessage: string
): Promise<{
  project_context: string;
  relevant_assets: string;
  conversation_history: string;
  user_message: string;
}> {
  // Fetch project details
  const project = await fetchProjectDetails(projectId);
  
  // Fetch conversation history
  const messages = await fetchConversationHistory(conversationId);
  
  // Get relevant assets for this conversation
  const relevantAssets = await fetchRelevantAssets(projectId, userMessage);
  
  return {
    project_context: formatProjectContext(project),
    relevant_assets: formatRelevantAssets(relevantAssets),
    conversation_history: formatConversationHistory(messages),
    user_message: userMessage
  };
}

// These functions would connect to your actual data stores
async function fetchProjectDetails(projectId: string) {
  // Implementation would connect to your database
  return { name: "Example Project", description: "A sample project" };
}

async function fetchConversationHistory(conversationId: string) {
  // Implementation would connect to your database
  return [];
}

async function fetchRelevantAssets(projectId: string, query: string) {
  // Implementation would connect to your vector database
  return [];
}
