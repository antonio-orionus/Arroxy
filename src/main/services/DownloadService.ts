import {EventEmitter} from 'node:events'
import {randomUUID} from 'node:crypto'
import {stat} from 'node:fs/promises'
import log from 'electron-log/main.js'
import {trackMain} from '@main/services/analytics.js'
import {phasesFor, PhaseExecutor} from './phases/index.js'
import type {PhaseContext, PhaseOutcome} from './phases/index.js'
import {nowIso} from '@main/utils/clock.js'
import {createAppError} from '@main/utils/errorFactory.js'
import {fail, ok, type Result} from '@shared/result.js'
import {STATUS_KEY} from '@shared/schemas.js'
import {MAX_CONCURRENT_DOWNLOADS} from '@shared/constants.js'
import type {CancelDownloadOutput, DownloadJob, LocalizedError, PauseDownloadOutput, RecentJob, StartDownloadInput, StartDownloadOutput, StatusEvent, StatusKey} from '@shared/types.js'
import type {RecentJobsStore} from '@main/stores/RecentJobsStore.js'
import {YtDlp} from './YtDlp.js'
import {AsyncStack} from './phases/index.js'
import type {ActiveDownload, PausedDownload} from './phases/index.js'
import {killActiveProcesses} from './download/processControl.js'
import {cleanupPartFiles, cleanupTempDirByPath} from './download/cleanup.js'
import {ProgressParser} from './download/progressParser.js'
import {JobLifecycle} from './JobLifecycle.js'

const logger = log.scope('downloads')

// Max concurrent downloads — defense-in-depth at the service boundary.
// QueueService applies its own lane-aware policy (NORMAL_LANE_CAP for the
// normal lane, MAX_CONCURRENT_DOWNLOADS as a hard ceiling for priority
// spawns). This backstop catches buggy IPC bursts or future policy changes
// that could otherwise spawn more parallel yt-dlp + ffmpeg processes than
// the queue scheduler intended. Defaults to the shared ceiling so the
// queue's priority-lane bypass isn't rejected here. Tunable for tests.
const DEFAULT_MAX_CONCURRENT_DOWNLOADS = MAX_CONCURRENT_DOWNLOADS

export class DownloadService extends EventEmitter {
	private activeJobs = new Map<string, ActiveDownload>()
	private pausedJobs = new Map<string, PausedDownload>()
	private readonly maxConcurrent: number
	private readonly progressParser: ProgressParser
	private readonly lifecycle: JobLifecycle

	constructor(
		private readonly ytDlp: YtDlp,
		private readonly recentJobsStore: RecentJobsStore,
		private readonly mockMode = false,
		maxConcurrent: number = DEFAULT_MAX_CONCURRENT_DOWNLOADS
	) {
		super()
		this.maxConcurrent = Math.max(1, maxConcurrent)
		this.progressParser = new ProgressParser(
			(jobId, stage, statusKey, params, error) => this.emitStatus(jobId, stage, statusKey, params, error),
			event => this.emit('progress', event)
		)
		this.lifecycle = new JobLifecycle(this.recentJobsStore)
	}

	get activeCount(): number {
		return this.activeJobs.size
	}

	get runningJobCount(): number {
		let count = 0
		for (const active of this.activeJobs.values()) {
			if (!active.cancelRequested && !active.pauseRequested) count++
		}
		return count
	}

