import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@renderer': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, '../../src/shared')
    }
  },
  plugins: [react(), tailwindcss()]
});
