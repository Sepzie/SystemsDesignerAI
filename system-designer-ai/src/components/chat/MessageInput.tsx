'use client';

import React, { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    try {
      await onSendMessage(message.trim());
      setMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none min-h-[40px] max-h-[150px]"
          disabled={isLoading}
          rows={1}
        />
      </div>
      <button
        type="submit"
        disabled={!message.trim() || isLoading}
        className={`
          px-4 py-2 rounded-md text-white
          ${message.trim() && !isLoading
            ? 'bg-primary hover:bg-primary-dark'
            : 'bg-gray-300 cursor-not-allowed'}
          min-h-[40px]
          flex items-center justify-center
          transition-colors
          w-20
        `}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          'Send'
        )}
      </button>
    </form>
  );
}; 