	async start(input: StartDownloadInput): Promise<Result<StartDownloadOutput>> {
		if (!input.outputDir) {
			return fail(createAppError('validation', 'outputDir is required'))
		}
		// Boundary check — counts only jobs not yet in cancel/pause-requested
		// state. A paused job consumes no process slot, so resume() is unaffected.
		if (this.runningJobCount >= this.maxConcurrent) {
			return fail(createAppError('validation', `Maximum concurrent downloads (${this.maxConcurrent}) reached. Pause or cancel one before starting another.`))
		}
		const now = nowIso()
		const preparedJob = input.job
		const expectedBytes = preparedJob.kind === 'single-format' ? preparedJob.expectedBytes : undefined
		const job: DownloadJob = {id: randomUUID(), url: input.url, outputDir: input.outputDir, expectedBytes, status: 'running', createdAt: now, updatedAt: now}
		const controller = new AbortController()
		const active: ActiveDownload = {job, input, controller, signal: controller.signal, cancelRequested: false, pauseRequested: false, subtitlePaths: [], tempDir: input.tempDir, disposables: new AsyncStack()}
		this.activeJobs.set(job.id, active)
		logger.info('Download job created', {jobId: job.id, url: job.url, outputDir: job.outputDir, kind: preparedJob.kind})
		const hasSubs = preparedJob.kind !== 'subtitle-only' ? Boolean(preparedJob.subtitles?.languages.length) : true
		const hasSponsorBlock = preparedJob.kind !== 'subtitle-only' && preparedJob.sponsorBlock.mode !== 'off'
		const embedMetadata = preparedJob.kind !== 'subtitle-only' && preparedJob.embed.metadata
		const embedThumbnail = preparedJob.kind !== 'subtitle-only' && preparedJob.embed.thumbnail
		trackMain('download_started', {preset: preparedJob.kind, has_subtitles: hasSubs, has_sponsorblock: hasSponsorBlock, cookies_mode: input.cookiesMode ?? 'off', embed_metadata: embedMetadata, embed_thumbnail: embedThumbnail})
		return this.runJob(active)
	}

	async resume(jobId: string): Promise<Result<{resumed: boolean; job?: DownloadJob}>> {
		const paused = this.pausedJobs.get(jobId)
		if (!paused) {
			logger.info('resume() called but no paused job found', {jobId})
			return ok({resumed: false})
		}

		this.pausedJobs.delete(jobId)
		const {job, input} = paused
		job.status = 'running'
		job.updatedAt = nowIso()
		// Validate the preserved tempDir still exists. OS tmp cleaners, NFS
		// unmounts, and manual deletes can wipe it between pause and resume.
		// Setting tempDir to undefined makes VideoPhase's setupTempDir() recreate
		// it fresh — partial download is lost, but the job runs cleanly instead
		// of failing with an opaque ENOENT inside yt-dlp.
		let resumedTempDir = paused.tempDir
		if (resumedTempDir) {
			try {
				const s = await stat(resumedTempDir)
				if (!s.isDirectory()) resumedTempDir = undefined
			} catch {
				logger.info('Resume: preserved tempDir missing — restarting fresh', {jobId: job.id, tempDir: paused.tempDir})
				resumedTempDir = undefined
			}
		}
		const controller = new AbortController()
		const active: ActiveDownload = {job, input, controller, signal: controller.signal, cancelRequested: false, pauseRequested: false, subtitlePaths: [], tempDir: resumedTempDir, disposables: new AsyncStack()}
		this.activeJobs.set(job.id, active)
		logger.info('Resuming download', {jobId: job.id})

		const result = await this.runJob(active)
		if (!result.ok) {
			if (active.cancelRequested) return ok({resumed: false})
			return fail(result.error)
		}
		return ok({resumed: true, job: result.data.job})
	}

	private async runJob(active: ActiveDownload): Promise<Result<StartDownloadOutput>> {
		const {job} = active
		try {
			this.emitStatus(job.id, 'setup', STATUS_KEY.preparingBinaries)
			await this.ytDlp.prepare((statusKey, params) => {
				this.emitStatus(job.id, 'setup', statusKey, params)
			})

			if (active.cancelRequested) {
				logger.info('Download cancelled before binary setup completed', {jobId: job.id})
				this.emitStatus(job.id, 'error', STATUS_KEY.cancelled)
				await this.finalize(job, 'cancelled')
				return fail(createAppError('download', 'Download cancelled before start'))
			}

			if (this.mockMode) {
				this.emitStatus(job.id, 'token', STATUS_KEY.mintingToken)
				this.emitStatus(job.id, 'download', STATUS_KEY.startingYtdlp)
				this.startMockDownload(job.id)
				return ok({job})
			}

			void this.runPhases(active).catch(async error => {
				const message = error instanceof Error ? error.message : 'Unknown phase failure'
				logger.error('Download phase threw unexpectedly', {jobId: job.id, message})
				const payload: LocalizedError = {kind: 'unknown', raw: message}
				this.emitStatus(job.id, 'error', STATUS_KEY.unknownStartupFailure, undefined, payload)
				await this.finalize(job, 'failed', payload)
			})

			return ok({job})
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Unknown download startup failure'
			const payload: LocalizedError = {kind: 'unknown', raw: message}
			this.emitStatus(job.id, 'error', STATUS_KEY.unknownStartupFailure, undefined, payload)
			await this.finalize(job, 'failed', payload)
			return fail(createAppError('download', message))
		}
	}

