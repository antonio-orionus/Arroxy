// Load-time check of finished rows' files against the disk: fills sizes for
// files recorded before sizes were stored, marks files that were moved or
// deleted outside Arroxy as missing, and clears that mark when a file is back
// (a reconnected drive, a file moved back).
//
// No queue state here: the caller applies the returned patches through its own
// commit path, so QueueService remains the queue's only writer.

import {QUEUE_STATUS} from '@shared/schemas.js'
import {visibleQueueArtifacts} from '@shared/queueArtifacts.js'
import type {QueueArtifact, QueueItem} from '@shared/types.js'
import {fileOnDisk, type FileOnDisk} from './finalArtifacts.js'

export interface ArtifactDiskPatch {
	itemId: string
	patcher: (item: QueueItem) => QueueItem
}

function withDiskState(artifact: QueueArtifact, file: FileOnDisk): QueueArtifact {
	if (file.kind === 'missing') return artifact.missing === true ? artifact : {...artifact, missing: true}
	if (file.kind === 'unknown') return artifact
	if (artifact.missing !== true && artifact.sizeBytes !== undefined) return artifact
	const {missing: _missing, ...present} = artifact
	return {...present, sizeBytes: artifact.sizeBytes ?? file.sizeBytes}
}

export async function checkQueueArtifactsOnDisk(items: readonly QueueItem[]): Promise<ArtifactDiskPatch[]> {
	const patches = await Promise.all(
		items.map(async item => {
			if (item.status !== QUEUE_STATUS.done) return null
			const files = new Map<string, FileOnDisk>()
			for (const artifact of visibleQueueArtifacts(item.artifacts)) files.set(artifact.path, await fileOnDisk(artifact.path))
			const changed = item.artifacts.some(artifact => {
				const file = files.get(artifact.path)
				return file !== undefined && withDiskState(artifact, file) !== artifact
			})
			if (!changed) return null
			const patcher = (prev: QueueItem): QueueItem => ({
				...prev,
				artifacts: prev.artifacts.map(artifact => {
					const file = files.get(artifact.path)
					return file ? withDiskState(artifact, file) : artifact
				})
			})
			return {itemId: item.id, patcher}
		})
	)
	return patches.filter(patch => patch !== null)
}
