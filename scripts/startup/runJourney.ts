import fs from 'node:fs'
import path from 'node:path'
import {_electron as electron, type Page} from '@playwright/test'
import type {ExpectedOutcome, StartupJourney} from './journeys.js'
import {inspectStartupLog, type LogViolation} from './logOracle.js'
import {provisionProfile} from './provisionProfile.js'

// A cold managed yt-dlp download plus PyInstaller unpack runs ~20s on a fast
// machine and much longer on a loaded runner; the budget is deliberately far
// above the observed cost so a slow runner is not read as a hang.
const MILESTONE_TIMEOUT_MS = 10 * 60 * 1000

export interface RunContext {
	packagedExe: string
	baseDir: string
	warmSource?: string
	inheritedSource?: string
	fakeToolsDir?: string
}

export interface JourneyVerdict {
	id: string
	outcome: 'pass' | 'fail'
	observed: ExpectedOutcome | 'none'
	violations: LogViolation[]
	error?: string
	elapsedMs: number
	/** Where this journey's profile was written — the `warm` journeys are seeded from it. */
	profileDir?: string
}

export function buildJourneyEnv(journey: StartupJourney, ctx: RunContext, profileDir: string): NodeJS.ProcessEnv {
	const env: NodeJS.ProcessEnv = {...process.env, ...journey.env, ELECTRON_USER_DATA: profileDir}

	// ELECTRON_RUN_AS_NODE turns the app into a bare Node process — it must never
	// reach the app itself, only yt-dlp's child env (see CLAUDE.md).
	delete env.ELECTRON_RUN_AS_NODE

	// ARROXY_E2E would swap in MockTokenProvider and the fixture yt-dlp plugin,
	// mocking away the very branches these journeys exist to verify; MOCK_BACKEND
	// would stub the backend the same way.
	delete env.ARROXY_E2E
	delete env.MOCK_BACKEND

	if (journey.pathContamination && ctx.fakeToolsDir) {
		env.PATH = `${ctx.fakeToolsDir}${path.delimiter}${env.PATH ?? ''}`
	}

	return env
}

async function observeOutcome(page: Page): Promise<ExpectedOutcome> {
	const splash = page.locator('[data-testid="splash-overlay"]')
	const repair = page.locator('[data-testid="splash-overlay"][data-state="blocked"]')

	// The splash must be observed ATTACHED before waiting for it to detach. A
	// bare `detached` wait resolves instantly against the pre-mount DOM — the
	// element simply does not exist before React mounts — so the first packaged
	// run of this harness "observed" main-screen 773ms into a cold boot while
	// warmup was still running, and read a main.log that could not yet contain
	// the warmup summary. WarmupSplash holds the overlay for MIN_MS (800ms), so
	// the attached phase is always observable.
	await splash.waitFor({state: 'attached', timeout: MILESTONE_TIMEOUT_MS})

	// Detach is the real milestone: the renderer sets `initialized` only after
	// the warmup promise settles, and the splash fades only after `initialized`
	// — so a detached splash guarantees the warmup summary is already in
	// main.log for the oracle to read. The blocked variant never detaches (it
	// stays mounted as the repair container), so it resolves the race itself.
	return Promise.race([splash.waitFor({state: 'detached', timeout: MILESTONE_TIMEOUT_MS}).then((): ExpectedOutcome => 'main-screen'), repair.waitFor({state: 'attached', timeout: MILESTONE_TIMEOUT_MS}).then((): ExpectedOutcome => 'repair-panel')])
}

export async function runJourney(journey: StartupJourney, ctx: RunContext): Promise<JourneyVerdict> {
	const startedAt = Date.now()
	const base: JourneyVerdict = {id: journey.id, outcome: 'fail', observed: 'none', violations: [], elapsedMs: 0}

	let profileDir: string
	try {
		profileDir = await provisionProfile({kind: journey.profile, baseDir: ctx.baseDir, warmSource: ctx.warmSource, inheritedSource: ctx.inheritedSource})
	} catch (err) {
		return {...base, error: `profile provisioning failed: ${err instanceof Error ? err.message : String(err)}`, elapsedMs: Date.now() - startedAt}
	}

	const app = await electron.launch({executablePath: ctx.packagedExe, env: buildJourneyEnv(journey, ctx, profileDir) as Record<string, string>})

	try {
		const page = await app.firstWindow()
		const observed = await observeOutcome(page)

		if (observed === 'main-screen') {
			await page.locator('[data-testid="profiles-main-input"]').waitFor({state: 'visible', timeout: 15_000})
		}

		const logPath = path.join(profileDir, 'logs', 'main.log')
		const logText = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8') : ''
		const violations = observed === 'main-screen' ? inspectStartupLog(logText, journey.logPolicy) : []

		const matched = observed === journey.expect
		return {id: journey.id, outcome: matched && violations.length === 0 ? 'pass' : 'fail', observed, violations, error: matched ? undefined : `expected ${journey.expect}, observed ${observed}`, elapsedMs: Date.now() - startedAt, profileDir}
	} catch (err) {
		return {...base, error: err instanceof Error ? err.message : String(err), elapsedMs: Date.now() - startedAt}
	} finally {
		await app.close()
	}
}
