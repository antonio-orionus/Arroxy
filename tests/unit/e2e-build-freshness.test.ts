import {describe, expect, it} from 'vitest'
import {findStaleBuild} from '../e2e/buildFreshness.js'

describe('findStaleBuild', () => {
	it('reports the newest source file edited after the build', () => {
		const sources = [
			{path: 'src/main/a.ts', mtimeMs: 100},
			{path: 'src/main/b.ts', mtimeMs: 300},
			{path: 'src/main/c.ts', mtimeMs: 250}
		]
		expect(findStaleBuild(200, sources)).toEqual({path: 'src/main/b.ts', mtimeMs: 300})
	})

	it('accepts a build newer than every source file', () => {
		expect(findStaleBuild(400, [{path: 'src/main/a.ts', mtimeMs: 399}])).toBeNull()
	})

	it('treats a missing build as stale-free — the launch itself reports it', () => {
		expect(findStaleBuild(null, [{path: 'src/main/a.ts', mtimeMs: 1}])).toBeNull()
	})
})
