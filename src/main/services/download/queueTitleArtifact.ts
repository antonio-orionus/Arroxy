// Artifact ingest with the Layer 2 title backstop. Records the artifact and,
// when a media file (or a subtitles-only job's subtitle file) lands on a
// still-flagged row, backfills the row title from
// the title the event carries: the one yt-dlp wrote into the job's info-json.
// The filename is never parsed for it — yt-dlp sanitizes and trims names, and
// the template decides where the title sits.
//
// Follows the queueOutputTargetMove host-interface pattern: no queue state
// here, target resolution reads through the injected host and the mutation
// goes back through commitPatch — commit() in QueueService remains the
// queue's only writer. Final artifacts for already-done jobs resolve via the
// remembered targets, mirroring the previous inline lookup.

import {moveQueueArtifactPath, queueArtifactFromPath, upsertQueueArtifact} from '@shared/queueArtifacts.js'
import {withBackfilledTitle} from '@shared/queueTitle.js'
import type {QueueArtifactEvent, QueueItem} from '@shared/types.js'
import type {FinalArtifactTargets} from '../finalArtifactTargets.js'

export interface QueueArtifactIngestHost {
	items: () => readonly QueueItem[]
	finalTargets: FinalArtifactTargets
	commitPatch: (itemId: string, reason: string, patcher: (item: QueueItem) => QueueItem) => void
}

function findTarget(host: QueueArtifactIngestHost, jobId: string): QueueItem | undefined {
	const active = host.items().find(item => item.lastJobId === jobId)
	if (active) return active
	const itemId = host.finalTargets.get(jobId)
	return itemId ? host.items().find(item => item.id === itemId) : undefined
}

export function ingestQueueArtifactEvent(host: QueueArtifactIngestHost, event: QueueArtifactEvent): void {
	const item = findTarget(host, event.jobId)
	if (!item) return
	const artifact = queueArtifactFromPath(event.path, {kind: event.kind, discoveredAt: event.at, internal: event.internal, sizeBytes: event.sizeBytes})
	// Without a title on the event the placeholder stays. A subtitles-only job
	// has no media file, so its subtitles carry the title.
	const backfilledTitle = (event.kind === 'media' || event.kind === 'subtitle') && item.titleIsPlaceholder === true && event.title ? event.title : null
	host.commitPatch(item.id, `artifact:${event.kind}`, prev => {
		const applyTitle = (next: QueueItem): QueueItem => (backfilledTitle !== null && next.titleIsPlaceholder === true ? withBackfilledTitle(next, backfilledTitle) : next)
		if (!event.fromPath) return applyTitle({...prev, artifacts: upsertQueueArtifact(prev.artifacts, artifact)})
		if (!prev.artifacts.some(existing => existing.path === event.fromPath)) return applyTitle({...prev, artifacts: upsertQueueArtifact(prev.artifacts, artifact)})
		return applyTitle({...prev, artifacts: upsertQueueArtifact(moveQueueArtifactPath(prev.artifacts, event.fromPath, event.path), artifact)})
	})
}
