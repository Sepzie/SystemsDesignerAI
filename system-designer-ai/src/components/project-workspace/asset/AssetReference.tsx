import { AssetReference as AssetReferenceType } from "@/types/client-types";
import { Asset } from '@/types/base-types';
import { AssetType } from '@/types/base-types';

interface AssetReferenceProps {
  reference: AssetReferenceType;
  asset: Asset;
  onClick: () => void;
}

export function AssetReference({ asset, onClick }: AssetReferenceProps) {
  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'mermaid':
        return '📊';
      case 'markdown':
        return '📝';
      default:
        return '📄';
    }
  };

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-[var(--accent-soft)] text-[var(--accent-strong)] hover:opacity-90 rounded"
    >
      <span>{getAssetIcon(asset.type)}</span>
      <span className="font-medium">{asset.name}</span>
    </button>
  );
}
