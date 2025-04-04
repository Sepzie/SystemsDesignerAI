'use client';

import { useCallback, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Conversation } from '@/types/conversation';
import { Project } from '@/types/project';
import { Message } from '@/types/chat';
import { Asset } from '@/types/asset';

// Selector functions
export function useAppState() {
  const { state } = useAppContext();

  // Get current project
  const getCurrentProject = useCallback((): Project | null => {
    if (!state.currentProjectId) return null;
    return state.projects.get(state.currentProjectId) || null;
  }, [state.currentProjectId, state.projects]);

  // Get active conversation
  const getActiveConversation = useCallback((): Conversation | null => {
    if (!state.activeConversationId) return null;
    return state.conversations.get(state.activeConversationId) || null;
  }, [state.activeConversationId, state.conversations]);

  // Get conversation messages
  const getConversationMessages = useCallback(
    (conversationId: string): Message[] => {
      return state.messages.get(conversationId) || [];
    },
    [state.messages]
  );

  // Get selected asset
  const getSelectedAsset = useCallback((): Asset | null => {
    if (!state.selectedAssetId) return null;
    return state.assets.get(state.selectedAssetId) || null;
  }, [state.selectedAssetId, state.assets]);

  // Get project assets
  const getProjectAssets = useCallback(
    (projectId: string): Asset[] => {
      return Array.from(state.assets.values()).filter(
        (asset) => asset.project_id === projectId
      );
    },
    [state.assets]
  );

  // Get loading state
  const isLoading = useCallback(
    (key: string): boolean => {
      return state.loadingStates.get(key) || false;
    },
    [state.loadingStates]
  );

  // Get error state
  const getError = useCallback(
    (key: string): string | null => {
      return state.errors.get(key) || null;
    },
    [state.errors]
  );

  // Get project conversations
  const getProjectConversations = useCallback(
    (projectId: string): Conversation[] => {
      return Array.from(state.conversations.values()).filter(
        (conversation) => conversation.project_id === projectId
      );
    },
    [state.conversations]
  );

  // Get messages with asset references
  const getMessagesWithAssetReferences = useCallback(
    (asset_id: string): Message[] => {
      return Array.from(state.messages.values())
        .flat()
        .filter((message) => 
          message.metadata?.assetIds?.includes(asset_id)
        );
    },
    [state.messages]
  );

  // Get assets by IDs
  const getAssetsByIds = useCallback(
    (assetIds: string[]): Asset[] => {
      return assetIds
        .map(id => state.assets.get(id))
        .filter((asset): asset is Asset => asset !== undefined);
    },
    [state.assets]
  );

  // Memoize all selectors
  return useMemo(
    () => ({
      getCurrentProject,
      getActiveConversation,
      getConversationMessages,
      getSelectedAsset,
      getProjectAssets,
      isLoading,
      getError,
      getProjectConversations,
      getMessagesWithAssetReferences,
      getAssetsByIds,
    }),
    [
      getCurrentProject,
      getActiveConversation,
      getConversationMessages,
      getSelectedAsset,
      getProjectAssets,
      isLoading,
      getError,
      getProjectConversations,
      getMessagesWithAssetReferences,
      getAssetsByIds,
    ]
  );
} 