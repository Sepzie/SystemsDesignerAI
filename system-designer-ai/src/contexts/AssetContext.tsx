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
  const { assets: projectAssets, subscribe, notify } = useProject();
  
  // Asset state
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to project events
  useEffect(() => {
    const unsubscribe = subscribe('asset:selected', (event) => {
      const payload = event.payload as { assetId: string };
      selectAsset(payload.assetId);
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  const selectAsset = useCallback((assetOrId: Asset | string | null) => {
    if (!assetOrId) {
      setSelectedAsset(null);
      return;
    }

    const assetId = typeof assetOrId === 'string' ? assetOrId : assetOrId.id;
    const asset = typeof assetOrId === 'string' 
      ? projectAssets.find(a => a.id === assetOrId)
      : assetOrId;

    if (asset) {
      setSelectedAsset(asset);
      notify('asset:selected', { assetId });
    }
  }, [projectAssets, notify]);

  const createAsset = useCallback(async (assetData: Omit<Asset, 'id' | 'project_id' | 'current_version' | 'metadata' | 'created_at' | 'updated_at'>) => {
    try {
      setIsLoading(true);
      setError(null);
      const newAsset = await api.createAsset(projectId, assetData);
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
      const updatedAsset = await api.updateAsset(projectId, assetId, assetData);
      
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
      await api.deleteAsset(projectId, assetId);

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
      return await api.getAssetVersion(projectId, assetId, versionNumber);
    } catch (err) {
      console.error('Failed to get asset version:', err);
      return null;
    }
  }, [projectId]);

  const getAssetVersions = useCallback(async (assetId: string): Promise<AssetVersion[]> => {
    try {
      return await api.getAssetVersions(projectId, assetId);
    } catch (err) {
      console.error('Failed to get asset versions:', err);
      return [];
    }
  }, [projectId]);

  // Asset validation
  const validateMermaidDiagram = useCallback(async (content: string): Promise<MermaidValidationResult> => {
    try {
      return await api.validateMermaidDiagram(content);
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
    assets: projectAssets,
    selectedAsset,
    isLoading,
    error,
    selectAsset,
    createAsset,
    updateAsset,
    deleteAsset,
    loadAssets: () => Promise.resolve(), // No-op since we're using project assets
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