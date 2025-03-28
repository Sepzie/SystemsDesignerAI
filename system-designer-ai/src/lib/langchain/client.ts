import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { config } from './config';
import { 
  getPromptTemplate,
  DesignPromptInput,
  ReviewPromptInput,
  SelectionPromptInput 
} from './prompts';

// Mock implementation for development/testing
class MockLangChainClient {
  async processMessage(message: string, context: string = '') {
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
    type: 'design' | 'review' | 'selection' = 'design'
  ) {
    const prompt = getPromptTemplate(type);
    
    // Format the prompt based on the type
    let formattedPrompt: string;
    switch (type) {
      case 'design': {
        const designPrompt = prompt as PromptTemplate<DesignPromptInput>;
        formattedPrompt = await designPrompt.format({
          systemMessage: config.systemMessage,
          context,
          question: message,
        });
        break;
      }
      case 'review': {
        const reviewPrompt = prompt as PromptTemplate<ReviewPromptInput>;
        formattedPrompt = await reviewPrompt.format({
          systemMessage: config.systemMessage,
          architecture: context,
          reviewRequest: message,
        });
        break;
      }
      case 'selection': {
        const selectionPrompt = prompt as PromptTemplate<SelectionPromptInput>;
        formattedPrompt = await selectionPrompt.format({
          systemMessage: config.systemMessage,
          requirements: message,
          constraints: context,
        });
        break;
      }
      default:
        throw new Error(`Unsupported prompt type: ${type}`);
    }

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

    // Get the last message's content
    const content = response.content;
    
    // Create a usage object based on the response
    const usage = {
      promptTokens: 0, // These would come from the actual API response
      completionTokens: 0,
      totalTokens: 0,
    };

    return {
      text: content,
      usage,
    };
  }
}

// Export the appropriate client based on configuration
export const langChainClient = config.useMock
  ? new MockLangChainClient()
  : new LangChainClient();

// Type for the client response
export interface LangChainResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
} 