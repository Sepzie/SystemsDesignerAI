'use client';

import React from 'react';
import { Message } from '@/types/base-types';
import { Asset } from '@/types/base-types';
import { useAppActions } from '@/hooks/useAppActions';

interface MessageItemProps {
  message: Message;
  referencedAssets: Asset[];
}

export function MessageItem({ message, referencedAssets }: MessageItemProps) {
  const { selectAsset } = useAppActions();
  const isUser = message.role === 'user';
  const isStreaming = message.metadata?.isStreaming;
  
  // Function to process message content and convert asset references into clickable elements
  const renderMessageContent = () => {
    if (isUser) {
      // For user messages, just return the content as paragraphs
      return message.content.split('\n').map((line, index) => (
        <p key={index} className="text-white mb-2 last:mb-0">{line}</p>
      ));
    }

    // For assistant messages, process asset references
    return message.content.split('\n').map((line, index) => {
      const assetRefRegex = /\[See asset: ([^\]]+)\]\(([^)]+)\)/g;
      let match;
      let currentIndex = 0;
      const segments: React.ReactNode[] = [];

      while ((match = assetRefRegex.exec(line)) !== null) {
        const [fullMatch, title, assetToken] = match;
        const asset = referencedAssets.find(
          (item) => item.id === assetToken || item.semantic_id === assetToken
        );

        if (match.index > currentIndex) {
          segments.push(
            <span key={`text-${index}-${currentIndex}`}>
              {line.substring(currentIndex, match.index)}
            </span>
          );
        }

        if (asset) {
          segments.push(
            <span
              key={`asset-${index}-${match.index}`}
              className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm cursor-pointer hover:bg-blue-200"
              onClick={() => selectAsset(asset.id)}
            >
              {asset.name}
            </span>
          );
        } else {
          segments.push(
            <span key={`asset-missing-${index}-${match.index}`}>
              {fullMatch}
            </span>
          );
        }

        currentIndex = match.index + fullMatch.length;
      }

      if (currentIndex < line.length) {
        segments.push(
          <span key={`text-end-${index}`}>
            {line.substring(currentIndex)}
          </span>
        );
      }

      if (segments.length === 0) {
        return <p key={index} className="text-gray-800 mb-2 last:mb-0">{line}</p>;
      }

      return <p key={index} className="text-gray-800 mb-2 last:mb-0">{segments}</p>;
    });
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
