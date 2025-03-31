'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Project, ProjectContextType, ProjectEvent, ProjectEventType } from '@/types/project';
import { Message } from '@/types/chat';
import * as api from '@/lib/api-client';

interface ProjectProviderProps {
  children: React.ReactNode;
  projectId: string;
}

// Create the project context with undefined as initial value
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

/**
 * ProjectProvider component that manages project state and provides project functionality
 * to its children through the ProjectContext.
 */
export function ProjectProvider({ children, projectId }: ProjectProviderProps) {
  // Project state
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Event system
  const [eventSubscribers, setEventSubscribers] = useState<{
    [key in ProjectEventType]?: ((event: ProjectEvent) => void)[];
  }>({});

  // Load project data
  useEffect(() => {
    async function loadProject() {
      try {
        setIsLoading(true);
        setError(null);
        const projectData = await api.getProject(projectId);
        setProject(projectData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
        console.error('Failed to load project:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProject();
  }, [projectId]);

  // Event system implementation
  const subscribe = useCallback((eventType: ProjectEventType, callback: (event: ProjectEvent) => void) => {
    setEventSubscribers(prev => ({
      ...prev,
      [eventType]: [...(prev[eventType] || []), callback]
    }));

    // Return unsubscribe function
    return () => {
      setEventSubscribers(prev => ({
        ...prev,
        [eventType]: prev[eventType]?.filter(cb => cb !== callback)
      }));
    };
  }, []);

  const notify = useCallback((eventType: ProjectEventType, payload: any) => {
    const event: ProjectEvent = {
      type: eventType,
      payload,
      timestamp: new Date().toISOString()
    };

    // Notify all subscribers for this event type
    eventSubscribers[eventType]?.forEach(callback => callback(event));
  }, [eventSubscribers]);

  // Asset-related methods
  const selectAsset = useCallback((assetId: string) => {
    notify('asset:selected', { assetId });
  }, [notify]);

  const createAsset = useCallback(async (assetData: any) => {
    try {
      const newAsset = await api.createAsset(projectId, assetData);
      notify('asset:created', newAsset);
    } catch (err) {
      console.error('Failed to create asset:', err);
      throw err;
    }
  }, [projectId, notify]);

  const updateAsset = useCallback(async (assetId: string, assetData: any) => {
    try {
      const updatedAsset = await api.updateAsset(projectId, assetId, assetData);
      notify('asset:updated', updatedAsset);
    } catch (err) {
      console.error('Failed to update asset:', err);
      throw err;
    }
  }, [projectId, notify]);

  const deleteAsset = useCallback(async (assetId: string) => {
    try {
      await api.deleteAsset(projectId, assetId);
      notify('asset:deleted', { assetId });
    } catch (err) {
      console.error('Failed to delete asset:', err);
      throw err;
    }
  }, [projectId, notify]);

  // Message-related methods
  const handleAssetReference = useCallback((message: Message, assetId: string) => {
    notify('message:asset-referenced', { message, assetId });
  }, [notify]);

  // Create the context value
  const contextValue: ProjectContextType = {
    project,
    isLoading,
    error,
    subscribe,
    notify,
    selectAsset,
    createAsset,
    updateAsset,
    deleteAsset,
    handleAssetReference,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}

/**
 * Custom hook to use the ProjectContext
 */
export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
} 