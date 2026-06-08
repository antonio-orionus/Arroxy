import type {ChildProcessWithoutNullStreams} from 'node:child_process'
import type {DownloadJob, LocalizedError, StartDownloadInput, StatusEvent, StatusKey} from '@shared/types.js'
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
				await fn()
			} catch {}
		}
		this.disposed = true
	}
}

export interface ActiveJob {
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
	mediaPath?: string
	usedExtractorFallback?: boolean
	tempDir?: string
	postProcEmitted?: Partial<Record<'extractingAudio' | 'convertingVideo' | 'embeddingMetadata' | 'movingFiles', true>>
}

// Back-compat name for tests / call sites that still spell it ActiveDownload.
// The intent is to migrate every spelling — kept here only so this commit can
// land without rewriting every test fixture in the same diff.
export type ActiveDownload = ActiveJob

export interface PausedDownload {
	job: DownloadJob
	input: StartDownloadInput
	tempDir?: string
}

export type PhaseOutcome = {kind: 'continue'} | {kind: 'completed'} | {kind: 'soft-failed'; status: StatusKey} | {kind: 'hard-failed'; error: LocalizedError} | {kind: 'cancelled'} | {kind: 'paused'}

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
	emitStatus(stage: StatusEvent['stage'], statusKey: StatusKey, params?: Record<string, string | number>, error?: LocalizedError): void
	register(disposable: Disposable): void
	safeConsume(text: string): void
}
