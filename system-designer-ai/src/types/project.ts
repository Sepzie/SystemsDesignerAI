import { Message } from './chat';
import { Asset } from './asset';

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
  | 'message:asset-referenced';

export interface ProjectEvent {
  type: ProjectEventType;
  payload: {
    'asset:selected': { assetId: string };
    'asset:created': Asset;
    'asset:updated': Asset;
    'asset:deleted': { assetId: string };
    'message:asset-referenced': { message: Message; assetId: string };
  }[ProjectEventType];
  timestamp: string;
}

export interface ProjectContextType {
  // Project state
  project: Project | null;
  isLoading: boolean;
  error: string | null;

  // Event system
  subscribe: (eventType: ProjectEventType, callback: (event: ProjectEvent) => void) => () => void;
  notify: (eventType: ProjectEventType, payload: ProjectEvent['payload']) => void;

  // Message-related methods
  handleAssetReference: (message: Message, assetId: string) => void;
} 