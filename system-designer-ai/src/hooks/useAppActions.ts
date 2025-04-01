'use client';

import { useCallback, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Asset } from '@/types/asset';

// Action creators
export function useAppActions() {
  const { dispatch } = useAppContext();

  // Project actions
  const loadProject = useCallback(
    (projectId: string) => {
      dispatch({ type: 'LOAD_PROJECT_START', payload: { projectId } });
      // TODO: Implement API call to load project
      // For now, we'll just dispatch the success action with mock data
      dispatch({
        type: 'LOAD_PROJECT_SUCCESS',
        payload: {
          project: {
            id: projectId,
            name: 'Mock Project',
            description: 'A mock project for testing',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: 'mock-user-id',
            tech_stack: 'TypeScript, React, Node.js',
            progress: 0
          },
        },
      });
    },
    [dispatch]
  );

  // Conversation actions
  const setActiveConversation = useCallback(
    (conversationId: string | null) => {
      dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: { conversationId } });
    },
    [dispatch]
  );

  const createConversation = useCallback(
    (projectId: string) => {
      dispatch({ type: 'CREATE_CONVERSATION_START', payload: { projectId } });
      // TODO: Implement API call to create conversation
      // For now, we'll just dispatch the success action with mock data
      dispatch({
        type: 'CREATE_CONVERSATION_SUCCESS',
        payload: {
          conversation: {
            id: `conv-${Date.now()}`,
            project_id: projectId,
            title: 'New Conversation',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_message_at: new Date().toISOString(),
            message_count: 0
          },
        },
      });
    },
    [dispatch]
  );

  const updateConversationTitle = useCallback(
    (conversationId: string, title: string) => {
      dispatch({
        type: 'UPDATE_CONVERSATION_TITLE_START',
        payload: { conversationId, title },
      });
      // TODO: Implement API call to update conversation title
      // For now, we'll just dispatch the success action with mock data
      dispatch({
        type: 'UPDATE_CONVERSATION_TITLE_SUCCESS',
        payload: {
          conversation: {
            id: conversationId,
            project_id: 'mock-project-id',
            title,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_message_at: new Date().toISOString(),
            message_count: 0
          },
        },
      });
    },
    [dispatch]
  );

  const deleteConversation = useCallback(
    (conversationId: string) => {
      dispatch({ type: 'DELETE_CONVERSATION_START', payload: { conversationId } });
      // TODO: Implement API call to delete conversation
      // For now, we'll just dispatch the success action
      dispatch({
        type: 'DELETE_CONVERSATION_SUCCESS',
        payload: { conversationId },
      });
    },
    [dispatch]
  );

  // Message actions
  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      dispatch({
        type: 'SEND_MESSAGE_START',
        payload: { conversationId, content },
      });
      // TODO: Implement API call to send message
      // For now, we'll just dispatch the success action with mock data
      dispatch({
        type: 'SEND_MESSAGE_SUCCESS',
        payload: {
          message: {
            id: `msg-${Date.now()}`,
            conversation_id: conversationId,
            content,
            role: 'user', 
            created_at: new Date().toISOString(),
            metadata: {
              asset_references: [],
              tokens: {
                prompt: 0,
                completion: 0,
                total: 0
              },
              isStreaming: false
            }
          },
        },
      });
    },
    [dispatch]
  );

  // Asset actions
  const selectAsset = useCallback(
    (assetId: string | null) => {
      dispatch({ type: 'SELECT_ASSET', payload: { assetId } });
    },
    [dispatch]
  );

  const createAsset = useCallback(
    (projectId: string, data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
      dispatch({ type: 'CREATE_ASSET_START', payload: { projectId, data } });
      // TODO: Implement API call to create asset
      // For now, we'll just dispatch the success action with mock data
      dispatch({
        type: 'CREATE_ASSET_SUCCESS',
        payload: {
          asset: {
            id: `asset-${Date.now()}`,
            ...data,
            project_id: projectId,
            created_at: new Date(),
            updated_at: new Date(),
            current_version: 1
          },
        },
      });
    },
    [dispatch]
  );

  const updateAsset = useCallback(
    (projectId: string, assetId: string, updates: Partial<Asset>) => {
      dispatch({
        type: 'UPDATE_ASSET_START',
        payload: { projectId, assetId, updates },
      });
      // TODO: Implement API call to update asset
      // For now, we'll just dispatch the success action with mock data
      dispatch({
        type: 'UPDATE_ASSET_SUCCESS',
        payload: {
          asset: {
            id: assetId,
            project_id: projectId,
            name: 'Updated Asset',
            type: 'mermaid_diagram',
            content: 'Updated content',
            current_version: 1,
            metadata: {
              created_at: new Date(),
              updated_at: new Date(),
              created_by_message_id: 'mock-message-id',
              version_number: 1
            },
            created_at: new Date(),
            updated_at: new Date(),
            ...updates,
          },
        },
      });
    },
    [dispatch]
  );

  const deleteAsset = useCallback(
    (projectId: string, assetId: string) => {
      dispatch({ type: 'DELETE_ASSET_START', payload: { projectId, assetId } });
      // TODO: Implement API call to delete asset
      // For now, we'll just dispatch the success action
      dispatch({
        type: 'DELETE_ASSET_SUCCESS',
        payload: { assetId },
      });
    },
    [dispatch]
  );

  // Memoize all action creators
  return useMemo(
    () => ({
      loadProject,
      setActiveConversation,
      createConversation,
      updateConversationTitle,
      deleteConversation,
      sendMessage,
      selectAsset,
      createAsset,
      updateAsset,
      deleteAsset,
    }),
    [
      loadProject,
      setActiveConversation,
      createConversation,
      updateConversationTitle,
      deleteConversation,
      sendMessage,
      selectAsset,
      createAsset,
      updateAsset,
      deleteAsset,
    ]
  );
} 