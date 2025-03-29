'use client';

import React from 'react';
import { Message } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { AssetReference } from '../asset/AssetReference';
import { Asset } from '@/types/asset';

interface MessageItemProps {
  message: Message;
  onAssetClick: (asset: Asset) => void;
  assets: Record<string, Asset>; // Map of asset_id to Asset
}

export function MessageItem({ message, onAssetClick, assets }: MessageItemProps) {
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
            {message.metadata.assets.map((reference) => {
              const asset = assets[reference.asset_id];
              if (!asset) return null;
              return (
                <AssetReference
                  key={reference.id}
                  reference={reference}
                  asset={asset}
                  onClick={() => onAssetClick(asset)}
                />
              );
            })}
          </div>
        )}
        <div className="mt-2 text-xs opacity-70">
          {new Date(message.created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
} 