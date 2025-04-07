import { Json } from './supabase';

export interface Conversation {
  id: string;
  project_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  message_count: number;
}

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  metadata?: {
    assetIds?: string[];
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
export interface AssetVersion {
  id: string;
  asset_id: string;
  version_number: number;
  content: string;
  created_by_message_id: string;
  created_at: Date;
}
export interface Asset {
  id: string;
  project_id: string;
  name: string;
  type: AssetType;
  content: string;
  metadata: Json;
  created_at: string;
  updated_at: string;
}
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  tech_stack: string;
  created_at: string;
  updated_at: string;
  progress: number;
}
export type AssetType = 'mermaid_diagram' |
  'system_context' |
  'component_diagram' |
  'data_model' |
  'sequence_diagram' |
  'state_diagram' |
  'deployment_diagram';

