import { z } from 'zod';

// Environment variable schema
const envSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  MOCK_AI: z.string().optional().default('false'),
});

// Parse and validate environment variables
const env = envSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MOCK_AI: process.env.MOCK_AI,
});

export const config = {
  // Whether to use mock implementation
  useMock: env.MOCK_AI === 'true',
  
  // OpenAI configuration
  openai: {
    apiKey: env.OPENAI_API_KEY,
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2000,
  },

  // System message for the AI assistant
  systemMessage: `You are an expert AI system designer assistant. Your role is to help users design, 
  analyze, and improve their software systems. You should provide clear, practical advice while 
  considering scalability, maintainability, and best practices.`,

  // Default prompt template
  defaultPrompt: `As an AI system designer assistant, I'll help you with your system design questions.
  Please provide your question or describe the system you'd like to design, and I'll guide you through 
  the process.`,
} as const; 