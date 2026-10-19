import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {defineConfig} from 'vite-plus'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import Icons from 'unplugin-icons/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	resolve: {
		alias: [
			{find: '@renderer', replacement: path.resolve(__dirname, 'src')},
			{find: '@shared', replacement: path.resolve(__dirname, '../../src/shared')},
			{find: /^yt-dlp-bridge\/(.+)$/, replacement: `${path.resolve(__dirname, '../../packages/yt-dlp-bridge/src')}/$1.ts`},
			{find: /^ytdlp-errors$/, replacement: path.resolve(__dirname, '../../packages/ytdlp-errors/src/index.ts')}
		]
	},
	plugins: [react(), tailwindcss(), Icons({compiler: 'jsx', jsx: 'react'})]
})
