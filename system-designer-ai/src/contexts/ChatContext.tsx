'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Message, ChatContextType, Conversation as ChatConversation } from '@/types/chat';
import { Conversation as ApiConversation } from '@/types/api';
import * as api from '@/lib/api-client';
import { useProject } from './ProjectContext';

// Helper function to map API conversation to Chat conversation
function mapApiConversationToChat(apiConv: ApiConversation): ChatConversation {
  return {
    id: apiConv.id,
    project_id: apiConv.projectId,
    title: `Conversation ${apiConv.id.slice(0, 8)}`, // Generate a title from the ID
    created_at: apiConv.startedAt.toISOString(),
    updated_at: apiConv.updatedAt.toISOString(),
    last_message_at: apiConv.updatedAt.toISOString(),
    message_count: 0, // This will be updated when messages are loaded
  };
}

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
  const { handleAssetReference, subscribe } = useProject();
  
  // State for managing messages, loading state, errors, and pagination
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForAI, setIsWaitingForAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
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

        let apiConversation: ApiConversation;
        if (initialConversationId) {
          // Load an existing conversation
          const { conversation: existingConversation } = await api.getConversation(
            projectId,
            initialConversationId
          );
          apiConversation = existingConversation;
        } else {
          // Create a new conversation
          const { conversation: createdConversation } = await api.createConversation(projectId);
          apiConversation = createdConversation;
        }
        
        // Map API conversation to Chat conversation
        const chatConversation = mapApiConversationToChat(apiConversation);
        setConversation(chatConversation);

        // Load initial messages for the conversation
        await loadMessages(chatConversation.id, 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize conversation');
        console.error('Failed to initialize conversation:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initializeConversation();
  }, [projectId, initialConversationId]);

  // Subscribe to project events
  useEffect(() => {
    const unsubscribe = subscribe('message:asset-referenced', (event) => {
      // Handle asset references from other parts of the application
      if (event.type === 'message:asset-referenced') {
        const payload = event.payload as { message: Message; assetId: string };
        if (payload.message.conversation_id === conversation?.id) {
          handleAssetReference(payload.message, payload.assetId);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe, handleAssetReference, conversation?.id]);

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

    // Prevent sending new messages while waiting for AI response
    if (isWaitingForAI) {
      return;
    }

    setIsLoading(true);
    setError(null);

    // Create an optimistic update for the user's message
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversation.id,
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
        setIsWaitingForAI(true);
        
        // Add a placeholder AI message that will be updated via SSE
        const placeholderAiMessage: Message = {
          id: aiMessageId,
          conversation_id: conversation.id,
          role: 'assistant',
          content: 'Thinking...', // Initial loading state
          created_at: new Date().toISOString(),
          metadata: { isStreaming: true }, // Add metadata to indicate streaming state
        };
        setMessages(prev => [...prev, placeholderAiMessage]);

        // Connect to the SSE stream for AI response
        const cleanup = api.connectToMessageStream(
          projectId,
          conversation.id,
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
      // Remove the optimistic message on error
      setMessages(prev =>
        prev.filter(msg => msg.id !== optimisticMessage.id)
      );
    } finally {
      setIsLoading(false);
    }
  }, [conversation, projectId, isWaitingForAI, handleAssetReference]);

  // Provide the chat context value to children
  const value = {
    messages,
    isLoading,
    isWaitingForAI,
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