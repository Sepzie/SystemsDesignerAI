'use client';

import React from 'react';
import { VersionHistory } from './VersionHistory';
import { ChatInterface } from './chat/ChatInterface';
import { AppProvider } from '@/contexts/AppContext';
import { AssetViewer } from './asset/AssetViewer';
import { AssetList } from './asset/AssetList';
import { useAppContext } from '@/contexts/AppContext';
import { Asset } from '@/types/asset';

interface ProjectLayoutProps {
  projectId: string;
}

function ProjectContent() {
  const { state, dispatch } = useAppContext();
  const project = state.projects.get(state.currentProjectId || '');
  const selectedAsset = state.selectedAssetId ? state.assets.get(state.selectedAssetId) || null : null;
  const assets = Array.from(state.assets.values());
  const isLoading = state.loadingStates.get(`project:${state.currentProjectId}`) || false;
  const error = state.errors.get(`project:${state.currentProjectId}`);

  if (isLoading) {
    return <div>Loading project...</div>;
  }

  if (error) {
    return <div>Error loading project: {error}</div>;
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
              onAssetUpdate={(asset: Asset) => {
                if (asset.id) {
                  dispatch({
                    type: 'UPDATE_ASSET_START',
                    payload: {
                      projectId: project?.id || '',
                      assetId: asset.id,
                      updates: asset
                    }
                  });
                }
              }}
            />
          </div>
          <div className="h-56 border-t bg-white flex-shrink-0">
            <AssetList
              assets={assets}
              selectedAssetId={selectedAsset?.id || null}
              onAssetSelect={(asset: Asset) => dispatch({ type: 'SELECT_ASSET', payload: { assetId: asset.id } })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectLayout({ projectId }: ProjectLayoutProps) {
  return (
    <AppProvider>
      <ProjectContent />
    </AppProvider>
  );
} 