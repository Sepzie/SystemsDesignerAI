import { Asset } from '@/types/base-types';
import { getAsset } from '@/lib/api-client';

/**
 * Extracts asset IDs from message content
 * @param content The message content to extract IDs from
 * @param messageId The ID of the message containing the IDs
 * @returns Array of asset IDs
 */
export function extractAssetIds(content: string, messageId: string): string[] {
  const assetReferenceRegex = /\[See asset: ([^\]]+)\]\(([a-zA-Z0-9-]+)\)/g;
  const assetIds: string[] = [];
  let match;

  console.log(`[ASSET SERVICE] Extracting asset IDs from message ${messageId}`);

  while ((match = assetReferenceRegex.exec(content)) !== null) {
    const [_, title, assetId] = match;
    assetIds.push(assetId);
    console.log(`[ASSET SERVICE] Found asset ID: ${assetId} (${title})`);
  }

  console.log(`[ASSET SERVICE] Found ${assetIds.length} asset IDs in total`);
  return assetIds;
}

/**
 * Fetches assets by their IDs
 * @param assetIds Array of asset IDs to fetch
 * @param projectId The project ID
 * @returns Array of assets
 */
export async function fetchAssetsByIds(assetIds: string[], projectId: string): Promise<Asset[]> {
  console.log(`[ASSET SERVICE] Fetching ${assetIds.length} assets for project ${projectId}`);
  
  const assets: Asset[] = [];
  
  for (const assetId of assetIds) {
    try {
      const asset = await getAsset(projectId, assetId);
      if (asset) {
        assets.push(asset);
        console.log(`[ASSET SERVICE] Successfully fetched asset ${assetId}`);
      }
    } catch (error) {
      console.error(`[ASSET SERVICE] Failed to fetch asset ${assetId}:`, error);
    }
  }
  
  console.log(`[ASSET SERVICE] Successfully fetched ${assets.length} assets`);
  return assets;
} 