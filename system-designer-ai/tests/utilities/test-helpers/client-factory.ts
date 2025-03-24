import { testConfig } from './test-config';

// Import client interfaces
import type { SupabaseClient } from '@supabase/supabase-js';

// Type for supported client types
export type ClientType = 'supabase' | 'openai' | 'langchain';

/**
 * Factory function to get either a mock or real client based on test configuration
 */
export function getTestClient(clientType: ClientType): any {
  if (testConfig.useMocks[clientType]) {
    return getMockClient(clientType);
  }
  return getRealClient(clientType);
}

/**
 * Returns the appropriate mock client implementation
 */
function getMockClient(clientType: ClientType): any {
  switch (clientType) {
    case 'supabase':
      // Dynamically import to avoid loading in production
      return import('../../mocks/supabase/supabase-mock').then(
        (module) => new module.SupabaseMock()
      );
    case 'openai':
      return import('../../mocks/openai/openai-mock').then(
        (module) => new module.OpenAIMock()
      );
    case 'langchain':
      return import('../../mocks/langchain/langchain-mock').then(
        (module) => new module.LangChainMock()
      );
    default:
      throw new Error(`Unknown client type: ${clientType}`);
  }
}

/**
 * Returns the real client implementation
 */
function getRealClient(clientType: ClientType): any {
  switch (clientType) {
    case 'supabase':
      return import('@/lib/supabase/client').then(
        (module) => module.createClient()
      );
    case 'openai':
      return import('@/lib/openai/client').then(
        (module) => module.getOpenAIClient()
      );
    case 'langchain':
      return import('@/lib/langchain/client').then(
        (module) => module.getLangChainClient()
      );
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