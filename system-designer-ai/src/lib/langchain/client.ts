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
import { AssetReference, AssetType } from '@/types/asset';
import { processAIResponse as processAIResponseAssets } from './asset-extraction';
import { AssetService } from '../asset/asset-service.server';
import { Message } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import { SYSTEM_MESSAGE } from './prompts';
import { MOCK_LLM_RESPONSE_MARKDOWN_WITH_DIAGRAM } from './api-mocks';
import { formatCompleteContext } from './context';
import { buildConversationContext } from './context';
import App from 'next/app';

const assetService = new AssetService();

// Mock implementation for development/testing
class MockLangChainClient {
  async processMessage(message: string, context: string = ''): Promise<Message> {
    return {
      id: uuidv4(),
      conversation_id: 'mock-conv',
      role: 'assistant',
      content: `Mock response for: ${message}\nContext: ${context}`,
      created_at: new Date().toISOString()
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
    type: 'design' | 'review' | 'selection' | 'asset' = 'design',
    projectId: string,
    conversationId: string,
    assetTypes?: AssetType[]
  ): Promise<Message> {
    const prompt = getPromptTemplate(type);

    // Build conversation context
    console.log('Building conversation context...');
    const conversationContext = await buildConversationContext(
      projectId,
      conversationId
    );
    
    // Format the context for the AI
    const context = formatCompleteContext(conversationContext);
    
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
    console.log('Context Length:', context.length);
    console.log('Message Length:', message.length);
    console.log('Total Prompt Length:', formattedPrompt.length);
    console.log('========================\n');

    const response = MOCK_LLM_RESPONSE_MARKDOWN_WITH_DIAGRAM;
    // await this.model.invoke([
    //   {
    //     role: 'system',
    //     content: SYSTEM_MESSAGE,
    //   },
    //   {
    //     role: 'user',
    //     content: formattedPrompt,
    //   },
    // ]);

    // Get the last message's content and ensure it's a string
    const content = typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content);
    
    // Process the response to extract assets and clean text
    const { assets, cleanedText,  references } = await processAIResponseAssets(
      content,
      projectId,
      conversationId
    );

    // Store the extracted assets in db
    for (const asset of assets) {
      try {
        await assetService.storeAsset(asset);
      } catch (error) {
        console.error('Failed to store asset:', error);
        // Continue processing other assets even if one fails
      }
    }



    // Create the message object
    const messageId = uuidv4();
    const messageObj: Message = {
      id: messageId,
      conversation_id: conversationId,
      role: 'assistant',
      content: cleanedText,
      metadata: {
        asset_references: references,
        tokens: {
          prompt: 0, // These would come from the actual API response
          completion: 0,
          total: 0,
        }
      },
      created_at: new Date().toISOString()
    };

    return messageObj;
  }
}

// Export the appropriate client based on configuration
export const langChainClient = config.useMock
  ? new MockLangChainClient()
  : new LangChainClient(); 