'use client';

import React from 'react';
import { Message } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { AssetReference } from '../asset/AssetReference';
import { Asset } from '@/types/asset';
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
        {message.metadata?.asset_references && message.metadata.asset_references.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.metadata.asset_references.map((reference) => {
              const asset = referencedAssets.find(a => a.id === reference.asset_id);
              if (!asset) return null;
              return (
                <AssetReference
                  key={reference.id}
                  reference={reference}
                  asset={asset}
                  onClick={() => selectAsset(asset.id)}
                />
              );
            })}
          </div>
        )}
        <div className={`mt-2 text-xs ${isUser ? 'text-blue-100' : 'text-gray-500'} flex items-center`}>
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