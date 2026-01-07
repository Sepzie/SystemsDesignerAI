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
        <p key={index} className="text-white mb-2 last:mb-0">{line}</p>
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
                  className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm cursor-pointer hover:bg-blue-200"
                  onClick={() => selectAsset(asset.id)}
                >
                  {asset.name}
                </span>
              );
            }

            return (
              <a href={href} className="text-blue-600 hover:text-blue-700 underline">
                {children}
              </a>
            );
          },
          p: ({ children }) => (
            <p className="text-sm leading-6 text-slate-800 mb-2 last:mb-0">
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
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-white text-slate-800 shadow-sm border border-slate-200'
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
        
        <div className={`mt-2 text-xs flex items-center justify-end ${isUser ? 'text-white/70' : 'text-slate-500'}`}>
          <span>{new Date(message.created_at).toLocaleTimeString()}</span>
          {isStreaming && (
            <span className="ml-2 flex items-center">
              <span className={`w-1 h-1 rounded-full animate-ping mr-1 ${isUser ? 'bg-white/70' : 'bg-slate-400'}`} />
              Generating...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
