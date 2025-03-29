import { Asset, AssetType } from '@/types/langchain';

const ASSET_PATTERN = /{{asset_type:([^}]+)}}\n{{asset_name:([^}]+)}}\n```\n([\s\S]*?)\n```\n?([\s\S]*?)(?={{asset_type:|$)/g;
const ASSET_REFERENCE_PATTERN = /\[See asset: ([^\]]+)\]/g;

/**
 * Extracts assets from the AI response text
 * @param text The response text from the AI
 * @returns Array of extracted assets
 */
export function extractAssets(text: string): Asset[] {
  const assets: Asset[] = [];
  let match;

  while ((match = ASSET_PATTERN.exec(text)) !== null) {
    const [, type, name, content, description] = match;
    
    // Validate asset type
    if (!isValidAssetType(type)) {
      console.warn(`Invalid asset type found: ${type}`);
      continue;
    }

    assets.push({
      type: type as AssetType,
      name: name.trim(),
      content: content.trim(),
      description: description ? description.trim() : undefined,
    });
  }

  return assets;
}

/**
 * Validates if a given type is a valid asset type
 * @param type The type to validate
 * @returns boolean indicating if the type is valid
 */
function isValidAssetType(type: string): type is AssetType {
  const validTypes: AssetType[] = [
    'mermaid_diagram',
    'system_context',
    'component_diagram',
    'data_model',
    'sequence_diagram',
    'state_diagram',
    'deployment_diagram',
  ];
  return validTypes.includes(type as AssetType);
}

/**
 * Replaces asset blocks with references in the text
 * @param text The response text from the AI
 * @returns Text with asset blocks replaced by references
 */
export function replaceAssetBlocks(text: string): string {
  return text.replace(ASSET_PATTERN, (match, type, name) => {
    return `[See asset: ${name}]`;
  }).trim();
}

/**
 * Processes an AI response to extract both the text and assets
 * @param response The raw response from the AI
 * @returns Object containing processed text and extracted assets
 */
export function processAIResponse(response: string): {
  text: string;
  assets: Asset[];
} {
  const assets = extractAssets(response);
  const text = replaceAssetBlocks(response);
  
  return {
    text,
    assets,
  };
} 