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
      // Check if this line contains any asset references
      const containsAssetReference = referencedAssets.some(asset => 
        line.includes(`[See asset: ${asset.name}](${asset.semantic_id})`) ||
        line.includes(`selectAsset(asset.id)`) ||
        line.includes(`(${asset.semantic_id})`)
      );

      if (!containsAssetReference) {
        // If no asset references, just return the line as is
        return <p key={index} className="text-gray-800 mb-2 last:mb-0">{line}</p>;
      }

      // Process the line to extract and replace asset references
      let segments = [];
      let currentIndex = 0;
      
      referencedAssets.forEach(asset => {
        // Use a regex to find asset references
        const assetRefRegex = new RegExp(`\\[See asset: ([^\\]]+)\\]\\(${asset.semantic_id}\\)`, 'g');
        let match;
        
        while ((match = assetRefRegex.exec(line)) !== null) {
          // Add text before the match
          if (match.index > currentIndex) {
            segments.push(
              <span key={`text-${currentIndex}`}>
                {line.substring(currentIndex, match.index)}
              </span>
            );
          }
          
          // Add the clickable asset reference
          segments.push(
            <span 
              key={`asset-${match.index}`}
              className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm cursor-pointer hover:bg-blue-200"
              onClick={() => selectAsset(asset.id)}
            >
              {asset.name}
            </span>
          );
          
          currentIndex = match.index + match[0].length;
        }
      });
      
      // Add any remaining text after the last match
      if (currentIndex < line.length) {
        segments.push(
          <span key={`text-end-${index}`}>
            {line.substring(currentIndex)}
          </span>
        );
      }
      
      // If no segments were created (no regex matches but contains simple reference), return the whole line
      if (segments.length === 0) {
        return <p key={index} className="text-gray-800 mb-2 last:mb-0">{line}</p>;
      }
      
      return <p key={index} className="text-gray-800 mb-2 last:mb-0">{segments}</p>;
    });
  };

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