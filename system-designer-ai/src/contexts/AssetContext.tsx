'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Asset, AssetContextType, AssetVersion, MermaidValidationResult } from '@/types/asset';
import { useProject } from './ProjectContext';
import * as api from '@/lib/api-client';

interface AssetProviderProps {
  children: React.ReactNode;
  projectId: string;
}

// Create the asset context with undefined as initial value
const AssetContext = createContext<AssetContextType | undefined>(undefined);

/**
 * AssetProvider component that manages asset state and provides asset functionality
 * to its children through the AssetContext.
 */
export function AssetProvider({ children, projectId }: AssetProviderProps) {
  const { project, subscribe, notify } = useProject();
  
  // Asset state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load assets when project changes
  useEffect(() => {
    if (project?.id) {
      loadAssets();
    }
  }, [project?.id]);

  // Subscribe to project events
  useEffect(() => {
    const unsubscribe = subscribe('asset:selected', (event) => {
      const { assetId } = event.payload;
      selectAsset(assetId);
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  // Asset operations
  const loadAssets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/projects/${projectId}/assets`);
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      const assets = await response.json() as Asset[];
      setAssets(assets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets');
      console.error('Failed to load assets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  const selectAsset = useCallback((assetOrId: Asset | string | null) => {
    if (!assetOrId) {
      setSelectedAsset(null);
      return;
    }

    const assetId = typeof assetOrId === 'string' ? assetOrId : assetOrId.id;
    const asset = typeof assetOrId === 'string' 
      ? assets.find(a => a.id === assetOrId)
      : assetOrId;

    if (asset) {
      setSelectedAsset(asset);
      notify('asset:selected', { assetId });
    }
  }, [assets, notify]);

  const createAsset = useCallback(async (assetData: Omit<Asset, 'id' | 'project_id' | 'current_version' | 'metadata' | 'created_at' | 'updated_at'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/projects/${projectId}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        throw new Error('Failed to create asset');
      }

      const newAsset = await response.json() as Asset;
      setAssets(prev => [...prev, newAsset]);
      notify('asset:created', newAsset);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create asset');
      console.error('Failed to create asset:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, notify]);

  const updateAsset = useCallback(async (assetId: string, assetData: Partial<Asset>) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/projects/${projectId}/assets/${assetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        throw new Error('Failed to update asset');
      }

      const updatedAsset = await response.json() as Asset;
      setAssets(prev => prev.map(asset => 
        asset.id === assetId ? updatedAsset : asset
      ));
      
      if (selectedAsset?.id === assetId) {
        setSelectedAsset(updatedAsset);
      }
      
      notify('asset:updated', updatedAsset);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update asset');
      console.error('Failed to update asset:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, selectedAsset, notify]);

  const deleteAsset = useCallback(async (assetId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/projects/${projectId}/assets/${assetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }

      setAssets(prev => prev.filter(asset => asset.id !== assetId));
      if (selectedAsset?.id === assetId) {
        setSelectedAsset(null);
      }
      
      notify('asset:deleted', { assetId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete asset');
      console.error('Failed to delete asset:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, selectedAsset, notify]);

  // Asset versioning
  const getAssetVersion = useCallback(async (assetId: string, versionNumber: number): Promise<AssetVersion | null> => {
    try {
      const response = await fetch(`/api/projects/${projectId}/assets/${assetId}/versions/${versionNumber}`);
      if (!response.ok) {
        return null;
      }
      return await response.json() as AssetVersion;
    } catch (err) {
      console.error('Failed to get asset version:', err);
      return null;
    }
  }, [projectId]);

  const getAssetVersions = useCallback(async (assetId: string): Promise<AssetVersion[]> => {
    try {
      const response = await fetch(`/api/projects/${projectId}/assets/${assetId}/versions`);
      if (!response.ok) {
        throw new Error('Failed to fetch asset versions');
      }
      return await response.json() as AssetVersion[];
    } catch (err) {
      console.error('Failed to get asset versions:', err);
      return [];
    }
  }, [projectId]);

  // Asset validation
  const validateMermaidDiagram = useCallback(async (content: string): Promise<MermaidValidationResult> => {
    try {
      const response = await fetch('/api/validate/mermaid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate diagram');
      }

      return await response.json() as MermaidValidationResult;
    } catch (err) {
      console.error('Failed to validate diagram:', err);
      return {
        isValid: false,
        errors: [err instanceof Error ? err.message : 'Failed to validate diagram'],
      };
    }
  }, []);

  // Create the context value
  const contextValue: AssetContextType = {
    assets,
    selectedAsset,
    isLoading,
    error,
    selectAsset,
    createAsset,
    updateAsset,
    deleteAsset,
    loadAssets,
    getAssetVersion,
    getAssetVersions,
    validateMermaidDiagram,
  };

  return (
    <AssetContext.Provider value={contextValue}>
      {children}
    </AssetContext.Provider>
  );
}

/**
 * Custom hook to use the AssetContext
 */
export function useAsset() {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error('useAsset must be used within an AssetProvider');
  }
  return context;
} 