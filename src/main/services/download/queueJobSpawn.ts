// Starts a queue row's download, then settles the row against whatever happened
// to it while the start was awaited (binary setup, the probe cache). Extracted
// from QueueService so the scheduler class stays under the repo's LOC cap;
// QueueService still owns the `spawning` set around the call.

import log from 'electron-log/main.js'
import {fail, ok, type Result} from '@shared/result.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import type {QueueEvent} from '@shared/queueTransition.js'
import type {QueueItem} from '@shared/types.js'
import type {DownloadService} from '../DownloadService.js'
import type {ProbeInfoJsonCache} from '../ProbeInfoJsonCache.js'
import {QueueResumeLifecycle} from './QueueResumeLifecycle.js'
import {resolveStartIdentity} from './queueStartIdentity.js'
import {createAppError} from '@main/utils/errorFactory.js'

const logger = log.scope('queue')

export interface QueueJobSpawnDeps {
	downloadService: Pick<DownloadService, 'start' | 'resume' | 'pause' | 'cancel'>
	probeInfoJsonCache?: ProbeInfoJsonCache
	findItem: (itemId: string) => QueueItem | undefined
	commitEvent: (itemId: string, evt: QueueEvent) => void
	patch: (itemId: string, reason: string, patcher: (prev: QueueItem) => QueueItem) => void
	// Ends the row's spawn. Called in the same tick as the commit that settles the
	// row, so the scheduler never counts a running row and its spawn together.
	settled: () => void
}

export async function spawnQueueJob(deps: QueueJobSpawnDeps, item: QueueItem, tempDir: string | undefined): Promise<Result<void>> {
	// A row Resume All moved back to pending still names the job it parked:
	// resume that job, which keeps its state (a quality limit among it), rather
	// than start a new one beside it.
	if (item.status === QUEUE_STATUS.pending && item.lastJobId) {
		const resumed = await resumeParkedJob(deps, item, item.lastJobId)
		if (resumed !== 'notParked') return resumed
	}
	const effectiveTempDir = QueueResumeLifecycle.tempDirForQueueStart(item, tempDir)
	const {auth, replayProbeInfoJson} = resolveStartIdentity(item)
	const probeInfoJsonPath = replayProbeInfoJson && item.probeInfoJsonRef && deps.probeInfoJsonCache ? await deps.probeInfoJsonCache.resolve(item.probeInfoJsonRef) : undefined
	if (item.probeInfoJsonRef) {
		logger.info('probe info-json resolved', {itemId: item.id, probeInfoJsonRef: item.probeInfoJsonRef, probeInfoJsonPath: probeInfoJsonPath ?? null})
	}
	const result = await deps.downloadService.start({url: item.url, outputDir: item.outputDir, job: item.job, tempDir: effectiveTempDir, ...(auth === 'exploreSession' ? {auth} : {}), ...(probeInfoJsonPath ? {probeInfoJsonPath, ...(item.probeInfoJsonRef?.formatsWithheld ? {probeFormatsWithheld: true} : {})} : {})})
	if (!result.ok) {
		deps.commitEvent(item.id, {kind: 'failed', error: {kind: 'unknown', raw: result.error.message}, resumeContext: item.resumeContext})
		deps.settled()
		return fail(result.error)
	}
	const jobId = result.data.job.id
	return settleStartedJob(deps, item, jobId, {kind: 'started', lastJobId: jobId}, effectiveTempDir)
}

// 'notParked': no parked job by that id (the app restarted since the pause), so
// the caller starts a fresh job from the row's temp dir.
async function resumeParkedJob(deps: QueueJobSpawnDeps, item: QueueItem, jobId: string): Promise<Result<void> | 'notParked'> {
	const resumed = await deps.downloadService.resume(jobId)
	if (resumed.ok && resumed.data.resumed) return settleStartedJob(deps, item, jobId, {kind: 'resumed'}, item.tempDir)
	// The wait can be long: a pause, cancel or remove may have moved the row on.
	const current = deps.findItem(item.id)
	if (current?.status !== item.status || current.lastJobId !== jobId) {
		deps.settled()
		return ok(undefined)
	}
	if (!resumed.ok) {
		deps.commitEvent(item.id, {kind: 'failed', error: {kind: 'unknown', raw: resumed.error.message}})
		deps.settled()
		return fail(resumed.error)
	}
	if (resumed.data.jobLive) {
		// Its pause has not parked yet: a fresh start would leave the old job beside
		// it. Back to paused, where a later resume picks the job up.
		deps.patch(item.id, 'spawn:stillParking', prev => ({...prev, status: QUEUE_STATUS.pausedActive}))
		deps.settled()
		return fail(createAppError('conflict', 'The download is still pausing; resume it again in a moment'))
	}
	return 'notParked'
}

// `item` predates the await and commit replaces slots rather than mutating, so
// `item.status` is the pre-start snapshot. Comparing against it, not against
// `pending`, keeps a cross-restart resume (still `paused-active`) running.
async function settleStartedJob(deps: QueueJobSpawnDeps, item: QueueItem, jobId: string, evt: QueueEvent, tempDir: string | undefined): Promise<Result<void>> {
	const current = deps.findItem(item.id)
	if (current?.status === item.status) {
		deps.commitEvent(item.id, evt)
		deps.settled()
		return ok(undefined)
	}
	if (current?.status === QUEUE_STATUS.pausedHeld) {
		// Paused, alone or by Pause All, while it was still starting: park the job
		// it just started instead of running it, so a resume continues that job.
		deps.patch(item.id, 'spawn:pausedWhileStarting', prev => ({...prev, status: QUEUE_STATUS.pausedActive, lastJobId: jobId, progressDetail: null, ...(tempDir ? {tempDir} : {})}))
		deps.settled()
		const paused = await deps.downloadService.pause(jobId)
		if (!paused.ok || !paused.data.paused) {
			logger.warn('spawn: could not park a download paused while starting', {itemId: item.id, jobId, error: paused.ok ? null : paused.error.message})
			return fail(paused.ok ? createAppError('conflict', 'The download ended before it could be paused') : paused.error)
		}
		return ok(undefined)
	}
	await deps.downloadService.cancel(jobId)
	return ok(undefined)
}
