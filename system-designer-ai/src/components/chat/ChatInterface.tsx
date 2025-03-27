'use client';

import React from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChat } from '@/contexts/ChatContext';

export const ChatInterface: React.FC = () => {
  const { messages, isLoading, sendMessage } = useChat();

  return (
    <div className="h-64 border-t bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm mr-2">
              AI
            </div>
            <h3 className="text-lg font-semibold">AI System Designer Assistant</h3>
          </div>
          {isLoading && (
            <div className="text-sm text-gray-500 flex items-center">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
              Thinking...
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
        <MessageList messages={messages} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white">
        <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}; 