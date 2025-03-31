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
      case 'mermaid_diagram':
        return '📊';
      case 'data_model':
        return '🗄️';
      case 'component_diagram':
        return '🔧';
      case 'sequence_diagram':
        return '⏱️';
      case 'state_diagram':
        return '🔄';
      case 'deployment_diagram':
        return '🚀';
      case 'system_context':
        return '🌐';
      default:
        return '📄';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1 overflow-x-auto pb-1 flex-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                filterType === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
              }`}
            >
              All
            </button>
            {(['mermaid_diagram', 'data_model', 'component_diagram', 'sequence_diagram', 'state_diagram', 'deployment_diagram', 'system_context'] as AssetType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                  filterType === type ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'
                }`}
              >
                {getAssetIcon(type)}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
            className="text-xs border rounded px-2 py-1 flex-shrink-0"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-2 p-3">
          {filteredAssets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => onAssetSelect(asset)}
              className={`flex-shrink-0 w-48 p-2 text-left rounded-lg hover:bg-gray-50 ${
                selectedAssetId === asset.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{getAssetIcon(asset.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{asset.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(asset.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 