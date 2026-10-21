import fs from 'node:fs'
import path from 'node:path'
import {describe, expect, it} from 'vite-plus/test'

interface E2eSpecsModule {
	E2E_SPEC_DIR: string
	PACKAGED_SPECS: readonly string[]
	selectGatingSpecs: (names: readonly string[]) => string[]
}

async function loadE2eSpecs(): Promise<E2eSpecsModule> {
	return (await import(new URL('../../scripts/e2eSpecs.mjs', import.meta.url).href)) as E2eSpecsModule
}

const repoRoot = path.resolve(import.meta.dirname, '../..')

function specNames(dir: string): string[] {
	return fs.readdirSync(path.join(repoRoot, dir)).filter(name => name.endsWith('.spec.ts'))
}

describe('gating E2E spec selection', () => {
	it('selects every spec except the packaged-build ones, sorted, as repo-relative posix paths', async () => {
		const {selectGatingSpecs} = await loadE2eSpecs()

		expect(selectGatingSpecs(['profile-a.spec.ts', 'startup-journeys.spec.ts', 'fixture-b.spec.ts', 'smoke.spec.ts', 'fixtureHarness.ts', 'fixture-media-catalog.json'])).toEqual(['tests/e2e/fixture-b.spec.ts', 'tests/e2e/profile-a.spec.ts', 'tests/e2e/smoke.spec.ts'])
	})

	it('gates the specs that once never ran in CI', async () => {
		const {E2E_SPEC_DIR, selectGatingSpecs} = await loadE2eSpecs()
		const selected = selectGatingSpecs(specNames(E2E_SPEC_DIR))

		for (const name of ['profile-subtitles-only.spec.ts', 'profile-cover-art.spec.ts', 'profile-embed-subtitles.spec.ts', 'playlist-multi-profile.spec.ts', 'smoke.spec.ts', 'startup-resilience.spec.ts']) {
			expect(selected).toContain(`${E2E_SPEC_DIR}/${name}`)
		}
	})

	// The exclusion is the one place a spec can drop out of CI, so it may hold
	// only specs that cannot run against the dev build at all.
	it('excludes exactly the specs that need a packaged executable', async () => {
		const {E2E_SPEC_DIR, PACKAGED_SPECS, selectGatingSpecs} = await loadE2eSpecs()
		const names = specNames(E2E_SPEC_DIR)
		const selected = new Set(selectGatingSpecs(names))
		const needsPackagedExe = (name: string): boolean => fs.readFileSync(path.join(repoRoot, E2E_SPEC_DIR, name), 'utf8').includes('PACKAGED_EXE')

		for (const name of PACKAGED_SPECS) expect(names, `${name} is excluded but does not exist`).toContain(name)
		for (const name of names) {
			expect(selected.has(`${E2E_SPEC_DIR}/${name}`), `${name}: gated in CI must mean it runs on the dev build`).toBe(!needsPackagedExe(name))
		}
	})
})
