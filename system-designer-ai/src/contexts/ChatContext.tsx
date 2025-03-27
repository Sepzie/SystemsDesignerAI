'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Message, ChatContextType } from '@/types/chat';
import { Conversation } from '@/types/api';
import * as api from '@/lib/api-client';

interface ChatProviderProps {
  children: React.ReactNode;
  projectId: string;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children, projectId }: ChatProviderProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);

  // Initialize or get existing conversation
  useEffect(() => {
    async function initializeConversation() {
      try {
        setIsLoading(true);
        setError(null);

        // Create a new conversation
        const { conversation: newConversation } = await api.createConversation(projectId);
        setConversation(newConversation);

        // Load messages if the conversation already existed
        const { messages: existingMessages } = await api.getMessages(
          projectId,
          newConversation.id
        );
        setMessages(existingMessages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize conversation');
        console.error('Failed to initialize conversation:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initializeConversation();
  }, [projectId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!conversation) {
      setError('No active conversation');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create optimistic update
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, optimisticMessage]);

      // Send the message to the API
      const { message: sentMessage } = await api.sendMessage(
        projectId,
        conversation.id,
        {
          role: 'user',
          content,
        }
      );

      // Replace optimistic message with actual message
      setMessages(prev =>
        prev.map(msg =>
          msg.id === optimisticMessage.id ? sentMessage : msg
        )
      );

      // Simulate assistant response (to be replaced with actual AI response)
      const { message: assistantMessage } = await api.sendMessage(
        projectId,
        conversation.id,
        {
          role: 'assistant',
          content: `This is a simulated response to: "${content}"`,
        }
      );

      setMessages(prev => [...prev, assistantMessage]);
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