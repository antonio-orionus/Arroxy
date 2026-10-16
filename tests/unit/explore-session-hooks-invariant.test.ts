// @vitest-environment node
import {readdirSync, readFileSync} from 'node:fs'
import {join, relative} from 'node:path'
import {describe, expect, it} from 'vite-plus/test'

// Electron keeps one webRequest listener per event per session: a second
// onBeforeRequest silently replaces the first. The Explore ad blocker owns
// those listeners (and the session preload) on the Explore partition, and
// turning it off clears them. Any other owner must be composed with it through
// one dispatcher instead of registering its own; this test makes that a
// decision rather than an accident.

const MAIN = join(process.cwd(), 'src', 'main')
const OWNER = 'src/main/services/explore/ExploreAdBlocker.ts'
const SESSION_HOOK = /\.webRequest\.on\w+\(|\.registerPreloadScript\(|\.setPreloads\(/

function sources(dir: string): string[] {
	return readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
		const path = join(dir, entry.name)
		if (entry.isDirectory()) return sources(path)
		return /\.(ts|tsx|mts|cts)$/.test(entry.name) ? [path] : []
	})
}

describe('session request hooks', () => {
	it('only the Explore ad blocker registers webRequest listeners or session preloads', () => {
		const owners = sources(MAIN)
			.filter(file => SESSION_HOOK.test(readFileSync(file, 'utf8')))
			.map(file => relative(process.cwd(), file).split('\\').join('/'))
		expect(owners).toEqual([OWNER])
	})
})
