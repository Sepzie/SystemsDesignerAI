import React, { useState } from 'react';
import { Conversation } from '@/types/conversation';
import { useAppActions } from '@/hooks/useAppActions';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  projectId: string;
  onConversationSelect: (conversationId: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  projectId,
  onConversationSelect,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const { createConversationAction: createConversation, deleteConversationAction: deleteConversation, updateConversationTitleAction: updateConversationTitle } = useAppActions();

  const handleCreateConversation = async () => {
    await createConversation(projectId);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    await deleteConversation(projectId, conversationId);
  };

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleSaveEdit = async (conversationId: string) => {
    await updateConversationTitle(conversationId, editTitle);
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-white">
        <button
          onClick={handleCreateConversation}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Conversation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              conversation.id === activeConversationId
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
          >
            {editingId === conversation.id ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={`flex-1 px-2 py-1 rounded border ${
                    conversation.id === activeConversationId
                      ? 'bg-blue-700 border-blue-500 text-white placeholder-gray-300'
                      : 'bg-white border-gray-300'
                  }`}
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit(conversation.id)}
                  className={`p-1 rounded ${
                    conversation.id === activeConversationId
                      ? 'hover:bg-blue-700'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className={`p-1 rounded ${
                    conversation.id === activeConversationId
                      ? 'hover:bg-blue-700'
                      : 'hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div
                  className="flex-1 truncate"
                  onClick={() => onConversationSelect(conversation.id)}
                >
                  {conversation.title || 'Untitled Conversation'}
                </div>
                <div className="flex items-center space-x-2 ml-2">
                  <button
                    onClick={() => handleStartEdit(conversation)}
                    className={`p-1 rounded ${
                      conversation.id === activeConversationId
                        ? 'hover:bg-blue-700'
                        : 'hover:bg-gray-200'
                    }`}
                    title="Edit title"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteConversation(conversation.id)}
                    className={`p-1 rounded ${
                      conversation.id === activeConversationId
                        ? 'hover:bg-blue-700'
                        : 'hover:bg-gray-200'
                    }`}
                    title="Delete conversation"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 