'use client';

import { useCallback, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Asset } from '../types/app';

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
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 'mock-user-id',
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
            projectId,
            title: 'New Conversation',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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
            projectId: 'mock-project-id',
            title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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
            conversationId,
            content,
            role: 'user',
            createdAt: new Date().toISOString(),
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
            projectId,
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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
            projectId,
            name: 'Updated Asset',
            type: 'diagram',
            content: 'Updated content',
            metadata: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
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