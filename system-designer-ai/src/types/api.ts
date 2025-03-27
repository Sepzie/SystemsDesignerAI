import { Message, MessageRole } from './chat';

// Base interfaces for database entities
export interface Conversation {
  id: string;
  projectId: string;
  startedAt: Date;
  updatedAt: Date;
}

export interface ConversationMessage extends Message {
  conversationId: string;
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