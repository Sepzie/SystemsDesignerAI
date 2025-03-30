import { defineConfig } from 'cypress';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

export default defineConfig({
  e2e: {
    baseUrl: process.env.NEXT_APP_URL,
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      // Add any custom plugins or event listeners here
      on('task', {
        // Add custom tasks if needed
      });

      // Add environment variables from .env.test
      config.env = {
        ...config.env,
        ...process.env,
      };

      return config;
    },
  },
  env: {
    // Default test environment variables
    apiUrl: 'http://localhost:3000/api',
  },
  retries: {
    runMode: 2,
    openMode: 0,
  },
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 30000,
}); 