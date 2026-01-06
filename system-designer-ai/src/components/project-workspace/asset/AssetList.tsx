import { useState } from 'react';
import { AssetType } from "@/types/base-types";
import { Asset } from '@/types/base-types';
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
      case 'mermaid':
        return 'M';
      case 'markdown':
        return 'MD';
      default:
        return 'A';
    }
  };

  const availableAssetTypes: AssetType[] = ['mermaid', 'markdown'];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-2 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1 overflow-x-auto pb-1 flex-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                filterType === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
              }`}
            >
              All
            </button>
            {availableAssetTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                  filterType === type ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                }`}
              >
                <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-white text-slate-700 border border-slate-200 mr-1">
                  {getAssetIcon(type)}
                </span>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
            className="text-xs border border-slate-200 rounded px-2 py-1 flex-shrink-0 text-slate-700"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto bg-white">
        <div className="flex gap-2 p-4">
          {filteredAssets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => onAssetSelect(asset)}
              className={`flex-shrink-0 w-56 p-3 text-left rounded-lg border ${
                selectedAssetId === asset.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                  {getAssetIcon(asset.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{asset.name}</p>
                  <p className="text-xs text-slate-500">
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
