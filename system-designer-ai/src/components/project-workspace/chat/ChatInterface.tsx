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
    <div className="h-full flex flex-col bg-[var(--surface)]">
      <div className="px-5 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white text-sm font-semibold shadow-[0_10px_24px_rgba(15,118,110,0.25)]">
            AI
          </div>
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-[var(--ink)]">AI System Designer Assistant</h3>
            <div className="flex items-center space-x-2 mt-1 text-xs">
              {currentConversation ? (
                <span className="text-[var(--ink-muted)]">{currentConversation.title}</span>
              ) : (
                <span className="text-[var(--ink-muted)]">No conversation selected</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-rose-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-rose-600 hover:text-rose-800 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[var(--surface-muted)]">
        {isLoadingConversation && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[var(--accent-soft)] border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[var(--ink-muted)]">Loading conversation...</p>
            </div>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </div>

      {/* Input */}
      <div className="px-5 py-4 border-t border-[var(--border)] bg-[var(--surface)]">
        <MessageInput 
          onSend={handleSendMessage}
          disabled={isWaitingForAI}
          isLoading={isWaitingForAI} 
        />
      </div>
    </div>
  );
}; 
