import type {FinalPathResult, FormatSummary, PaginationResult, ParsedJsonLines, ProgressEvent, SanitizedFormatSummary, SanitizedMetadataItem, SubtitleSummary, ThumbnailSummary} from './types.js'
export {parseYtDlpOutputLine, type YtDlpOutputEvent, type YtDlpPostprocessPhase} from './output-events.js'

export function parseJsonLines<T = unknown>(output: string): ParsedJsonLines<T> {
	const rawLines = output.split(/\r?\n/).flatMap(line => {
		const rawLine = line.trim()
		return rawLine ? [rawLine] : []
	})
	const items: T[] = []
	const parseErrors: ParsedJsonLines<T>['parseErrors'] = []

	for (const line of rawLines) {
		try {
			items.push(JSON.parse(line) as T)
		} catch (error) {
			parseErrors.push({line, message: error instanceof Error ? error.message : String(error)})
		}
	}

	return {items, rawLines, parseErrors}
}

export function sanitizeMetadataItems(items: unknown[], maxFormats = 25): SanitizedMetadataItem[] {
	return items.map(item => sanitizeMetadataItem(item, maxFormats))
}

export function sanitizeMetadataItem(item: unknown, maxFormats = 25): SanitizedMetadataItem {
	const source = isRecord(item) ? item : {}
	const formats = Array.isArray(source.formats) ? source.formats : []
	const thumbnails = Array.isArray(source.thumbnails) ? source.thumbnails : []

	const sanitized: SanitizedMetadataItem = {}
	copyString(source, sanitized, 'id', 'id')
	copyString(source, sanitized, 'title', 'title')
	copyString(source, sanitized, 'fulltitle', 'fulltitle')
	copyString(source, sanitized, 'description', 'description')
	copyNumber(source, sanitized, 'duration', 'duration')
	copyString(source, sanitized, 'duration_string', 'durationString')
	copyString(source, sanitized, 'uploader', 'uploader')
	copyString(source, sanitized, 'uploader_id', 'uploaderId')
	copyString(source, sanitized, 'channel', 'channel')
	copyString(source, sanitized, 'channel_id', 'channelId')
	copyString(source, sanitized, 'channel_url', 'channelUrl')
	copyString(source, sanitized, 'webpage_url', 'webpageUrl')
	copyString(source, sanitized, 'extractor', 'extractor')
	copyString(source, sanitized, 'extractor_key', 'extractorKey')
	copyString(source, sanitized, 'upload_date', 'uploadDate')
	copyNumber(source, sanitized, 'timestamp', 'timestamp')
	copyString(source, sanitized, 'availability', 'availability')
	copyString(source, sanitized, 'live_status', 'liveStatus')
	copyNumber(source, sanitized, 'age_limit', 'ageLimit')

	if (Array.isArray(source.categories)) sanitized.categories = source.categories.filter(isString)
	if (Array.isArray(source.tags)) sanitized.tags = source.tags.filter(isString)
	if (Array.isArray(source.chapters)) sanitized.chapters = source.chapters
	if (isRecord(source.subtitles)) {
		sanitized.subtitleLanguages = Object.keys(source.subtitles).sort()
		sanitized.subtitleCount = sanitized.subtitleLanguages.length
	}
	if (isRecord(source.automatic_captions)) {
		sanitized.automaticCaptionLanguages = Object.keys(source.automatic_captions).sort()
		sanitized.automaticCaptionCount = sanitized.automaticCaptionLanguages.length
	}
	if (thumbnails.length > 0) sanitized.thumbnailCount = thumbnails.length
	if (formats.length > 0) {
		sanitized.formatCount = formats.length
		sanitized.formats = formats.slice(0, maxFormats).map(sanitizeFormatSummary)
	}
	const selectedFormat = sanitizeFormatSummary(source)
	if (Object.keys(selectedFormat).length > 0) sanitized.selectedFormat = selectedFormat
	return sanitized
}

export function paginate<T>(items: T[], offset: number, limit: number): PaginationResult<T> {
	const safeOffset = Math.max(0, offset)
	const safeLimit = Math.max(1, limit)
	const sliced = items.slice(safeOffset, safeOffset + safeLimit)
	const nextOffset = safeOffset + sliced.length
	const result: PaginationResult<T> = {total: items.length, count: sliced.length, offset: safeOffset, limit: safeLimit, hasMore: nextOffset < items.length, items: sliced}
	if (result.hasMore) result.nextOffset = nextOffset
	return result
}

