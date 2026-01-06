import { Asset } from '@/types/base-types';
import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';

interface AssetViewerProps {
  asset: Asset | null;
  onAssetUpdate?: (asset: Asset) => void;
}

export function AssetViewer({ asset, onAssetUpdate }: AssetViewerProps) {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [mermaidError, setMermaidError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize mermaid once
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        htmlLabels: true,
        curve: 'basis',
        rankSpacing: 50,
        nodeSpacing: 50,
        padding: 15
      }
    });
  }, []);

  useEffect(() => {
    if (asset?.type === 'mermaid' && mermaidRef.current) {
      setMermaidError(null);
      try {
        // Clear previous content
        mermaidRef.current.innerHTML = '';
        
        // Get the raw content
        const rawContent = asset.content.trim();
        
        // Create a unique ID for this diagram
        const diagramId = `mermaid-diagram-${Date.now()}`;
        
        // Render the diagram directly without wrapping in code blocks
        mermaid.render(diagramId, rawContent)
          .then(({ svg }) => {
            if (mermaidRef.current) {
              mermaidRef.current.innerHTML = svg;
            }
          })
          .catch((error) => {
            console.error('Mermaid rendering error:', error);
            setMermaidError(error.message);
            // Fallback to showing raw content
            if (mermaidRef.current) {
              mermaidRef.current.innerHTML = `
                <div class="text-red-500 mb-4">Error rendering diagram: ${error.message}</div>
                <pre class="bg-gray-50 p-4 rounded-lg overflow-auto"><code>${rawContent}</code></pre>
              `;
            }
          });
      } catch (error) {
        console.error('Mermaid initialization error:', error);
        setMermaidError(error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }, [asset]);

  if (!asset) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <p className="text-slate-500 text-sm">Select an asset to view</p>
      </div>
    );
  }

  const renderAssetContent = () => {
    switch (asset.type) {
      case 'mermaid':
        return (
          <div className="flex-1 overflow-auto p-5">
            <div ref={mermaidRef} className="mermaid-diagram" />
            {mermaidError && (
              <div className="mt-2 text-sm text-red-500">
                Error: {mermaidError}
              </div>
            )}
          </div>
        );
      case 'markdown':
        return (
          <div className="p-5 overflow-auto">
            <MarkdownRenderer content={asset.content} />
          </div>
        );
      default:
        return (
          <div className="p-5">
            <pre className="whitespace-pre-wrap text-sm text-slate-700">{asset.content}</pre>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{asset.name}</h2>
          <p className="text-xs text-slate-500">
            {asset.type} · Created {new Date(asset.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      {renderAssetContent()}
    </div>
  );
} 
