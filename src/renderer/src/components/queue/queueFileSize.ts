import type {QueueArtifact} from '@shared/types.js'
import {visibleQueueArtifacts} from '@shared/queueArtifacts.js'

// Total on-disk size of a row's visible files, or null when it is not fully
// known: no file has a size yet (unfinished rows), or a file still on disk has
// none, where a partial sum would understate the download. Missing files are
// left out.
export function queueItemSizeBytes(artifacts: readonly QueueArtifact[]): number | null {
	let total: number | null = null
	for (const artifact of visibleQueueArtifacts(artifacts)) {
		if (artifact.missing === true) continue
		if (artifact.sizeBytes === undefined) return null
		total = (total ?? 0) + artifact.sizeBytes
	}
	return total
}

// True when the row recorded files and every one of them is gone from disk.
export function queueItemFilesMissing(artifacts: readonly QueueArtifact[]): boolean {
	const visible = visibleQueueArtifacts(artifacts)
	return visible.length > 0 && visible.every(artifact => artifact.missing === true)
}
