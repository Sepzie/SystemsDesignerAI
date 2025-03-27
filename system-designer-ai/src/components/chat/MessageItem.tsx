'use client';

import React from 'react';
import { Message } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';
  
  return (
    <div
      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}
      role="listitem"
    >
      <div
        className={`
          max-w-[80%] rounded-lg p-4
          ${isAssistant 
            ? 'bg-white border border-gray-200 shadow-sm text-gray-800' 
            : 'bg-blue-600 text-white shadow-sm'}
        `}
      >
        {isAssistant && (
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm mr-2">
              AI
            </div>
            <span className="font-semibold text-gray-800">AI Assistant</span>
          </div>
        )}
        
        <div className="whitespace-pre-wrap">{message.content}</div>
        
        <div className={`text-xs mt-2 ${isAssistant ? 'text-gray-500' : 'text-blue-100'}`}>
          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}; 