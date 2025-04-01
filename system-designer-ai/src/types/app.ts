// Base types for all entities
export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface Conversation {
  id: string;
  projectId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  assetReferences?: string[]; // Array of asset IDs referenced in the message
}

export interface Asset {
  id: string;
  projectId: string;
  name: string;
  type: 'diagram' | 'document' | 'image' | 'other';
  content: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  referencedBy?: string[]; // Array of message IDs that reference this asset
}

// Action types
export type AppAction =
  | { type: 'LOAD_PROJECT_START'; payload: { projectId: string } }
  | { type: 'LOAD_PROJECT_SUCCESS'; payload: { project: Project } }
  | { type: 'LOAD_PROJECT_ERROR'; payload: { projectId: string; error: string } }
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: { conversationId: string | null } }
  | { type: 'CREATE_CONVERSATION_START'; payload: { projectId: string } }
  | { type: 'CREATE_CONVERSATION_SUCCESS'; payload: { conversation: Conversation } }
  | { type: 'CREATE_CONVERSATION_ERROR'; payload: { projectId: string; error: string } }
  | { type: 'SEND_MESSAGE_START'; payload: { conversationId: string; content: string } }
  | { type: 'SEND_MESSAGE_SUCCESS'; payload: { message: Message } }
  | { type: 'SEND_MESSAGE_ERROR'; payload: { conversationId: string; error: string } }
  | { type: 'SELECT_ASSET'; payload: { assetId: string | null } }
  | { type: 'CREATE_ASSET_START'; payload: { projectId: string; data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'> } }
  | { type: 'CREATE_ASSET_SUCCESS'; payload: { asset: Asset } }
  | { type: 'CREATE_ASSET_ERROR'; payload: { projectId: string; error: string } }
  | { type: 'UPDATE_ASSET_START'; payload: { projectId: string; assetId: string; updates: Partial<Asset> } }
  | { type: 'UPDATE_ASSET_SUCCESS'; payload: { asset: Asset } }
  | { type: 'UPDATE_ASSET_ERROR'; payload: { projectId: string; assetId: string; error: string } }
  | { type: 'DELETE_ASSET_START'; payload: { projectId: string; assetId: string } }
  | { type: 'DELETE_ASSET_SUCCESS'; payload: { assetId: string } }
  | { type: 'DELETE_ASSET_ERROR'; payload: { projectId: string; assetId: string; error: string } }
  | { type: 'UPDATE_CONVERSATION_TITLE_START'; payload: { conversationId: string; title: string } }
  | { type: 'UPDATE_CONVERSATION_TITLE_SUCCESS'; payload: { conversation: Conversation } }
  | { type: 'UPDATE_CONVERSATION_TITLE_ERROR'; payload: { conversationId: string; error: string } }
  | { type: 'DELETE_CONVERSATION_START'; payload: { conversationId: string } }
  | { type: 'DELETE_CONVERSATION_SUCCESS'; payload: { conversationId: string } }
  | { type: 'DELETE_CONVERSATION_ERROR'; payload: { conversationId: string; error: string } };

// State interface
export interface AppState {
  projects: Map<string, Project>;
  currentProjectId: string | null;
  conversations: Map<string, Conversation>;
  activeConversationId: string | null;
  messages: Map<string, Message[]>;
  assets: Map<string, Asset>;
  selectedAssetId: string | null;
  loadingStates: Map<string, boolean>;
  errors: Map<string, string | null>;
}

// Initial state
export const initialState: AppState = {
  projects: new Map(),
  currentProjectId: null,
  conversations: new Map(),
  activeConversationId: null,
  messages: new Map(),
  assets: new Map(),
  selectedAssetId: null,
  loadingStates: new Map(),
  errors: new Map(),
}; 