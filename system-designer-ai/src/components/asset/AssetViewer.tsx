import { useState, useEffect } from 'react';
import { Asset, AssetType } from '@/types/asset';
import { MermaidValidatorService } from '@/lib/asset/mermaid-validator';
import { DataModelValidatorService } from '@/lib/asset/data-model-validator';
import { CodeValidatorService } from '@/lib/asset/code-validator';
import { DiagramEditor } from '@/components/diagram/DiagramEditor';
import { DataModelEditor } from '@/components/diagram/DataModelEditor';
import { CodeEditor } from '@/components/editor/CodeEditor';

interface AssetViewerProps {
  asset: Asset | null;
  onAssetUpdate?: (asset: Asset) => void;
}

export function AssetViewer({ asset, onAssetUpdate }: AssetViewerProps) {
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!asset) return;

    const validateAsset = async () => {
      try {
        let isValid = true;
        let error = null;

        switch (asset.type) {
          case AssetType.MermaidDiagram:
            isValid = await MermaidValidatorService.validate(asset.content);
            if (!isValid) error = 'Invalid Mermaid diagram syntax';
            break;
          case AssetType.DataModel:
            isValid = await DataModelValidatorService.validate(asset.content);
            if (!isValid) error = 'Invalid data model format';
            break;
          case AssetType.Code:
            isValid = await CodeValidatorService.validate(asset.content);
            if (!isValid) error = 'Invalid code syntax';
            break;
        }

        setIsValid(isValid);
        setError(error);
      } catch (err) {
        setIsValid(false);
        setError(err instanceof Error ? err.message : 'Validation failed');
      }
    };

    validateAsset();
  }, [asset]);

  if (!asset) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <p className="text-gray-500">Select an asset to view</p>
      </div>
    );
  }

  const renderAssetContent = () => {
    switch (asset.type) {
      case AssetType.MermaidDiagram:
        return (
          <DiagramEditor
            content={asset.content}
            onChange={(content) => onAssetUpdate?.({ ...asset, content })}
            readOnly={!onAssetUpdate}
          />
        );
      case AssetType.DataModel:
        return (
          <DataModelEditor
            content={asset.content}
            onChange={(content) => onAssetUpdate?.({ ...asset, content })}
            readOnly={!onAssetUpdate}
          />
        );
      case AssetType.Code:
        return (
          <CodeEditor
            content={asset.content}
            onChange={(content) => onAssetUpdate?.({ ...asset, content })}
            readOnly={!onAssetUpdate}
            language={asset.metadata.language || 'typescript'}
          />
        );
      default:
        return (
          <div className="p-4">
            <pre className="whitespace-pre-wrap">{asset.content}</pre>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">{asset.name}</h2>
          <p className="text-sm text-gray-500">
            {asset.type} • Created {new Date(asset.created_at).toLocaleDateString()}
          </p>
        </div>
        {!isValid && (
          <div className="text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {renderAssetContent()}
      </div>
    </div>
  );
} 