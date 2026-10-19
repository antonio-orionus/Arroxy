import {infoDictSchema, isPlaylistLike, ytDlpFormatSchema, type YtDlpFormat} from './info.js'
import type {FinalPathResult, FormatSummary, PaginationResult, ParsedJsonLines, SanitizedFormatSummary, SanitizedMetadataItem, SubtitleSummary, ThumbnailSummary} from './types.js'
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

// Reads the dict through infoDictSchema, so every copied field is one the schema
// validated. A dict the schema rejects sanitizes to `{}`.
export function sanitizeMetadataItem(item: unknown, maxFormats = 25): SanitizedMetadataItem {
	const parsed = infoDictSchema.safeParse(item)
	if (!parsed.success) return {}
	const info = parsed.data
	const thumbnailCount = info.thumbnails?.length ?? 0
	const common = definedFields({id: info.id, title: info.title, webpageUrl: info.webpage_url, extractor: info.extractor, extractorKey: info.extractor_key, thumbnailCount: thumbnailCount > 0 ? thumbnailCount : undefined})
	if (isPlaylistLike(info)) return common

	const sanitized: SanitizedMetadataItem = {
		...common,
		...definedFields({
			fulltitle: info.fulltitle,
			description: info.description,
			duration: info.duration,
			durationString: info.duration_string,
			uploader: info.uploader,
			uploaderId: info.uploader_id,
			channel: info.channel,
			channelId: info.channel_id,
			channelUrl: info.channel_url,
			uploadDate: info.upload_date,
			timestamp: info.timestamp,
			availability: info.availability,
			liveStatus: info.live_status,
			ageLimit: info.age_limit,
			categories: info.categories,
			tags: info.tags,
			chapters: info.chapters
		})
	}
	if (info.subtitles) {
		sanitized.subtitleLanguages = Object.keys(info.subtitles).sort()
		sanitized.subtitleCount = sanitized.subtitleLanguages.length
	}
	if (info.automatic_captions) {
		sanitized.automaticCaptionLanguages = Object.keys(info.automatic_captions).sort()
		sanitized.automaticCaptionCount = sanitized.automaticCaptionLanguages.length
	}
	const formats = info.formats ?? []
	if (formats.length > 0) {
		sanitized.formatCount = formats.length
		sanitized.formats = formats.slice(0, maxFormats).map(sanitizeFormatSummary)
	}
	// A single-format dict carries its format fields on the top level.
	const topLevelFormat = ytDlpFormatSchema.safeParse(item)
	const selectedFormat = topLevelFormat.success ? sanitizeFormatSummary(topLevelFormat.data) : {}
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

function sanitizeFormatSummary(format: YtDlpFormat): SanitizedFormatSummary {
	return definedFields({
		formatId: format.format_id,
		extension: format.ext,
		protocol: format.protocol,
		resolution: format.resolution,
		width: format.width,
		height: format.height,
		fps: format.fps,
		audioCodec: format.acodec,
		videoCodec: format.vcodec,
		audioBitrate: format.abr,
		videoBitrate: format.vbr,
		totalBitrate: format.tbr,
		filesize: format.filesize,
		filesizeApprox: format.filesize_approx,
		formatNote: format.format_note,
		dynamicRange: format.dynamic_range,
		language: format.language
	})
}

type DefinedFields<T> = {[K in keyof T]?: Exclude<T[K], undefined>}

// Drops undefined values so optional fields are absent rather than present-
// but-undefined (exactOptionalPropertyTypes).
function definedFields<T extends Record<string, unknown>>(fields: T): DefinedFields<T> {
	const result: DefinedFields<T> = {}
	for (const key of Object.keys(fields) as (keyof T)[]) {
		const value = fields[key]
		if (value !== undefined) result[key] = value as Exclude<T[keyof T], undefined>
	}
	return result
}
