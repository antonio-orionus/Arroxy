import type {QueueArtifact, QueueArtifactKind} from './types.js'

const SUBTITLE_EXTENSIONS = new Set(['srt', 'vtt', 'ass'])
const THUMBNAIL_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp'])
const MEDIA_EXTENSIONS = new Set(['mp4', 'mkv', 'webm', 'mov', 'avi', 'flv', 'mp3', 'm4a', 'opus', 'ogg', 'wav', 'flac'])
const INTERNAL_ARTIFACT_FILE_NAMES = new Set(['_arroxy.info.json'])

function fileNameFromPath(path: string): string {
	return path.split(/[\\/]/).filter(Boolean).at(-1) ?? path
}

function extension(path: string): string {
	const name = fileNameFromPath(path).toLowerCase()
	const dot = name.lastIndexOf('.')
	return dot < 0 ? '' : name.slice(dot + 1)
}

export function artifactKindForPath(path: string): QueueArtifactKind {
	const name = fileNameFromPath(path).toLowerCase()
	const ext = extension(path)
	if (name.endsWith('.description')) return 'description'
	if (name.endsWith('.info.json') || name.endsWith('.json') || name.endsWith('.m3u') || name.endsWith('.m3u8')) return 'companion'
	if (SUBTITLE_EXTENSIONS.has(ext)) return 'subtitle'
	if (THUMBNAIL_EXTENSIONS.has(ext)) return 'thumbnail'
	if (MEDIA_EXTENSIONS.has(ext)) return 'media'
	return 'unknown'
}

export function queueArtifactFromPath(path: string, options: {discoveredAt: string; sizeBytes?: number; kind?: QueueArtifactKind; internal?: boolean}): QueueArtifact {
	const fileName = fileNameFromPath(path)
	return {id: `artifact:${path}`, kind: options.kind ?? artifactKindForPath(path), path, fileName, ...(options.sizeBytes !== undefined ? {sizeBytes: options.sizeBytes} : {}), discoveredAt: options.discoveredAt, ...(options.internal === true || isInternalArtifactPath(path) ? {internal: true} : {})}
}

export function upsertQueueArtifact(artifacts: QueueArtifact[], artifact: QueueArtifact): QueueArtifact[] {
	const index = artifacts.findIndex(existing => existing.path === artifact.path)
	if (index < 0) return [...artifacts, artifact]
	const existing = artifacts[index]
	const next = [...artifacts]
	next[index] = {...existing, ...artifact, id: existing.id, discoveredAt: existing.discoveredAt}
	return next
}

export function moveQueueArtifactPath(artifacts: QueueArtifact[], from: string, to: string): QueueArtifact[] {
	return artifacts.map(artifact => (artifact.path === from ? {...artifact, path: to, fileName: fileNameFromPath(to), missing: undefined} : artifact))
}

export function markMissingArtifacts(artifacts: QueueArtifact[], missingPaths: ReadonlySet<string>): QueueArtifact[] {
	return artifacts.map(artifact => (missingPaths.has(artifact.path) ? {...artifact, missing: true} : artifact))
}

export function visibleQueueArtifacts(artifacts: readonly QueueArtifact[]): QueueArtifact[] {
	return artifacts.filter(artifact => artifact.internal !== true && !isInternalArtifactPath(artifact.path) && !isInternalArtifactPath(artifact.fileName))
}

function isInternalArtifactPath(path: string): boolean {
	return INTERNAL_ARTIFACT_FILE_NAMES.has(fileNameFromPath(path).toLowerCase())
}
