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

} as const; 