// The files a completed job leaves in its output folder, reported to the
// queue as artifact events. The paths are taken while the job is still active.
// Media and subtitles are announced at once; sizes are read afterwards and sent
// as a second event, best-effort, so a slow disk never holds up completion.

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
	// The media file's title from the job's info-json.
	title?: string
}

export function finalArtifactsOf(active: ActiveDownload): FinalArtifact[] {
	const artifacts: FinalArtifact[] = []
	const add = (path: string | undefined, kind: QueueArtifactKind, extra: Omit<FinalArtifact, 'path' | 'kind'> = {}): void => {
		if (!path || artifacts.some(artifact => artifact.path === path)) return
		artifacts.push({path, kind, ...extra})
	}
	add(active.mediaPath, 'media', active.mediaTitle ? {title: active.mediaTitle} : {})
	const embedsSubtitlesIntoMedia = active.input.job.kind !== 'subtitle-only' && active.input.job.subtitles?.mode === 'embed'
	if (!embedsSubtitlesIntoMedia) {
		for (const subtitlePath of active.subtitlePaths) add(subtitlePath, 'subtitle')
	}
	for (const sidecarPath of active.sidecarPaths ?? []) add(sidecarPath, artifactKindForPath(sidecarPath), {sidecar: true})
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

export function announcedArtifactEvents(jobId: string, artifacts: readonly FinalArtifact[]): QueueArtifactEvent[] {
	return artifacts.filter(artifact => artifact.sidecar !== true).map(({path, kind, title}) => ({jobId, path, kind, at: nowIso(), ...(title ? {title} : {})}))
}

// Media and subtitles come back only when a size was read (they were already
// announced); a sidecar comes back unless it is gone from disk.
export async function sizedArtifactEvents(jobId: string, artifacts: readonly FinalArtifact[]): Promise<QueueArtifactEvent[]> {
	const events = await Promise.all(
		artifacts.map(async ({path, kind, sidecar}): Promise<QueueArtifactEvent | null> => {
			const file = await fileOnDisk(path)
			if (file.kind === 'file') return {jobId, path, kind, at: nowIso(), sizeBytes: file.sizeBytes}
			return sidecar && file.kind === 'unknown' ? {jobId, path, kind, at: nowIso()} : null
		})
	)
	return events.filter(event => event !== null)
}
