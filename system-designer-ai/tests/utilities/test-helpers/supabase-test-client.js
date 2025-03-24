const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL } = require('./msw-setup');
const { SupabaseMock } = require('../../mocks/supabase/supabase-mock');

/**
 * Creates a Supabase client for testing
 * @returns {import('@supabase/supabase-js').SupabaseClient | SupabaseMock}
 */
function createTestClient() {
  // Use SupabaseMock by default, but allow overriding with MSW
  if (process.env.USE_MSW_SUPABASE === 'true') {
    console.log('Using Supabase Client with MSW');
    // Use a dummy API key since MSW will intercept the requests
    return createClient(SUPABASE_URL, 'test-api-key');
  } else {
    console.log('Using Supabase Mock directly (default)');
    return new SupabaseMock();
  }
}

module.exports = { createTestClient }; 