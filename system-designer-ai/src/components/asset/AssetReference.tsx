import { AssetReference as AssetReferenceType, Asset } from '@/types/asset';

interface AssetReferenceProps {
  reference: AssetReferenceType;
  asset: Asset;
  onClick: () => void;
}

export function AssetReference({ reference, asset, onClick }: AssetReferenceProps) {
  const getAssetIcon = (type: string) => {
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
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
    >
      <span>{getAssetIcon(asset.type)}</span>
      <span className="font-medium">{asset.name}</span>
    </button>
  );
} 