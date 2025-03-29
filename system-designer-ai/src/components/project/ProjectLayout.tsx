'use client';

import React, { useState, useEffect } from 'react';
import { VersionHistory } from './VersionHistory';
import { ChatInterface } from '../chat/ChatInterface';
import { ChatProvider } from '@/contexts/ChatContext';
import { AssetViewer } from '../asset/AssetViewer';
import { AssetList } from '../asset/AssetList';
import { Asset, StoredAsset } from '@/types/asset';
import { AssetService } from '@/lib/asset/asset-service';

interface ProjectLayoutProps {
  children: React.ReactNode;
  projectId: string;
}

export function ProjectLayout({ children, projectId }: ProjectLayoutProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const assetService = new AssetService();
        const storedAssets = await assetService.getProjectAssets(projectId);
        
        // Transform StoredAsset to Asset format
        const transformedAssets: Asset[] = storedAssets.map(storedAsset => ({
          id: storedAsset.id,
          project_id: storedAsset.project_id,
          name: storedAsset.name,
          type: storedAsset.asset_type,
          content: storedAsset.current_content,
          metadata: storedAsset.metadata,
          created_at: storedAsset.created_at,
          updated_at: storedAsset.updated_at
        }));
        
        setAssets(transformedAssets);
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
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-primary text-white p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">AI System Designer</h1>
            <div>E-Commerce Platform User Account</div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Asset List */}
          <div className="w-64 border-r bg-white">
            <AssetList
              assets={assets}
              selectedAssetId={selectedAsset?.id || null}
              onAssetSelect={setSelectedAsset}
            />
          </div>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-4">
            {children}
          </main>

          {/* Asset Viewer */}
          <div className="w-1/2 border-l">
            <AssetViewer
              asset={selectedAsset}
              onAssetUpdate={(asset) => {
                // TODO: Implement asset update logic
                console.log('Asset updated:', asset);
              }}
            />
          </div>
        </div>

        {/* Chat Interface */}
        <ChatInterface projectId={projectId} />
      </div>
    </ChatProvider>
  );
} 