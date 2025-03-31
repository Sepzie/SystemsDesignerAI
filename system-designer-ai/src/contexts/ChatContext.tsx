'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Message, ChatContextType, MessageRole } from '@/types/chat';
import * as api from '@/lib/api-client';
import { useProject } from './ProjectContext';
import { useConversation } from './ConversationContext';

interface ChatProviderProps {
  children: React.ReactNode;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: ChatProviderProps) {
  const { handleAssetReference, subscribe } = useProject();
  const { currentConversation } = useConversation();
  
  // State for managing messages, loading state, errors, and pagination
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const MESSAGES_PER_PAGE = 20;

  // Use ref to store the current conversation ID
  const conversationIdRef = useRef<string | null>(null);

  // Update ref when conversation changes
  useEffect(() => {
    conversationIdRef.current = currentConversation?.id ?? null;
  }, [currentConversation?.id]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id, 1);
    }
  }, [currentConversation]);

  // Subscribe to project events
  useEffect(() => {
    const handleAssetReferenceEvent = (event: { type: string; payload: any }) => {
      if (event.type === 'message:asset-referenced') {
        const payload = event.payload as { message: Message; assetId: string };
        if (payload.message.conversation_id === conversationIdRef.current) {
          handleAssetReference(payload.message, payload.assetId);
        }
      }
    };

    const unsubscribe = subscribe('message:asset-referenced', handleAssetReferenceEvent);

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  /**
   * Load messages for a conversation with pagination support
   */
  const loadMessages = useCallback(async (conversationId: string, page: number) => {
    if (!currentConversation) return;

    try {
      const { messages: newMessages } = await api.getMessages(
        currentConversation.project_id,
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
  }, [currentConversation]);

  /**
   * Load more messages when scrolling up (pagination)
   */
  const loadMoreMessages = useCallback(async () => {
    if (!currentConversation || isLoading || !hasMoreMessages) return;
    
    setIsLoading(true);
    try {
      await loadMessages(currentConversation.id, currentPage + 1);
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, isLoading, hasMoreMessages, currentPage, loadMessages]);

  /**
   * Send a new message and handle the AI response stream
   * This function implements optimistic updates and retry logic
   */
  const sendMessage = useCallback(async (content: string) => {
    if (!currentConversation) {
      setError('No active conversation');
      return;
    }

    // Prevent sending new messages while waiting for AI response
    if (isWaitingForAI) {
      return;
    }

    setIsLoading(true);
    setError(null);

    // Create an optimistic update for the user's message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: currentConversation.id,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // Send the message to the API with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      let sentMessage: Message | null = null;
      let aiMessageId: string | undefined;

      // Implement retry logic for message sending
      while (retryCount < maxRetries) {
        try {
          const response = await api.sendMessage(
            currentConversation.project_id,
            currentConversation.id,
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
        setIsWaitingForAI(true);
        
        // Add a placeholder AI message that will be updated via SSE
        const placeholderAiMessage: Message = {
          id: aiMessageId,
          conversation_id: currentConversation.id,
          role: 'assistant',
          content: 'Thinking...', // Initial loading state
          created_at: new Date().toISOString(),
          metadata: { isStreaming: true }, // Add metadata to indicate streaming state
        };
        setMessages(prev => [...prev, placeholderAiMessage]);

        // Connect to the SSE stream for AI response
        const cleanup = api.connectToMessageStream(
          currentConversation.project_id,
          currentConversation.id,
          aiMessageId,
          // Handle incoming message chunks
          (data: { content: string; assets?: { id: string }[] }) => {
            setMessages(prevMessages => {
              const updatedMessages = prevMessages.map(message =>
                message.id === aiMessageId
                  ? { 
                      ...message, 
                      content: data.content,
                      metadata: {
                        ...message.metadata,
                        isStreaming: true
                      }
                    }
                  : message
              );

              // Handle asset references in the message
              if (data.assets) {
                data.assets.forEach(asset => {
                  const message = updatedMessages.find(msg => msg.id === aiMessageId);
                  if (message) {
                    handleAssetReference(message, asset.id);
                  }
                });
              }

              return updatedMessages;
            });
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
            setIsWaitingForAI(false);
            // Update the message to remove streaming state
            setMessages(prev =>
              prev.map(msg =>
                msg.id === aiMessageId
                  ? {
                      ...msg,
                      metadata: {
                        ...msg.metadata,
                        isStreaming: false
                      }
                    }
                  : msg
              )
            );
          }
        );

        return () => {
          cleanup();
        };
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Failed to send message:', err);
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
    } finally {
      setIsLoading(false);
      setIsWaitingForAI(false);
    }
  }, [currentConversation, isWaitingForAI, handleAssetReference]);

  const value: ChatContextType = {
    messages,
    isLoading,
    isWaitingForAI,
    error,
    sendMessage,
    currentConversation,
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
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
} 