'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Message, ChatContextType } from '@/types/chat';
import { Conversation } from '@/types/api';
import * as api from '@/lib/api-client';

interface ChatProviderProps {
  children: React.ReactNode;
  projectId: string;
  initialConversationId?: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children, projectId, initialConversationId }: ChatProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const MESSAGES_PER_PAGE = 20;

  // Initialize or get existing conversation
  useEffect(() => {
    async function initializeConversation() {
      try {
        setIsLoading(true);
        setError(null);

        let newConversation: Conversation;
        if (initialConversationId) {
          // Get existing conversation
          const { conversation: existingConversation } = await api.getConversation(
            projectId,
            initialConversationId
          );
          newConversation = existingConversation;
        } else {
          // Create a new conversation
          const { conversation: createdConversation } = await api.createConversation(projectId);
          newConversation = createdConversation;
        }
        setConversation(newConversation);

        // Load initial messages
        await loadMessages(newConversation.id, 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize conversation');
        console.error('Failed to initialize conversation:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initializeConversation();
  }, [projectId, initialConversationId]);

  const loadMessages = useCallback(async (conversationId: string, page: number) => {
    try {
      const { messages: newMessages } = await api.getMessages(
        projectId,
        conversationId,
        page,
        MESSAGES_PER_PAGE
      );

      setMessages(prev => {
        if (page === 1) return newMessages;
        return [...prev, ...newMessages];
      });
      setHasMoreMessages(newMessages.length === MESSAGES_PER_PAGE);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      console.error('Failed to load messages:', err);
    }
  }, [projectId]);

  const loadMoreMessages = useCallback(async () => {
    if (!conversation || isLoading || !hasMoreMessages) return;
    
    setIsLoading(true);
    try {
      await loadMessages(conversation.id, currentPage + 1);
    } finally {
      setIsLoading(false);
    }
  }, [conversation, isLoading, hasMoreMessages, currentPage, loadMessages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!conversation) {
      setError('No active conversation');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create optimistic update for user message
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        created_at: new Date(),
      };
      setMessages(prev => [...prev, optimisticMessage]);

      // Send the message to the API with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      let sentMessage: Message | null = null;
      let aiMessageId: string | undefined;

      while (retryCount < maxRetries) {
        try {
          const response = await api.sendMessage(
            projectId,
            conversation.id,
            {
              role: 'user',
              content,
            }
          );
          sentMessage = response.message;
          aiMessageId = response.aiMessageId;
          break;
        } catch (err) {
          retryCount++;
          if (retryCount === maxRetries) throw err;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      if (!sentMessage) throw new Error('Failed to send message after retries');

      // Replace optimistic message with actual message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === optimisticMessage.id ? sentMessage : msg
        )
      );

      // If we have an AI message ID, connect to the stream
      if (aiMessageId) {
        console.log('Connecting to stream with messageId:', aiMessageId);
        
        // Add a placeholder AI message
        const placeholderAiMessage: Message = {
          id: aiMessageId,
          role: 'assistant',
          content: '',
          created_at: new Date(),
        };
        setMessages(prev => [...prev, placeholderAiMessage]);

        const cleanup = api.connectToMessageStream(
          projectId,
          conversation.id,
          aiMessageId,
          (data) => {
            // Update the AI message with the streamed content
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, content: data.content }
                  : msg
              )
            );
          },
          (err) => {
            setError(err.message);
            console.error('Stream error:', err);
            setError(err.message);
            // Remove the placeholder message on error
            setMessages(prev =>
              prev.filter(msg => msg.id !== aiMessageId)
            );
          },
          () => {
            setIsLoading(false);
          }
        );

        // Clean up the stream connection when component unmounts
        return cleanup;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Failed to send message:', err);

      // Remove optimistic message on error
      setMessages(prev =>
        prev.filter(msg => !msg.id.startsWith('temp-'))
      );
    } finally {
      setIsLoading(false);
    }
  }, [conversation, projectId]);

  const value = {
    messages,
    isLoading,
    error,
    sendMessage,
    conversation,
    loadMoreMessages,
    hasMoreMessages,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 