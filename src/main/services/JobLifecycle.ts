import log from 'electron-log/main.js'
import {trackMain, downloadDurationBucket, sizeBucket} from '@main/services/analytics.js'
import {nowIso} from '@main/utils/clock.js'
import type {DownloadJob, LocalizedError, RecentJob} from '@shared/types.js'
import type {RecentJobsStore} from '@main/stores/RecentJobsStore.js'
import type {ActiveJob} from './phases/types.js'

const logger = log.scope('lifecycle')

// Single-source job lifecycle: drain LIFO, persist a RecentJob, log analytics.
// Replaces three scattered cleanup paths in DownloadService (cancel /
// paused-cancel / mock-cancel) plus the inline cleanup blocks in
// PhaseExecutor.run. Every cleanup goes through `finalize`; every spawn /
// tempDir creation registers a disposable on the ActiveJob.
//
// Disposables drain LIFO with try/catch per entry — one failure cannot block
// the next. This is the same shape as Go's `defer`: tear down in reverse
// order of acquisition.
export class JobLifecycle {
	constructor(private readonly recentJobsStore: RecentJobsStore) {}

	async drain(active: ActiveJob): Promise<void> {
		await active.disposables[Symbol.asyncDispose]()
	}

	async finalize(job: DownloadJob, status: RecentJob['status'], error?: LocalizedError): Promise<void> {
		logger.info('Job finalized', {jobId: job.id, status, ...(error && {error})})

		job.status = status
		job.updatedAt = nowIso()

		const durationMs = new Date(job.updatedAt).getTime() - new Date(job.createdAt).getTime()
		if (status === 'completed') {
			trackMain('download_finished', {duration_bucket: downloadDurationBucket(durationMs), ...(job.expectedBytes != null ? {size_bucket: sizeBucket(job.expectedBytes)} : {})})
		} else if (status === 'cancelled') {
			trackMain('download_cancelled', {duration_bucket: downloadDurationBucket(durationMs)})
		} else {
			trackMain('download_failed', {duration_bucket: downloadDurationBucket(durationMs), error_category: error?.kind ?? 'unknown', ...(job.expectedBytes != null ? {size_bucket: sizeBucket(job.expectedBytes)} : {})})
		}

		const recent: RecentJob = {id: job.id, url: job.url, outputDir: job.outputDir, formatId: job.formatId, status, finishedAt: job.updatedAt, error}

		await this.recentJobsStore.push(recent)
	}
}

export type {LocalizedError, RecentJob, DownloadJob}
