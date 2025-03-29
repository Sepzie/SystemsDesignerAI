import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { config } from './config';
import { 
  getPromptTemplate,
  DesignPromptInput,
  ReviewPromptInput,
  SelectionPromptInput,
  AssetGenerationInput
} from './prompts';
import { AssetType } from '@/types/asset';
import { processAIResponse } from './asset-extraction';
import { AssetService } from '../asset/asset-service';
import { Message, ChatResponse } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import { SYSTEM_MESSAGE } from './prompts';

const assetService = new AssetService();

// Mock implementation for development/testing
class MockLangChainClient {
  async processMessage(message: string, context: string = ''): Promise<ChatResponse> {
    return {
      message: {
        id: uuidv4(),
        conversation_id: 'mock-conv',
        role: 'assistant',
        content: `Mock response for: ${message}\nContext: ${context}`,
        created_at: new Date().toISOString()
      }
    };
  }
}

// Real LangChain implementation
class LangChainClient {
  private model: ChatOpenAI;

  constructor() {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key is required for real implementation');
    }

    this.model = new ChatOpenAI({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.model,
      temperature: config.openai.temperature,
      maxTokens: config.openai.maxTokens,
    });
  }

  async processMessage(
    message: string,
    context: string = '',
    type: 'design' | 'review' | 'selection' | 'asset' = 'design',
    projectId: string,
    conversationId: string,
    assetTypes?: AssetType[]
  ): Promise<ChatResponse> {
    const prompt = getPromptTemplate(type);
    
    // Format the prompt based on the type
    let formattedPrompt: string;
    switch (type) {
      case 'design': {
        const designPrompt = prompt as PromptTemplate<DesignPromptInput>;
        formattedPrompt = await designPrompt.format({
          context,
          question: message,
        });
        break;
      }
      case 'review': {
        const reviewPrompt = prompt as PromptTemplate<ReviewPromptInput>;
        formattedPrompt = await reviewPrompt.format({
          architecture: context,
          reviewRequest: message,
        });
        break;
      }
      case 'selection': {
        const selectionPrompt = prompt as PromptTemplate<SelectionPromptInput>;
        formattedPrompt = await selectionPrompt.format({
          requirements: message,
          constraints: context,
        });
        break;
      }
      case 'asset': {
        const assetPrompt = prompt as PromptTemplate<AssetGenerationInput>;
        formattedPrompt = await assetPrompt.format({
          context,
          question: message,
          assetTypes: assetTypes?.join(', ') || 'all',
        });
        break;
      }
      default:
        throw new Error(`Unsupported prompt type: ${type}`);
    }

    // Log the final prompt before sending to OpenAI
    console.log('\n=== AI Prompt Details ===');
    console.log('Type:', type);
    console.log('System Message:', SYSTEM_MESSAGE);
    console.log('Formatted Prompt:', formattedPrompt);
    console.log('Context Length:', context.length);
    console.log('Message Length:', message.length);
    console.log('Total Prompt Length:', formattedPrompt.length);
    console.log('========================\n');

    const response = await this.model.invoke([
      {
        role: 'system',
        content: SYSTEM_MESSAGE,
      },
      {
        role: 'user',
        content: formattedPrompt,
      },
    ]);

    // Get the last message's content and ensure it's a string
    const content = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);
    
    // Process the response to extract assets and clean text
    const { cleanedText, assets, references } = await processAIResponse(
      content,
      projectId,
      conversationId
    );

    // Create the message object
    const messageId = uuidv4();
    const messageObj: Message = {
      id: messageId,
      conversation_id: conversationId,
      role: 'assistant',
      content: cleanedText,
      metadata: {
        assets: references,
        tokens: {
          prompt: 0, // These would come from the actual API response
          completion: 0,
          total: 0,
        }
      },
      created_at: new Date().toISOString()
    };

    return {
      message: messageObj,
      assets: assets.map(asset => ({
        id: asset.id,
        type: asset.asset_type,
        name: asset.name,
        content: asset.current_content
      }))
    };
  }
}

// Export the appropriate client based on configuration
export const langChainClient = config.useMock
  ? new MockLangChainClient()
  : new LangChainClient(); 