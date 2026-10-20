import type {ExpectedOutcome} from './journeys.js'

/** The slice of Playwright's `Page` the warmup milestone reads, so unit tests can drive it with a fake. */
export interface SplashPage {
	locator(selector: string): {waitFor(options: {state: 'attached' | 'detached'; timeout: number}): Promise<void>}
}

/**
 * Resolves once a packaged build's warmup has settled: the splash fades out
 * (`main-screen`) or stays mounted as the repair container (`repair-panel`).
 */
export async function awaitWarmupSettled(page: SplashPage, timeoutMs: number): Promise<ExpectedOutcome> {
	const splash = page.locator('[data-testid="splash-overlay"]')
	const repair = page.locator('[data-testid="splash-overlay"][data-state="blocked"]')

	// The splash must be observed ATTACHED before waiting for it to detach. A
	// bare `detached` wait resolves instantly against the pre-mount DOM — the
	// element simply does not exist before React mounts — so the first packaged
	// run of the startup harness "observed" main-screen 773ms into a cold boot
	// while warmup was still running, and read a main.log that could not yet
	// contain the warmup summary. WarmupSplash holds the overlay for MIN_MS
	// (800ms), so the attached phase is always observable.
	await splash.waitFor({state: 'attached', timeout: timeoutMs})

	// Detach is the real milestone: the renderer sets `initialized` only after
	// the warmup promise settles, and the splash fades only after `initialized`
	// — so a detached splash guarantees warmup has finished writing main.log and
	// the runtime cache. The blocked variant never detaches (it stays mounted as
	// the repair container), so it resolves the race itself.
	return Promise.race([splash.waitFor({state: 'detached', timeout: timeoutMs}).then((): ExpectedOutcome => 'main-screen'), repair.waitFor({state: 'attached', timeout: timeoutMs}).then((): ExpectedOutcome => 'repair-panel')])
}
