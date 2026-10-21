import {execFileSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {releaseFlagOn, unreleasedFlagsOn} from '@shared/releaseFlags.js'

// The module reads Vite's env once, at import, the way a bundle does.
async function importWithEnv(env: Record<string, string>): Promise<boolean> {
	for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value)
	vi.resetModules()
	return (await import('@shared/releaseFlags.js')).UNRELEASED_FLAGS_ON
}

afterEach(() => {
	vi.unstubAllEnvs()
	vi.resetModules()
})

describe('release flags', () => {
	it('are off in a release build', async () => {
		expect(unreleasedFlagsOn('production', undefined)).toBe(false)
		expect(unreleasedFlagsOn('production', 'true')).toBe(false)
		expect(await importWithEnv({MODE: 'production'})).toBe(false)
	})

	it('are on in dev, the Scenario Workbench and tests', async () => {
		for (const mode of ['development', 'browser-mock', 'test']) expect(unreleasedFlagsOn(mode, undefined)).toBe(true)
		expect(await importWithEnv({MODE: 'browser-mock'})).toBe(true)
		expect(await importWithEnv({MODE: 'test'})).toBe(true)
	})

	it('are on in the production build fixture E2E runs against', async () => {
		expect(await importWithEnv({MODE: 'production', VITE_RELEASE_FLAGS: 'on'})).toBe(true)
		const scripts = (JSON.parse(readFileSync('package.json', 'utf8')) as {scripts: Record<string, string>}).scripts
		for (const name of ['test:e2e:fixtures', 'test:e2e:fixtures:ci']) {
			expect((scripts[name] ?? '').split('&&').map(step => step.trim())).toContain('VITE_RELEASE_FLAGS=on bun run build')
		}
	})

	it('turn a flag on in release builds once it is marked inRelease', () => {
		expect(releaseFlagOn({summary: 'shipped', inRelease: true}, false)).toBe(true)
		expect(releaseFlagOn({summary: 'unreleased', inRelease: false}, false)).toBe(false)
		expect(releaseFlagOn({summary: 'unreleased', inRelease: false}, true)).toBe(true)
	})

	// Vite loads .env files into every build, release builds included.
	it('are never switched on by a tracked .env file', () => {
		const envFiles = execFileSync('git', ['ls-files', '.env', '.env.*', '**/.env', '**/.env.*'], {encoding: 'utf8'}).split('\n').filter(Boolean)
		for (const file of envFiles) expect(readFileSync(file, 'utf8')).not.toMatch(/RELEASE_FLAGS/)
	})
})
