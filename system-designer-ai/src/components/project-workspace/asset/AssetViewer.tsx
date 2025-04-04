import { Asset } from '@/types/asset';

interface AssetViewerProps {
  asset: Asset | null;
  onAssetUpdate?: (asset: Asset) => void;
}

export function AssetViewer({ asset, onAssetUpdate }: AssetViewerProps) {
  if (!asset) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-500">Select an asset to view</p>
      </div>
    );
  }

//   const renderAssetContent = () => {
//     switch (asset.type) {
//       case 'mermaid_diagram':
//         return (
//           <DiagramEditor
//             content={asset.content}
//             onChange={(content: string) => onAssetUpdate?.({ ...asset, content })}
//             readOnly={!onAssetUpdate}
//           />
//         );
//       case 'data_model':
//         return (
//           <DataModelEditor
//             content={asset.content}
//             onChange={(content: string) => onAssetUpdate?.({ ...asset, content })}
//             readOnly={!onAssetUpdate}
//           />
//         );
//       case 'component_diagram':
//       case 'sequence_diagram':
//       case 'state_diagram':
//       case 'deployment_diagram':
//         return (
//           <DiagramEditor
//             content={asset.content}
//             onChange={(content: string) => onAssetUpdate?.({ ...asset, content })}
//             readOnly={!onAssetUpdate}
//           />
//         );
//       case 'system_context':
//         return (
//           <div className="p-4">
//             <pre className="whitespace-pre-wrap">{asset.content}</pre>
//           </div>
//         );
//       default:
//         return (
//           <div className="p-4">
//             <pre className="whitespace-pre-wrap">{asset.content}</pre>
//           </div>
//         );
//     }
//   };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">{asset.name}</h2>
          <p className="text-sm text-gray-500">
            {asset.type} • Created {new Date(asset.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="whitespace-pre-wrap">{asset.content}</pre>
      </div>
    </div>
  );
} 