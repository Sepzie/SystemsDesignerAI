import { Conversation } from './api';

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  created_at: Date;
}

export interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  conversation: Conversation | null;
  loadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;
}

// Mock data for initial development
export const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'I need to add a recommendation engine to the platform.',
    created_at: new Date('2024-03-27T14:25:00'),
  },
  {
    id: '2',
    role: 'assistant',
    content: "I'll help you integrate a recommendation engine. This will require:\n1. A new microservice for the recommendation algorithm\n2. Data collection from user browsing patterns\nWould you like me to update the system diagram?",
    created_at: new Date('2024-03-27T14:26:00'),
  },
]; 