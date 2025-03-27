'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Message, ChatContextType, mockMessages } from '@/types/chat';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    try {
      // Create a new user message
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newMessage]);

      // TODO: Implement actual API call here
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `This is a mock response to: "${content}"`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <ChatContext.Provider value={{ messages, isLoading, sendMessage }}>
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