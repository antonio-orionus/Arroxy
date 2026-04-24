import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    environment: 'node',
    environmentMatchGlobs: [['tests/renderer/**/*.test.tsx', 'jsdom']],
    setupFiles: ['tests/setup.ts']
  },
  resolve: {
    alias: {
      '@main': path.resolve('src/main'),
      '@preload': path.resolve('src/preload'),
      '@renderer': path.resolve('src/renderer/src'),
      '@shared': path.resolve('src/shared')
    }
  }
});
