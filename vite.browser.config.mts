import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: 'src/renderer',
  base: './',
  resolve: {
    alias: {
      '@renderer': path.resolve('src/renderer/src'),
      '@shared': path.resolve('src/shared')
    }
  },
  plugins: [react(), tailwindcss()],
  build: {
    outDir: path.resolve('dist-browser'),
    emptyOutDir: true
  }
});
