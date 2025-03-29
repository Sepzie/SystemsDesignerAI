import { useState } from 'react';
import { Asset, AssetType } from '@/types/asset';
import { formatDistanceToNow } from 'date-fns';

interface AssetListProps {
  assets: Asset[];
  selectedAssetId: string | null;
  onAssetSelect: (asset: Asset) => void;
}

export function AssetList({ assets, selectedAssetId, onAssetSelect }: AssetListProps) {
  const [filterType, setFilterType] = useState<AssetType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

  const filteredAssets = assets
    .filter(asset => filterType === 'all' || asset.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.name.localeCompare(b.name);
    });

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case AssetType.MermaidDiagram:
        return '📊';
      case AssetType.DataModel:
        return '🗄️';
      case AssetType.Code:
        return '💻';
      default:
        return '📄';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Assets</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-1 text-sm rounded ${
              filterType === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
            }`}
          >
            All
          </button>
          {Object.values(AssetType).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2 py-1 text-sm rounded ${
                filterType === type ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
              }`}
            >
              {getAssetIcon(type)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {filteredAssets.map((asset) => (
          <button
            key={asset.id}
            onClick={() => onAssetSelect(asset)}
            className={`w-full p-3 text-left hover:bg-gray-50 ${
              selectedAssetId === asset.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{getAssetIcon(asset.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{asset.name}</p>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(asset.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 