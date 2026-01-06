'use client';

import React, { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  isLoading: boolean;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, isLoading, disabled }) => {
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
    if (!message.trim() || isLoading || disabled) return;

    try {
      await onSend(message.trim());
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
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[48px] max-h-[150px] text-slate-800 placeholder-slate-400 bg-white shadow-sm"
          disabled={isLoading || disabled}
          rows={1}
        />
      </div>
      <button
        type="submit"
        disabled={!message.trim() || isLoading || disabled}
        className={`
          px-6 py-3 rounded-xl text-white font-medium
          ${message.trim() && !isLoading && !disabled
            ? 'bg-blue-600 hover:bg-blue-700 shadow-sm'
            : 'bg-slate-200 cursor-not-allowed text-slate-500'}
          min-h-[48px]
          flex items-center justify-center
          transition-all duration-200
          w-24
          disabled:opacity-50
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
