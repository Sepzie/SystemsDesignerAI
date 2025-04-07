'use client';

import React, { useEffect } from 'react';
import { VersionHistory } from './VersionHistory';
import { ChatInterface } from './chat/ChatInterface';
import { ConversationList } from './chat/ConversationList';
import { AppProvider } from '@/contexts/AppContext';
import { AssetViewer } from './asset/AssetViewer';
import { AssetList } from './asset/AssetList';
import { useAppState } from '@/hooks/useAppState';
import { useAppActions } from '@/hooks/useAppActions';
import { Asset } from '@/types/base-types';
import { useAssetFetcher } from '@/hooks/useAssetFetcher';

interface ProjectLayoutProps {
  projectId: string;
}

function ProjectContent({ projectId }: { projectId: string }) {
  const { 
    getCurrentProject, 
    getSelectedAsset, 
    getProjectAssets,
    getProjectConversations,
    getActiveConversation,
    isLoading,
    getError 
  } = useAppState();
  
  const { 
    updateAssetAction: updateAsset,
    selectAsset,
    setActiveConversation,
    loadProject
  } = useAppActions();

  // Use the asset fetcher hook to handle pending assets
  useAssetFetcher();

  // Load project when component mounts
  useEffect(() => {
    loadProject(projectId);
  }, [projectId, loadProject]);

  const project = getCurrentProject();
  const selectedAsset = getSelectedAsset();
  const assets = getProjectAssets(project?.id || '');
  const conversations = getProjectConversations(project?.id || '');
  const activeConversation = getActiveConversation();
  const isLoadingProject = isLoading(`project:${project?.id}`);
  const error = getError(`project:${project?.id}`);

  if (isLoadingProject) {
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
        {/* Conversation List Side Panel */}
        <div className="w-64 border-r flex-shrink-0">
          <ConversationList
            conversations={conversations}
            activeConversationId={activeConversation?.id || null}
            projectId={projectId}
            onConversationSelect={(conversationId) => setActiveConversation(conversationId)}
          />
        </div>

        {/* Chat Interface */}
        <div className="w-1/2 border-r flex flex-col">
          <ChatInterface projectId={projectId} />
        </div>

        {/* Right Side - Asset Viewer and List */}
        <div className="w-1/2 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <AssetViewer
              asset={selectedAsset}
              onAssetUpdate={(asset: Asset) => {
                if (asset.id && project?.id) {
                  updateAsset(project.id, asset.id, asset);
                }
              }}
            />
          </div>
          <div className="h-56 border-t bg-white flex-shrink-0">
            <AssetList
              assets={assets}
              selectedAssetId={selectedAsset?.id || null}
              onAssetSelect={(asset: Asset) => selectAsset(asset.id)}
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
      <ProjectContent projectId={projectId} />
    </AppProvider>
  );
} 