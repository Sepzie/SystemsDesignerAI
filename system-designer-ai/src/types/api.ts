import { Message, MessageRole } from './chat';
import { ConversationWithMessages } from './conversation';

// Base interfaces for database entities
export interface Conversation {
  id: string;
  projectId: string;
  startedAt: Date;
  updatedAt: Date;
}

export interface ConversationMessage extends Message {
  metadata?: Record<string, any>;
}

// API Request/Response interfaces
export interface CreateConversationRequest {
  projectId: string;
}

export interface CreateConversationResponse {
  conversation: Conversation;
}

export interface ListConversationsResponse {
  conversations: Conversation[];
}

export interface GetConversationResponse {
  conversation: Conversation;
  messages: ConversationMessage[];
}

export interface CreateMessageRequest {
  content: string;
  role: MessageRole;
  metadata?: Record<string, any>;
}

export interface CreateMessageResponse {
  message: ConversationMessage;
  aiMessageId?: string; // ID of the placeholder AI message for SSE connection
}

export interface ListMessagesResponse {
  messages: ConversationMessage[];
}

// Error response interface
export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
  };
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// API route parameters
export interface ProjectRouteParams {
  projectId: string;
}

export interface ConversationRouteParams extends ProjectRouteParams {
  conversationId: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  tech_stack: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  assets: {
    id: string;
    name: string;
    type: string;
    current_content: string;
    current_version: number;
    created_at: string;
    updated_at: string;
  }[];
  conversations: {
    id: string;
    title: string;
    started_at: string;
    updated_at: string;
  }[];
  latest_conversation?: ConversationWithMessages;
  };
