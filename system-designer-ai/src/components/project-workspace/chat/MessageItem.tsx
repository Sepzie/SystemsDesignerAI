'use client';

import React from 'react';
import { Message } from '@/types/base-types';
import { formatDistanceToNow } from 'date-fns';
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

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[85%] rounded-2xl p-4 ${
          isUser 
            ? 'bg-blue-600 text-white shadow-sm' 
            : 'bg-white text-gray-800 shadow-sm border border-gray-100'
        }`}
      >
        <div className="prose prose-sm max-w-none">
          {message.content.split(/\n/).map((line, index) => (
            <p key={index} className={`${isUser ? 'text-white' : 'text-gray-800'} mb-2 last:mb-0`}>
              {line}
              {isStreaming && index === message.content.split(/\n/).length - 1 && (
                <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />
              )}
            </p>
          ))}
        </div>
        {message.metadata?.assetIds && message.metadata.assetIds.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.metadata.assetIds.map((assetId) => {
              const asset = referencedAssets.find(a => a.id === assetId);
              if (!asset) return null;
              return (
                <div 
                  key={assetId}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm cursor-pointer hover:bg-blue-200"
                  onClick={() => selectAsset(assetId)}
                >
                  {asset.name}
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-2 text-xs text-gray-500 flex items-center justify-end">
          <span>{new Date(message.created_at).toLocaleTimeString()}</span>
          {isStreaming && (
            <span className="ml-2 flex items-center">
              <span className="w-1 h-1 bg-gray-400 rounded-full animate-ping mr-1" />
              Generating...
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 