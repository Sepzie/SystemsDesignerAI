import { Asset, AssetType } from './asset';
import { Message } from './chat';
import { Project } from './project';

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