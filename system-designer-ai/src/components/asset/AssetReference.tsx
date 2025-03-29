import { Asset, AssetType } from '@/types/asset';

interface AssetReferenceProps {
  asset: Asset;
  onClick: () => void;
}

export function AssetReference({ asset, onClick }: AssetReferenceProps) {
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
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
    >
      <span>{getAssetIcon(asset.type)}</span>
      <span className="font-medium">{asset.name}</span>
    </button>
  );
} 