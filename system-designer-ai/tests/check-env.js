// Simple script to check if environment variables are loaded properly
require('dotenv').config({ path: '.env.test' });

console.log('Checking environment variables for testing:');
console.log('-----------------------------------------');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '❌ Missing (optional)');
console.log('-----------------------------------------');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Error: Required environment variables are missing!');
  console.log('Make sure you have a .env.test file in the project root with these variables set.');
  console.log('Example .env.test file:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-key (optional)');
  process.exit(1);
} else {
  console.log('Environment variables are set correctly! ✅');
} 