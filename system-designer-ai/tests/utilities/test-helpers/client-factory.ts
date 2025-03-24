import { testConfig } from './test-config';

// Import client interfaces
import type { SupabaseClient } from '@supabase/supabase-js';

// Type for supported client types
export type ClientType = 'supabase' | 'openai' | 'langchain';

/**
 * Gets a client (either mock or real) based on test configuration
 */
export async function getTestClient(clientType: ClientType): Promise<any> {
  const useMock = testConfig.useMocks[clientType];
  
  if (useMock) {
    return getMockClient(clientType);
  } else {
    return getRealClient(clientType);
  }
}

/**
 * Gets a mock client for the specified type
 */
async function getMockClient(clientType: ClientType): Promise<any> {
  switch (clientType) {
    case 'supabase':
      const supabaseMock = await import('../../mocks/supabase/supabase-mock');
      return new supabaseMock.SupabaseMock();
    case 'openai':
      const openaiMock = await import('../../mocks/openai/openai-mock');
      return new openaiMock.OpenAIMock();
    case 'langchain':
      const langchainMock = await import('../../mocks/langchain/langchain-mock');
      return new langchainMock.LangChainMock();
    default:
      throw new Error(`Unknown client type: ${clientType}`);
  }
}

/**
 * Gets a real client for the specified type
 */
async function getRealClient(clientType: ClientType): Promise<any> {
  switch (clientType) {
    case 'supabase':
      const supabaseClient = await import('@/lib/supabase/client');
      return supabaseClient.createClient();
    case 'openai':
      const openaiClient = await import('@/lib/openai/client');
      return openaiClient.createClient();
    case 'langchain':
      const langchainClient = await import('@/lib/langchain/client');
      return langchainClient.createClient();
    default:
      throw new Error(`Unknown client type: ${clientType}`);
  }
}

/**
 * Helper to reset all clients (useful between tests)
 */
export function resetAllClients(): void {
  // This would clear any cached client instances
  console.log('Resetting all test clients');
} 