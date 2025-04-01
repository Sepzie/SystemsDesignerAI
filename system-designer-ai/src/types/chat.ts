import { AssetReference } from './asset';
import { Conversation } from './conversation';


export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  metadata?: {
    asset_references?: AssetReference[];
    tokens?: {
      prompt: number;
      completion: number;
      total: number;
    };
    isStreaming?: boolean;
    [key: string]: any;
  };
  created_at: string;
}

export interface ChatResponse {
  message: Message;
  assets?: {
    id: string;
    type: string;
    name: string;
    content: string;
  }[];
}

// Mock data for development
export const mockMessages: Message[] = [
  {
    id: '1',
    conversation_id: 'conv-1',
    role: 'user',
    content: 'I need to add a recommendation engine to the platform.',
    created_at: new Date('2024-03-27T14:25:00').toISOString(),
  },
  {
    id: '2',
    conversation_id: 'conv-1',
    role: 'assistant',
    content: "I'll help you integrate a recommendation engine. This will require:\n1. A new microservice for the recommendation algorithm\n2. Data collection from user browsing patterns\nWould you like me to update the system diagram?",
    created_at: new Date('2024-03-27T14:26:00').toISOString(),
  },
]; 