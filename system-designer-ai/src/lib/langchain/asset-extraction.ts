import { AssetType } from "@/types/base-types";
import { ExtractedAsset } from "@/types/langchain";
import { Asset } from '@/types/base-types';
import { AssetExtractionResult } from '@/types/langchain';
import { validateMermaidDiagram } from '../validators/mermaid-validator';
import { v4 as uuidv4 } from 'uuid';
import { updateAsset } from './asset-update';

// New regex pattern to match the XML-like function format
const ASSET_FUNCTION_PATTERN = /<function name="assets">\s*<parameter name="command">([^<]+)<\/parameter>\s*<parameter name="semantic_id">([^<]+)<\/parameter>\s*<parameter name="type">([^<]+)<\/parameter>\s*<parameter name="title">([^<]+)<\/parameter>\s*<parameter name="content">([\s\S]*?)<\/parameter>(?:\s*<parameter name="old_str">([^<]+)<\/parameter>\s*<parameter name="new_str">([^<]+)<\/parameter>)?\s*<\/function>/g;

// Pattern for asset references in the text
const ASSET_REFERENCE_PATTERN = /\[See asset: ([^\]]+)\]\(([^)]+)\)/g;

/**
 * Validates an asset based on its type
 * @param asset The asset to validate
 * @returns boolean indicating if the asset is valid
 */
async function validateAsset(asset: ExtractedAsset): Promise<boolean> {
  if (asset.type === 'mermaid') {
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
  const now = new Date().toISOString();
  const metadata = {
    created_by: messageId,
    version: 1
  };

  return {
    id: uuidv4(),
    semantic_id: asset.semantic_id,
    project_id: projectId,
    name: asset.title,
    type: asset.type,
    content: asset.content,
    metadata,
    created_at: now,
    updated_at: now
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

  while ((match = ASSET_FUNCTION_PATTERN.exec(text)) !== null) {
    const [, command, semanticId, type, title, content, oldStr, newStr] = match;

    // Validate asset type
    if (!isValidAssetType(type)) {
      console.warn(`Invalid asset type found: ${type}`);
      continue;
    }

    assets.push({
      semantic_id: semanticId.trim(),
      type: type as AssetType,
      title: title.trim(),
      content: content.trim(),
      command: command as 'create' | 'update' | 'reference',
      old_str: oldStr ? oldStr.trim() : undefined,
      new_str: newStr ? newStr.trim() : undefined
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
  const validTypes: AssetType[] = ['mermaid', 'markdown'];
  return validTypes.includes(type as AssetType);
}

/**
 * Replaces asset blocks with references in the text
 * @param text The response text from the AI
 * @param assetMap Map of asset semantic IDs to their actual IDs
 * @returns Text with asset blocks replaced by references
 */
function replaceAssetBlocks(text: string, assetMap: Map<string, string>): string {
  return text.replace(ASSET_FUNCTION_PATTERN, (match, command, semanticId, type, title) => {
    const assetId = assetMap.get(semanticId.trim());
    // If the asset is not found in the map (e.g., it was invalid or failed processing), keep the original block
    return assetId ? `[See asset: ${title}](${assetId})` : match;
  }).trim();
}

/**
 * Processes an AI response to extract assets and prepare them for storage
 * @param response The raw response from the AI
 * @param projectId The project ID
 * @param messageId The message ID that created the assets
 * @returns Object containing processed text, extracted assets, and assetIds
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
      assetIds: [],
      cleanedText: ''
    };
  }

  // Extract assets from the response
  const extractedAssets = extractAssets(response);

  // Create a map of asset semantic IDs to their actual IDs for reference replacement
  const assetMap = new Map<string, string>();

  console.log('Extracted assets:', extractedAssets);

  // Filter out invalid assets
  const validAssets = await Promise.all(
    extractedAssets.map(async (asset) => {
      try {
        const isValid = await validateAsset(asset);
        return isValid ? asset : null;
      } catch (error) {
        console.warn(`Error validating asset ${asset.title}:`, error);
        return null;
      }
    })
  );

  // Create assets
  const assets: Asset[] = [];
  const assetIds: string[] = [];

  for (const asset of validAssets) {
    if (!asset) continue;

    try {
      // Handle different commands
      if (asset.command === 'create') {
        const createdAsset = createAsset(asset, projectId, messageId);
        assets.push(createdAsset);
        assetIds.push(createdAsset.id);
        assetMap.set(asset.semantic_id, createdAsset.id); // Use semantic_id as key
      } else if (asset.command === 'update') {
        // Use the updateAsset function to handle updates
        const updatedAsset = await updateAsset(asset, projectId, messageId);
        assets.push(updatedAsset);
        assetIds.push(updatedAsset.id);
        assetMap.set(asset.semantic_id, updatedAsset.id); // Use semantic_id as key
      } else if (asset.command === 'reference') {
        // For references, we need to find the actual asset ID based on semantic ID.
        // This assumes the referenced asset already exists or is being created/updated in the same response.
        // If the reference points to an asset *not* in this response, this logic might need adjustment
        // depending on how existing assets are looked up. For now, we assume it's handled if present.
        // We store the semantic ID mapping to itself initially, it might be overwritten if a create/update
        // for the same semantic ID exists in the response. If not found, replaceAssetBlocks will handle it.
         if (!assetMap.has(asset.semantic_id)) {
             // If the semantic ID isn't already mapped (from a create/update in this batch),
             // we assume it refers to an existing asset and map the semantic ID to itself.
             // The replacement logic will look for this ID.
             // TODO: Potentially look up the *actual* asset ID from the database here if needed.
             assetMap.set(asset.semantic_id, asset.semantic_id);
         }
      }
    } catch (error) {
      console.warn(`Error processing asset ${asset.title}:`, error);
    }
  }

  const cleanedText = replaceAssetBlocks(response, assetMap);

  return {
    assets,
    assetIds,
    cleanedText
  };
} 