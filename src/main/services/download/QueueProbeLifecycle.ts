// Probe-stage lifecycle for queue items. A `probing` item is a placeholder row
// created by a blind path (the global hotkey) before its yt-dlp probe has
// resolved real formats: the scheduler must never spawn it, cancelling it must
// abort exactly its own probe, and it cannot survive an app restart.
//
// Extracted from QueueService (same pattern as QueueAutoRetry) so the
// scheduler keeps its single responsibility. Holds no queue state — every
// mutation goes back through the injected commit callbacks.

import log from 'electron-log/main.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import {fail, ok, type Result} from '@shared/result.js'
import {createAppError} from '@main/utils/errorFactory.js'
import {findInadmissibleQueueItem, findLiveDuplicate} from './queueAdmission.js'
import type {LocalizedError, QueueItem} from '@shared/types.js'

const logger = log.scope('queue')

export interface QueueProbeLifecycleDeps {
	items: () => readonly QueueItem[]
	patch: (itemId: string, reason: string, patcher: (item: QueueItem) => QueueItem) => void
	commitEvent: (itemId: string, evt: {kind: 'probe-failed'; error: LocalizedError} | {kind: 'cancelled'}) => void
	// Raw commit seams for the atomic swap: remove + add run back-to-back with
	// no await between them, so no other command can interleave.
	commitRemove: (itemId: string) => void
	commitAdd: (items: QueueItem[]) => void
}

export class QueueProbeLifecycle {
	constructor(private readonly deps: QueueProbeLifecycleDeps) {}

	// Terminal state for a probe: the item's probe finished without a job. The
	// renderer reports it after its hotkey probe fails; only a probing item
	// accepts the transition (illegalTransition rejects it elsewhere).
	probeFailed(itemId: string, error: LocalizedError): boolean {
		const item = this.deps.items().find(candidate => candidate.id === itemId)
		if (!item || item.status !== QUEUE_STATUS.probing) return false
		this.deps.commitEvent(itemId, {kind: 'probe-failed', error})
		return true
	}

	// A `probing` item never survived a restart (its probe died with the
	// previous process). Promote to an error row the user can remove — no
	// silent drop, no surprise auto-reprobe on boot.
	promoteStaleProbes(items: readonly QueueItem[]): void {
		for (const item of items) {
			if (item.status !== QUEUE_STATUS.probing) continue
			this.deps.patch(item.id, 'boot:stale-probe', prev => ({...prev, status: QUEUE_STATUS.error, error: {kind: 'unknown', raw: 'App restarted while fetching video details'}}))
		}
	}

	// Atomic probe-stage swap: a hotkey placeholder's probe resolved real items.
	// Either the placeholder is still `probing` and the swap commits as one
	// synchronous mutation pair (validate → remove → add, no awaits between
	// them, so no renderer command can interleave), or the placeholder is
	// gone/failed and NOTHING is enqueued — the caller gets an error instead of
	// orphaned prepared items downloading after the user cancelled the
	// submission.
	replaceProbing(itemId: string, items: QueueItem[]): Result<{ids: string[]}> {
		const placeholder = this.deps.items().find(candidate => candidate.id === itemId)
		if (!placeholder || placeholder.status !== QUEUE_STATUS.probing) {
			return fail(createAppError('validation', `probing placeholder ${itemId} is no longer active`))
		}
		const rejected = findInadmissibleQueueItem(items)
		if (rejected) return fail(createAppError('validation', rejected.message))
		const duplicate = findLiveDuplicate(
			items,
			this.deps.items().filter(item => item.id !== itemId)
		)
		if (duplicate) return fail(createAppError('conflict', duplicate.message))
		if (items.length === 0) {
			this.deps.commitRemove(itemId)
			return ok({ids: []})
		}
		this.deps.commitRemove(itemId)
		this.deps.commitAdd(items)
		logger.info('replaceProbing', {itemId, replacedBy: items.map(i => i.id)})
		return ok({ids: items.map(i => i.id)})
	}
}
