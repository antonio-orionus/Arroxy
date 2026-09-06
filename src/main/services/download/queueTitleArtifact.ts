// Artifact ingest with the Layer 2 title backstop. Records the artifact and,
// when a media file lands on a still-flagged row whose job template has the
// default shape, backfills the row title from the artifact basename.
//
// Follows the queueOutputTargetMove host-interface pattern: no queue state
// here, target resolution reads through the injected host and the mutation
// goes back through commitPatch — commit() in QueueService remains the
// queue's only writer. Final artifacts for already-done jobs resolve via the
// remembered targets, mirroring the previous inline lookup.

import {moveQueueArtifactPath, queueArtifactFromPath, upsertQueueArtifact} from '@shared/queueArtifacts.js'
import {deriveTitleFromArtifact, withBackfilledTitle} from '@shared/queueTitle.js'
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
	const artifact = queueArtifactFromPath(event.path, {kind: event.kind, discoveredAt: event.at, internal: event.internal})
	// A media file landing on a still-flagged row proves the real title via
	// its basename — but only for default-shape templates, where the title
	// portion is unambiguous. Subtitle-only jobs emit no media artifact and
	// skip this path by construction.
	const backfilledTitle = event.kind === 'media' && item.titleIsPlaceholder === true ? deriveTitleFromArtifact(artifact.fileName, 'filenameTemplate' in item.job ? item.job.filenameTemplate : undefined) : null
	host.commitPatch(item.id, `artifact:${event.kind}`, prev => {
		const applyTitle = (next: QueueItem): QueueItem => (backfilledTitle !== null && next.titleIsPlaceholder === true ? withBackfilledTitle(next, backfilledTitle) : next)
		if (!event.fromPath) return applyTitle({...prev, artifacts: upsertQueueArtifact(prev.artifacts, artifact)})
		if (!prev.artifacts.some(existing => existing.path === event.fromPath)) return applyTitle({...prev, artifacts: upsertQueueArtifact(prev.artifacts, artifact)})
		return applyTitle({...prev, artifacts: upsertQueueArtifact(moveQueueArtifactPath(prev.artifacts, event.fromPath, event.path), artifact)})
	})
}