	private async runPhases(active: ActiveDownload): Promise<void> {
		const {job, input} = active
		const ctx: PhaseContext = {
			active,
			signal: active.signal,
			ytDlp: this.ytDlp,
			emitStatus: (stage, statusKey, params?, error?) => this.emitStatus(job.id, stage, statusKey, params, error),
			register: disposable =>
				active.disposables.defer(async () => {
					try {
						await disposable()
					} catch (err) {
						logger.warn('disposable threw during drain', {jobId: active.job.id, message: err instanceof Error ? err.message : String(err)})
					}
				}),
			safeConsume: text => this.safeConsume(active, text)
		}
		const outcome = await new PhaseExecutor().run(ctx, phasesFor(input))
		await this.handleOutcome(active, outcome)
	}

	private async handleOutcome(active: ActiveDownload, outcome: PhaseOutcome): Promise<void> {
		const {job, input} = active
		switch (outcome.kind) {
			case 'completed':
			case 'soft-failed':
				await this.finalize(job, 'completed')
				return
			case 'hard-failed':
				await this.finalize(job, 'failed', outcome.error)
				return
			case 'cancelled':
				await this.finalize(job, 'cancelled')
				return
			case 'paused':
				// Cancel may have landed between pauseRequested and the phase
				// returning the paused outcome. Honor the more recent intent: drain
				// and finalize as cancelled rather than parking a job whose
				// processes are already dead.
				if (active.cancelRequested) {
					this.emitStatus(job.id, 'error', STATUS_KEY.cancelled)
					await this.finalize(job, 'cancelled')
					return
				}
				this.activeJobs.delete(job.id)
				this.pausedJobs.set(job.id, {job, input, tempDir: active.tempDir})
				logger.info('Download paused — temp dir preserved', {jobId: job.id, tempDir: active.tempDir})
				return
			case 'continue':
				// Should not surface here — PhaseExecutor consumes 'continue' by
				// moving to the next phase. Treat as completed defensively.
				await this.finalize(job, 'completed')
				return
		}
	}

	private safeConsume(active: ActiveDownload, text: string): void {
		try {
			this.consumeProgress(active, text)
		} catch (err) {
			logger.warn('consumeProgress threw', {jobId: active.job.id, message: err instanceof Error ? err.message : String(err)})
		}
	}

	async cancel(jobId?: string): Promise<Result<CancelDownloadOutput>> {
		if (jobId) {
			const active = this.activeJobs.get(jobId)
			if (active) {
				logger.info('Cancelling active job', {jobId})
				return this.cancelOne(active)
			}

			const paused = this.pausedJobs.get(jobId)
			if (paused) {
				logger.info('Cancelling paused job — cleaning up temp dir and .part files', {jobId, outputDir: paused.job.outputDir})
				this.pausedJobs.delete(jobId)
				if (paused.tempDir) await this.cleanupTempDirByPath(paused.tempDir)
				await this.cleanupPartFiles(paused.job.outputDir)
				return ok({cancelled: true})
			}

			logger.info('cancel() called but no job found', {jobId})
			return ok({cancelled: false})
		}

		const hadJobs = this.activeJobs.size > 0 || this.pausedJobs.size > 0
		logger.info('Cancelling all jobs', {activeCount: this.activeJobs.size, pausedCount: this.pausedJobs.size})
		await Promise.all([...this.activeJobs.values()].map(a => this.cancelOne(a)))
		await Promise.all(
			[...this.pausedJobs.values()].map(async paused => {
				if (paused.tempDir) await this.cleanupTempDirByPath(paused.tempDir)
				await this.cleanupPartFiles(paused.job.outputDir)
			})
		)
		this.pausedJobs.clear()
		return ok({cancelled: hadJobs})
	}

