'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { AppState, AppAction, initialState } from '../types/app';

// Create the context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_PROJECT_START':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(`project:${action.payload.projectId}`, true),
        errors: new Map(state.errors).set(`project:${action.payload.projectId}`, null),
      };

    case 'LOAD_PROJECT_SUCCESS':
      return {
        ...state,
        projects: new Map(state.projects).set(action.payload.project.id, action.payload.project),
        currentProjectId: action.payload.project.id,
        loadingStates: new Map(state.loadingStates).set(`project:${action.payload.project.id}`, false),
      };

    case 'LOAD_PROJECT_ERROR':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(`project:${action.payload.projectId}`, false),
        errors: new Map(state.errors).set(`project:${action.payload.projectId}`, action.payload.error),
      };

    case 'SET_ACTIVE_CONVERSATION':
      return {
        ...state,
        activeConversationId: action.payload.conversationId,
      };

    case 'LOAD_MESSAGES_START':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(
          `conversation:${action.payload.conversationId}`,
          true
        ),
        errors: new Map(state.errors).set(`conversation:${action.payload.conversationId}`, null),
      };

    case 'LOAD_MESSAGES_SUCCESS':
      return {
        ...state,
        messages: new Map(state.messages).set(
          action.payload.conversationId,
          action.payload.messages
        ),
        loadingStates: new Map(state.loadingStates).set(
          `conversation:${action.payload.conversationId}`,
          false
        ),
      };

    case 'LOAD_MESSAGES_ERROR':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(
          `conversation:${action.payload.conversationId}`,
          false
        ),
        errors: new Map(state.errors).set(
          `conversation:${action.payload.conversationId}`,
          action.payload.error
        ),
      };

    case 'CREATE_CONVERSATION_START':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(`conversation:${action.payload.projectId}`, true),
        errors: new Map(state.errors).set(`conversation:${action.payload.projectId}`, null),
      };

    case 'CREATE_CONVERSATION_SUCCESS':
      return {
        ...state,
        conversations: new Map(state.conversations).set(
          action.payload.conversation.id,
          action.payload.conversation
        ),
        activeConversationId: action.payload.conversation.id,
        loadingStates: new Map(state.loadingStates).set(
          `conversation:${action.payload.conversation.id}`,
          false
        ),
      };

    case 'CREATE_CONVERSATION_ERROR':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(
          `conversation:${action.payload.projectId}`,
          false
        ),
        errors: new Map(state.errors).set(
          `conversation:${action.payload.projectId}`,
          action.payload.error
        ),
      };

    case 'SEND_MESSAGE_START':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(
          `message:${action.payload.conversationId}`,
          true
        ),
        errors: new Map(state.errors).set(`message:${action.payload.conversationId}`, null),
      };

    case 'SEND_MESSAGE_SUCCESS': {
      const conversationId = action.payload.message.conversation_id;
      const existingMessages = state.messages.get(conversationId) || [];
      return {
        ...state,
        messages: new Map(state.messages).set(conversationId, [...existingMessages, action.payload.message]),
        loadingStates: new Map(state.loadingStates).set(`message:${conversationId}`, false),
      };
    }

    case 'SEND_MESSAGE_ERROR':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(
          `message:${action.payload.conversationId}`,
          false
        ),
        errors: new Map(state.errors).set(
          `message:${action.payload.conversationId}`,
          action.payload.error
        ),
      };

    case 'SELECT_ASSET':
      return {
        ...state,
        selectedAssetId: action.payload.assetId,
      };

    case 'CREATE_ASSET_START':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(
          `asset:${action.payload.projectId}`,
          true
        ),
        errors: new Map(state.errors).set(`asset:${action.payload.projectId}`, null),
      };

    case 'CREATE_ASSET_SUCCESS':
      return {
        ...state,
        assets: new Map(state.assets).set(action.payload.asset.id, action.payload.asset),
        loadingStates: new Map(state.loadingStates).set(
          `asset:${action.payload.asset.id}`,
          false
        ),
      };

    case 'CREATE_ASSET_ERROR':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(
          `asset:${action.payload.projectId}`,
          false
        ),
        errors: new Map(state.errors).set(
          `asset:${action.payload.projectId}`,
          action.payload.error
        ),
      };

    case 'UPDATE_ASSET_START':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(
          `asset:${action.payload.assetId}`,
          true
        ),
        errors: new Map(state.errors).set(`asset:${action.payload.assetId}`, null),
      };

    case 'UPDATE_ASSET_SUCCESS':
      return {
        ...state,
        assets: new Map(state.assets).set(action.payload.asset.id, action.payload.asset),
        loadingStates: new Map(state.loadingStates).set(
          `asset:${action.payload.asset.id}`,
          false
        ),
      };

    case 'UPDATE_ASSET_ERROR':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(
          `asset:${action.payload.assetId}`,
          false
        ),
        errors: new Map(state.errors).set(
          `asset:${action.payload.assetId}`,
          action.payload.error
        ),
      };

    case 'DELETE_ASSET_START':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(
          `asset:${action.payload.assetId}`,
          true
        ),
        errors: new Map(state.errors).set(`asset:${action.payload.assetId}`, null),
      };

    case 'DELETE_ASSET_SUCCESS': {
      const newAssets = new Map(state.assets);
      newAssets.delete(action.payload.assetId);
      return {
        ...state,
        assets: newAssets,
        selectedAssetId: state.selectedAssetId === action.payload.assetId ? null : state.selectedAssetId,
        loadingStates: new Map(state.loadingStates).set(
          `asset:${action.payload.assetId}`,
          false
        ),
      };
    }

    case 'DELETE_ASSET_ERROR':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(
          `asset:${action.payload.assetId}`,
          false
        ),
        errors: new Map(state.errors).set(
          `asset:${action.payload.assetId}`,
          action.payload.error
        ),
      };

    case 'UPDATE_CONVERSATION_TITLE_START':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(
          `conversation:${action.payload.conversationId}`,
          true
        ),
        errors: new Map(state.errors).set(`conversation:${action.payload.conversationId}`, null),
      };

    case 'UPDATE_CONVERSATION_TITLE_SUCCESS':
      return {
        ...state,
        conversations: new Map(state.conversations).set(
          action.payload.conversation.id,
          action.payload.conversation
        ),
        loadingStates: new Map(state.loadingStates).set(
          `conversation:${action.payload.conversation.id}`,
          false
        ),
      };

    case 'UPDATE_CONVERSATION_TITLE_ERROR':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(
          `conversation:${action.payload.conversationId}`,
          false
        ),
        errors: new Map(state.errors).set(
          `conversation:${action.payload.conversationId}`,
          action.payload.error
        ),
      };

    case 'DELETE_CONVERSATION_START':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(
          `conversation:${action.payload.conversationId}`,
          true
        ),
        errors: new Map(state.errors).set(`conversation:${action.payload.conversationId}`, null),
      };

    case 'DELETE_CONVERSATION_SUCCESS': {
      const newConversations = new Map(state.conversations);
      newConversations.delete(action.payload.conversationId);
      const newMessages = new Map(state.messages);
      newMessages.delete(action.payload.conversationId);
      return {
        ...state,
        conversations: newConversations,
        messages: newMessages,
        activeConversationId:
          state.activeConversationId === action.payload.conversationId
            ? null
            : state.activeConversationId,
        loadingStates: new Map(state.loadingStates).set(
          `conversation:${action.payload.conversationId}`,
          false
        ),
      };
    }

    case 'DELETE_CONVERSATION_ERROR':
      return {
        ...state,
        loadingStates: new Map(state.loadingStates).set(
          `conversation:${action.payload.conversationId}`,
          false
        ),
        errors: new Map(state.errors).set(
          `conversation:${action.payload.conversationId}`,
          action.payload.error
        ),
      };

    default:
      return state;
  }
}

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 