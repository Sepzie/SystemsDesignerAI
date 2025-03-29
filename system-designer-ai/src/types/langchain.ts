import { Message } from './chat';
import { Project } from './project';

export type AssetType = 
  | 'mermaid_diagram'
  | 'system_context'
  | 'component_diagram'
  | 'data_model'
  | 'sequence_diagram'
  | 'state_diagram'
  | 'deployment_diagram';

export interface Asset {
  type: AssetType;
  name: string;
  content: string;
  description?: string;
}

export interface ConversationContext {
  messages: Message[];
  projectDetails?: Pick<Project, 'name' | 'description' | 'tech_stack'>;
}

export interface LangChainResponse {
  text: string;
  assets?: Asset[];
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AssetGenerationInput {
  context: string;
  question: string;
  assetTypes?: AssetType[];
} 