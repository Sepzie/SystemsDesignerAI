'use client';

import { useCallback, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Project, Conversation, Message, Asset } from '../types/app';

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
        (asset) => asset.projectId === projectId
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
        (conversation) => conversation.projectId === projectId
      );
    },
    [state.conversations]
  );

  // Get messages with asset references
  const getMessagesWithAssetReferences = useCallback(
    (assetId: string): Message[] => {
      return Array.from(state.messages.values())
        .flat()
        .filter((message) => message.asset_references?.includes(assetId));
    },
    [state.messages]
  );

  // Get assets referenced in message
  const getReferencedAssets = useCallback(
    (messageId: string): Asset[] => {
      const message = Array.from(state.messages.values())
        .flat()
        .find((msg) => msg.id === messageId);
      if (!message?.asset_references) return [];
      return message.asset_references
        .map((assetId) => state.assets.get(assetId))
        .filter((asset): asset is Asset => asset !== undefined);
    },
    [state.messages, state.assets]
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
      getReferencedAssets,
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
      getReferencedAssets,
    ]
  );
} 