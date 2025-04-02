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
  current_content: string;
  current_version: number;
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

