
export interface AssetMetadata {
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

export interface StoredAsset {
  id: string;
  project_id: string;
  name: string;
  asset_type: AssetType;
  current_content: string;
  current_version: number;
  created_at: Date;
  updated_at: Date;
  metadata: AssetMetadata;
}

export interface AssetExtractionResult {
  assets: StoredAsset[];
  references: AssetReference[];
  cleanedText: string;
}

export interface MermaidValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}export interface Asset {
  type: AssetType;
  name: string;
  content: string;
  description?: string;
}
export type AssetType = 'mermaid_diagram' |
  'system_context' |
  'component_diagram' |
  'data_model' |
  'sequence_diagram' |
  'state_diagram' |
  'deployment_diagram';
 