export function parseFormats(output: string): FormatSummary[] {
	const lines = dataLines(output)
	return lines.map(raw => {
		const columns = raw.trim().split(/\s+/)
		const format: FormatSummary = {formatId: columns[0] ?? raw.trim(), raw}
		if (columns[1]) format.extension = columns[1]
		if (columns[2]) format.resolution = columns[2]
		const fpsToken = columns.find(token => /^\d+(?:\.\d+)?fps$/i.test(token))
		if (fpsToken) format.fps = Number.parseFloat(fpsToken)
		const sizeToken = columns.find(token => /^\d+(?:\.\d+)?(?:KiB|MiB|GiB|TiB|k|m|g)$/i.test(token))
		if (sizeToken) format.filesizeApprox = sizeToken
		const noteStart = raw.indexOf('|')
		if (noteStart >= 0) format.note = raw.slice(noteStart + 1).trim()
		return format
	})
}

export function parseSubtitles(output: string): SubtitleSummary[] {
	const results: SubtitleSummary[] = []
	let source: SubtitleSummary['source'] = 'unknown'

	for (const raw of output.split(/\r?\n/)) {
		const line = raw.trim()
		if (!line) continue
		if (/available subtitles/i.test(line)) {
			source = 'manual'
			continue
		}
		if (/available automatic captions/i.test(line)) {
			source = 'automatic'
			continue
		}
		if (source === 'unknown') continue
		if (/^(language|[-\s]+$)/i.test(line)) continue

		const alignedColumns = /^[A-Za-z0-9][A-Za-z0-9_-]*(?:-[A-Za-z0-9]+)*\s{2,}/.test(line)
			? line.split(/\s{2,}|\t+/).flatMap(part => {
					const column = part.trim()
					return column ? [column] : []
				})
			: []
		const fallback = /^([A-Za-z0-9][A-Za-z0-9_-]*(?:-[A-Za-z0-9]+)*)\s+(.+?)\s+((?:vtt|srt|ttml|srv3|srv2|srv1|json3)(?:,\s*(?:vtt|srt|ttml|srv3|srv2|srv1|json3))*)$/i.exec(line)
		const columns = alignedColumns.length >= 2 ? alignedColumns : fallback ? [fallback[1] ?? '', fallback[2] ?? '', fallback[3] ?? ''] : []
		if (columns.length < 2) continue

		const subtitle: SubtitleSummary = {language: columns[0] ?? line, formats: splitFormats(columns.at(-1) ?? ''), source, raw}
		if (columns.length > 2 && columns[1]) subtitle.name = columns[1]
		results.push(subtitle)
	}

	return results
}

