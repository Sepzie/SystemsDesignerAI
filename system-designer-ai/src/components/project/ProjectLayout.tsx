'use client';

import React, { useState, useEffect } from 'react';
import { VersionHistory } from './VersionHistory';
import { ChatInterface } from '../chat/ChatInterface';
import { ChatProvider } from '@/contexts/ChatContext';
import { AssetViewer } from '../asset/AssetViewer';
import { AssetList } from '../asset/AssetList';
import { Asset } from '@/types/asset';

interface ProjectLayoutProps {
  projectId: string;
}

export function ProjectLayout({ projectId }: ProjectLayoutProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/assets`);
        if (!response.ok) {
          throw new Error('Failed to fetch assets');
        }
        const assets = await response.json() as Asset[];
        setAssets(assets);
      } catch (error) {
        console.error('Failed to load assets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssets();
  }, [projectId]);

  return (
    <ChatProvider projectId={projectId}>
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-primary text-white p-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">AI System Designer</h1>
            <div>E-Commerce Platform User Account</div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Chat Interface */}
          <div className="w-1/2 border-r flex flex-col">
            <ChatInterface projectId={projectId} />
          </div>

          {/* Right Side - Asset Viewer and List */}
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <AssetViewer
                asset={selectedAsset}
                onAssetUpdate={(asset) => {
                  // TODO: Implement asset update logic
                  console.log('Asset updated:', asset);
                }}
              />
            </div>
            <div className="h-56 border-t bg-white flex-shrink-0">
              <AssetList
                assets={assets}
                selectedAssetId={selectedAsset?.id || null}
                onAssetSelect={setSelectedAsset}
              />
            </div>
          </div>
        </div>
      </div>
    </ChatProvider>
  );
} 