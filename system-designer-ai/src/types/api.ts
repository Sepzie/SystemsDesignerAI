import { Message, MessageRole } from './base-types';
import { Conversation } from './base-types';
import { Project } from "./base-types";
import { Asset } from './base-types';


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
