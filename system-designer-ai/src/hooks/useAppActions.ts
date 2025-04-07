'use client';

import { useCallback, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Asset } from '@/types/base-types';
import { Conversation } from '@/types/base-types';
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
      console.log(`[APP ACTIONS] Starting to load project: ${projectId}`);
      try {
        dispatch({ type: 'LOAD_PROJECT_START', payload: { projectId } });
        const response = await getProject(projectId);
        console.log(`[APP ACTIONS] Successfully loaded project: ${projectId}`);
        dispatch({
          type: 'LOAD_PROJECT_SUCCESS',
          payload: { project: response.project, conversations: response.conversations, assets: response.assets },
        });
      } catch (error) {
        console.error(`[APP ACTIONS] Failed to load project: ${projectId}`, error);
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
      console.log(`[APP ACTIONS] Setting active conversation: ${conversationId}`);
      dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: { conversationId } });
      if (conversationId) {
        try {
          dispatch({ type: 'LOAD_MESSAGES_START', payload: { conversationId } });
          const conversation = state.conversations.get(conversationId);
          if (!conversation) {
            console.warn(`[APP ACTIONS] Conversation not found: ${conversationId}`);
            return;
          }
          const response = await getMessages(conversation.project_id, conversationId);
          console.log(`[APP ACTIONS] Successfully loaded messages for conversation: ${conversationId}`);
          dispatch({
            type: 'LOAD_MESSAGES_SUCCESS',
            payload: { conversationId, messages: response.messages },
          });
        } catch (error) {
          console.error(`[APP ACTIONS] Failed to load messages for conversation: ${conversationId}`, error);
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
      console.log(`[APP ACTIONS] Creating new conversation for project: ${projectId}`);
      try {
        dispatch({ type: 'CREATE_CONVERSATION_START', payload: { projectId } });
        const response = await createConversation(projectId);
        console.log(`[APP ACTIONS] Successfully created conversation: ${response.conversation.id}`);
        dispatch({
          type: 'CREATE_CONVERSATION_SUCCESS',
          payload: { conversation: response.conversation },
        });
      } catch (error) {
        console.error(`[APP ACTIONS] Failed to create conversation for project: ${projectId}`, error);
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
      console.log(`[APP ACTIONS] Updating title for conversation: ${conversationId}`);
      try {
        const conversation = Array.from(state.conversations.values()).find((c: Conversation) => c.id === conversationId);
        if (!conversation) {
          console.warn(`[APP ACTIONS] Conversation not found: ${conversationId}`);
          throw new Error('Conversation not found');
        }

        dispatch({
          type: 'UPDATE_CONVERSATION_TITLE_START',
          payload: { conversationId, title },
        });
        await updateConversationTitle(conversation.project_id, conversationId, title);
        console.log(`[APP ACTIONS] Successfully updated title for conversation: ${conversationId}`);
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
        console.error(`[APP ACTIONS] Failed to update title for conversation: ${conversationId}`, error);
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
      console.log(`[APP ACTIONS] Deleting conversation: ${conversationId}`);
      try {
        dispatch({ type: 'DELETE_CONVERSATION_START', payload: { conversationId } });
        await deleteConversation(projectId, conversationId);
        console.log(`[APP ACTIONS] Successfully deleted conversation: ${conversationId}`);
        dispatch({
          type: 'DELETE_CONVERSATION_SUCCESS',
          payload: { conversationId },
        });
      } catch (error) {
        console.error(`[APP ACTIONS] Failed to delete conversation: ${conversationId}`, error);
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
      console.log(`[APP ACTIONS] Sending message to conversation: ${conversationId}`);
      try {
        dispatch({
          type: 'SEND_MESSAGE_START',
          payload: { conversationId, content },
        });
        
        const response = await sendMessage(projectId, conversationId, { content, role: 'user' });
        console.log(`[APP ACTIONS] Successfully sent user message to conversation: ${conversationId}`);
        
        dispatch({
          type: 'SEND_MESSAGE_SUCCESS',
          payload: { message: response.message },
        });

        if (response.aiMessageId) {
          const aiMessageId = response.aiMessageId;
          console.log(`[APP ACTIONS] Starting AI response stream for message: ${aiMessageId}`);
          dispatch({
            type: 'MESSAGE_STREAM_START',
            payload: { messageId: aiMessageId, conversationId },
          });

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
              console.error(`[APP ACTIONS] Stream error for AI message: ${aiMessageId}`, error);
              dispatch({
                type: 'MESSAGE_STREAM_ERROR',
                payload: { messageId: aiMessageId, error: error.message },
              });
              cleanup();
            },
            () => {
              console.log(`[APP ACTIONS] Completed AI response stream for message: ${aiMessageId}`);
              dispatch({
                type: 'MESSAGE_STREAM_COMPLETE',
                payload: { messageId: aiMessageId },
              });
              cleanup();
            }
          );
        }
      } catch (error) {
        console.error(`[APP ACTIONS] Failed to send message to conversation: ${conversationId}`, error);
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
      console.log(`[APP ACTIONS] Selecting asset: ${assetId}`);
      dispatch({ type: 'SELECT_ASSET', payload: { assetId } });
    },
    [dispatch]
  );

  const createAssetAction = useCallback(
    async (projectId: string, data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
      console.log(`[APP ACTIONS] Creating new asset for project: ${projectId}`);
      try {
        dispatch({ type: 'CREATE_ASSET_START', payload: { projectId, data } });
        const asset = await createAsset(projectId, data);
        console.log(`[APP ACTIONS] Successfully created asset: ${asset.id}`);
        dispatch({
          type: 'CREATE_ASSET_SUCCESS',
          payload: { asset },
        });
      } catch (error) {
        console.error(`[APP ACTIONS] Failed to create asset for project: ${projectId}`, error);
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
      console.log(`[APP ACTIONS] Updating asset: ${assetId}`);
      try {
        dispatch({
          type: 'UPDATE_ASSET_START',
          payload: { projectId, assetId, updates },
        });
        const asset = await updateAsset(projectId, assetId, updates);
        console.log(`[APP ACTIONS] Successfully updated asset: ${assetId}`);
        dispatch({
          type: 'UPDATE_ASSET_SUCCESS',
          payload: { asset },
        });
      } catch (error) {
        console.error(`[APP ACTIONS] Failed to update asset: ${assetId}`, error);
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
      console.log(`[APP ACTIONS] Deleting asset: ${assetId}`);
      try {
        dispatch({ type: 'DELETE_ASSET_START', payload: { projectId, assetId } });
        await deleteAsset(projectId, assetId);
        console.log(`[APP ACTIONS] Successfully deleted asset: ${assetId}`);
        dispatch({
          type: 'DELETE_ASSET_SUCCESS',
          payload: { assetId },
        });
      } catch (error) {
        console.error(`[APP ACTIONS] Failed to delete asset: ${assetId}`, error);
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