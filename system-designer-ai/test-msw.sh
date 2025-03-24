#!/bin/bash
# Test script to run tests with MSW for Supabase

# Set environment variables
export NODE_ENV=test
export USE_MSW_SUPABASE=true

# Echo info
echo "Running tests with Supabase MSW"
echo "=================================="

# Run the tests
npx jest tests/unit/mocks/supabase-mock.test.ts tests/unit/lib/supabase-models.test.js tests/unit/lib/auth-flow.test.js

# Get the exit code
EXIT_CODE=$?

# Print summary
echo ""
echo "=================================="
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ All tests passed successfully!"
else
  echo "❌ Some tests failed. Please check the output for details."
fi

exit $EXIT_CODE 