	// eslint-disable-next-line @typescript-eslint/require-await -- IPC handler signature requires Promise
	async pause(jobId?: string): Promise<Result<PauseDownloadOutput>> {
		const active = jobId ? this.activeJobs.get(jobId) : [...this.activeJobs.values()][0]
		if (!active) {
			logger.info('pause() called but no active job found', {jobId})
			return ok({paused: false})
		}

		logger.info('Pausing download', {jobId: active.job.id})

		if (active.mockTimer) {
			clearInterval(active.mockTimer)
			active.mockTimer = undefined
			this.activeJobs.delete(active.job.id)
			this.pausedJobs.set(active.job.id, {job: active.job, input: active.input})
			logger.info('Mock download paused', {jobId: active.job.id})
			return ok({paused: true, jobId: active.job.id})
		}

		if (!active.ytDlpProcess && !active.ffmpegProcess) {
			logger.info('pause() called but job has no process yet', {jobId: active.job.id})
			return ok({paused: false})
		}

		active.pauseRequested = true
		// killActiveProcesses tree-kills both yt-dlp and ffmpeg (when present)
		// via process-group on Unix and taskkill /T on Windows. Pause may land
		// mid-mux (SidecarSubsPhase.runEmbedMux); without killing ffmpeg too, the
		// mux completes after the user thinks they paused.
		killActiveProcesses(active, 'SIGTERM')
		logger.info('SIGTERM sent to active processes', {jobId: active.job.id})
		return ok({paused: true, tempDir: active.tempDir, jobId: active.job.id})
	}

	private async cancelOne(active: ActiveDownload): Promise<Result<CancelDownloadOutput>> {
		active.cancelRequested = true
		// controller.abort() drops the AbortSignal; any in-flight ytDlp.run that
		// received `signal: active.signal` will SIGKILL its child and resolve
		// with a Cancelled exit-error. Mirrors the cancelRequested flag for code
		// paths that already poll the boolean.
		active.controller.abort()

		if (active.ytDlpProcess || active.ffmpegProcess) {
			logger.info('Sending SIGKILL to active processes', {jobId: active.job.id})
			killActiveProcesses(active, 'SIGKILL')
			return ok({cancelled: true})
		}

		if (active.mockTimer) {
			const {job} = active
			logger.info('Clearing mock download timer', {jobId: job.id})
			clearInterval(active.mockTimer)
			active.mockTimer = undefined
			await this.cleanupPartFiles(job.outputDir)
			this.emitStatus(job.id, 'error', STATUS_KEY.cancelled)
			await this.finalize(job, 'cancelled')
			return ok({cancelled: true})
		}

		logger.info('cancelOne() — job had no process or timer (pre-spawn cancel)', {jobId: active.job.id})
		return ok({cancelled: true})
	}

	async cleanupPartFiles(outputDir: string): Promise<void> {
		await cleanupPartFiles(outputDir)
	}

	private async cleanupTempDirByPath(tempDir: string): Promise<void> {
		await cleanupTempDirByPath(tempDir)
	}

	private consumeProgress(active: ActiveDownload, text: string): void {
		this.progressParser.consume(active, text)
	}

	private emitStatus(jobId: string, stage: StatusEvent['stage'], statusKey: StatusKey, params?: Record<string, string | number>, error?: LocalizedError): void {
		const event: StatusEvent = {jobId, stage, statusKey, params, error, at: nowIso()}
		this.emit('status', event)
		if (stage === 'error') logger.error(statusKey, {jobId, stage, params})
		else logger.info(statusKey, {jobId, stage, params})
	}

	private async finalize(job: DownloadJob, status: RecentJob['status'], error?: LocalizedError): Promise<void> {
		const active = this.activeJobs.get(job.id)
		this.activeJobs.delete(job.id)
		// Drain LIFO disposables (process kills, tempDir removals, watchdog
		// timers) before writing the RecentJob entry. Per-disposable failures
		// log + continue; a stuck cleanup can't block finalize.
		if (active) await this.lifecycle.drain(active)
		await this.lifecycle.finalize(job, status, error)
	}

	private startMockDownload(jobId: string): void {
		const active = this.activeJobs.get(jobId)
		if (!active) return
		let percent = 0

		const timer = setInterval(() => {
			percent += 10

			const line = `[download] ${percent.toFixed(1)}% of ~10MiB at 1.2MiB/s ETA 00:0${Math.max(0, 10 - percent / 10)}`
			this.consumeProgress(active, line)

			if (percent >= 100) {
				clearInterval(timer)
				this.emitStatus(jobId, 'done', STATUS_KEY.complete)
				void this.finalize(active.job, 'completed')
			}
		}, 250)

		active.mockTimer = timer
	}
}
