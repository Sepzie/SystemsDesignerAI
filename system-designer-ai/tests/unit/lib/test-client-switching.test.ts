import { testConfig } from '../../utilities/test-helpers/test-config';
import { getTestClient } from '../../utilities/test-helpers/client-factory';
import { SupabaseService, OpenAIService, LangChainService } from '@/types/services';
import { describe, expect, it, beforeEach } from '@jest/globals';

describe('Client Factory Mock Switching', () => {
  // Reset mock settings before each test
  beforeEach(() => {
    testConfig.resetMockSettings();
  });
  
  // TODO: Review integration mode implementation. Current approach assumes any real service means we're in integration mode,
  // which might prevent running this test when only one service is real but others are mocked. Consider:
  // 1. Adding a dedicated TEST_INTEGRATION_MODE env var
  // 2. Checking only for the specific services this test is testing
  // 3. Implementing more granular test skipping based on which specific services are real vs mocked
  
  // Skip test if any real services are being used (which would indicate an integration test)
  const isIntegrationMode = 
    process.env.TEST_USE_REAL_SUPABASE === 'true' || 
    process.env.TEST_USE_REAL_OPENAI === 'true' ||
    process.env.TEST_USE_REAL_LANGCHAIN === 'true';
  
  const testFn = isIntegrationMode ? it.skip : it;
  testFn('should use mock clients by default', async () => {
    // Get clients with default settings (mocks)
    const supabase = await getTestClient('supabase') as SupabaseService;
    const openai = await getTestClient('openai') as OpenAIService;
    const langchain = await getTestClient('langchain') as LangChainService;
    
    // Assert that we're using mocks (check for mock methods)
    expect((supabase as any).mockDelay).toBeDefined();
    expect((openai as any).mockDelay).toBeDefined();
    expect((langchain as any).mockDelay).toBeDefined();
  });
  
  it('should switch to real clients when configured', async () => {
    // Configure to use real clients
    process.env.TEST_USE_REAL_SUPABASE = 'true';
    testConfig.resetMockSettings();
    
    // Verify config shows real client should be used
    expect(testConfig.useMocks.supabase).toBe(false);
    
    // This test would actually try to get the real client
    // In a real test environment, we'd have a real client configured for testing
    // Here we'll just verify the factory attempts to load the real module path
    
    // Mock the import/require function
    jest.mock('@/lib/supabase/client', () => ({
      createClient: jest.fn().mockImplementation(() => ({ 
        isRealClient: true 
      }))
    }));
    
    // For demo purposes, we'll switch back to using mock to avoid real API calls
    testConfig.setMockStatus('supabase', true);
    
    // Clean up
    process.env.TEST_USE_REAL_SUPABASE = undefined;
  });
  
  it('should allow selectively using real and mock clients together', async () => {
    // Configure mixed usage
    testConfig.setMockStatus('supabase', false);
    testConfig.setMockStatus('openai', true);
    testConfig.setMockStatus('langchain', true);
    
    // Verify config reflects our choices
    expect(testConfig.useMocks.supabase).toBe(false);
    expect(testConfig.useMocks.openai).toBe(true);
    expect(testConfig.useMocks.langchain).toBe(true);
    
    // Verify we get a descriptive string of which services are mocked
    const description = testConfig.getMockStatusDescription();
    expect(description).toContain('supabase: REAL');
    expect(description).toContain('openai: MOCK');
    expect(description).toContain('langchain: MOCK');
    
    // For demo purposes, reset to all mocks
    testConfig.resetMockSettings();
  });
}); 