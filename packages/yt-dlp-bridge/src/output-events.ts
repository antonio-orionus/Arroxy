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
	| {kind: Extract<YtDlpOutputEventKind, 'transfer-retry'>; attempt: number; total: number}
	| {kind: Extract<YtDlpOutputEventKind, 'postprocess'>; phase: YtDlpPostprocessPhase; path?: string}
	// The fallback for every other line. A `[download]` progress line also
	// carries yt-dlp's total size, speed and ETA as printed (`10.00MiB`,
	// `1.00MiB/s`, `00:05`).
	| {kind: Extract<YtDlpOutputEventKind, 'progress'>; percent?: number; total?: string; speed?: string; eta?: string; raw: string}

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

	// yt-dlp retries a failed media transfer in-process and reports it only on
	// this line. Without a dedicated event it falls through to `progress`, where
	// the formatter drops it — the row then sits at "Downloading, 0%" for the
	// whole retry budget with no sign anything is wrong. The offending host is
	// left in the raw line, which callers already log verbatim; lifting it into
	// the event would add a field nothing reads.
	const transferRetry = /Got error:.*?Retrying \((\d+)\/(\d+)\)/s.exec(clean)
	if (transferRetry?.[1] && transferRetry[2]) return {kind: 'transfer-retry', attempt: Number(transferRetry[1]), total: Number(transferRetry[2])}

	const postprocess = postprocessPhase(clean)
	if (postprocess) {
		// ExtractAudio prints `Destination: <path>` alone; the video convertor and
		// remuxer print `Remuxing video from mp4 to mkv; Destination: <path>`.
		const destination = /^\[(?:ExtractAudio\]|(?:VideoConvertor|VideoRemuxer)\] (?:Converting|Remuxing) video from \S+ to \S+;) Destination:\s+(.+)$/.exec(clean)
		return {kind: 'postprocess', phase: postprocess, ...(destination?.[1] ? {path: destination[1]} : {})}
	}

	const percent = parsePercentFromLine(clean)
	return {kind: 'progress', ...(percent === undefined ? {} : {percent}), ...downloadProgressFields(clean), raw: clean}
}

// `[download]  42.0% of ~10.00MiB at 1.00MiB/s ETA 00:05` (any part may be
// missing or `Unknown`).
function downloadProgressFields(line: string): {total?: string; speed?: string; eta?: string} {
	if (!line.startsWith('[download]')) return {}
	const total = /\bof\s+(.+?)(?=\s+(?:at|ETA|in)\b|$)/i.exec(line)?.[1]?.trim()
	const speed = /\bat\s+(\S+)/i.exec(line)?.[1]
	const eta = /\bETA\s+(\S+)/i.exec(line)?.[1]
	return {...(total ? {total} : {}), ...(speed ? {speed} : {}), ...(eta ? {eta} : {})}
}

function postprocessPhase(line: string): YtDlpPostprocessPhase | null {
	if (line.startsWith('[ExtractAudio]')) return 'extractingAudio'
	if (line.startsWith('[VideoConvertor]') || line.startsWith('[VideoRemuxer]')) return 'convertingVideo'
	if (line.startsWith('[EmbedThumbnail]') || line.startsWith('[Metadata]') || line.startsWith('[FixupM4a]') || line.startsWith('[FixupM3u8]')) return 'embeddingMetadata'
	if (line.startsWith('[MoveFiles]')) return 'movingFiles'
	return null
}

// Only yt-dlp's own `[download]  42.0% of …` line carries a percent. Other
// lines may hold a `N%` that is no progress: ffmpeg's banner prints the media
// URL, whose encoded commas read as one (`met=1792423725%2C`).
function parsePercentFromLine(line: string): number | undefined {
	const match = /^\[download\]\s+(\d+(?:\.\d+)?)%/.exec(line)
	if (!match?.[1]) return undefined
	const parsed = Number.parseFloat(match[1])
	return Number.isNaN(parsed) ? undefined : parsed
}
