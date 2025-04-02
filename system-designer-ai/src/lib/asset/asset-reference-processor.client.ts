import { AssetReference, Asset } from '@/types/asset';
import { getAsset } from '@/lib/api-client';

/**
 * Extracts asset references from message content
 * @param content The message content to extract references from
 * @param messageId The ID of the message containing the references
 * @returns Array of AssetReference objects
 */
export function extractAssetReferences(content: string, messageId: string): AssetReference[] {
  const assetReferenceRegex = /\[See asset: ([^\]]+)\]\(([a-f0-9-]+)\)/g;
  const references: AssetReference[] = [];
  let match;

  console.log(`[Asset Reference Processor] Extracting references from message ${messageId}`);

  while ((match = assetReferenceRegex.exec(content)) !== null) {
    const [_, title, assetId] = match;
    const reference: AssetReference = {
      id: crypto.randomUUID(),
      message_id: messageId,
      asset_id: assetId,
      version_referenced: 1, // Default to version 1 for now
      reference_type: 'mention'
    };
    references.push(reference);
    console.log(`[Asset Reference Processor] Found reference: ${title} (${assetId})`);
  }

  console.log(`[Asset Reference Processor] Found ${references.length} references in total`);
  return references;
}

/**
 * Fetches the actual assets for a list of references
 * @param assetReferences Array of AssetReference objects
 * @param projectId The project ID to fetch assets from
 * @returns Promise resolving to array of objects containing references and their assets
 */
export async function fetchReferencedAssets(
  assetReferences: AssetReference[],
  projectId: string
): Promise<Array<{ reference: AssetReference; asset: Asset } | null>> {
  console.log(`[Asset Reference Processor] Fetching ${assetReferences.length} assets for project ${projectId}`);
  
  try {
    const results = await Promise.all(
      assetReferences.map(async (reference) => {
        try {
          const asset = await getAsset(projectId, reference.asset_id);
          if (!asset) {
            console.error(`[Asset Reference Processor] Asset ${reference.asset_id} not found`);
            return null;
          }
          console.log(`[Asset Reference Processor] Successfully fetched asset ${reference.asset_id}`);
          return { reference, asset };
        } catch (error) {
          console.error(`[Asset Reference Processor] Error fetching asset ${reference.asset_id}:`, error);
          return null;
        }
      })
    );

    const successfulFetches = results.filter(result => result !== null).length;
    console.log(`[Asset Reference Processor] Successfully fetched ${successfulFetches} out of ${assetReferences.length} assets`);
    
    return results;
  } catch (error) {
    console.error('[Asset Reference Processor] Error in fetchReferencedAssets:', error);
    return assetReferences.map(() => null);
  }
} 