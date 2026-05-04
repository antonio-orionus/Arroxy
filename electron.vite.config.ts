import path from 'node:path';
import { defineConfig, externalizeDepsPlugin, loadEnv } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // Inline APTABASE_KEY from .env at build time. Without this, process.env.APTABASE_KEY
  // is undefined in the packaged app (no shell env to read from), and analytics silently
  // never initialize. Empty-string prefix loads all keys regardless of VITE_/MAIN_VITE_ prefix.
  const env = loadEnv(mode, '.', '');
  const aptabaseKey = env.APTABASE_KEY ?? process.env.APTABASE_KEY ?? '';

  return {
    main: {
      plugins: [externalizeDepsPlugin()],
      define: {
        'process.env.APTABASE_KEY': JSON.stringify(aptabaseKey),
      },
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
  };
});
