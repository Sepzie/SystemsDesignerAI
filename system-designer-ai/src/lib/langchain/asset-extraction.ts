import { AssetType, ExtractedAsset } from '@/types/asset';
import { Asset } from '@/types/asset';
import { AssetExtractionResult, AssetReference, AssetMetadata } from '@/types/asset';
import { validateMermaidDiagram } from '../validators/mermaid-validator';
import { v4 as uuidv4 } from 'uuid';

const ASSET_PATTERN = /{asset_type:([^}]+)}\s*\n{asset_name:([^}]+)}\s*\n```([\w]*)\n([\s\S]*?)\n```(?:\s*\n([\s\S]*?))?/g;
const ASSET_REFERENCE_PATTERN = /\[See asset: ([^\]]+)\]\(([^)]+)\)/g;

/**
 * Validates an asset based on its type
 * @param asset The asset to validate
 * @returns boolean indicating if the asset is valid
 */
async function validateAsset(asset: ExtractedAsset): Promise<boolean> {
  if (asset.type === 'mermaid_diagram') {
    const validationResult = await validateMermaidDiagram(asset.content);
    if (!validationResult.isValid) {
      console.warn(`Invalid Mermaid diagram: ${validationResult.errors?.join(', ')}`);
      asset.content = `graph TD\n    A[Error] -->|Invalid Diagram| B[Please try again]`;
      return true;
    }
  }
  return true;
}

/**
 * Creates an asset from an extracted asset
 * @param asset The extracted asset
 * @param projectId The project ID
 * @param messageId The message ID that created the asset
 * @returns An asset ready for database insertion
 */
function createAsset(
  asset: ExtractedAsset,
  projectId: string,
  messageId: string
): Asset {
  const now = new Date();
  const metadata: AssetMetadata = {
    language: '',
    created_at: now,
    updated_at: now,
    created_by_message_id: messageId,
    version_number: 1,
  };

  return {
    id: uuidv4(),
    project_id: projectId,
    name: asset.name,
    type: asset.type,
    current_content: asset.content,
    current_version: 1,
    metadata,
    created_at: now,
    updated_at: now
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
function extractAssets(text: string): ExtractedAsset[] {
  const assets: ExtractedAsset[] = [];
  let match;

  while ((match = ASSET_PATTERN.exec(text)) !== null) {
    const [, type, name, language, content] = match;
    
    // Validate asset type
    if (!isValidAssetType(type)) {
      console.warn(`Invalid asset type found: ${type}`);
      continue;
    }

    assets.push({
      type: type as AssetType,
      name: name.trim(),
      content: content.trim(),
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
  // Handle empty response
  if (!response || !response.trim()) {
    console.warn('Empty response received from AI');
    return {
      assets: [],
      references: [],
      cleanedText: ''
    };
  }

  // Extract assets from the response
  const extractedAssets = extractAssets(response);
  
  // Create a map of asset names to their IDs for reference replacement
  const assetMap = new Map<string, string>();

  console.log('Extracted assets:', extractedAssets);
  
  // Filter out invalid assets
  const validAssets = await Promise.all(
    extractedAssets.map(async (asset) => {
      try {
        const isValid = await validateAsset(asset);
        return isValid ? asset : null;
      } catch (error) {
        console.warn(`Error validating asset ${asset.name}:`, error);
        return null;
      }
    })
  );
  
  // Create assets and references
  const assets: Asset[] = [];
  const references: AssetReference[] = [];
  
  for (const asset of validAssets) {
    if (!asset) continue;
    
    try {
      const createdAsset = createAsset(asset, projectId, messageId);
      assets.push(createdAsset);
      assetMap.set(asset.name, createdAsset.id);
      
      const reference = createAssetReference(
        messageId,
        createdAsset.id,
        createdAsset.current_version,
        'creation'
      );
      references.push(reference);
    } catch (error) {
      console.warn(`Error creating asset ${asset.name}:`, error);
    }
  }
  
  const cleanedText = replaceAssetBlocks(response, assetMap);
  
  return {
    assets,
    references,
    cleanedText
  };
} 