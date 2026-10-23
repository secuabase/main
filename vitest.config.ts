import { config } from 'dotenv';
import { defineConfig } from 'vitest/config';

// RLS tests talk to the Supabase project named in .env.local.
config({ path: '.env.local', quiet: true });

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    testTimeout: 20000,
    hookTimeout: 20000,
    // Role files write and restore the same seed rows; run them one at a time.
    fileParallelism: false,
  },
});
