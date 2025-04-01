import { Message } from './chat';

export interface Conversation {
  id: string;
  project_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  message_count: number;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface ConversationContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  createConversation: (projectId: string) => Promise<Conversation>;
  selectConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  updateConversationTitle: (conversationId: string, title: string) => Promise<void>;
  loadConversations: (projectId: string) => Promise<void>;
}

// Helper function to map API conversation to our Conversation type
export function mapApiConversationToChat(apiConv: { 
  id: string; 
  projectId: string; 
  startedAt: string | Date; 
  updatedAt: string | Date;
  title?: string;
}): Conversation {
  return {
    id: apiConv.id,
    project_id: apiConv.projectId,
    title: apiConv.title || `Conversation ${apiConv.id.slice(0, 8)}`,
    created_at: typeof apiConv.startedAt === 'string' ? apiConv.startedAt : apiConv.startedAt.toISOString(),
    updated_at: typeof apiConv.updatedAt === 'string' ? apiConv.updatedAt : apiConv.updatedAt.toISOString(),
    last_message_at: typeof apiConv.updatedAt === 'string' ? apiConv.updatedAt : apiConv.updatedAt.toISOString(),
    message_count: 0, // This will be updated when messages are loaded
  };
} 