'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project, ProjectContextType, ProjectEvent, ProjectEventType } from '@/types/project';
import { Message } from '@/types/chat';
import { getProject } from '@/lib/api-client';

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children, projectId }: { children: React.ReactNode; projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<Map<ProjectEventType, Set<(event: ProjectEvent) => void>>>(new Map());

  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true);
        const projectData = await getProject(projectId);
        setProject(projectData);
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