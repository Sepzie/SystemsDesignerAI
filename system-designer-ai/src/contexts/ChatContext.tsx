'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Message, ChatContextType } from '@/types/chat';
import { Conversation } from '@/types/api';
import * as api from '@/lib/api-client';

/**
 * Props for the ChatProvider component
 */
interface ChatProviderProps {
  children: React.ReactNode;
  projectId: string;
  initialConversationId?: string; // Optional ID for loading an existing conversation
}

// Create the chat context with undefined as initial value
const ChatContext = createContext<ChatContextType | undefined>(undefined);

/**
 * ChatProvider component that manages the chat state and provides chat functionality
 * to its children through the ChatContext.
 */
export function ChatProvider({ children, projectId, initialConversationId }: ChatProviderProps) {
  // State for managing messages, loading state, errors, and pagination
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const MESSAGES_PER_PAGE = 20;

  /**
   * Initialize or load an existing conversation when the component mounts
   * or when projectId/initialConversationId changes
   */
  useEffect(() => {
    async function initializeConversation() {
      try {
        setIsLoading(true);
        setError(null);

        let newConversation: Conversation;
        if (initialConversationId) {
          // Load an existing conversation
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

        // Load initial messages for the conversation
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

  /**
   * Load messages for a conversation with pagination support
   */
  const loadMessages = useCallback(async (conversationId: string, page: number) => {
    try {
      const { messages: newMessages } = await api.getMessages(
        projectId,
        conversationId,
        page,
        MESSAGES_PER_PAGE
      );

      // Update messages state based on whether this is the first page or not
      setMessages(prev => {
        if (page === 1) return newMessages;
        return [...prev, ...newMessages];
      });
      
      // Update pagination state
      setHasMoreMessages(newMessages.length === MESSAGES_PER_PAGE);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      console.error('Failed to load messages:', err);
    }
  }, [projectId]);

  /**
   * Load more messages when scrolling up (pagination)
   */
  const loadMoreMessages = useCallback(async () => {
    if (!conversation || isLoading || !hasMoreMessages) return;
    
    setIsLoading(true);
    try {
      await loadMessages(conversation.id, currentPage + 1);
    } finally {
      setIsLoading(false);
    }
  }, [conversation, isLoading, hasMoreMessages, currentPage, loadMessages]);

  /**
   * Send a new message and handle the AI response stream
   * This function implements optimistic updates and retry logic
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!conversation) {
      setError('No active conversation');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create an optimistic update for the user's message
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

      // Implement retry logic for message sending
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
          // Exponential backoff for retries
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      if (!sentMessage) throw new Error('Failed to send message after retries');

      // Replace the optimistic message with the actual message from the server
      setMessages(prev =>
        prev.map(msg =>
          msg.id === optimisticMessage.id ? sentMessage : msg
        )
      );

      // Handle AI response streaming if we have an AI message ID
      if (aiMessageId) {
        // Add a placeholder AI message that will be updated via SSE
        const placeholderAiMessage: Message = {
          id: aiMessageId,
          role: 'assistant',
          content: '',
          created_at: new Date(),
        };
        setMessages(prev => [...prev, placeholderAiMessage]);

        // Connect to the SSE stream for AI response
        const cleanup = api.connectToMessageStream(
          projectId,
          conversation.id,
          aiMessageId,
          // Handle incoming message chunks
          (data) => {
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiMessageId
                  ? { ...msg, content: data.content }
                  : msg
              )
            );
          },
          // Handle stream errors
          (err) => {
            setError(err.message);
            console.error('Stream error:', err);
            // Remove the placeholder message on error
            setMessages(prev =>
              prev.filter(msg => msg.id !== aiMessageId)
            );
          },
          // Handle stream completion
          () => {
            setIsLoading(false);
          }
        );

        // Return cleanup function to be called on unmount
        return cleanup;
      }
    } catch (err) {
      // Handle any errors during message sending
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Failed to send message:', err);

      // Remove the optimistic message on error
      setMessages(prev =>
        prev.filter(msg => !msg.id.startsWith('temp-'))
      );
    } finally {
      setIsLoading(false);
    }
  }, [conversation, projectId]);

  // Provide the chat context value to children
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

/**
 * Custom hook to use the chat context
 * Throws an error if used outside of ChatProvider
 */
export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 