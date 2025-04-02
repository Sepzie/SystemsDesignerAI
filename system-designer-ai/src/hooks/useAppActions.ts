'use client';

import { useCallback, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Asset } from '@/types/asset';
import { Conversation } from '@/types/conversation';
import {
  createConversation,
  deleteConversation,
  updateConversationTitle,
  sendMessage,
  createAsset,
  updateAsset,
  deleteAsset,
  getProject,
  getMessages,
  connectToMessageStream,
} from '@/lib/api-client';

// Action creators
export function useAppActions() {
  const { dispatch, state } = useAppContext();

  // Project actions
  const loadProject = useCallback(
    async (projectId: string) => {
      try {
        dispatch({ type: 'LOAD_PROJECT_START', payload: { projectId } });
        const response = await getProject(projectId);
        dispatch({
          type: 'LOAD_PROJECT_SUCCESS',
          payload: { project: response.project, conversations: response.conversations, assets: response.assets },
        });
      } catch (error) {
        dispatch({
          type: 'LOAD_PROJECT_ERROR',
          payload: { projectId, error: error instanceof Error ? error.message : 'Failed to load project' },
        });
      }
    },
    [dispatch]
  );

  // Conversation actions
  const setActiveConversation = useCallback(
    async (conversationId: string | null) => {
      dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: { conversationId } });
      if (conversationId) {
        try {
          dispatch({ type: 'LOAD_MESSAGES_START', payload: { conversationId } });
          const conversation = state.conversations.get(conversationId);
          if (!conversation) return;
          const response = await getMessages(conversation.project_id, conversationId);
          dispatch({
            type: 'LOAD_MESSAGES_SUCCESS',
            payload: { conversationId, messages: response.messages },
          });
        } catch (error) {
          dispatch({
            type: 'LOAD_MESSAGES_ERROR',
            payload: { conversationId, error: error instanceof Error ? error.message : 'Failed to load messages' },
          });
        }
      }
    },
    [dispatch, state.conversations]
  );

  const createConversationAction = useCallback(
    async (projectId: string) => {
      try {
        dispatch({ type: 'CREATE_CONVERSATION_START', payload: { projectId } });
        const response = await createConversation(projectId);
        dispatch({
          type: 'CREATE_CONVERSATION_SUCCESS',
          payload: { conversation: response.conversation },
        });
      } catch (error) {
        dispatch({
          type: 'CREATE_CONVERSATION_ERROR',
          payload: { projectId, error: error instanceof Error ? error.message : 'Failed to create conversation' },
        });
      }
    },
    [dispatch]
  );

  const updateConversationTitleAction = useCallback(
    async (conversationId: string, title: string) => {
      try {
        // Get the project ID from the conversation
        const conversation = Array.from(state.conversations.values()).find((c: Conversation) => c.id === conversationId);
        if (!conversation) {
          throw new Error('Conversation not found');
        }

        dispatch({
          type: 'UPDATE_CONVERSATION_TITLE_START',
          payload: { conversationId, title },
        });
        await updateConversationTitle(conversation.project_id, conversationId, title);
        dispatch({
          type: 'UPDATE_CONVERSATION_TITLE_SUCCESS',
          payload: { 
            conversation: { 
              id: conversationId,
              project_id: conversation.project_id,
              title,
              created_at: conversation.created_at,
              updated_at: new Date().toISOString(),
              last_message_at: conversation.last_message_at,
              message_count: conversation.message_count
            } 
          },
        });
      } catch (error) {
        dispatch({
          type: 'UPDATE_CONVERSATION_TITLE_ERROR',
          payload: { conversationId, error: error instanceof Error ? error.message : 'Failed to update conversation title' },
        });
      }
    },
    [dispatch, state.conversations]
  );

  const deleteConversationAction = useCallback(
    async (projectId: string, conversationId: string) => {
      try {
        dispatch({ type: 'DELETE_CONVERSATION_START', payload: { conversationId } });
        await deleteConversation(projectId, conversationId);
        dispatch({
          type: 'DELETE_CONVERSATION_SUCCESS',
          payload: { conversationId },
        });
      } catch (error) {
        dispatch({
          type: 'DELETE_CONVERSATION_ERROR',
          payload: { conversationId, error: error instanceof Error ? error.message : 'Failed to delete conversation' },
        });
      }
    },
    [dispatch]
  );

  // Message actions
  const sendMessageAction = useCallback(
    async (projectId: string, conversationId: string, content: string) => {
      try {
        dispatch({
          type: 'SEND_MESSAGE_START',
          payload: { conversationId, content },
        });
        
        // Send the initial message and get the AI message ID
        const response = await sendMessage(projectId, conversationId, { content, role: 'user' });
        
        // Dispatch success for the user message
        dispatch({
          type: 'SEND_MESSAGE_SUCCESS',
          payload: { message: response.message },
        });

        if (response.aiMessageId) {
          const aiMessageId = response.aiMessageId;
          // Start streaming the AI response
          dispatch({
            type: 'MESSAGE_STREAM_START',
            payload: { messageId: aiMessageId, conversationId },
          });

          // Connect to the streaming endpoint
          const cleanup = connectToMessageStream(
            projectId,
            conversationId,
            aiMessageId,
            (data: { content: string }) => {
              dispatch({
                type: 'MESSAGE_STREAM_CHUNK',
                payload: { messageId: aiMessageId, content: data.content },
              });
            },
            (error: Error) => {
              dispatch({
                type: 'MESSAGE_STREAM_ERROR',
                payload: { messageId: aiMessageId, error: error.message },
              });
              cleanup();
            },
            () => {
              dispatch({
                type: 'MESSAGE_STREAM_COMPLETE',
                payload: { messageId: aiMessageId },
              });
              cleanup();
            }
          );
        }
      } catch (error) {
        dispatch({
          type: 'SEND_MESSAGE_ERROR',
          payload: { conversationId, error: error instanceof Error ? error.message : 'Failed to send message' },
        });
      }
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

  const createAssetAction = useCallback(
    async (projectId: string, data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        dispatch({ type: 'CREATE_ASSET_START', payload: { projectId, data } });
        const asset = await createAsset(projectId, data);
        dispatch({
          type: 'CREATE_ASSET_SUCCESS',
          payload: { asset },
        });
      } catch (error) {
        dispatch({
          type: 'CREATE_ASSET_ERROR',
          payload: { projectId, error: error instanceof Error ? error.message : 'Failed to create asset' },
        });
      }
    },
    [dispatch]
  );

  const updateAssetAction = useCallback(
    async (projectId: string, assetId: string, updates: Partial<Asset>) => {
      try {
        dispatch({
          type: 'UPDATE_ASSET_START',
          payload: { projectId, assetId, updates },
        });
        const asset = await updateAsset(projectId, assetId, updates);
        dispatch({
          type: 'UPDATE_ASSET_SUCCESS',
          payload: { asset },
        });
      } catch (error) {
        dispatch({
          type: 'UPDATE_ASSET_ERROR',
          payload: { projectId, assetId, error: error instanceof Error ? error.message : 'Failed to update asset' },
        });
      }
    },
    [dispatch]
  );

  const deleteAssetAction = useCallback(
    async (projectId: string, assetId: string) => {
      try {
        dispatch({ type: 'DELETE_ASSET_START', payload: { projectId, assetId } });
        await deleteAsset(projectId, assetId);
        dispatch({
          type: 'DELETE_ASSET_SUCCESS',
          payload: { assetId },
        });
      } catch (error) {
        dispatch({
          type: 'DELETE_ASSET_ERROR',
          payload: { projectId, assetId, error: error instanceof Error ? error.message : 'Failed to delete asset' },
        });
      }
    },
    [dispatch]
  );

  // Memoize all action creators
  return useMemo(
    () => ({
      loadProject,
      setActiveConversation,
      createConversationAction,
      updateConversationTitleAction,
      deleteConversationAction,
      sendMessageAction,
      selectAsset,
      createAssetAction,
      updateAssetAction,
      deleteAssetAction,
    }),
    [
      loadProject,
      setActiveConversation,
      createConversationAction,
      updateConversationTitleAction,
      deleteConversationAction,
      sendMessageAction,
      selectAsset,
      createAssetAction,
      updateAssetAction,
      deleteAssetAction,
    ]
  );
} 