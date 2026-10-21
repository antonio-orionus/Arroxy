import {fileURLToPath} from 'node:url'
import {defineConfig} from 'vite-plus'

export default defineConfig({
	// Tests read arroxy-control from its sources, as the type check does, so they need no build of it.
	test: {include: ['tests/**/*.test.ts'], environment: 'node', alias: {'arroxy-control': fileURLToPath(new URL('../arroxy-control/src/index.ts', import.meta.url))}},
	pack: {
		// One executable: the MCP server and the CLI share it.
		entry: ['src/cli.ts'],
		format: ['esm'],
		platform: 'node',
		// Keep `cli.js`: package.json `bin` points at it.
		fixedExtension: false,
		dts: false,
		clean: true,
		sourcemap: true,
		treeshake: true,
		target: 'node20',
		minify: false
	}
})
