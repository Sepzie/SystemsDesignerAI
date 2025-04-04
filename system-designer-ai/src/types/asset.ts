import { Json } from './supabase';

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
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface AssetExtractionResult {
  assets: Asset[];
  assetIds: string[];
  cleanedText: string;
}

export interface MermaidValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

