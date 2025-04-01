'use client';

import React from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useAppContext } from '@/contexts/AppContext';
import { Conversation } from '@/types/conversation';

interface ChatInterfaceProps {
  projectId: string;
  initialConversationId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ projectId, initialConversationId }) => {
  const { state, dispatch } = useAppContext();
  
  const currentConversation = state.activeConversationId ? state.conversations.get(state.activeConversationId) : null;
  const conversations = Array.from(state.conversations.values());
  const messages = state.activeConversationId ? state.messages.get(state.activeConversationId) || [] : [];
  const isLoading = state.loadingStates.get(`conversation:${state.activeConversationId}`) || false;
  const isWaitingForAI = state.loadingStates.get(`message:${state.activeConversationId}`) || false;
  const error = state.errors.get(`conversation:${state.activeConversationId}`) || state.errors.get(`message:${state.activeConversationId}`);

  const handleCreateConversation = async () => {
    try {
      dispatch({ type: 'CREATE_CONVERSATION_START', payload: { projectId } });
      // The actual API call and success/error handling will be done in the reducer
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleDeleteConversation = async () => {
    if (!currentConversation) return;
    try {
      dispatch({ type: 'DELETE_CONVERSATION_START', payload: { conversationId: currentConversation.id } });
      // After deletion, select the first available conversation or create a new one
      if (conversations.length > 0) {
        dispatch({ type: 'SET_ACTIVE_CONVERSATION', payload: { conversationId: conversations[0].id } });
      } else {
        handleCreateConversation();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleSendMessage = async (content: string): Promise<(() => void) | undefined> => {
    if (!currentConversation) return undefined;
    try {
      dispatch({ 
        type: 'SEND_MESSAGE_START', 
        payload: { 
          conversationId: currentConversation.id, 
          content 
        } 
      });
      // Return a cleanup function that can be used to cancel the message stream if needed
      return () => {
        // Add cleanup logic here if needed
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      return undefined;
    }
  };

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
              <div className="flex items-center space-x-2 mt-1">
                {currentConversation ? (
                  <>
                    <select
                      value={currentConversation.id}
                      onChange={(e) => dispatch({ 
                        type: 'SET_ACTIVE_CONVERSATION', 
                        payload: { conversationId: e.target.value } 
                      })}
                      className="text-sm border rounded px-2 py-1"
                    >
                      {conversations.map((conv) => (
                        <option key={conv.id} value={conv.id}>
                          {conv.title}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleDeleteConversation}
                      className="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                      title="Delete conversation"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-gray-500">No conversation selected</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCreateConversation}
              className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50 flex items-center"
              title="New conversation"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New
            </button>
            {isLoading && (
              <div className="text-sm text-gray-500 flex items-center">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                Thinking...
              </div>
            )}
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
          onSendMessage={handleSendMessage}
          isLoading={isLoading || isWaitingForAI} 
        />
      </div>
    </div>
  );
}; 