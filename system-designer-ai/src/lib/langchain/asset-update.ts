import { Asset } from '@/types/base-types';
import { ExtractedAsset } from '@/types/langchain';
import { v4 as uuidv4 } from 'uuid';

/**
 * Updates an existing asset with new content
 * @param asset The asset to update
 * @param projectId The project ID
 * @param messageId The message ID that created the update
 * @returns The updated asset
 */
export async function updateAsset(
  asset: ExtractedAsset,
  projectId: string,
  messageId: string
): Promise<Asset> {
  if (!asset.semantic_id || !asset.old_str || !asset.new_str) {
    throw new Error('Missing required fields for asset update');
  }

  // In a real implementation, you would:
  // 1. Fetch the existing asset from the database
  // 2. Create a new version with the old content
  // 3. Update the asset with the new content
  // 4. Save both to the database
  
  // For now, we'll just create a new asset with the updated content
  const now = new Date().toISOString();
  const metadata = {
    created_by: messageId,
    version: 2, // Increment version
    update_from: asset.semantic_id,
    old_content: asset.old_str
  };

  return {
    id: uuidv4(), // Generate a new ID for the updated asset
    semantic_id: asset.semantic_id,
    project_id: projectId,
    name: asset.title,
    type: asset.type,
    content: asset.content.replace(asset.old_str, asset.new_str),
    metadata,
    created_at: now,
    updated_at: now,
    version: 2
  };
} 
