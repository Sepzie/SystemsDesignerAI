import { Message } from './chat';
import { Asset } from './asset';
import { Conversation } from './conversation';

export interface ProjectRequirements {
  functional: string[];
  nonFunctional: string[];
}

export interface ProjectFormData {
  name: string;
  description: string;
  techStack: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  requirements: ProjectRequirements;
  tech_stack: string;
  created_at: string;
  updated_at: string;
  progress: number;
}

export type ProjectEventType = 
  | 'asset:selected'
  | 'asset:created'
  | 'asset:updated'
  | 'asset:deleted'
  | 'message:asset-referenced'
  | 'conversation:created'
  | 'conversation:selected'
  | 'conversation:deleted'
  | 'conversation:updated';

export interface ProjectEvent {
  type: ProjectEventType;
  payload: {
    'asset:selected': { assetId: string };
    'asset:created': Asset;
    'asset:updated': Asset;
    'asset:deleted': { assetId: string };
    'message:asset-referenced': { message: Message; assetId: string };
    'conversation:created': { conversation: Conversation };
    'conversation:selected': { conversation: Conversation };
    'conversation:deleted': { conversationId: string };
    'conversation:updated': { conversationId: string; title: string };
  }[ProjectEventType];
  timestamp: string;
}

export interface ProjectContextType {
  // Project state
  project: Project | null;
  assets: Asset[];
  openConversation?: {
    id: string;
    project_id: string;
    title: string;
    started_at: string;
    updated_at: string;
    messages: {
      id: string;
      role: string;
      content: string;
      metadata?: Record<string, any>;
      created_at: string;
    }[];
  };
  isLoading: boolean;
  error: string | null;

  // Event system
  subscribe: (eventType: ProjectEventType, callback: (event: ProjectEvent) => void) => () => void;
  notify: (eventType: ProjectEventType, payload: ProjectEvent['payload']) => void;

  // Message-related methods
  handleAssetReference: (message: Message, assetId: string) => void;
} 