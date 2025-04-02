import { Message, MessageRole } from './chat';
import {  } from './conversation';
import { Project } from './project';
import { Asset } from './asset';

// Base interfaces for database entities
export interface Conversation {
  id: string;
  project_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  message_count: number;
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
  project: Project;
  conversations: Conversation[];
  assets: Asset[];
}
