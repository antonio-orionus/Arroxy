import {spawnSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import gt from 'semver/functions/gt.js'
import valid from 'semver/functions/valid.js'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {RELEASE_FLAGS, releaseFlagOn, unreleasedFlagsOn, type ReleaseFlagDefinition} from '@shared/releaseFlags.js'
import {importWithReleaseFlagsOff} from '../helpers/releaseFlags.js'

// The module reads Vite's env once, at import, the way a bundle does.
async function importWithEnv(env: Record<string, string>): Promise<boolean> {
	for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value)
	vi.resetModules()
	return (await import('@shared/releaseFlags.js')).UNRELEASED_FLAGS_ON
}

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {version: string; scripts: Record<string, string>}

// A flag is deleted in the release after the one that turned it on.
function flagsPastTheirRelease(flags: Readonly<Record<string, ReleaseFlagDefinition>>, version: string): string[] {
	return Object.entries(flags).flatMap(([name, flag]) => (flag.inRelease && gt(version, flag.shippedIn) ? [`${name} (shipped in ${flag.shippedIn})`] : []))
}

// Tracked files under the given pathspecs that mention the release flags.
function trackedFilesMentioningReleaseFlags(pathspecs: string[]): string[] {
	const grep = spawnSync('git', ['grep', '-l', 'RELEASE_FLAGS', '--', ...pathspecs], {encoding: 'utf8'})
	if (grep.status === 1) return []
	if (grep.status !== 0) throw new Error(`git grep failed: ${grep.stderr}`)
	return grep.stdout.split('\n').filter(Boolean)
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
		expect((await importWithReleaseFlagsOff(() => import('@shared/releaseFlags.js'))).UNRELEASED_FLAGS_ON).toBe(false)
	})

	it('are on in dev, the Scenario Workbench and tests', async () => {
		for (const mode of ['development', 'browser-mock', 'test']) expect(unreleasedFlagsOn(mode, undefined)).toBe(true)
		expect(await importWithEnv({MODE: 'browser-mock'})).toBe(true)
		expect(await importWithEnv({MODE: 'test'})).toBe(true)
	})

	it('are on in the production build fixture E2E runs against', async () => {
		expect(await importWithEnv({MODE: 'production', VITE_RELEASE_FLAGS: 'on'})).toBe(true)
		for (const name of ['test:e2e:fixtures', 'test:e2e:fixtures:ci']) {
			expect((packageJson.scripts[name] ?? '').split('&&').map(step => step.trim())).toContain('VITE_RELEASE_FLAGS=on bun run build')
		}
	})

	it('turn a flag on in release builds once it is marked inRelease', () => {
		expect(releaseFlagOn({summary: 'shipped', inRelease: true, shippedIn: '0.7.3'}, false)).toBe(true)
		expect(releaseFlagOn({summary: 'unreleased', inRelease: false}, false)).toBe(false)
		expect(releaseFlagOn({summary: 'unreleased', inRelease: false}, true)).toBe(true)
	})

	// Release builds run `dist:*` from release.yml, installer-smoke.yml and
	// scripts/release.sh, configured by electron-builder and the Vite configs,
	// and Vite loads .env files into every build. Fixture E2E workflows run the
	// package.json scripts, so no workflow needs to set the switch itself.
	it('are switched on by the fixture E2E scripts only', () => {
		expect(Object.keys(packageJson.scripts).filter(name => packageJson.scripts[name]?.includes('RELEASE_FLAGS'))).toEqual(['test:e2e:fixtures', 'test:e2e:fixtures:ci'])
		expect(trackedFilesMentioningReleaseFlags(['.env', '.env.*', '**/.env', '**/.env.*', '.github', 'scripts', 'build', 'electron-builder.*', '*vite.config.*'])).toEqual([])
	})

	it('record the release that turned them on as a version', () => {
		for (const [name, flag] of Object.entries(RELEASE_FLAGS)) {
			if (flag.inRelease) expect(valid(flag.shippedIn), `${name}.shippedIn`).toBe(flag.shippedIn)
		}
	})

	it('are deleted in the release after the one that shipped them', () => {
		const flags: Record<string, ReleaseFlagDefinition> = {unreleased: {summary: 'unreleased', inRelease: false}, shipping: {summary: 'shipping', inRelease: true, shippedIn: '0.7.3'}, shipped: {summary: 'shipped', inRelease: true, shippedIn: '0.7.2'}}
		expect(flagsPastTheirRelease(flags, '0.7.2')).toEqual([])
		expect(flagsPastTheirRelease(flags, '0.7.3')).toEqual(['shipped (shipped in 0.7.2)'])
		expect(flagsPastTheirRelease(flags, '0.8.0-beta.1')).toEqual(['shipping (shipped in 0.7.3)', 'shipped (shipped in 0.7.2)'])

		const stale = flagsPastTheirRelease(RELEASE_FLAGS, packageJson.version)
		expect(stale, `package.json is at ${packageJson.version}: delete each of these flags from src/shared/releaseFlags.ts and every isReleaseFlagOn read of it (dev-docs/release-flags.md)`).toEqual([])
	})
})
