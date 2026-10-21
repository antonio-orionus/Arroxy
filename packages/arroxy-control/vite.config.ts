import {defineConfig} from 'vite-plus'

export default defineConfig({
	test: {include: ['tests/**/*.test.ts'], environment: 'node'},
	pack: {
		entry: ['src/index.ts'],
		format: ['esm', 'cjs'],
		// Keep `index.js` + `index.cjs` (and `index.d.ts` + `index.d.cts`): package.json `exports` points at them.
		fixedExtension: false,
		dts: true,
		clean: true,
		sourcemap: true,
		treeshake: true,
		target: 'es2022',
		minify: false
	}
})
