import { AssetType } from "./base-types";
import { Asset } from './base-types';
import { Message } from './base-types';
import { Project } from "./base-types";


export interface ConversationContext {
  messages: Message[];
  projectDetails?: Pick<Project, 'name' | 'description' | 'tech_stack'>;
  assets?: Asset[];
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
export interface ExtractedAsset {
  semantic_id: string;
  type: AssetType;
  title: string;
  content: string;
  command: 'create' | 'update' | 'reference';
  old_str?: string;
  new_str?: string;
}
