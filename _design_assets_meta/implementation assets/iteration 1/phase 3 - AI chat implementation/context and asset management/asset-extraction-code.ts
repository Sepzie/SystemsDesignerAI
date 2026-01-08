/**
 * Asset extraction and processing logic for AI System Designer
 */

// Types for assets and responses
interface ExtractedAsset {
  type: AssetType;
  content: string;
  metadata?: Record<string, any>;
}

type AssetType = 'mermaid_diagram' | 'project_description' | 'roadmap' | 'technical_documentation' | 'implementation_prompt';

interface ProcessedResponse {
  message: string;
  assets: ExtractedAsset[];
}

/**
 * Extracts assets from the AI response and processes the message
 * to replace raw asset content with references
 */
export function extractAssetsFromResponse(response: string): ProcessedResponse {
  // Regex to find assets in the specified format
  const assetRegex = /--- ASSET: \[([^\]]+)\] ---\n([\s\S]*?)--- END ASSET ---/g;
  const extractedAssets: ExtractedAsset[] = [];
  let processedMessage = response;
  
  // Find all asset blocks and extract them
  let match;
  while ((match = assetRegex.exec(response)) !== null) {
    const assetType = match[1] as AssetType;
    const assetContent = match[2].trim();
    
    // Validate asset type
    if (!isValidAssetType(assetType)) {
      console.warn(`Invalid asset type detected: ${assetType}`);
      continue;
    }
    
    // Add to extracted assets
    extractedAssets.push({
      type: assetType,
      content: assetContent
    });
    
    // Replace the asset content with a placeholder reference
    // This will be replaced with proper UI component on the client
    processedMessage = processedMessage.replace(
      match[0],
      `[ASSET:${extractedAssets.length - 1}:${assetType}]`
    );
  }
  
  return {
    message: processedMessage,
    assets: extractedAssets
  };
}

/**
 * Validates the asset type is one of the supported types
 */
function isValidAssetType(type: string): type is AssetType {
  const validTypes: AssetType[] = [
    'mermaid_diagram',
    'project_description',
    'roadmap',
    'technical_documentation',
    'implementation_prompt'
  ];
  
  return validTypes.includes(type as AssetType);
}

/**
 * Handles storage of extracted assets in the database
 * and creates proper references
 */
export async function storeExtractedAssets(
  extractedAssets: ExtractedAsset[],
  projectId: string,
  messageId: string
): Promise<Record<number, string>> {
  const assetIds: Record<number, string> = {};
  
  for (let i = 0; i < extractedAssets.length; i++) {
    const asset = extractedAssets[i];
    
    // Store the asset
    const assetId = await createAsset(
      projectId,
      asset.type,
      asset.content,
      messageId
    );
    
    // Store the index to asset ID mapping
    assetIds[i] = assetId;
  }
  
  return assetIds;
}

/**
 * Creates a new asset or updates an existing one based on similarity
 */
async function createAsset(
  projectId: string,
  assetType: AssetType,
  content: string,
  messageId: string
): Promise<string> {
  // Check for similar existing assets to update instead of creating new
  const similarAsset = await findSimilarAsset(projectId, assetType, content);
  
    // Create new asset
    const assetId = await createNewAsset(projectId, assetType, content);
    
    // Create initial version
    await createAssetVersion(assetId, content, messageId);
    
    // Create reference to the new asset
    await createAssetReference(messageId, assetId, 'creation');
    
    return assetId;
  
}

/**
 * Finds similar existing assets to potentially update instead of creating new ones
 * Uses simple similarity check for diagrams and text comparison for other assets
 */
async function findSimilarAsset(
  projectId: string,
  assetType: AssetType,
  content: string
) {
  // Implementation would connect to database
  // For now, returning null to indicate no similar asset found
  return null;
}

/**
 * Creates a new asset in the database
 */
async function createNewAsset(
  projectId: string,
  assetType: AssetType,
  content: string
): Promise<string> {
  // Generate a name based on the asset type and content
  const name = generateAssetName(assetType, content);
  
  // Implementation would connect to database
  const assetId = 'asset_' + Math.random().toString(36).substring(2, 11);
  
  console.log(`Created new asset: ${name} (${assetType})`);
  
  return assetId;
}

/**
 * Creates a new version for an existing asset
 */
async function createAssetVersion(
  assetId: string,
  content: string,
  messageId: string
): Promise<void> {
  // Implementation would connect to database
  console.log(`Created new version for asset: ${assetId}`);
}

/**
 * Creates a reference between a message and an asset
 */
async function createAssetReference(
  messageId: string,
  assetId: string,
  referenceType: 'creation' | 'modification' | 'mention'
): Promise<void> {
  // Implementation would connect to database
  console.log(`Created ${referenceType} reference: message ${messageId} -> asset ${assetId}`);
}

/**
 * Generates a sensible name for a new asset based on its content
 */
function generateAssetName(assetType: AssetType, content: string): string {
  // Extract first line or diagram type to create a name
  const firstLine = content.split('\n')[0].trim();
  
  switch (assetType) {
    case 'mermaid_diagram':
      if (content.startsWith('graph')) return 'Graph Diagram';
      if (content.startsWith('flowchart')) return 'Flow Chart';
      if (content.startsWith('sequenceDiagram')) return 'Sequence Diagram';
      if (content.startsWith('classDiagram')) return 'Class Diagram';
      if (content.startsWith('erDiagram')) return 'ER Diagram';
      return 'Diagram';
      
    case 'project_description':
      return firstLine.replace(/^#\s*/, '') || 'Project Description';
      
    case 'roadmap':
      return firstLine.replace(/^#\s*/, '') || 'Project Roadmap';
      
    case 'technical_documentation':
      return firstLine.replace(/^#\s*/, '') || 'Technical Documentation';
      
    case 'implementation_prompt':
      return firstLine.replace(/^#\s*/, '') || 'Implementation Prompt';
      
    default:
      return 'Untitled Asset';
  }
}

/**
 * Reconstructs the full message with embedded assets for display
 */
export function reconstructMessageWithAssets(
  processedMessage: string,
  assetIds: Record<number, string>
): string {
  // Replace asset references with proper links or embed codes
  return processedMessage.replace(
    /\[ASSET:(\d+):([^\]]+)\]/g,
    (_, index, type) => {
      const assetId = assetIds[parseInt(index)];
      return `<div class="asset-reference" data-asset-id="${assetId}" data-asset-type="${type}"></div>`;
    }
  );
}
