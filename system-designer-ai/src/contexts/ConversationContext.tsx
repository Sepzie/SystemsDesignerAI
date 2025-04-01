'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Conversation, ConversationContextType, mapApiConversationToChat } from '@/types/conversation';
import { useProject } from './ProjectContext';
import * as api from '@/lib/api-client';

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

interface ConversationProviderProps {
  children: React.ReactNode;
}

export function ConversationProvider({ children }: ConversationProviderProps) {
  const { project, activeConversation, subscribe, notify } = useProject();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversations when project changes
  useEffect(() => {
    if (project) {
      loadConversations(project.id);
    }
  }, [project]);

  // Update conversations array when activeConversation changes
  useEffect(() => {
    if (activeConversation) {
      setConversations(prev => {
        if (!prev.find(c => c.id === activeConversation.id)) {
          return [...prev, activeConversation];
        }
        return prev;
      });
    }
  }, [activeConversation]);

  const loadConversations = useCallback(async (projectId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { conversations: apiConversations } = await api.getConversations(projectId);
      const mappedConversations = apiConversations.map(mapApiConversationToChat);
      setConversations(mappedConversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createConversation = useCallback(async (projectId: string): Promise<Conversation> => {
    try {
      setIsLoading(true);
      setError(null);
      const { conversation: apiConversation } = await api.createConversation(projectId);
      const conversation = mapApiConversationToChat(apiConversation);
      setConversations(prev => [...prev, conversation]);
      setCurrentConversation(conversation);
      notify('conversation:created', { conversation });
      return conversation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation');
      console.error('Failed to create conversation:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  const selectConversation = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      notify('conversation:selected', { conversation });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select conversation');
      console.error('Failed to select conversation:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [conversations, notify]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
      }
      notify('conversation:deleted', { conversationId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete conversation');
      console.error('Failed to delete conversation:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, notify]);

  const updateConversationTitle = useCallback(async (conversationId: string, title: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.updateConversationTitle(conversationId, title);
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId ? { ...c, title } : c
        )
      );
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(prev => prev ? { ...prev, title } : null);
      }
      notify('conversation:updated', { conversationId, title });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update conversation title');
      console.error('Failed to update conversation title:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, notify]);

  const value: ConversationContextType = {
    conversations,
    currentConversation,
    isLoading,
    error,
    createConversation,
    selectConversation,
    deleteConversation,
    updateConversationTitle,
    loadConversations,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
} 