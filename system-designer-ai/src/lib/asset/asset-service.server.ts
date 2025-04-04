import { createClient } from '@/lib/supabase/server';
import { 
  Asset, 
  AssetVersion, 
  AssetReference,
  AssetType 
} from '@/types/asset';
import { SupabaseClient } from '@supabase/supabase-js';

export class AssetService {
  /**
   * Stores a new asset in the database
   * @param asset The asset to store
   * @returns The stored asset
   */
  async storeAsset(asset: Asset): Promise<Asset> {
    const supabase = await createClient();
    
    const assetForDb = {
      id: asset.id,
      project_id: asset.project_id,
      name: asset.name,
      type: asset.type,
      content: asset.content,
      metadata: asset.metadata
    };

    console.log('Asset being sent to database:', assetForDb);

    const { data, error } = await supabase
      .from('assets')
      .insert([assetForDb])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }
    return data;
  }

  /**
   * Creates a new version for an existing asset
   * @param assetId The ID of the asset
   * @param content The new content
   * @param messageId The message ID that created this version
   * @returns The new version
   */
  async createAssetVersion(
    assetId: string,
    content: string,
    messageId: string
  ): Promise<AssetVersion> {
    const supabase = await createClient();
    
    // Get the current version number
    const { data: versions, error: versionError } = await supabase
      .from('asset_versions')
      .select('version_number')
      .eq('asset_id', assetId)
      .order('version_number', { ascending: false })
      .limit(1);

    if (versionError) throw versionError;

    const newVersion = versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

    // Create the new version
    const { data: version, error: insertError } = await supabase
      .from('asset_versions')
      .insert([{
        asset_id: assetId,
        version_number: newVersion,
        content,
        metadata: { created_by: messageId }
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // Update the asset's content
    const { error: updateError } = await supabase
      .from('assets')
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq('id', assetId);

    if (updateError) throw updateError;

    return version;
  }

  /**
   * Retrieves an asset by ID
   * @param assetId The ID of the asset
   * @returns The asset
   */
  async getAssetById(assetId: string): Promise<Asset | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Retrieves assets by project ID
   * @param projectId The project ID
   * @returns Array of assets
   */
  async getAssetsByProject(projectId: string): Promise<Asset[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('project_id', projectId);

    if (error) throw error;
    return data;
  }

  /**
   * Retrieves assets by type
   * @param projectId The project ID
   * @param type The asset type
   * @returns Array of assets
   */
  async getAssetsByType(
    projectId: string,
    type: AssetType
  ): Promise<Asset[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('project_id', projectId)
      .eq('type', type);

    if (error) throw error;
    return data;
  }

  /**
   * Retrieves version history for an asset
   * @param assetId The ID of the asset
   * @returns Array of versions
   */
  async getAssetVersions(assetId: string): Promise<AssetVersion[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('asset_versions')
      .select('*')
      .eq('asset_id', assetId)
      .order('version_number', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Creates a reference between an asset and a message
   * @param reference The asset reference to create
   * @returns The created reference
   */
  async createAssetReference(reference: Omit<AssetReference, 'id'>): Promise<AssetReference> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('asset_references')
      .insert([reference])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Retrieves all references for an asset
   * @param assetId The ID of the asset
   * @returns Array of references
   */
  async getAssetReferences(assetId: string): Promise<AssetReference[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('asset_references')
      .select('*')
      .eq('asset_id', assetId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Retrieves all assets referenced in a message
   * @param messageId The ID of the message
   * @returns Array of assets with their references
   */
  async getMessageAssets(messageId: string): Promise<{
    asset: Asset;
    reference: AssetReference;
  }[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('asset_references')
      .select(`
        *,
        asset:assets(*)
      `)
      .eq('message_id', messageId);

    if (error) throw error;

    return data.map((item: any) => ({
      asset: item.asset,
      reference: {
        id: item.id,
        message_id: item.message_id,
        asset_id: item.asset_id,
        version_referenced: item.version_referenced,
        reference_type: item.reference_type
      }
    }));
  }

  /**
   * Deletes an asset and all its versions
   * @param assetId The ID of the asset to delete
   */
  async deleteAsset(assetId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', assetId);

    if (error) throw error;
  }

  async getProjectAssets(projectId: string): Promise<Asset[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getAsset(id: string): Promise<Asset> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createAsset(asset: Omit<Asset, 'id'>): Promise<Asset> {
    const supabase = await createClient();
    const assetForDb = {
      project_id: asset.project_id,
      name: asset.name,
      type: asset.type,
      content: asset.content,
      metadata: asset.metadata || {}
    };

    const { data, error } = await supabase
      .from('assets')
      .insert([assetForDb])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateAsset(id: string, asset: Partial<Asset>): Promise<Asset> {
    const supabase = await createClient();
    const updateData = {
      ...(asset.name && { name: asset.name }),
      ...(asset.type && { type: asset.type }),
      ...(asset.content && { content: asset.content }),
      ...(asset.metadata && { metadata: asset.metadata }),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('assets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
} 