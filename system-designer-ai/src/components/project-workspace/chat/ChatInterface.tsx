'use client';

import React from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useAppState } from '@/hooks/useAppState';
import { useAppActions } from '@/hooks/useAppActions';

interface ChatInterfaceProps {
  projectId: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ projectId }) => {
  const {
    getActiveConversation,
    getConversationMessages,
    isLoading,
    getError
  } = useAppState();

  const {
    sendMessageAction: sendMessage
  } = useAppActions();

  const currentConversation = getActiveConversation();
  const messages = currentConversation ? getConversationMessages(currentConversation.id) : [];
  const isLoadingConversation = isLoading(`conversation:${currentConversation?.id}`);
  const isWaitingForAI = isLoading(`message:${currentConversation?.id}`);
  const error = getError(`conversation:${currentConversation?.id}`) || getError(`message:${currentConversation?.id}`);

  const handleSendMessage = async (content: string) => {
    if (!currentConversation) return;
    try {
      await sendMessage(projectId, currentConversation.id, content);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-semibold">
            AI
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-slate-900">AI System Designer Assistant</h3>
            <div className="flex items-center space-x-2 mt-1 text-xs">
              {currentConversation ? (
                <span className="text-slate-600">{currentConversation.title}</span>
              ) : (
                <span className="text-slate-500">No conversation selected</span>
              )}
            </div>
          </div>
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
      <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
        {isLoadingConversation && messages.length === 0 ? (
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
      <div className="px-5 py-4 border-t border-slate-200 bg-white">
        <MessageInput 
          onSend={handleSendMessage}
          disabled={isWaitingForAI}
          isLoading={isWaitingForAI} 
        />
      </div>
    </div>
  );
}; 
