import fs from 'node:fs'
import path from 'node:path'
import {_electron as electron, type ElectronApplication} from '@playwright/test'
import type {ExpectedOutcome, StartupJourney} from './journeys.js'
import {packagedLaunchEnv} from './launchEnv.js'
import {inspectStartupLog, type LogViolation} from './logOracle.js'
import {provisionProfile} from './provisionProfile.js'
import {awaitWarmupSettled} from './warmupSettled.js'

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
	const env = packagedLaunchEnv(profileDir, journey.env)

	if (journey.pathContamination && ctx.fakeToolsDir) {
		env.PATH = `${ctx.fakeToolsDir}${path.delimiter}${env.PATH ?? ''}`
	}

	return env
}

export async function runJourney(journey: StartupJourney, ctx: RunContext): Promise<JourneyVerdict> {
	const startedAt = Date.now()
	const base: JourneyVerdict = {id: journey.id, outcome: 'fail', observed: 'none', violations: [], elapsedMs: 0}

	let profileDir: string
	try {
		profileDir = await provisionProfile({kind: journey.profile.kind, baseDir: ctx.baseDir, warmSource: ctx.warmSource, inheritedSource: ctx.inheritedSource})
	} catch (err) {
		return {...base, error: `profile provisioning failed: ${err instanceof Error ? err.message : String(err)}`, elapsedMs: Date.now() - startedAt}
	}

	// Launch sits inside the protected path: a failed launch must become a
	// failed verdict for this journey — so verdict accounting stays complete
	// and the remaining journeys still report — not a rejection that skips
	// the verdict archive.
	let app: ElectronApplication | null = null
	try {
		app = await electron.launch({executablePath: ctx.packagedExe, env: buildJourneyEnv(journey, ctx, profileDir) as Record<string, string>})
		const page = await app.firstWindow()
		const observed = await awaitWarmupSettled(page, MILESTONE_TIMEOUT_MS)

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
		if (app) await app.close()
	}
}
