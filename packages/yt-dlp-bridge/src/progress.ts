import {z} from 'zod'
import {definedFields} from './fields.js'
import {YtDlpDownloadStatusSchema, type YtDlpDownloadStatus} from './schemas.js'

// yt-dlp's human-readable `[download]  42.0% of ~10.00MiB …` line is a
// presentation: units are rounded, fields go missing, and every stream of a
// merged download restarts it at 0%. These templates make yt-dlp print the
// numbers behind it as one JSON line each, behind a prefix no other line has.
// `%()j` is JSON with non-ASCII escaped, so the console encoding cannot mangle it.

export const YT_DLP_PROGRESS_PREFIX = '[yt-dlp-bridge:progress]'
export const YT_DLP_REQUESTED_FORMATS_PREFIX = '[yt-dlp-bridge:formats]'

const PROGRESS_FIELDS = 'status,downloaded_bytes,total_bytes,total_bytes_estimate,speed,eta,elapsed,fragment_index,fragment_count'
const FORMAT_FIELDS = 'format_id,filesize,filesize_approx'

// `--progress-template download:…`. `info` is the dict of the stream being
// downloaded, so `info.format_id` names one stream of a merged download.
export const YT_DLP_PROGRESS_TEMPLATE = `${YT_DLP_PROGRESS_PREFIX} {"progress":%(progress.{${PROGRESS_FIELDS}})j,"format_id":%(info.format_id|null)j}`

// `--print before_dl:…`, once per video before any stream downloads.
// `requested_formats` lists the streams of a merged download in the order yt-dlp
// downloads them; a single-stream download has none and its own fields instead.
export const YT_DLP_REQUESTED_FORMATS_TEMPLATE = `${YT_DLP_REQUESTED_FORMATS_PREFIX} {"format_id":%(format_id|null)j,"filesize":%(filesize|null)j,"filesize_approx":%(filesize_approx|null)j,"requested":%(requested_formats.:.{${FORMAT_FIELDS}}|null)j}`

export interface YtDlpDownloadProgress {
	status: YtDlpDownloadStatus
	formatId?: string
	downloadedBytes?: number
	totalBytes?: number
	// A fragmented stream's size, extrapolated from the fragments so far.
	totalBytesEstimate?: number
	speedBps?: number
	etaSeconds?: number
	elapsedSeconds?: number
	fragmentIndex?: number
	fragmentCount?: number
}

export interface YtDlpRequestedFormat {
	formatId: string
	filesize?: number
	filesizeApprox?: number
}

// yt-dlp prints `null` for a field it does not know; absent and null mean the
// same. A negative value is dropped on its own (an ETA computed from a fragment
// estimate that undercuts the bytes so far), so it cannot discard the record.
const count = z
	.number()
	.nullish()
	.transform(value => (value === null || value === undefined || value < 0 ? undefined : value))
const formatId = z
	.string()
	.min(1)
	.nullish()
	.transform(value => value ?? undefined)

const progressLineSchema = z.object({progress: z.object({status: YtDlpDownloadStatusSchema, downloaded_bytes: count, total_bytes: count, total_bytes_estimate: count, speed: count, eta: count, elapsed: count, fragment_index: count, fragment_count: count}), format_id: formatId})

const requestedFormatSchema = z.object({format_id: z.string().min(1), filesize: count, filesize_approx: count})

const requestedFormatsLineSchema = z.object({format_id: formatId, filesize: count, filesize_approx: count, requested: z.array(requestedFormatSchema).nullish()})

function jsonAfter(line: string, prefix: string): unknown {
	if (!line.startsWith(prefix)) return undefined
	try {
		return JSON.parse(line.slice(prefix.length))
	} catch {
		return undefined
	}
}

export function parseProgressLine(line: string): YtDlpDownloadProgress | null {
	const parsed = progressLineSchema.safeParse(jsonAfter(line, YT_DLP_PROGRESS_PREFIX))
	if (!parsed.success) return null
	const {progress} = parsed.data
	return {
		status: progress.status,
		...definedFields({
			formatId: parsed.data.format_id,
			downloadedBytes: progress.downloaded_bytes,
			totalBytes: progress.total_bytes,
			totalBytesEstimate: progress.total_bytes_estimate,
			speedBps: progress.speed,
			etaSeconds: progress.eta,
			elapsedSeconds: progress.elapsed,
			fragmentIndex: progress.fragment_index,
			fragmentCount: progress.fragment_count
		})
	}
}

