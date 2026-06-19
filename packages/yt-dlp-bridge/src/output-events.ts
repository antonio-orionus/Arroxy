import type {YtDlpOutputEventKind, YtDlpPostprocessPhase} from './schemas.js'

export type {YtDlpPostprocessPhase}

export type YtDlpOutputEvent =
	| {kind: Extract<YtDlpOutputEventKind, 'destination'>; path: string}
	| {kind: Extract<YtDlpOutputEventKind, 'merge'>; path?: string}
	| {kind: Extract<YtDlpOutputEventKind, 'already-downloaded'>; path: string}
	| {kind: Extract<YtDlpOutputEventKind, 'move'>; from: string; to: string}
	| {kind: Extract<YtDlpOutputEventKind, 'artifact'>; path: string}
	| {kind: Extract<YtDlpOutputEventKind, 'sleep'>; seconds: number}
	| {kind: Extract<YtDlpOutputEventKind, 'sponsorblock-fetch'>}
	| {kind: Extract<YtDlpOutputEventKind, 'sponsorblock-retry'>; attempt: number; total: number}
	| {kind: Extract<YtDlpOutputEventKind, 'postprocess'>; phase: YtDlpPostprocessPhase; path?: string}
	| {kind: Extract<YtDlpOutputEventKind, 'progress'>; percent?: number; raw: string}

export function parseYtDlpOutputLine(line: string): YtDlpOutputEvent | null {
	const clean = line.trim()
	if (!clean) return null

	const destination = /^\[download\] Destination:\s+(.+)$/.exec(clean)
	if (destination?.[1]) return {kind: 'destination', path: destination[1]}

	const merger = /^\[Merger\] Merging formats into "([^"]+)"|^\[Merger\] Merging formats into (.+)$/.exec(clean)
	if (merger) {
		const path = merger[1] ?? merger[2]
		return path ? {kind: 'merge', path} : {kind: 'merge'}
	}

	const already = /^\[download\]\s+(.+?)\s+has already been downloaded$/.exec(clean)
	if (already?.[1]) return {kind: 'already-downloaded', path: already[1]}

	const move = /^\[MoveFiles\] Moving file "([^"]+)" to "([^"]+)"$/.exec(clean)
	if (move?.[1] && move[2]) return {kind: 'move', from: move[1], to: move[2]}

	const sidecar = /^\[info\] Writing video (?:description|metadata as JSON|thumbnail \d+) to:\s+(.+)$/.exec(clean)
	if (sidecar?.[1]) return {kind: 'artifact', path: sidecar[1]}

	const sleep = /Sleeping (\d+(?:\.\d+)?) seconds/.exec(clean)
	if (sleep?.[1]) return {kind: 'sleep', seconds: Math.round(Number.parseFloat(sleep[1]))}

	if (clean === '[SponsorBlock] Fetching SponsorBlock segments') return {kind: 'sponsorblock-fetch'}

	const sponsorBlockRetry = /Unable to communicate with SponsorBlock API:.+Retrying \((\d+)\/(\d+)\)/.exec(clean)
	if (sponsorBlockRetry?.[1] && sponsorBlockRetry[2]) return {kind: 'sponsorblock-retry', attempt: Number(sponsorBlockRetry[1]), total: Number(sponsorBlockRetry[2])}

	const postprocess = postprocessPhase(clean)
	if (postprocess) {
		const destination = /^\[(?:ExtractAudio|VideoConvertor|VideoRemuxer)\] Destination:\s+(.+)$/.exec(clean)
		return {kind: 'postprocess', phase: postprocess, ...(destination?.[1] ? {path: destination[1]} : {})}
	}

	const percent = parsePercentFromLine(clean)
	return percent === undefined ? {kind: 'progress', raw: clean} : {kind: 'progress', percent, raw: clean}
}

function postprocessPhase(line: string): YtDlpPostprocessPhase | null {
	if (line.startsWith('[ExtractAudio]')) return 'extractingAudio'
	if (line.startsWith('[VideoConvertor]') || line.startsWith('[VideoRemuxer]')) return 'convertingVideo'
	if (line.startsWith('[EmbedThumbnail]') || line.startsWith('[Metadata]') || line.startsWith('[FixupM4a]') || line.startsWith('[FixupM3u8]')) return 'embeddingMetadata'
	if (line.startsWith('[MoveFiles]')) return 'movingFiles'
	return null
}

function parsePercentFromLine(line: string): number | undefined {
	const match = /(\d+(?:\.\d+)?)%/.exec(line)
	if (!match?.[1]) return undefined
	const parsed = Number.parseFloat(match[1])
	return Number.isNaN(parsed) ? undefined : parsed
}
