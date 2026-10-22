import type {BinaryManifestSource} from '@shared/schemas.js'
import type {Result} from '@shared/result.js'
import type {DependencyId, WarmUpOutput, WarmupProgressEvent} from '@shared/types.js'
import type {WarmupReportState} from '@main/stores/WarmupReportStore.js'
import {buildWarmupReportHit, firstFailure, throughputBucket, type WarmupReport, type WarmupReportContext, type WarmupReportHit, type WarmupReportKind, type WarmupReportStage} from './warmupReport.js'
import type {WarmupRunObservation, WarmupRunObserver} from './WarmupService.js'

// A kept report older than this says nothing about the current state of the field.
const UNDELIVERED_MAX_AGE_MS = 7 * 86_400_000

export interface WarmupReporterDeps {
	state: {read(): WarmupReportState; write(state: WarmupReportState): void}
	send: (hit: WarmupReportHit) => Promise<boolean>
	context: () => WarmupReportContext
	// True once anything managed (yt-dlp build or FFmpeg package) is on disk.
	hasManagedInstall: () => Promise<boolean>
	manifestSource: () => BinaryManifestSource | null
	// The heartbeat's switch: off sends nothing and keeps nothing.
	isEnabled: () => boolean
	now: () => number
}

interface Transfer {
	firstAt: number
	firstBytes: number
	lastAt: number
	lastBytes: number
}

interface Started {
	at: number
	kind: WarmupReportKind
	attempt: number
}

// One warmup run, from its first download to its outcome.
class ReportedRun implements WarmupRunObservation {
	private readonly transfers = new Map<DependencyId, Transfer>()
	private started: Promise<Started> | null = null
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
		this.started = this.reporter.start(this.kind, this.startedAt)
		// Awaited later by the outcome; until then a failure must not surface as unhandled.
		this.started.catch(() => undefined)
	}

	async settled(result: Result<WarmUpOutput>): Promise<void> {
		if (!this.started || this.done) return
		this.done = true
		const stage: WarmupReportStage = !result.ok ? 'failed' : result.data.cancelled ? 'stopped' : result.data.completed ? 'ok' : 'failed'
		await this.reporter.finish(await this.started, {stage, elapsedMs: this.reporter.now() - this.startedAt, failure: result.ok ? firstFailure(result.data.dependencies) : 'unknown', throughput: this.throughput()})
	}

	async quit(): Promise<void> {
		if (!this.started || this.done) return
		this.done = true
		await this.reporter.finish(await this.started, {stage: 'quit', elapsedMs: this.reporter.now() - this.startedAt, throughput: this.throughput()})
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

	// The speed of the largest transfer, counted from its own first byte report
	// so a resumed download is not credited with bytes it already had.
	private throughput(): string {
		let best: Transfer | undefined
		for (const transfer of this.transfers.values()) {
			if (!best || transfer.lastBytes - transfer.firstBytes > best.lastBytes - best.firstBytes) best = transfer
		}
		return best ? throughputBucket(best.lastBytes - best.firstBytes, best.lastAt - best.firstAt) : 'unknown'
	}
}

// Turns warmup runs that fetch a managed binary into warmup reports: `started`
// at the first download, then `ok`, `failed`, `stopped` or `quit`. Never throws
// into the warmup it watches.
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
		const kind: Promise<WarmupReportKind> = this.deps.state.read().firstPending
			? Promise.resolve('first')
			: this.deps.hasManagedInstall().then(
					installed => (installed ? 'update' : 'first'),
					() => 'update'
				)
		const run = new ReportedRun(this, kind)
		this.runs.add(run)
		return {progress: event => run.progress(event), settled: result => run.settled(result).finally(() => this.runs.delete(run))}
	}

	// The report for every run still downloading, or null when there is none,
	// so the caller holds the quit only when something is being sent.
	quit(): Promise<void> | null {
		const downloading = [...this.runs].filter(run => run.downloading)
		if (downloading.length === 0) return null
		return Promise.all(downloading.map(run => run.quit())).then(
			() => undefined,
			() => undefined
		)
	}

	// Sends the report a previous launch could not deliver, once.
	async retryUndelivered(): Promise<void> {
		const state = this.deps.state.read()
		const kept = state.undelivered
		if (!kept) return
		this.deps.state.write({attempt: state.attempt, firstPending: state.firstPending})
		if (!this.deps.isEnabled() || this.deps.now() - kept.at > UNDELIVERED_MAX_AGE_MS) return
		await this.deps.send(kept.hit)
	}

	async start(kindPromise: Promise<WarmupReportKind>, at: number): Promise<Started> {
		const kind = await kindPromise
		const state = this.deps.state.read()
		const started: Started = {at, kind, attempt: state.attempt + 1}
		this.deps.state.write({...state, attempt: started.attempt, firstPending: kind === 'first'})
		await this.deliver({kind, stage: 'started', attempt: started.attempt, manifestSource: this.manifestSource()})
		return started
	}

	async finish(started: Started, outcome: Pick<WarmupReport, 'stage' | 'elapsedMs' | 'failure' | 'throughput'>): Promise<void> {
		if (outcome.stage === 'ok') this.deps.state.write({...this.deps.state.read(), attempt: 0, firstPending: false})
		await this.deliver({kind: started.kind, attempt: started.attempt, manifestSource: this.manifestSource(), ...outcome})
	}

	private manifestSource(): BinaryManifestSource | 'unknown' {
		return this.deps.manifestSource() ?? 'unknown'
	}

	private async deliver(report: WarmupReport): Promise<void> {
		const hit = buildWarmupReportHit(report, this.deps.context())
		if (await this.deps.send(hit)) return
		this.deps.state.write({...this.deps.state.read(), undelivered: {hit, at: this.deps.now()}})
	}
}
