// Probe-stage lifecycle for queue items. A `probing` item is a placeholder row
// created by a blind path (the global hotkey) before its yt-dlp probe has
// resolved real formats: the scheduler must never spawn it, cancelling it must
// abort exactly its own probe, and it cannot survive an app restart.
//
// Extracted from QueueService (same pattern as QueueAutoRetry) so the
// scheduler keeps its single responsibility. Holds no queue state — every
// mutation goes back through the injected commit callbacks.

import {QUEUE_STATUS} from '@shared/schemas.js'
import type {LocalizedError, QueueItem} from '@shared/types.js'

export interface QueueProbeLifecycleDeps {
	findItem: (itemId: string) => QueueItem | undefined
	patch: (itemId: string, reason: string, patcher: (item: QueueItem) => QueueItem) => void
	commitEvent: (itemId: string, evt: {kind: 'probe-failed'; error: LocalizedError} | {kind: 'cancelled'}) => void
}

export class QueueProbeLifecycle {
	constructor(private readonly deps: QueueProbeLifecycleDeps) {}

	// Terminal state for a probe: the item's probe finished without a job. The
	// renderer reports it after its hotkey probe fails; only a probing item
	// accepts the transition (illegalTransition rejects it elsewhere).
	probeFailed(itemId: string, error: LocalizedError): boolean {
		const item = this.deps.findItem(itemId)
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
}
