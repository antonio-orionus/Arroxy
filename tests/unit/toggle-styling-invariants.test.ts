import {readdirSync, readFileSync} from 'node:fs'
import path from 'node:path'
import {describe, expect, it} from 'vitest'

const RENDERER_SRC = path.resolve('src/renderer/src')
const PRIMITIVES = path.resolve('src/renderer/src/components/ui')

// The primitive already carries every one of these. A call site that restates
// them is the copy-paste that let localized labels overflow for months: the
// duplicate looks harmless, drifts from the primitive, and hides the fact that
// the wrap/shrink rules were never overridden at all.
const FORBIDDEN = ['aria-pressed:border-', 'aria-pressed:bg-', 'aria-pressed:text-', 'data-[state=on]:border-', 'data-[state=on]:bg-', 'data-[state=on]:text-']

function sourceFiles(dir: string): string[] {
	return readdirSync(dir, {recursive: true, encoding: 'utf8'})
		.map(entry => path.join(dir, entry))
		.filter(file => /\.tsx?$/.test(file) && !file.startsWith(PRIMITIVES))
}

describe('toggle styling invariants', () => {
	it('keeps pressed-state brand styling inside the ui primitives', () => {
		const offenders: string[] = []
		for (const file of sourceFiles(RENDERER_SRC)) {
			const contents = readFileSync(file, 'utf8')
			for (const token of FORBIDDEN) {
				if (contents.includes(token)) offenders.push(`${path.relative(RENDERER_SRC, file)} → ${token}`)
			}
		}
		expect(offenders).toEqual([])
	})
})
