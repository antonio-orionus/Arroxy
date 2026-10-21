// Probe-stage lifecycle for queue items. A placeholder row is placed by a
// quick download (the URL tab, Explore, or the global hotkey) before its
// yt-dlp probe has resolved real formats. While `probing` the scheduler must
// never spawn it and cancelling it aborts exactly its own probe; a probe that
// cannot outlive the process does not survive a restart. `needs-choice` holds
// the row until the user decides, and survives a restart: it has no probe.
// Cancelling either placeholder removes it — it never became a download.
//
// Extracted from QueueService (same pattern as QueueAutoRetry) so the
// scheduler keeps its single responsibility. Holds no queue state — every
// mutation goes back through the injected commit callbacks.

import log from 'electron-log/main.js'
import type {IntakeOrigin} from '@shared/intake/intakeSchemas.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import {fail, ok, type Result} from '@shared/result.js'
import {createAppError} from '@main/utils/errorFactory.js'
import {admitAgainstLiveQueue, findInadmissibleQueueItem} from './queueAdmission.js'
import type {JobAuth, QueueChoice} from '@shared/schemas.js'
import type {LocalizedError, QueueItem} from '@shared/types.js'

const logger = log.scope('queue')

export interface QueueProbeLifecycleDeps {
	items: () => readonly QueueItem[]
	patch: (itemId: string, reason: string, patcher: (item: QueueItem) => QueueItem) => void
	commitEvent: (itemId: string, evt: {kind: 'probe-failed'; error: LocalizedError; auth?: JobAuth} | {kind: 'needs-choice'; choice: QueueChoice; title: string} | {kind: 'probe-restarted'}) => void
	abortProbe: (itemId: string) => void
	// Raw commit seams for the atomic swap: remove + add run back-to-back with
	// no await between them, so no other command can interleave.
	commitRemove: (itemId: string) => void
	commitAdd: (items: QueueItem[]) => void
	// How many rows one intake may become, by who took it in; null for no limit.
	rowsPerIntake: (origin: IntakeOrigin) => number | null
}

export class QueueProbeLifecycle {
	constructor(private readonly deps: QueueProbeLifecycleDeps) {}

	// The probe ended without a job: the renderer reports a failure, or a
	// decision only the user can make. Only a probing row accepts either.
	probeFailed(itemId: string, error: LocalizedError, auth?: JobAuth): Result<void> {
		return this.resolveProbing(itemId, {kind: 'probe-failed', error, ...(auth ? {auth} : {})})
	}

	needsChoice(itemId: string, choice: QueueChoice, title: string): Result<void> {
		return this.resolveProbing(itemId, {kind: 'needs-choice', choice, title})
	}

	// Back to `probing` so the renderer can run the probe again: a Retry on a
	// probe-error row, or a choice that needs a fresh probe.
	reprobe(itemId: string): Result<void> {
		const item = this.find(itemId)
		const restartable = item?.status === QUEUE_STATUS.needsChoice || (item?.status === QUEUE_STATUS.error && item.job.kind === 'unresolved')
		if (!restartable) return fail(createAppError('validation', `queue item ${itemId} has no probe to restart`))
		this.deps.commitEvent(itemId, {kind: 'probe-restarted'})
		return ok(undefined)
	}

	// Cancel and Remove of a placeholder: abort its probe, drop the row.
	// Returns false for every other row, which the caller handles itself.
	discard(item: QueueItem): boolean {
		if (item.status !== QUEUE_STATUS.probing && item.status !== QUEUE_STATUS.needsChoice) return false
		if (item.status === QUEUE_STATUS.probing) this.deps.abortProbe(item.id)
		this.deps.commitRemove(item.id)
		return true
	}

	private find(itemId: string): QueueItem | undefined {
		return this.deps.items().find(candidate => candidate.id === itemId)
	}

	private resolveProbing(itemId: string, evt: {kind: 'probe-failed'; error: LocalizedError; auth?: JobAuth} | {kind: 'needs-choice'; choice: QueueChoice; title: string}): Result<void> {
		const item = this.find(itemId)
		if (item?.status !== QUEUE_STATUS.probing) return fail(createAppError('validation', `${evt.kind} is a stale signal for item ${itemId}`))
		this.deps.commitEvent(itemId, evt)
		return ok(undefined)
	}

	// A `probing` item never survived a restart (its probe died with the
	// previous process). Promote to a probe-error row the user can retry or
	// remove — no silent drop, no surprise auto-reprobe on boot.
	promoteStaleProbes(items: readonly QueueItem[]): void {
		for (const item of items) {
			if (item.status !== QUEUE_STATUS.probing) continue
			this.deps.patch(item.id, 'boot:stale-probe', prev => ({...prev, status: QUEUE_STATUS.error, error: {kind: 'unknown', raw: 'App restarted while fetching video details'}}))
		}
	}

	// Atomic probe-stage swap: a placeholder's probe resolved real items.
	// Either the placeholder is still live and the swap commits as one
	// synchronous mutation pair (validate → remove → add, no awaits between
	// them, so no renderer command can interleave), or the placeholder is
	// gone/failed and NOTHING is enqueued — the caller gets an error instead of
	// orphaned prepared items downloading after the user cancelled the
	// submission.
	//
	// Rows whose video is already live are left out here, where the queue of
	// record is read in the same tick as the swap, and counted: an overlapping
	// playlist prepared at the same time still queues its new entries. Only a
	// batch with nothing new is refused as a conflict, keeping the placeholder.
	// Every row the placeholder becomes carries its intake origin, and a batch
	// over the intake's admission limit is refused before anything is committed.
	replaceProbing(itemId: string, items: QueueItem[]): Result<{ids: string[]; skippedAlreadyQueued: number}> {
		const placeholder = this.find(itemId)
		if (placeholder?.status !== QUEUE_STATUS.probing && placeholder?.status !== QUEUE_STATUS.needsChoice) {
			return fail(createAppError('validation', `probing placeholder ${itemId} is no longer active`))
		}
		const rejected = findInadmissibleQueueItem(items)
		if (rejected) return fail(createAppError('validation', rejected.message))
		const admission = admitAgainstLiveQueue(
			items,
			this.deps.items().filter(item => item.id !== itemId)
		)
		if (!admission.ok) return admission
		const {admitted, skippedAlreadyQueued} = admission.data
		const {origin} = placeholder
		const limit = origin ? this.deps.rowsPerIntake(origin) : null
		if (limit !== null && admitted.length > limit) return fail(createAppError('limit', `intake ${origin?.intakeId} may add at most ${limit} rows, not ${admitted.length}`))
		this.deps.commitRemove(itemId)
		if (admitted.length === 0) return ok({ids: [], skippedAlreadyQueued})
		const queued = withPlaceholderId(itemId, items, origin ? admitted.map(item => ({...item, origin})) : admitted)
		this.deps.commitAdd(queued)
		logger.info('replaceProbing', {itemId, replacedBy: queued.map(i => i.id), skippedAlreadyQueued})
		return ok({ids: queued.map(i => i.id), skippedAlreadyQueued})
	}
}

// The batch's row that carried the placeholder's id may be one left out; the
// first queued row then takes the id, so whatever names the placeholder (a
// toast's View) still finds a row.
function withPlaceholderId(itemId: string, items: readonly QueueItem[], admitted: QueueItem[]): QueueItem[] {
	const [first, ...rest] = admitted
	if (!first || admitted.some(item => item.id === itemId) || !items.some(item => item.id === itemId)) return admitted
	return [{...first, id: itemId}, ...rest]
}
