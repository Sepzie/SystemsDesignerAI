import { Message } from './chat';

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
  payload: any;
  timestamp: string;
}

export interface ProjectContextType {
  // Project state
  project: Project | null;
  isLoading: boolean;
  error: string | null;

  // Event system
  subscribe: (eventType: ProjectEventType, callback: (event: ProjectEvent) => void) => () => void;
  notify: (eventType: ProjectEventType, payload: any) => void;

  // Asset-related methods
  selectAsset: (assetId: string) => void;
  createAsset: (assetData: any) => Promise<void>;
  updateAsset: (assetId: string, assetData: any) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;

  // Message-related methods
  handleAssetReference: (message: Message, assetId: string) => void;
} 