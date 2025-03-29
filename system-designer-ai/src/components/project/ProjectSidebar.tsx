import { useState, useEffect } from 'react';
import { Asset } from '@/types/asset';
import { AssetList } from '../asset/AssetList';
import { AssetService } from '@/lib/asset/asset-service';

interface ProjectSidebarProps {
  projectId: string;
  selectedAssetId: string | null;
  onAssetSelect: (asset: Asset) => void;
}

export function ProjectSidebar({ projectId, selectedAssetId, onAssetSelect }: ProjectSidebarProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        const assetService = new AssetService();
        const projectAssets = await assetService.getProjectAssets(projectId);
        setAssets(projectAssets);
      } catch (error) {
        console.error('Failed to load assets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssets();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="w-64 border-r bg-white p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-r bg-white">
      <AssetList
        assets={assets}
        selectedAssetId={selectedAssetId}
        onAssetSelect={onAssetSelect}
      />
    </div>
  );
} 