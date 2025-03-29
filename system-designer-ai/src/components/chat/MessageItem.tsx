'use client';

import React from 'react';
import { Message } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { AssetReference } from '../asset/AssetReference';
import { Asset } from '@/types/asset';

interface MessageItemProps {
  message: Message;
  onAssetClick: (asset: Asset) => void;
}

export function MessageItem({ message, onAssetClick }: MessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser ? 'bg-blue-500 text-white' : 'bg-gray-100'
        }`}
      >
        <div className="prose prose-sm max-w-none">
          {message.content.split(/\n/).map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
        {message.metadata?.assets && message.metadata.assets.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.metadata.assets.map((assetRef) => (
              <AssetReference
                key={assetRef.id}
                asset={assetRef}
                onClick={() => onAssetClick(assetRef)}
              />
            ))}
          </div>
        )}
        <div className="mt-2 text-xs opacity-70">
          {new Date(message.created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
} 