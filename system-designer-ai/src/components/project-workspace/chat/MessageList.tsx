'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { Message } from '@/types/base-types';
import { MessageItem } from './MessageItem';
import { useAppState } from '@/hooks/useAppState';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { getAssetsByIds } = useAppState();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 text-[var(--ink)]">
      {messages.map((message) => {
        const assetIds = message.metadata?.assetIds || [];
        const referencedAssets = getAssetsByIds(assetIds);
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
