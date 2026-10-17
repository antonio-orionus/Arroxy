// The files a completed job leaves in its output folder, reported to the
// queue as artifact events with their on-disk size. The paths are taken while
// the job is still active; sizes are read afterwards, once the files are final.

import {stat} from 'node:fs/promises'
import {nowIso} from '@main/utils/clock.js'
import {artifactKindForPath} from '@shared/queueArtifacts.js'
import type {QueueArtifactKind} from '@shared/schemas.js'
import type {QueueArtifactEvent} from '@shared/types.js'
import type {ActiveDownload} from '../phases/index.js'

export interface FinalArtifact {
	path: string
	kind: QueueArtifactKind
	// Reported only when the file is still on disk at completion.
	sidecar?: true
}

export function finalArtifactsOf(active: ActiveDownload): FinalArtifact[] {
	const artifacts: FinalArtifact[] = []
	const add = (path: string | undefined, kind: QueueArtifactKind, sidecar = false): void => {
		if (!path || artifacts.some(artifact => artifact.path === path)) return
		artifacts.push({path, kind, ...(sidecar ? {sidecar: true as const} : {})})
	}
	add(active.mediaPath, 'media')
	const embedsSubtitlesIntoMedia = active.input.job.kind !== 'subtitle-only' && active.input.job.subtitles?.mode === 'embed'
	if (!embedsSubtitlesIntoMedia) {
		for (const subtitlePath of active.subtitlePaths) add(subtitlePath, 'subtitle')
	}
	for (const sidecarPath of active.sidecarPaths ?? []) add(sidecarPath, artifactKindForPath(sidecarPath), true)
	return artifacts
}

// `missing` only when the path is provably gone; any other failure (no
// permission, an I/O error) is `unknown`, so it never flags a file as missing.
export type FileOnDisk = {kind: 'file'; sizeBytes: number} | {kind: 'missing'} | {kind: 'unknown'}

export async function fileOnDisk(path: string): Promise<FileOnDisk> {
	try {
		const info = await stat(path)
		return info.isFile() ? {kind: 'file', sizeBytes: info.size} : {kind: 'unknown'}
	} catch (err) {
		const code = err instanceof Error && 'code' in err ? err.code : undefined
		return code === 'ENOENT' || code === 'ENOTDIR' ? {kind: 'missing'} : {kind: 'unknown'}
	}
}

export async function finalArtifactEvents(jobId: string, artifacts: readonly FinalArtifact[]): Promise<QueueArtifactEvent[]> {
	const events = await Promise.all(
		artifacts.map(async ({path, kind, sidecar}): Promise<QueueArtifactEvent | null> => {
			const file = await fileOnDisk(path)
			if (sidecar && file.kind === 'missing') return null
			return {jobId, path, kind, at: nowIso(), ...(file.kind === 'file' ? {sizeBytes: file.sizeBytes} : {})}
		})
	)
	return events.filter(event => event !== null)
}
