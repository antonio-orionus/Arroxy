// How a phase-status event lands on its queue item, extracted from QueueService
// so the scheduler class stays under the repo's LOC cap.

import {STATUS_KEY} from '@shared/schemas.js'
import type {QueueItem, StatusEvent} from '@shared/types.js'

export interface PhaseStatusHost {
	patch(reason: string, patcher: (item: QueueItem) => QueueItem): void
	// Writes the queue now, even inside a bulk command that defers its writes.
	persistNow(): void
}

// Most statuses only replace the visible status line. `signingInWithExplore`
// also records that the job now runs on the Explore session; DownloadService
// emits it synchronously right before the signed-in spawn, so the item is on
// disk as signed in before that spawn starts and a restart never resumes it
// anonymously.
export function commitPhaseStatus(host: PhaseStatusHost, event: Pick<StatusEvent, 'statusKey' | 'params'>): void {
	const escalated = event.statusKey === STATUS_KEY.signingInWithExplore
	host.patch(`phase:${event.statusKey}`, prev => ({...prev, ...(escalated ? {auth: 'exploreSession' as const} : {}), lastStatus: {key: event.statusKey, params: event.params}, progressDetail: null}))
	if (escalated) host.persistNow()
}
