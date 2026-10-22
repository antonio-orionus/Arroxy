import type {BinaryManifestSource} from '@shared/schemas.js'
import type {Result} from '@shared/result.js'
import type {DependencyId, WarmUpOutput, WarmupProgressEvent} from '@shared/types.js'
import {KEPT_REPORTS_MAX, type WarmupReportState} from '@main/stores/WarmupReportStore.js'
import {buildWarmupReportHit, firstFailure, throughputBucket, type WarmupOutcome, type WarmupReport, type WarmupReportContext, type WarmupReportHit, type WarmupReportKind} from './warmupReport.js'
import type {WarmupRunObservation, WarmupRunObserver} from './WarmupService.js'

// A kept report older than this says nothing about the current state of the field.
const KEPT_MAX_AGE_MS = 7 * 86_400_000

export interface WarmupReporterDeps {
	state: {read(): WarmupReportState; write(state: WarmupReportState): void}
	send: (hit: WarmupReportHit) => Promise<boolean>
	context: () => WarmupReportContext
	// True once anything managed (yt-dlp build or FFmpeg package) is on disk.
	hasManagedInstall: () => Promise<boolean>
	manifestSource: () => BinaryManifestSource | null
	// The heartbeat's switch, read before every send: off sends nothing and keeps nothing.
	isEnabled: () => boolean
	now: () => number
	onError?: (error: unknown) => void
}

interface Transfer {
	firstAt: number
	firstBytes: number
	lastAt: number
	lastBytes: number
}

interface Started {
	kind: WarmupReportKind
	attempt: number
}

// One warmup run, from its first download to its outcome.
class ReportedRun implements WarmupRunObservation {
	private readonly transfers = new Map<DependencyId, Transfer>()
	private started: Promise<Started | null> | null = null
	private startedAt = 0
	private done = false

	constructor(
		private readonly reporter: WarmupReporter,
		private readonly kind: Promise<WarmupReportKind>
	) {}

	get downloading(): boolean {
		return this.started !== null && !this.done
	}

	progress(event: WarmupProgressEvent): void {
		if (this.done || event.phase !== 'downloading') return
		this.track(event)
		if (this.started) return
		this.startedAt = this.reporter.now()
		this.started = this.reporter.start(this.kind)
	}

	async settled(result: Result<WarmUpOutput>): Promise<void> {
		if (this.done) return
		this.done = true
		// A run that set the install up without fetching (a system FFmpeg, a file
		// the user picked) still ends a run of failed attempts.
		if (!this.started) {
			if (result.ok && result.data.completed) this.reporter.setUpFinished()
			return
		}
		const stage = !result.ok ? 'failed' : result.data.cancelled ? 'stopped' : result.data.completed ? 'ok' : 'failed'
		await this.finish({stage, failure: result.ok ? firstFailure(result.data.dependencies) : 'unknown'})
	}

	async quit(): Promise<void> {
		if (!this.downloading) return
		this.done = true
		await this.finish({stage: 'quit', failure: 'unknown'})
	}

	private async finish(outcome: Pick<WarmupOutcome, 'stage' | 'failure'>): Promise<void> {
		const started = await this.started
		if (started) await this.reporter.finish(started, {...outcome, elapsedMs: this.reporter.now() - this.startedAt, throughput: this.throughput()})
	}

	// A download's start carries no byte count; only real counts are measured,
	// so a resumed download is timed from where it resumed.
	private track(event: WarmupProgressEvent): void {
		const bytes = event.bytesDownloaded
		if (bytes === undefined) return
		const at = this.reporter.now()
		const known = this.transfers.get(event.binary)
		this.transfers.set(event.binary, known ? {...known, lastAt: at, lastBytes: bytes} : {firstAt: at, firstBytes: bytes, lastAt: at, lastBytes: bytes})
	}

	// The speed of the largest transfer, counted from its own first byte report.
	private throughput(): string {
		let best: Transfer | undefined
		for (const transfer of this.transfers.values()) {
			if (!best || transfer.lastBytes - transfer.firstBytes > best.lastBytes - best.firstBytes) best = transfer
		}
		return best ? throughputBucket(best.lastBytes - best.firstBytes, best.lastAt - best.firstAt) : 'unknown'
	}
}

