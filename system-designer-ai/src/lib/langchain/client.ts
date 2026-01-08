import { ChatOpenAI } from '@langchain/openai';
import { config } from './config';
import { 
  systemDesignPrompt,
} from './prompts';
import { processAIResponse as processAIResponseAssets } from './asset-extraction';
import { AssetService } from '../asset/asset-service.server';
import { Message } from '@/types/base-types';
import { v4 as uuidv4 } from 'uuid';
import { SYSTEM_MESSAGE } from './prompts';
import { formatCompleteContext, buildConversationContext } from './context';

const assetService = new AssetService();


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

  async respondToUserMessage(
    userMessage: string,
    projectId: string,
    conversationId: string,
  ): Promise<Message> {
    // Build conversation context
    console.log('Building conversation context...');
    const conversationContext = await buildConversationContext(
      projectId,
      conversationId
    );
    
    // Format the context for the AI
    const context = formatCompleteContext(conversationContext);
    
    // Format the prompt
    const formattedPrompt = await systemDesignPrompt.format({
      context,
      question: userMessage, // The question is already included in the conversation context
    });

    // Log the final prompt before sending to OpenAI
    console.log('\n=== AI Prompt Details ===');
    console.log('Context Length:', context.length);
    console.log('Total Prompt Length:', formattedPrompt.length);
    console.log('Prompt:', formattedPrompt);
    console.log('========================\n');

    // const response = MOCK_LLM_RESPONSE_MARKDOWN_WITH_DIAGRAM;
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

    console.log('--- AI Response ---:', content);
    
    // Process the response to extract assets and clean text
    const { assets, cleanedText, assetIds } = await processAIResponseAssets(
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
        assetIds,
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
export const langChainClient = new LangChainClient(); 
