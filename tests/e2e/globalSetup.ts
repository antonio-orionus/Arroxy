import {resetClipboardLock} from './clipboardLock.js'
import {prepareFixtureRuntime} from './fixtureWorkflow.js'

/**
 * Warm the shared runtime cache once, before any worker starts.
 *
 * `prepareFixtureRuntime` memoizes per process, and Playwright workers are
 * separate processes — so with a cold cache every worker would fetch yt-dlp
 * and run `embed:fetch:host` concurrently against the same fixed paths. Doing
 * it here means workers only ever observe a warm cache, which is also why
 * running them in parallel is safe.
 *
 * Playwright runs this for every invocation, including a single-spec run, so
 * there is no path that reaches a worker cold.
 */
export default async function globalSetup(): Promise<void> {
	// Safe here and nowhere else: no worker exists yet, so a lock found now can
	// only be debris from a run that died. See resetClipboardLock.
	await resetClipboardLock()
	await prepareFixtureRuntime()
}
