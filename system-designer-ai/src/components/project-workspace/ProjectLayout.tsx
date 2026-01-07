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
    <div className="flex min-h-screen flex-col bg-[var(--app-bg)] text-[var(--ink)]">
      <header className="bg-[var(--surface)] backdrop-blur border-b border-[var(--border)] px-6 py-4 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {project?.name || 'AI System Designer'}
            </h1>
            <p className="text-sm text-[var(--ink-muted)]">
              {project?.description || 'Loading project...'}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Workspace
          </span>
        </div>
      </header>

      <div className="flex-1 min-h-0 p-4 lg:p-6">
        <div className="grid h-full min-h-0 gap-4 lg:gap-6 lg:grid-cols-[260px_minmax(0,1fr)_minmax(340px,0.9fr)]">
          <section className="order-2 lg:order-1 min-h-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_30px_rgba(24,20,16,0.08)]">
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversation?.id || null}
              projectId={projectId}
              onConversationSelect={(conversationId) => setActiveConversation(conversationId)}
            />
          </section>

          <section className="order-1 lg:order-2 min-h-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_16px_40px_rgba(24,20,16,0.08)]">
            <ChatInterface projectId={projectId} />
          </section>

          <section className="order-3 min-h-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_12px_30px_rgba(24,20,16,0.08)] flex flex-col">
            <div className="flex-1 min-h-0">
              <AssetViewer
                asset={selectedAsset}
                onAssetUpdate={(asset: Asset) => {
                  if (asset.id && project?.id) {
                    updateAsset(project.id, asset.id, asset);
                  }
                }}
              />
            </div>
            <div className="border-t border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
              <AssetList
                assets={assets}
                selectedAssetId={selectedAsset?.id || null}
                onAssetSelect={(asset: Asset) => selectAsset(asset.id)}
              />
            </div>
          </section>
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
