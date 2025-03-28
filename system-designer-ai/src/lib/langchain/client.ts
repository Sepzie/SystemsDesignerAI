import { ChatOpenAI } from 'langchain/chat_models/openai';
import { config } from './config';
import { getPromptTemplate } from './prompts';

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
    const formattedPrompt = await prompt.format({
      systemMessage: config.systemMessage,
      context,
      question: message,
    });

    const response = await this.model.call([
      {
        role: 'system',
        content: config.systemMessage,
      },
      {
        role: 'user',
        content: formattedPrompt,
      },
    ]);

    return {
      text: response.content,
      usage: response.usage,
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