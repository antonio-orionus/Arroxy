import {readdirSync, readFileSync} from 'node:fs'
import path from 'node:path'
import {describe, expect, it} from 'vite-plus/test'

// `useAppStore()` with no selector subscribes a component to the whole store,
// so every queue progress event re-renders it. Pick a field, or several with
// useShallow. tests/renderer/store-subscription-renders.test.tsx measures it.

const RENDERER_SRC = path.resolve('src/renderer/src')
const BARE_STORE_HOOK = /\buseAppStore\(\s*\)/g

function bareCalls(): string[] {
	const hits: string[] = []
	for (const entry of readdirSync(RENDERER_SRC, {recursive: true, encoding: 'utf8'})) {
		if (!/\.tsx?$/.test(entry)) continue
		// Whole-file match: `\s` spans newlines, so a call split across lines counts too.
		const source = readFileSync(path.join(RENDERER_SRC, entry), 'utf8')
		for (const match of source.matchAll(BARE_STORE_HOOK)) {
			const line = source.slice(0, match.index).split('\n').length
			hits.push(`${entry.split(path.sep).join('/')}:${line}`)
		}
	}
	return hits.sort()
}

describe('store selectors', () => {
	it('no renderer component subscribes to the whole store', () => {
		expect(bareCalls()).toEqual([])
	})
})
