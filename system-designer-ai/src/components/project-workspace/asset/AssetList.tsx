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
      <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1 overflow-x-auto pb-1 flex-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                filterType === 'all' ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]' : 'bg-[var(--surface-muted)] text-[var(--ink-muted)]'
              }`}
            >
              All
            </button>
            {availableAssetTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                  filterType === type ? 'bg-[var(--accent-soft)] text-[var(--accent-strong)]' : 'bg-[var(--surface-muted)] text-[var(--ink-muted)]'
                }`}
              >
                <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-[var(--surface-strong)] text-[var(--ink)] border border-[var(--border)] mr-1">
                  {getAssetIcon(type)}
                </span>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
            className="text-xs border border-[var(--border)] rounded px-2 py-1 flex-shrink-0 text-[var(--ink)] bg-[var(--surface-strong)]"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto bg-[var(--surface)]">
        <div className="flex gap-2 p-4">
          {filteredAssets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => onAssetSelect(asset)}
              className={`flex-shrink-0 w-56 p-3 text-left rounded-xl border transition ${
                selectedAssetId === asset.id ? 'bg-[var(--accent-soft)] border-[var(--accent)]' : 'bg-[var(--surface-strong)] border-[var(--border)] hover:bg-[var(--surface-muted)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--surface-muted)] text-[var(--ink)] text-xs font-semibold">
                  {getAssetIcon(asset.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{asset.name}</p>
                  <p className="text-xs text-[var(--ink-muted)]">
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
