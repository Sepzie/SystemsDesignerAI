'use client';

import React from 'react';
import { Message } from '@/types/base-types';
import { Asset } from '@/types/base-types';
import { useAppActions } from '@/hooks/useAppActions';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';

interface MessageItemProps {
  message: Message;
  referencedAssets: Asset[];
}

export function MessageItem({ message, referencedAssets }: MessageItemProps) {
  const { selectAsset } = useAppActions();
  const isUser = message.role === 'user';
  const isStreaming = message.metadata?.isStreaming;
  const renderMessageContent = () => {
    if (isUser) {
      return message.content.split('\n').map((line, index) => (
        <p key={index} className="text-white/90 mb-2 last:mb-0">{line}</p>
      ));
    }

    return (
      <MarkdownRenderer
        content={message.content}
        components={{
          a: ({ href, children }) => {
            if (!href) {
              return <span>{children}</span>;
            }

            const asset = referencedAssets.find(
              (item) => item.id === href || item.semantic_id === href
            );

            if (asset) {
              return (
                <span
                  className="inline-flex items-center px-2.5 py-1 rounded-md bg-[var(--accent-soft)] text-[var(--accent-strong)] text-sm font-semibold cursor-pointer hover:opacity-90"
                  onClick={() => selectAsset(asset.id)}
                >
                  {asset.name}
                </span>
              );
            }

            return (
              <a href={href} className="text-[var(--accent)] hover:text-[var(--accent-strong)] underline">
                {children}
              </a>
            );
          },
          p: ({ children }) => (
            <p className="text-sm leading-6 text-[var(--ink)] mb-2 last:mb-0">
              {children}
            </p>
          ),
        }}
      />
    );
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-[var(--accent)] text-white shadow-[0_12px_28px_rgba(15,118,110,0.2)]'
            : 'bg-[var(--surface-strong)] text-[var(--ink)] shadow-[0_12px_28px_rgba(24,20,16,0.08)] border border-[var(--border)]'
        }`}
      >
        <div className="max-w-none">
          {renderMessageContent()}
        </div>
        
        {message.metadata?.assetIds && message.metadata.assetIds.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.metadata.assetIds.map((assetId) => {
              const asset = referencedAssets.find(a => a.id === assetId);
              if (!asset) return null;
              return null;
            })}
          </div>
        )}
        
        <div className={`mt-2 text-xs flex items-center justify-end ${isUser ? 'text-white/70' : 'text-[var(--ink-muted)]'}`}>
          <span>{new Date(message.created_at).toLocaleTimeString()}</span>
          {isStreaming && (
            <span className="ml-2 flex items-center">
              <span className={`w-1 h-1 rounded-full animate-ping mr-1 ${isUser ? 'bg-white/70' : 'bg-[var(--ink-muted)]'}`} />
              Generating...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
