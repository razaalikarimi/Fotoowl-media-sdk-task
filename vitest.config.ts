import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'packages/*/tests/**/*.test.ts',
      'packages/*/tests/**/*.test.tsx',
    ],
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.ts', 'packages/*/src/**/*.tsx'],
      exclude: ['**/index.ts', '**/*.d.ts'],
    },
  },
});
