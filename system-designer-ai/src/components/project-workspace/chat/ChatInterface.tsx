'use client';

import React from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useChat } from '@/contexts/ChatContext';
import { useConversation } from '@/contexts/ConversationContext';

interface ChatInterfaceProps {
  projectId: string;
  initialConversationId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ projectId, initialConversationId }) => {
  const { messages, isLoading, isWaitingForAI, error, sendMessage } = useChat();
  const { conversations, currentConversation, selectConversation } = useConversation();

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm mr-2">
              AI
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold">AI System Designer Assistant</h3>
              {currentConversation && (
                <div className="flex items-center space-x-2">
                  <select
                    value={currentConversation.id}
                    onChange={(e) => selectConversation(e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    {conversations.map((conv) => (
                      <option key={conv.id} value={conv.id}>
                        {conv.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
          {isLoading && (
            <div className="text-sm text-gray-500 flex items-center">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
              Thinking...
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
        {isLoading && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading conversation...</p>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <MessageInput 
          onSendMessage={sendMessage} 
          isLoading={isLoading || isWaitingForAI} 
        />
      </div>
    </div>
  );
}; 