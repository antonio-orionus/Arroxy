import path from 'node:path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@main': path.resolve('src/main'),
        '@shared': path.resolve('src/shared')
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        '@preload': path.resolve('src/preload'),
        '@shared': path.resolve('src/shared')
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': path.resolve('src/renderer/src'),
        '@shared': path.resolve('src/shared')
      }
    },
    plugins: [react(), tailwindcss()]
  }
});
