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
		const lines = readFileSync(path.join(RENDERER_SRC, entry), 'utf8').split('\n')
		lines.forEach((line, index) => {
			if (BARE_STORE_HOOK.test(line)) hits.push(`${entry.split(path.sep).join('/')}:${index + 1}`)
			BARE_STORE_HOOK.lastIndex = 0
		})
	}
	return hits.sort()
}

describe('store selectors', () => {
	it('no renderer component subscribes to the whole store', () => {
		expect(bareCalls()).toEqual([])
	})
})
