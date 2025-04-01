'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Message } from '@/types/chat';
import { MessageItem } from './MessageItem';
import { useAppState } from '@/hooks/useAppState';
import { Asset } from '@/types/asset';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getReferencedAssets } = useAppState();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const referencedAssets = getReferencedAssets(message.id);
        return (
          <MessageItem
            key={message.id}
            message={message}
            referencedAssets={referencedAssets}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}; 