export function parseThumbnails(output: string): ThumbnailSummary[] {
	return dataLines(output).map(raw => {
		const columns = raw.trim().split(/\s+/)
		const item: ThumbnailSummary = {id: columns[0] ?? raw.trim(), raw}
		const url = columns.find(token => /^https?:\/\//i.test(token))
		if (url) item.url = url
		const resolution = columns.find(token => /^\d+x\d+$/i.test(token))
		if (resolution) item.resolution = resolution
		const separatorIndex = raw.indexOf('|')
		if (separatorIndex >= 0) item.note = raw.slice(separatorIndex + 1).trim()
		return item
	})
}

export function parseProgress(output: string): ProgressEvent[] {
	const events: ProgressEvent[] = []
	for (const raw of output.split(/\r?\n/)) {
		const line = raw.trim()
		if (!line) continue
		const isDownload = /^\[download\]/i.test(line)
		const isPostprocess = /^\[(?:ExtractAudio|Merger|VideoRemuxer|VideoConvertor|EmbedSubtitle|EmbedThumbnail|Metadata|SponsorBlock)\]/i.test(line)
		if (!isDownload && !isPostprocess) continue

		const percent = /(\d+(?:\.\d+)?)%/.exec(line)
		const total = /\bof\s+(.+?)(?=\s+\bat\b|\s+\bETA\b|$)/i.exec(line)
		const speed = /\bat\s+([^\s]+)/i.exec(line)
		const eta = /\bETA\s+([^\s]+)/i.exec(line)
		const event: ProgressEvent = {phase: isDownload ? 'download' : isPostprocess ? 'postprocess' : 'unknown', raw}
		if (percent) event.percent = Number.parseFloat(percent[1] ?? '0')
		if (total?.[1]) event.total = total[1].trim()
		if (speed?.[1]) event.speed = speed[1]
		if (eta?.[1]) event.eta = eta[1]
		events.push(event)
	}
	return events
}

export function parseFinalPaths(stdout: string): FinalPathResult {
	const stdoutLines = stdout.split(/\r?\n/).flatMap(line => {
		const stdoutLine = line.trim()
		return stdoutLine ? [stdoutLine] : []
	})
	const paths = new Set<string>()
	for (const line of stdoutLines) {
		if (!/^\[[^\]]+\]/.test(line) && !/^ERROR:/i.test(line)) {
			paths.add(line)
			continue
		}
		const destination = /^\[download\]\s+Destination:\s+(.+)$/i.exec(line)
		if (destination?.[1]) paths.add(destination[1].trim())
		const subtitle = /^\[info\]\s+Writing video subtitles to:\s+(.+)$/i.exec(line)
		if (subtitle?.[1]) paths.add(subtitle[1].trim())
		const thumbnail = /^\[info\]\s+Writing video thumbnail(?:\s+\d+)?\s+to:\s+(.+)$/i.exec(line)
		if (thumbnail?.[1]) paths.add(thumbnail[1].trim())
		const converted = /^\[(?:SubtitlesConvertor|ThumbnailsConvertor)\]\s+Converting .+? to (.+)$/i.exec(line)
		if (converted?.[1]) paths.add(converted[1].trim())
	}
	return {paths: Array.from(paths), stdoutLines}
}

function dataLines(output: string): string[] {
	return output
		.split(/\r?\n/)
		.map(line => line.replace(/\s+$/, ''))
		.filter(line => {
			const trimmed = line.trim()
			return Boolean(trimmed) && !trimmed.startsWith('[') && !/^ID\s+/i.test(trimmed) && !/^-{2,}/.test(trimmed)
		})
}

function splitFormats(value: string): string[] {
	return value.split(/,\s*|\s+/).flatMap(part => {
		const format = part.trim()
		return format ? [format] : []
	})
}

function sanitizeFormatSummary(item: unknown): SanitizedFormatSummary {
	const source = isRecord(item) ? item : {}
	const result: SanitizedFormatSummary = {}
	copyString(source, result, 'format_id', 'formatId')
	copyString(source, result, 'ext', 'extension')
	copyString(source, result, 'protocol', 'protocol')
	copyString(source, result, 'resolution', 'resolution')
	copyNumber(source, result, 'width', 'width')
	copyNumber(source, result, 'height', 'height')
	copyNumber(source, result, 'fps', 'fps')
	copyString(source, result, 'acodec', 'audioCodec')
	copyString(source, result, 'vcodec', 'videoCodec')
	copyNumber(source, result, 'abr', 'audioBitrate')
	copyNumber(source, result, 'vbr', 'videoBitrate')
	copyNumber(source, result, 'tbr', 'totalBitrate')
	copyNumber(source, result, 'filesize', 'filesize')
	copyNumber(source, result, 'filesize_approx', 'filesizeApprox')
	copyString(source, result, 'format_note', 'formatNote')
	copyString(source, result, 'dynamic_range', 'dynamicRange')
	copyString(source, result, 'language', 'language')
	return result
}

function copyString<T extends object>(source: Record<string, unknown>, target: T, sourceKey: string, targetKey: string): void {
	const value = source[sourceKey]
	if (typeof value === 'string') (target as Record<string, unknown>)[targetKey] = value
}

function copyNumber<T extends object>(source: Record<string, unknown>, target: T, sourceKey: string, targetKey: string): void {
	const value = source[sourceKey]
	if (typeof value === 'number' && Number.isFinite(value)) (target as Record<string, unknown>)[targetKey] = value
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown): value is string {
	return typeof value === 'string'
}