export function parseRequestedFormatsLine(line: string): YtDlpRequestedFormat[] | null {
	const parsed = requestedFormatsLineSchema.safeParse(jsonAfter(line, YT_DLP_REQUESTED_FORMATS_PREFIX))
	if (!parsed.success) return null
	const toFormat = (id: string, format: {filesize: number | undefined; filesize_approx: number | undefined}): YtDlpRequestedFormat => ({formatId: id, ...definedFields({filesize: format.filesize, filesizeApprox: format.filesize_approx})})
	const {requested, format_id: id} = parsed.data
	if (requested?.length) return requested.map(format => toFormat(format.format_id, format))
	return id ? [toFormat(id, parsed.data)] : null
}

export interface CombinedDownloadProgress {
	// How far through every requested stream, 0–100. Undefined while unknown.
	percent?: number
	speedBps?: number
	etaSeconds?: number
}

interface StreamState {
	formatId: string
	plannedBytes: number | undefined
	approxBytes: number | undefined
	downloadedBytes: number
	totalBytes: number | undefined
	estimatedBytes: number | undefined
	done: boolean
}

// On the first fragment (index 0) the extrapolated size is a few KiB and the
// stream reads as complete; only later fragments make it meaningful.
function usableEstimate(progress: YtDlpDownloadProgress): number | undefined {
	return progress.fragmentIndex === 0 ? undefined : progress.totalBytesEstimate
}

// A fragmented stream reports its exact size only once finished, and its live
// estimate follows the real stream, while a format list's approximate size can
// be far off: an underestimate would read as complete early.
function streamSize(stream: StreamState): number | undefined {
	return stream.totalBytes ?? stream.plannedBytes ?? stream.estimatedBytes ?? stream.approxBytes
}

function streamPercent(progress: YtDlpDownloadProgress): number | undefined {
	if (progress.status === 'finished') return 100
	const size = progress.totalBytes ?? usableEstimate(progress)
	if (!size || progress.downloadedBytes === undefined) return undefined
	return Math.min(100, (progress.downloadedBytes / size) * 100)
}

/**
 * One percent over every stream yt-dlp downloads for a video. A merged
 * download fetches its requested formats one after another, each reporting
 * progress from 0% on its own; this weighs each by its size so the audio after
 * the video counts. A stream's size is the first known of: its exact size from
 * live progress, its exact size from the requested formats, its live fragment
 * estimate, its approximate size from the requested formats. When any size
 * stays unknown, every stream gets an equal share.
 */
export class YtDlpDownloadProgressTracker {
	private streams: StreamState[] = []

	setRequestedFormats(formats: readonly YtDlpRequestedFormat[]): void {
		this.streams = formats.map(format => ({formatId: format.formatId, plannedBytes: format.filesize, approxBytes: format.filesizeApprox, downloadedBytes: 0, totalBytes: undefined, estimatedBytes: undefined, done: false}))
	}

	update(progress: YtDlpDownloadProgress): CombinedDownloadProgress {
		const index = progress.formatId === undefined ? -1 : this.streams.findIndex(stream => stream.formatId === progress.formatId)
		const transfer = definedFields({speedBps: progress.speedBps, etaSeconds: progress.status === 'finished' ? undefined : progress.etaSeconds})
		const stream = this.streams[index]
		if (!stream) return {...definedFields({percent: streamPercent(progress)}), ...transfer}

		// No progress is printed for a stream already on disk, so the order is
		// the only sign the streams before this one are complete.
		for (const earlier of this.streams.slice(0, index)) earlier.done = true
		stream.downloadedBytes = progress.downloadedBytes ?? stream.downloadedBytes
		stream.totalBytes = progress.totalBytes ?? stream.totalBytes
		stream.estimatedBytes = usableEstimate(progress) ?? stream.estimatedBytes
		stream.done = progress.status === 'finished'

		const sizes = this.streams.map(streamSize)
		if (sizes.every(size => size !== undefined && size > 0)) {
			const total = sizes.reduce<number>((sum, size) => sum + (size ?? 0), 0)
			const done = this.streams.reduce((sum, each, i) => sum + (each.done ? (sizes[i] ?? 0) : Math.min(each.downloadedBytes, sizes[i] ?? 0)), 0)
			const remaining = total - done
			return {percent: (done / total) * 100, ...transfer, ...(progress.speedBps && progress.status !== 'finished' ? {etaSeconds: remaining / progress.speedBps} : {})}
		}
		const shares = this.streams.map((each, i) => {
			const size = sizes[i]
			if (each.done) return 1
			return size ? Math.min(1, each.downloadedBytes / size) : 0
		})
		return {percent: (shares.reduce((sum, share) => sum + share, 0) / shares.length) * 100, ...transfer}
	}
}
