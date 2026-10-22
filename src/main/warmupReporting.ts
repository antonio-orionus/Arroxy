import log from 'electron-log/main.js'
import {isReleaseFlagOn} from '@shared/releaseFlags.js'
import type {QuitHooks} from '@main/sharedQuitHooks.js'
import type {BinaryManager} from '@main/services/BinaryManager.js'
import {WarmupReporter} from '@main/services/WarmupReporter.js'
import {sendWarmupReport, type WarmupReportContext} from '@main/services/warmupReport.js'
import {WarmupReportStore} from '@main/stores/WarmupReportStore.js'

const logger = log.scope('warmup-report')

// The longest a quit waits for the report of a warmup it interrupts.
export const WARMUP_REPORT_QUIT_BUDGET_MS = 1_000

// Warmup reports go to the heartbeat's collector, under the same rules (off in
// E2E, dev and mock unless one is named, `ARROXY_HEARTBEAT_URL=off`), and only
// once the release flag is on: the public wording still promises one heartbeat
// a day.
export function warmupReportCollector(heartbeatCollectorUrl: string | undefined): string | undefined {
	return isReleaseFlagOn('warmupReport') ? heartbeatCollectorUrl : undefined
}

// Starts the quit report as the quit begins, then holds the quit at will-quit
// until it is sent or the budget runs out. A quit that ends in app.exit
// (downloads still running) skips will-quit, so that path waits on the
// returned function instead: the same report, the same budget.
export function holdQuitForWarmupReport(app: QuitHooks, reporter: Pick<WarmupReporter, 'quit'>): () => Promise<void> {
	let sending: Promise<void> | null = null
	let sent = false
	// Bounded: resolves once the report is sent, fails, or the budget runs out.
	const settled = (): Promise<void> => {
		if (!sending || sent) return Promise.resolve()
		const budget = new Promise<void>(resolve => setTimeout(resolve, WARMUP_REPORT_QUIT_BUDGET_MS).unref())
		return Promise.race([sending, budget])
	}
	app.on('before-quit', () => {
		// A report that fails must still let the app quit.
		sending ??=
			reporter
				.quit()
				?.catch(() => undefined)
				.finally(() => (sent = true)) ?? null
	})
	app.on('will-quit', event => {
		if (!sending || sent) return
		event.preventDefault()
		void settled().then(() => app.exit(0))
	})
	return settled
}

interface WarmupReportingDeps {
	collectorUrl: string
	userDataPath: string
	binaryManager: Pick<BinaryManager, 'hasManagedInstall' | 'binaryManifestSource'>
	isEnabled: () => boolean
	context: () => WarmupReportContext
}

// The reporter for this session; it first sends the report a previous launch
// could not deliver.
export function startWarmupReporting({collectorUrl, userDataPath, binaryManager, isEnabled, context}: WarmupReportingDeps): WarmupReporter {
	const reporter = new WarmupReporter({
		state: new WarmupReportStore(userDataPath),
		send: hit => sendWarmupReport(collectorUrl, hit),
		context,
		hasManagedInstall: () => binaryManager.hasManagedInstall(),
		manifestSource: () => binaryManager.binaryManifestSource(),
		isEnabled,
		now: () => Date.now(),
		onError: error => logger.warn('Warmup report failed', {error: error instanceof Error ? error.message : String(error)})
	})
	void reporter.retryUndelivered().catch((error: unknown) => logger.warn('Kept warmup report could not be retried', {error: error instanceof Error ? error.message : String(error)}))
	return reporter
}
