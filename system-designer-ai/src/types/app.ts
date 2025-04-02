import { AssetType } from "./asset";

// base types
import { Message } from "./chat";
import { Project } from "./project";
import { Conversation } from "./conversation";
import { Asset } from "./asset";


// Action types
export type AppAction =
  // project actions
  | { type: 'LOAD_PROJECT_START'; payload: { projectId: string } }
  | { type: 'LOAD_PROJECT_SUCCESS'; payload: { project: Project; conversations: Conversation[]; assets: Asset[] } }
  | { type: 'LOAD_PROJECT_ERROR'; payload: { projectId: string; error: string } }
  // conversation actions
  | { type: 'SET_ACTIVE_CONVERSATION'; payload: { conversationId: string | null } }
  | { type: 'CREATE_CONVERSATION_START'; payload: { projectId: string } }
  | { type: 'CREATE_CONVERSATION_SUCCESS'; payload: { conversation: Conversation } }
  | { type: 'CREATE_CONVERSATION_ERROR'; payload: { projectId: string; error: string } }
  // message actions
  | { type: 'LOAD_MESSAGES_START'; payload: { conversationId: string } }
  | { type: 'LOAD_MESSAGES_SUCCESS'; payload: { conversationId: string; messages: Message[] } }
  | { type: 'LOAD_MESSAGES_ERROR'; payload: { conversationId: string; error: string } }
  | { type: 'SEND_MESSAGE_START'; payload: { conversationId: string; content: string } }
  | { type: 'SEND_MESSAGE_SUCCESS'; payload: { message: Message } }
  | { type: 'SEND_MESSAGE_ERROR'; payload: { conversationId: string; error: string } }
  | { type: 'MESSAGE_STREAM_START'; payload: { messageId: string; conversationId: string } }
  | { type: 'MESSAGE_STREAM_CHUNK'; payload: { messageId: string; content: string } }
  | { type: 'MESSAGE_STREAM_COMPLETE'; payload: { messageId: string } }
  | { type: 'MESSAGE_STREAM_ERROR'; payload: { messageId: string; error: string } }
  // asset actions
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
  // conversation actions
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