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
            </p>
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
        <div className={`mt-2 text-xs ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(message.created_at).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
} 