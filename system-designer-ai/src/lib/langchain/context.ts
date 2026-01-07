import { createClient } from '@/lib/supabase/server';
import { Message } from '@/types/base-types';
import { ConversationContext } from '@/types/langchain';
import { Asset } from '@/types/base-types';

/**
 * Fetches conversation history from the database
 */
export async function getConversationHistory(
  conversationId: string,
  limit: number = 10
): Promise<Message[]> {
  const supabase = await createClient();
  
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching conversation history:', error);
    return [];
  }

  // Only include completed messages
  
  const filteredMessages = (messages || []).filter(
    msg => (msg.metadata?.status === 'completed')
  );

  // Remove the latest message as it is the user question
  return filteredMessages.slice(0, -1);
}

/**
 * Fetches project details for context
 */
export async function getProjectDetails(projectId: string) {
  const supabase = await createClient();
  
  const { data: project, error } = await supabase
    .from('projects')
    .select('name, description, tech_stack')
    .eq('id', projectId)
    .single();

  if (error) {
    console.error('Error fetching project details:', error);
    return undefined;
  }

  return project;
}

/**
 * Fetches recent project assets for RAG-style context
 */
export async function getProjectAssets(
  projectId: string,
  limit: number = 10
): Promise<Asset[]> {
  const supabase = await createClient();

  const { data: assets, error } = await supabase
    .from('assets')
    .select('*')
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching project assets:', error);
    return [];
  }

  return assets || [];
}

/**
 * Formats messages into a context string for the AI
 */
export function formatMessageContext(messages: Message[]): string {
  const formattedContext = messages
    .map(msg => `${msg.role}: ${msg.content}`)
    .join('\n');
    return formattedContext;
}

/**
 * Builds complete conversation context including project details
 */
export async function buildConversationContext(
  projectId: string,
  conversationId: string,
  limit: number = 10
): Promise<ConversationContext> {
  const [messages, projectDetails, assets] = await Promise.all([
    getConversationHistory(conversationId, limit),
    getProjectDetails(projectId),
    getProjectAssets(projectId),
  ]);

  return {
    messages,
    projectDetails,
    assets,
  };
}

/**
 * Formats the complete context for use in AI prompts
 */
export function formatCompleteContext(context: ConversationContext): string {
  const parts: string[] = [];

  // Add project details if available
  if (context.projectDetails) {
    parts.push(`Project: ${context.projectDetails.name}`);
    if (context.projectDetails.description) {
      parts.push(`Description: ${context.projectDetails.description}`);
    }
    if (context.projectDetails.tech_stack) {
      parts.push(`Technologies: ${context.projectDetails.tech_stack}`);
    }
    parts.push(''); // Empty line for separation
  }

  // Add conversation history
  if (context.messages.length > 0) {
    parts.push('Conversation History:');
    parts.push(formatMessageContext(context.messages));
  }

  if (context.assets && context.assets.length > 0) {
    parts.push('');
    parts.push('Project Assets (use semantic_id to reference/update):');
    context.assets.forEach((asset, index) => {
      parts.push(
        `Asset ${index + 1}: ${asset.name} (${asset.type}) [semantic_id: ${asset.semantic_id}]`
      );
      parts.push(asset.content);
      parts.push('');
    });
  }

  return parts.join('\n');
}