// Turns warmup runs that fetch a managed binary into warmup reports: `started`
// at the first download, then `ok`, `failed`, `stopped` or `quit`. Each report
// is kept before it is sent and dropped once the collector takes it, so one cut
// short by a quit goes out at the next launch. Never rejects into the warmup it
// watches or the quit it delays.
export class WarmupReporter implements WarmupRunObserver {
	private readonly runs = new Set<ReportedRun>()

	constructor(private readonly deps: WarmupReporterDeps) {}

	now(): number {
		return this.deps.now()
	}

	runStarted(): WarmupRunObservation {
		if (!this.deps.isEnabled()) return {progress: () => undefined, settled: () => Promise.resolve()}
		// Decided before anything downloads, so a file the run itself writes cannot
		// turn a first setup into an update. A first setup that never finished
		// stays first until one does.
		const kind: Promise<WarmupReportKind> = this.safely(() => this.deps.state.read().firstPending, false)
			? Promise.resolve('first')
			: this.deps.hasManagedInstall().then(
					installed => (installed ? 'update' : 'first'),
					() => 'update'
				)
		const run = new ReportedRun(this, kind)
		this.runs.add(run)
		return {
			progress: event => run.progress(event),
			settled: result =>
				run
					.settled(result)
					.catch((error: unknown) => this.deps.onError?.(error))
					.finally(() => this.runs.delete(run))
		}
	}

	// The report for every run still downloading, or null when there is none,
	// so the caller holds the quit only when something is being sent.
	quit(): Promise<void> | null {
		const downloading = [...this.runs].filter(run => run.downloading)
		if (downloading.length === 0) return null
		return Promise.all(downloading.map(run => run.quit())).then(
			() => undefined,
			(error: unknown) => this.deps.onError?.(error)
		)
	}

	// Sends what earlier launches could not deliver, once each.
	async retryUndelivered(): Promise<void> {
		const state = this.deps.state.read()
		if (state.kept.length === 0) return
		this.deps.state.write({...state, kept: []})
		if (!this.deps.isEnabled()) return
		const fresh = state.kept.filter(entry => this.deps.now() - entry.at <= KEPT_MAX_AGE_MS)
		await Promise.all(fresh.map(entry => this.deps.send(entry.hit)))
	}

	// Counts the attempt and sends `started` without waiting for it, so the
	// outcome (above all `quit`) never waits on the network for `started`.
	async start(kindPromise: Promise<WarmupReportKind>): Promise<Started | null> {
		try {
			const kind = await kindPromise
			const state = this.deps.state.read()
			const started: Started = {kind, attempt: state.attempt + 1}
			this.deps.state.write({...state, attempt: started.attempt, firstPending: kind === 'first'})
			void this.deliver({kind, stage: 'started', attempt: started.attempt, manifestSource: this.manifestSource()})
			return started
		} catch (error) {
			this.deps.onError?.(error)
			return null
		}
	}

	async finish(started: Started, outcome: WarmupOutcome): Promise<void> {
		if (outcome.stage === 'ok') this.setUpFinished()
		await this.deliver({kind: started.kind, attempt: started.attempt, manifestSource: this.manifestSource(), ...outcome})
	}

	setUpFinished(): void {
		this.safely(() => {
			const state = this.deps.state.read()
			if (state.attempt !== 0 || state.firstPending) this.deps.state.write({...state, attempt: 0, firstPending: false})
		}, undefined)
	}

	private manifestSource(): BinaryManifestSource | 'unknown' {
		return this.deps.manifestSource() ?? 'unknown'
	}

	private async deliver(report: WarmupReport): Promise<void> {
		if (!this.deps.isEnabled()) return
		const entry = {hit: buildWarmupReportHit(report, this.deps.context()), at: this.deps.now()}
		this.safely(() => {
			const state = this.deps.state.read()
			this.deps.state.write({...state, kept: [...state.kept, entry].slice(-KEPT_REPORTS_MAX)})
		}, undefined)
		if (!(await this.deps.send(entry.hit))) return
		this.safely(() => {
			const state = this.deps.state.read()
			this.deps.state.write({...state, kept: state.kept.filter(kept => kept.at !== entry.at || kept.hit.p !== entry.hit.p)})
		}, undefined)
	}

	private safely<T>(work: () => T, fallback: T): T {
		try {
			return work()
		} catch (error) {
			this.deps.onError?.(error)
			return fallback
		}
	}
}
