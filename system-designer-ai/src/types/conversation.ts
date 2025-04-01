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