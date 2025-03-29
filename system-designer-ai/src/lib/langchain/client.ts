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
import { LangChainResponse, AssetType } from '@/types/langchain';
import { processAIResponse } from './asset-extraction';

// Mock implementation for development/testing
class MockLangChainClient {
  async processMessage(message: string, context: string = ''): Promise<LangChainResponse> {
    return {
      text: `Mock response for: ${message}\nContext: ${context}`,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
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
    assetTypes?: AssetType[]
  ): Promise<LangChainResponse> {
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
    console.log('System Message:', config.systemMessage);
    console.log('Formatted Prompt:', formattedPrompt);
    console.log('Context Length:', context.length);
    console.log('Message Length:', message.length);
    console.log('Total Prompt Length:', formattedPrompt.length);
    console.log('========================\n');

    const response = await this.model.invoke([
      {
        role: 'system',
        content: config.systemMessage,
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
    const { text, assets } = processAIResponse(content);
    
    // Create a usage object based on the response
    const usage = {
      promptTokens: 0, // These would come from the actual API response
      completionTokens: 0,
      totalTokens: 0,
    };

    return {
      text,
      assets,
      usage,
    };
  }
}

// Export the appropriate client based on configuration
export const langChainClient = config.useMock
  ? new MockLangChainClient()
  : new LangChainClient(); 