export type AssetType = 
  | 'mermaid_diagram'
  | 'system_context'
  | 'component_diagram'
  | 'data_model'
  | 'sequence_diagram'
  | 'state_diagram'
  | 'deployment_diagram';

export interface ExtractedAsset {
  type: AssetType;
  name: string;
  content: string;
  description?: string;
}

export interface AssetMetadata {
  language?: string;
  created_at: Date;
  updated_at: Date;
  created_by_message_id: string;
  version_number: number;
  reference_type: 'creation' | 'modification' | 'mention';
}

export interface AssetVersion {
  id: string;
  asset_id: string;
  version_number: number;
  content: string;
  created_by_message_id: string;
  created_at: Date;
}

export interface AssetReference {
  id: string;
  message_id: string;
  asset_id: string;
  version_referenced: number;
  reference_type: 'creation' | 'modification' | 'mention';
}

export interface Asset {
  id: string;
  project_id: string;
  name: string;
  type: AssetType;
  content: string;
  current_version: number;
  description?: string;
  metadata: AssetMetadata;
  created_at: Date;
  updated_at: Date;
}

export interface AssetExtractionResult {
  assets: Asset[];
  references: AssetReference[];
  cleanedText: string;
}

export interface MermaidValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

export interface AssetContextType {
  // Asset state
  assets: Asset[];
  selectedAsset: Asset | null;
  isLoading: boolean;
  error: string | null;

  // Asset operations
  selectAsset: (assetOrId: Asset | string | null) => void;
  createAsset: (assetData: Omit<Asset, 'id' | 'project_id' | 'current_version' | 'metadata' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateAsset: (assetId: string, assetData: Partial<Asset>) => Promise<void>;
  deleteAsset: (assetId: string) => Promise<void>;
  loadAssets: () => Promise<void>;

  // Asset versioning
  getAssetVersion: (assetId: string, versionNumber: number) => Promise<AssetVersion | null>;
  getAssetVersions: (assetId: string) => Promise<AssetVersion[]>;

  // Asset validation
  validateMermaidDiagram: (content: string) => Promise<MermaidValidationResult>;
}