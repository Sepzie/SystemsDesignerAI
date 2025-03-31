'use client';

import React, { useState, useEffect } from 'react';
import { VersionHistory } from './VersionHistory';
import { ChatInterface } from './chat/ChatInterface';
import { ChatProvider } from '@/contexts/ChatContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { AssetViewer } from './asset/AssetViewer';
import { AssetList } from './asset/AssetList';
import { Asset } from '@/types/asset';
import { useProject } from '@/contexts/ProjectContext';

interface ProjectLayoutProps {
  projectId: string;
}

function ProjectContent() {
  const { project, isLoading: projectLoading, error: projectError } = useProject();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const response = await fetch(`/api/projects/${project?.id}/assets`);
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

    if (project?.id) {
      loadAssets();
    }
  }, [project?.id]);

  if (projectLoading) {
    return <div>Loading project...</div>;
  }

  if (projectError) {
    return <div>Error loading project: {projectError}</div>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="bg-primary text-white p-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">{project?.name || 'AI System Designer'}</h1>
          <div>{project?.description || 'Loading project...'}</div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat Interface */}
        <div className="w-1/2 border-r flex flex-col">
          <ChatInterface projectId={project?.id || ''} />
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
  );
}

export function ProjectLayout({ projectId }: ProjectLayoutProps) {
  return (
    <ProjectProvider projectId={projectId}>
      <ChatProvider projectId={projectId}>
        <ProjectContent />
      </ChatProvider>
    </ProjectProvider>
  );
} 