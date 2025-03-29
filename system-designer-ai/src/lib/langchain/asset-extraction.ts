import { Asset, AssetType } from '@/types/langchain';
import { AssetExtractionResult, StoredAsset, AssetReference, AssetMetadata } from '@/types/asset';
import { validateMermaidDiagram } from '../validators/mermaid-validator';
import { v4 as uuidv4 } from 'uuid';

const ASSET_PATTERN = /{{asset_type:([^}]+)}}\n{{asset_name:([^}]+)}}\n```\n([\s\S]*?)\n```\n?([\s\S]*?)(?={{asset_type:|$)/g;
const ASSET_REFERENCE_PATTERN = /\[See asset: ([^\]]+)\]\(([^)]+)\)/g;

/**
 * Validates an asset based on its type
 * @param asset The asset to validate
 * @returns boolean indicating if the asset is valid
 */
async function validateAsset(asset: Asset): Promise<boolean> {
  if (asset.type === 'mermaid_diagram') {
    const validationResult = await validateMermaidDiagram(asset.content);
    if (!validationResult.isValid) {
      console.warn(`Invalid Mermaid diagram: ${validationResult.errors?.join(', ')}`);
      return false;
    }
  }
  return true;
}

/**
 * Creates a stored asset from an extracted asset
 * @param asset The extracted asset
 * @param projectId The project ID
 * @param messageId The message ID that created the asset
 * @returns A stored asset ready for database insertion
 */
function createStoredAsset(
  asset: Asset,
  projectId: string,
  messageId: string
): StoredAsset {
  const now = new Date();
  const metadata: AssetMetadata = {
    created_at: now,
    updated_at: now,
    created_by_message_id: messageId,
    version_number: 1,
    reference_type: 'creation'
  };

  return {
    id: uuidv4(),
    project_id: projectId,
    name: asset.name,
    asset_type: asset.type,
    current_content: asset.content,
    current_version: 1,
    created_at: now,
    updated_at: now,
    metadata
  };
}

/**
 * Creates an asset reference
 * @param messageId The message ID
 * @param assetId The asset ID
 * @param version The version number
 * @param referenceType The type of reference
 * @returns An asset reference ready for database insertion
 */
function createAssetReference(
  messageId: string,
  assetId: string,
  version: number,
  referenceType: 'creation' | 'modification' | 'mention'
): AssetReference {
  return {
    id: uuidv4(),
    message_id: messageId,
    asset_id: assetId,
    version_referenced: version,
    reference_type: referenceType
  };
}

/**
 * Extracts assets from the AI response text
 * @param text The response text from the AI
 * @returns Array of extracted assets
 */
function extractAssets(text: string): Asset[] {
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
 * @param assetMap Map of asset names to their IDs
 * @returns Text with asset blocks replaced by references
 */
function replaceAssetBlocks(text: string, assetMap: Map<string, string>): string {
  return text.replace(ASSET_PATTERN, (match, type, name) => {
    const assetId = assetMap.get(name.trim());
    return `[See asset: ${name}](${assetId})`;
  }).trim();
}

/**
 * Processes an AI response to extract assets and prepare them for storage
 * @param response The raw response from the AI
 * @param projectId The project ID
 * @param messageId The message ID that created the assets
 * @returns Object containing processed text, extracted assets, and references
 */
export async function processAIResponse(
  response: string,
  projectId: string,
  messageId: string
): Promise<AssetExtractionResult> {
  const extractedAssets = extractAssets(response);
  
  // Create a map of asset names to their IDs for reference replacement
  const assetMap = new Map<string, string>();
  
  // Filter out invalid assets
  const validAssets = await Promise.all(
    extractedAssets.map(async (asset) => {
      const isValid = await validateAsset(asset);
      return isValid ? asset : null;
    })
  );
  
  // Create stored assets and references
  const storedAssets: StoredAsset[] = [];
  const references: AssetReference[] = [];
  
  for (const asset of validAssets) {
    if (!asset) continue;
    
    const storedAsset = createStoredAsset(asset, projectId, messageId);
    storedAssets.push(storedAsset);
    assetMap.set(asset.name, storedAsset.id);
    
    const reference = createAssetReference(
      messageId,
      storedAsset.id,
      storedAsset.current_version,
      'creation'
    );
    references.push(reference);
  }
  
  const cleanedText = replaceAssetBlocks(response, assetMap);
  
  return {
    assets: storedAssets,
    references,
    cleanedText
  };
} 