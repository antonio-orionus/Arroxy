import path from 'node:path';
import { defineConfig } from 'vitest/config';

const alias = {
  '@main': path.resolve('src/main'),
  '@preload': path.resolve('src/preload'),
  '@renderer': path.resolve('src/renderer/src'),
  '@shared': path.resolve('src/shared')
};

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { alias },
        test: {
          name: 'node',
          globals: true,
          include: ['tests/**/*.test.ts'],
          environment: 'node',
          setupFiles: ['tests/setup.ts']
        }
      },
      {
        resolve: { alias },
        test: {
          name: 'jsdom',
          globals: true,
          include: ['tests/**/*.test.tsx'],
          environment: 'jsdom',
          setupFiles: ['tests/setup.ts']
        }
      }
    ]
  }
});
