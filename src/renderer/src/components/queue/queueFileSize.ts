import type {QueueArtifact} from '@shared/types.js'
import {visibleQueueArtifacts} from '@shared/queueArtifacts.js'

// Total on-disk size of a row's visible files, or null when none has a known
// size (unfinished rows, and rows finished before sizes were recorded).
export function queueItemSizeBytes(artifacts: readonly QueueArtifact[]): number | null {
	let total: number | null = null
	for (const artifact of visibleQueueArtifacts(artifacts)) {
		if (artifact.missing || artifact.sizeBytes === undefined) continue
		total = (total ?? 0) + artifact.sizeBytes
	}
	return total
}

// True when the row recorded files and every one of them is gone from disk.
export function queueItemFilesMissing(artifacts: readonly QueueArtifact[]): boolean {
	const visible = visibleQueueArtifacts(artifacts)
	return visible.length > 0 && visible.every(artifact => artifact.missing === true)
}

export function formatQueueByteSize(sizeBytes: number): string {
	if (sizeBytes < 1024) return `${sizeBytes} B`
	const units = ['KiB', 'MiB', 'GiB', 'TiB']
	let value = sizeBytes / 1024
	let unit = units[0]
	for (const nextUnit of units.slice(1)) {
		if (value < 1024) break
		value /= 1024
		unit = nextUnit
	}
	return `${value.toFixed(value >= 10 ? 0 : 1)} ${unit}`
}
