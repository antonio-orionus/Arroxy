import {execFileSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {describe, expect, it} from 'vite-plus/test'
import {unreleasedFlagsOn} from '@shared/releaseFlags.js'

describe('release flags', () => {
	it('are off in a release build', () => {
		expect(unreleasedFlagsOn('production', undefined)).toBe(false)
		expect(unreleasedFlagsOn('production', 'true')).toBe(false)
	})

	it('are on in dev, the Scenario Workbench and tests', () => {
		for (const mode of ['development', 'browser-mock', 'test']) expect(unreleasedFlagsOn(mode, undefined)).toBe(true)
	})

	it('are on in the production build fixture E2E runs against', () => {
		expect(unreleasedFlagsOn('production', 'on')).toBe(true)
		const scripts = (JSON.parse(readFileSync('package.json', 'utf8')) as {scripts: Record<string, string>}).scripts
		for (const name of ['test:e2e:fixtures', 'test:e2e:fixtures:ci']) expect(scripts[name]).toContain('VITE_RELEASE_FLAGS=on bun run build')
	})

	it('are on while this suite runs', () => {
		expect(unreleasedFlagsOn(import.meta.env.MODE, import.meta.env.VITE_RELEASE_FLAGS)).toBe(true)
	})

	// Vite loads .env files into every build, release builds included.
	it('are never switched on by a tracked .env file', () => {
		const envFiles = execFileSync('git', ['ls-files', '.env', '.env.*', '**/.env', '**/.env.*'], {encoding: 'utf8'}).split('\n').filter(Boolean)
		for (const file of envFiles) expect(readFileSync(file, 'utf8')).not.toMatch(/RELEASE_FLAGS/)
	})
})
