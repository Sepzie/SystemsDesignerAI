'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project, ProjectContextType, ProjectEvent, ProjectEventType } from '@/types/project';
import { Message } from '@/types/chat';
import { getProject } from '@/lib/api-client';
import { Asset, AssetType } from '@/types/asset';

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children, projectId }: { children: React.ReactNode; projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [openConversation, setOpenConversation] = useState<ProjectContextType['openConversation']>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<Map<ProjectEventType, Set<(event: ProjectEvent) => void>>>(new Map());

  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true);
        const projectData = await getProject(projectId);

        console.log('projectData', projectData);
        
        // Transform the API response into the expected format
        setProject({
          id: projectData.id,
          user_id: '', // This will be set by the backend
          name: projectData.name,
          description: projectData.description,
          requirements: { functional: [], nonFunctional: [] }, // Default empty requirements
          tech_stack: projectData.tech_stack.join(','), // Convert array to string
          created_at: projectData.created_at,
          updated_at: projectData.updated_at,
          progress: 0, // Default progress
        });

        // Set assets with proper metadata
        setAssets(projectData.assets.map(asset => ({
          id: asset.id,
          project_id: projectId,
          name: asset.name,
          type: asset.type as AssetType,
          content: asset.current_content,
          current_version: asset.current_version,
          created_at: new Date(asset.created_at),
          updated_at: new Date(asset.updated_at),
          metadata: {
            created_at: new Date(asset.created_at),
            updated_at: new Date(asset.updated_at),
            created_by_message_id: '', // This will be set by the backend
            version_number: asset.current_version,
            reference_type: 'creation' as const, // Default reference type
          },
        })));

        // Set open conversation (initially using the latest conversation)
        setOpenConversation(projectData.latest_conversation);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const subscribe = useCallback((eventType: ProjectEventType, callback: (event: ProjectEvent) => void) => {
    setSubscribers(prev => {
      const newSubscribers = new Map(prev);
      if (!newSubscribers.has(eventType)) {
        newSubscribers.set(eventType, new Set());
      }
      newSubscribers.get(eventType)?.add(callback);
      return newSubscribers;
    });

    return () => {
      setSubscribers(prev => {
        const newSubscribers = new Map(prev);
        newSubscribers.get(eventType)?.delete(callback);
        return newSubscribers;
      });
    };
  }, []);

  const notify = useCallback((eventType: ProjectEventType, payload: ProjectEvent['payload']) => {
    const event: ProjectEvent = {
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
    };

    subscribers.get(eventType)?.forEach(callback => callback(event));
  }, [subscribers]);

  const handleAssetReference = useCallback((message: Message, assetId: string) => {
    notify('message:asset-referenced', { message, assetId });
  }, [notify]);

  const value: ProjectContextType = {
    project,
    assets,
    openConversation,
    isLoading,
    error,
    subscribe,
    notify,
    handleAssetReference,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
} 