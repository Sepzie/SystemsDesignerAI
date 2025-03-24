/**
 * Test configuration system that controls which dependencies use mocks vs. real implementations
 */
export const testConfig = {
  useMocks: {
    supabase: process.env.TEST_USE_REAL_SUPABASE !== 'true',
    openai: process.env.TEST_USE_REAL_OPENAI !== 'true',
    langchain: process.env.TEST_USE_REAL_LANGCHAIN !== 'true',
    // Add more components as needed
  },
  // Allow overriding mock settings programmatically
  setMockStatus: (
    service: 'supabase' | 'openai' | 'langchain',
    useMock: boolean
  ) => {
    testConfig.useMocks[service] = useMock;
  },
  // Reset to environment-based defaults
  resetMockSettings: () => {
    testConfig.useMocks.supabase = process.env.TEST_USE_REAL_SUPABASE !== 'true';
    testConfig.useMocks.openai = process.env.TEST_USE_REAL_OPENAI !== 'true';
    testConfig.useMocks.langchain = process.env.TEST_USE_REAL_LANGCHAIN !== 'true';
  },
  // Get a descriptive string of which services are mocked
  getMockStatusDescription: () => {
    const mockStatus = Object.entries(testConfig.useMocks)
      .map(([service, isMocked]) => `${service}: ${isMocked ? 'MOCK' : 'REAL'}`)
      .join(', ');
    return `Test running with: ${mockStatus}`;
  }
}; 