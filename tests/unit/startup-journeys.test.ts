import {describe, expect, it} from 'vitest'
import {JOURNEYS, journeysForTier} from '../../scripts/startup/journeys.js'
import {inspectStartupLog} from '../../scripts/startup/logOracle.js'

describe('journey catalog', () => {
	it('gives every journey a unique id', () => {
		const ids = JOURNEYS.map(journey => journey.id)
		expect(new Set(ids).size).toBe(ids.length)
	})

	it('never enables the E2E harness, which would mock the branches under test', () => {
		for (const journey of JOURNEYS) {
			expect(journey.env.ARROXY_E2E).toBeUndefined()
		}
	})

	it('puts a fast fresh-start journey in the PR tier', () => {
		expect(journeysForTier('pr').map(journey => journey.id)).toContain('fresh-cold')
	})

	it('gates the update-over-previous-version journey on release', () => {
		const release = journeysForTier('release')
		expect(release.map(journey => journey.id)).toContain('inherited-update')
		expect(release.find(journey => journey.id === 'inherited-update')?.profile).toEqual({kind: 'inherited'})
	})

	it('keeps degraded staging — PATH contamination or env overrides — out of the blocking tiers', () => {
		for (const tier of ['pr', 'release'] as const) {
			for (const journey of journeysForTier(tier)) {
				expect(journey.pathContamination ?? false).toBe(false)
				expect(Object.keys(journey.env)).toEqual([])
			}
		}
	})

	it("waives the gpu-info warning the no-gpu journey's own mode provokes", () => {
		const noGpu = JOURNEYS.find(journey => journey.id === 'no-gpu')
		if (!noGpu) throw new Error('no-gpu journey missing from the catalog')
		const cleanLog = cleanStartupLog()
		const line = '[2026-08-30 05:22:53.000] [warn]  gpu info failed Error: GPU access not allowed. Reason: GPU access is disabled through commandline switch --disable-gpu and --disable-software-rasterizer.'
		expect(inspectStartupLog(`${cleanLog}\n${line}`, noGpu.logPolicy)).toEqual([])
	})

	it('waives the updater metadata 404 the release gate provokes against its own draft', () => {
		// The gate exports GH_TOKEN, which lets electron-updater see the draft
		// release under construction; its latest-*.yml is not uploaded yet, so
		// the soft launch-time update check 404s. Environmental, not a defect.
		const cleanLog = cleanStartupLog()
		const updater404 =
			'[2026-08-30 05:22:31.753] [error] (updater) Cannot find latest-mac.yml in the latest release artifacts (https://github.com/antonio-orionus/Arroxy/releases/download/v0.4.8-beta.2/latest-mac.yml): HttpError: 404\n[2026-08-30 05:22:31.760] [error] (updater) checkForUpdates failed Cannot find latest-mac.yml in the latest release artifacts (https://github.com/antonio-orionus/Arroxy/releases/download/v0.4.8-beta.2/latest-mac.yml): HttpError: 404'
		for (const journey of journeysForTier('release')) {
			const violations = inspectStartupLog(`${cleanLog}\n${updater404}`, journey.logPolicy)
			expect(violations.filter(violation => violation.kind === 'error-line')).toEqual([])
		}
	})

	it('still fails a journey whose updater reports a repo it cannot resolve', () => {
		const cleanLog = cleanStartupLog()
		const line = '[2026-08-30 05:22:31.753] [error] (updater) checkForUpdates failed HttpError: 404 no published release found for this channel'
		for (const journey of journeysForTier('release')) {
			const violations = inspectStartupLog(`${cleanLog}\n${line}`, journey.logPolicy)
			expect(violations.filter(violation => violation.kind === 'error-line').length).toBe(1)
		}
	})
})

function cleanStartupLog(): string {
	return "[2026-08-30 05:22:31.753] [info]  Session started\n[2026-08-30 05:22:52.330] [info]  (warmup)  Warmup branch settled { branch: 'ytDlp', elapsedMs: 100 }\n[2026-08-30 05:22:52.330] [info]  (warmup)  Warmup completed {\n  totalMs: 100,\n  gatedBy: 'ytDlp',\n  branches: { ytDlp: 100 }\n}"
}
