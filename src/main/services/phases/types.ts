import type {CookielessRetry} from '../download/cookielessRetry.js'
import type {QualityLimit} from '../download/formatLimitSignals.js'
import type {ChildProcessWithoutNullStreams} from 'node:child_process'
import type {DownloadJob, LocalizedError, QueueResumeContext, ResolvedStartDownloadInput, StartDownloadInput, StatusEvent, StatusKey} from '@shared/types.js'
import type {YtDlp} from '../YtDlp.js'

export type Disposable = () => Promise<void> | void

export class AsyncStack {
	private readonly fns: Disposable[] = []
	disposed = false

	defer(fn: Disposable): void {
		this.fns.push(fn)
	}

	async [Symbol.asyncDispose](): Promise<void> {
		const fns = this.fns.splice(0).reverse()
		for (const fn of fns) {
			try {
				// react-doctor-disable-next-line react-doctor/async-await-in-loop -- disposables drain in LIFO order
				await fn()
			} catch {}
		}
		this.disposed = true
	}
}

// DownloadService.runJob() narrows input.job to a real (startable) job before
// any phase runs — start() refuses the unresolved probe-stage placeholder.
export interface ActiveJobInput {
	job: DownloadJob
	input: StartDownloadInput
	// AbortController.abort() drops the signal. Process spawns register
	// `() => proc.kill('SIGKILL')` against `signal.aborted`, so cancel = abort.
	controller: AbortController
	signal: AbortSignal
	// Mirrors `signal.aborted` for code paths that already poll the boolean.
	// New code should prefer `signal.aborted` directly. Set to true at the
	// same moment `controller.abort()` runs.
	cancelRequested: boolean
	// Pause is gentler than cancel — phases call it to set this flag, the
	// active processes get SIGTERM, and the phase returns 'paused'. Cancel,
	// by contrast, calls controller.abort() and triggers the disposable drain.
	pauseRequested: boolean
	disposables: AsyncStack
	ytDlpProcess?: ChildProcessWithoutNullStreams
	ffmpegProcess?: ChildProcessWithoutNullStreams
	mockTimer?: NodeJS.Timeout
	currentFileKind?: 'subtitle' | 'media'
	subtitlePaths: string[]
	mediaDownloadStarted?: boolean
	mediaComponentPaths?: string[]
	mediaPath?: string
	mediaPostprocessStarted?: boolean
	usedExtractorFallback?: boolean
	// Set when YouTube withheld format URLs and the saved file came out below
	// what the profile asked for; completion reports it instead of a plain done.
	qualityLimit?: QualityLimit
	// yt-dlp reported withheld formats during this job's extraction. A resumed
	// run loads the saved info-json and never extracts again, so this is how it
	// still knows.
	formatsWithheld?: boolean
	tempDir?: string
	resumeContext?: QueueResumeContext
	postProcEmitted?: Partial<Record<'extractingAudio' | 'convertingVideo' | 'embeddingMetadata' | 'movingFiles', true>>
	// 10% step of the last progress line written to the log for the current
	// file. ProgressParser logs a redraw only when the step changes.
	lastLoggedProgressStep?: number
}

// The runtime shape after start() narrowed the job: phases can safely read
// subtitles / sponsorBlock / filenameTemplate off the input job.
export type ActiveJob = Omit<ActiveJobInput, 'input'> & {input: ResolvedStartDownloadInput}
export type ActiveDownload = ActiveJob

export interface PausedDownload {
	job: DownloadJob
	input: ResolvedStartDownloadInput
	tempDir?: string
	qualityLimit?: QualityLimit
	formatsWithheld?: boolean
}

export type PhaseOutcome = {kind: 'continue'} | {kind: 'completed'} | {kind: 'soft-failed'; status: StatusKey} | {kind: 'hard-failed'; error: LocalizedError; resumeContext?: QueueResumeContext} | {kind: 'cancelled'} | {kind: 'paused'}

export interface Phase {
	readonly kind: string
	run(ctx: PhaseContext): Promise<PhaseOutcome>
}

// PhaseContext — minimal surface a phase needs. Everything cleanup-related
// flows through `register()`; everything error-related stays inside the
// phase (it returns a hard-failed outcome with a LocalizedError when needed).
//
// Cleanup, finalize, and pause-park decisions live in DownloadService /
// JobLifecycle, driven by the PhaseOutcome returned from PhaseExecutor.
export interface PhaseContext {
	active: ActiveJob
	signal: AbortSignal
	ytDlp: YtDlp
	// Session-wide: whether retrying YouTube-limited downloads without cookies
	// has helped so far. Owned by DownloadService, shared by every job.
	cookielessRetry: CookielessRetry
	emitStatus(stage: StatusEvent['stage'], statusKey: StatusKey, params?: Record<string, string | number>, error?: LocalizedError, resumeContext?: QueueResumeContext): void
	register(disposable: Disposable): void
	safeConsume(text: string): void
}
