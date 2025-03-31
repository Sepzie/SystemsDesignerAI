'use client';

import React from 'react';
import { VersionHistory } from './VersionHistory';
import { ChatInterface } from './chat/ChatInterface';
import { ChatProvider } from '@/contexts/ChatContext';
import { ProjectProvider } from '@/contexts/ProjectContext';
import { AssetProvider } from '@/contexts/AssetContext';
import { AssetViewer } from './asset/AssetViewer';
import { AssetList } from './asset/AssetList';
import { useAsset } from '@/contexts/AssetContext';
import { useProject } from '@/contexts/ProjectContext';

interface ProjectLayoutProps {
  projectId: string;
}

function ProjectContent() {
  const { project, isLoading: projectLoading, error: projectError } = useProject();
  const { assets, selectedAsset, selectAsset, updateAsset, isLoading: assetsLoading } = useAsset();

  if (projectLoading || assetsLoading) {
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
                if (asset.id) {
                  updateAsset(asset.id, asset);
                }
              }}
            />
          </div>
          <div className="h-56 border-t bg-white flex-shrink-0">
            <AssetList
              assets={assets}
              selectedAssetId={selectedAsset?.id || null}
              onAssetSelect={selectAsset}
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
      <AssetProvider projectId={projectId}>
        <ChatProvider projectId={projectId}>
          <ProjectContent />
        </ChatProvider>
      </AssetProvider>
    </ProjectProvider>
  );
} 