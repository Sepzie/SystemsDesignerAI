'use client';

import React, { useState } from 'react';
import { ProjectSidebar } from './ProjectSidebar';
import { VersionHistory } from './VersionHistory';
import { ChatInterface } from '../chat/ChatInterface';
import { ChatProvider } from '@/contexts/ChatContext';
import { AssetViewer } from '../asset/AssetViewer';
import { Asset } from '@/types/asset';

interface ProjectLayoutProps {
  children: React.ReactNode;
  projectId: string;
}

export function ProjectLayout({ children, projectId }: ProjectLayoutProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

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
          {/* Left Sidebar */}
          <ProjectSidebar
            projectId={projectId}
            selectedAssetId={selectedAsset?.id || null}
            onAssetSelect={setSelectedAsset}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-4">
            {children}
          </main>

          {/* Right Sidebar - Version History */}
          <VersionHistory />
        </div>

        {/* Chat Interface */}
        <ChatInterface projectId={projectId} />

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
    </ChatProvider>
  );
} 