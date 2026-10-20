// yt-dlp's format sort (`yt_dlp/utils/_utils.py`, `FormatSorter`), ported so the
// Format screen ranks streams exactly as the yt-dlp run that downloads them:
// the same fields, in the same order (forced, then priority, then the `-S`
// tokens, then the extractor's `_format_sort_fields`, then yt-dlp's defaults),
// compared the same way. The selection parity check
// (scripts/check-selection-parity.ts) holds this port to real yt-dlp.

import type {YtDlpSelectableFormat} from './selectableFormat.js'

type FieldType = 'field' | 'ordered' | 'boolean' | 'extractor' | 'multiple' | 'combined' | 'alias'
type Convert = 'order' | 'float_string' | 'float_none' | 'float' | 'bytes' | 'string' | 'ignore'

interface FieldSetting {
	type?: FieldType
	field?: string | readonly string[]
	convert?: Convert
	order?: readonly (string | null)[]
	regex?: boolean
	notInList?: readonly (string | null)[]
	default?: number
	max?: number
	forced?: boolean
	priority?: boolean
	function?: (values: readonly unknown[]) => unknown
	sameLimit?: boolean
}

const firstTruthy = (values: readonly unknown[]): unknown => values.find(value => Boolean(value)) ?? null

function smallestSide(values: readonly unknown[]): number {
	const sides = values.filter((value): value is number => typeof value === 'number' && value !== 0)
	return sides.length > 0 ? Math.min(...sides) : 0
}

const SETTINGS: Readonly<Record<string, FieldSetting>> = {
	vcodec: {type: 'ordered', regex: true, order: ['av0?1', 'vp0?9\\.0?2', 'vp0?9', '[hx]265|he?vc?', '[hx]264|avc', 'vp0?8', 'mp4v|h263', 'theora', '', null, 'none']},
	acodec: {type: 'ordered', regex: true, order: ['[af]lac', 'wav|aiff', 'opus', 'vorbis|ogg', 'aac', 'mp?4a?', 'mp3', 'ac-?4', 'e-?a?c-?3', 'ac-?3', 'dts', '', null, 'none']},
	hdr: {type: 'ordered', regex: true, field: 'dynamic_range', order: ['dv', '(hdr)?12', '(hdr)?10\\+', '(hdr)?10', 'hlg', '', 'sdr', null]},
	proto: {type: 'ordered', regex: true, field: 'protocol', order: ['(ht|f)tps', '(ht|f)tp$', 'm3u8.*', '.*dash', 'websocket_frag', 'rtmpe?', '', 'ws|websocket', 'f4']},
	vext: {type: 'ordered', field: 'video_ext', order: ['mp4', 'mov', 'webm', 'flv', '', 'none']},
	aext: {type: 'ordered', regex: true, field: 'audio_ext', order: ['m4a', 'aac', 'mp3', 'ogg', 'opus', 'web[am]', '', 'none']},
	hidden: {type: 'extractor', forced: true, max: -1000},
	aud_or_vid: {type: 'multiple', forced: true, field: ['vcodec', 'acodec'], function: values => Number(values.some(value => value !== 'none'))},
	ie_pref: {type: 'extractor', priority: true},
	hasvid: {type: 'boolean', priority: true, field: 'vcodec', notInList: ['none']},
	hasaud: {type: 'boolean', field: 'acodec', notInList: ['none']},
	lang: {convert: 'float', field: 'language_preference', default: -1},
	quality: {convert: 'float', default: -1},
	filesize: {convert: 'bytes'},
	fs_approx: {convert: 'bytes', field: 'filesize_approx'},
	id: {convert: 'string', field: 'format_id'},
	height: {convert: 'float_none'},
	width: {convert: 'float_none'},
	fps: {convert: 'float_none'},
	channels: {convert: 'float_none', field: 'audio_channels'},
	tbr: {convert: 'float_none'},
	vbr: {convert: 'float_none'},
	abr: {convert: 'float_none'},
	asr: {convert: 'float_none'},
	source: {convert: 'float', field: 'source_preference', default: -1},
	codec: {type: 'combined', field: ['vcodec', 'acodec']},
	br: {type: 'multiple', field: ['tbr', 'vbr', 'abr'], convert: 'float_none', function: firstTruthy},
	size: {type: 'multiple', field: ['filesize', 'fs_approx'], convert: 'bytes', function: firstTruthy},
	ext: {type: 'combined', field: ['vext', 'aext']},
	// `min(filter(None, it), default=0)`: the smaller side, so portrait counts by its width.
	res: {type: 'multiple', field: ['height', 'width'], function: values => smallestSide(values)},
	// Actual field names, accepted as aliases.
	format_id: {type: 'alias', field: 'id'},
	preference: {type: 'alias', field: 'ie_pref'},
	language_preference: {type: 'alias', field: 'lang'},
	source_preference: {type: 'alias', field: 'source'},
	protocol: {type: 'alias', field: 'proto'},
	filesize_approx: {type: 'alias', field: 'fs_approx'},
	audio_channels: {type: 'alias', field: 'channels'}
}

const DEFAULT_ORDER = ['hidden', 'aud_or_vid', 'hasvid', 'ie_pref', 'lang', 'quality', 'res', 'fps', 'hdr:12', 'vcodec', 'channels', 'acodec', 'size', 'br', 'asr', 'proto', 'ext', 'hasaud', 'source', 'id'] as const

const SORT_ITEM = /^ *(?:(\+)?([a-zA-Z0-9_]+)(?:([~:])(.*?))?)? *$/

interface FieldData {
	reverse: boolean
	closest: boolean
	limit: number | string | null
}

function settingOf(field: string): FieldSetting {
	const setting = SETTINGS[field]
	if (!setting) throw new Error(`yt-dlp format sort: unknown field ${field}`)
	return setting
}

function typeOf(field: string): FieldType {
	return settingOf(field).type ?? 'field'
}

function sourceFields(field: string): readonly string[] {
	const {field: source} = settingOf(field)
	const type = typeOf(field)
	if (source !== undefined) return typeof source === 'string' ? [source] : source
	return type === 'extractor' ? ['preference'] : [field]
}

function convertOf(field: string): Convert {
	const setting = settingOf(field)
	if (setting.convert) return setting.convert
	return typeOf(field) === 'ordered' ? 'order' : 'float_string'
}

function floatOrNull(value: unknown): number | null {
	if (typeof value === 'number') return Number.isFinite(value) ? value : null
	if (typeof value === 'boolean') return Number(value)
	if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value)
	return null
}

const BYTE_UNITS = 'kmgtpezy'

// yt-dlp's `parse_bytes`: "500K", "1.5M" (powers of 1024).
function parseBytes(text: string): number | null {
	const match = /^(\d+(?:\.\d*)?)([kmgtpezy]?)$/i.exec(text.trim())
	if (!match?.[1]) return null
	const unit = (match[2] ?? '').toLowerCase()
	return Math.round(Number(match[1]) * 1024 ** (unit === '' ? 0 : BYTE_UNITS.indexOf(unit) + 1))
}

// A value's place in one of yt-dlp's lists, where a missing value is `None`.
function indexIn(list: readonly (string | null)[], value: unknown): number {
	if (value === null || value === undefined) return list.indexOf(null)
	return typeof value === 'string' ? list.indexOf(value) : -1
}

// Python's re.match anchors at the start only.
const anchoredPatterns = new Map<string, RegExp>()
function matchesAtStart(pattern: string, value: string): boolean {
	let regex = anchoredPatterns.get(pattern)
	if (!regex) {
		// eslint-disable-next-line security/detect-non-literal-regexp -- the pattern is one of yt-dlp's constant field orders above, not user input
		regex = new RegExp(`^(?:${pattern})`)
		anchoredPatterns.set(pattern, regex)
	}
	return regex.test(value)
}

// `_resolve_field_value`: a field's value as a number to compare, for `ordered` fields its place in the order.
function resolveFieldValue(field: string, raw: unknown, convertNone: boolean): number | string | null {
	if (raw === null || raw === undefined) {
		if (!convertNone) return null
	}
	const value = typeof raw === 'string' ? raw.toLowerCase() : raw
	const conversion = convertOf(field)
	if (conversion === 'ignore') return null
	if (conversion === 'string') return typeof value === 'string' ? value : typeof value === 'number' ? `${value}` : null
	if (conversion === 'float_none') return floatOrNull(value)
	if (conversion === 'bytes') return typeof value === 'string' ? parseBytes(value) : floatOrNull(value)
	if (conversion === 'order') {
		const order = settingOf(field).order ?? []
		const length = order.length
		const emptyPos = order.includes('') ? order.indexOf('') : length + 1
		if (settingOf(field).regex && typeof value === 'string') {
			const index = order.findIndex(entry => entry !== null && entry !== '' && matchesAtStart(entry, value))
			return length - (index < 0 ? emptyPos : index)
		}
		const index = indexIn(order, value)
		return length - (index < 0 ? emptyPos : index)
	}
	// float_string / float
	if (typeof value === 'number') return value
	if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value)
	return typeof value === 'string' ? value : null
}

export interface FormatSorter {
	readonly fields: readonly string[]
	compare(a: YtDlpSelectableFormat, b: YtDlpSelectableFormat): number
}

type Preference = readonly (number | string)[]

// Builds the sort for one run: `userSort` is what `-S` passes, `extractorSort`
// the probe's `_format_sort_fields`.
export function createFormatSorter(userSort: readonly string[], extractorSort: readonly string[]): FormatSorter {
	const order: string[] = []
	const data = new Map<string, FieldData>()

	const addItem = (field: string, reverse: boolean, closest: boolean, limitText: string | null): void => {
		if (order.includes(field)) return
		order.push(field)
		const limit = limitText === null ? null : resolveFieldValue(field, limitText, false)
		data.set(field, {reverse, closest: limit === null ? false : closest, limit})
	}

	const forced = DEFAULT_ORDER.filter(item => settingOf(item.split(':')[0] ?? item).forced)
	const priority = DEFAULT_ORDER.filter(item => settingOf(item.split(':')[0] ?? item).priority)
	for (const item of [...forced, ...priority, ...userSort, ...extractorSort, ...DEFAULT_ORDER]) {
		const match = SORT_ITEM.exec(item)
		if (!match) throw new Error(`yt-dlp format sort: invalid item ${item}`)
		let field = match[2]?.toLowerCase()
		if (field === undefined) continue
		if (typeOf(field) === 'alias') {
			const target = settingOf(field).field
			field = typeof target === 'string' ? target : field
		}
		const reverse = match[1] !== undefined
		const closest = match[3] === '~'
		const limitText = match[4] ?? null
		const multipleFields = typeOf(field) === 'combined'
		const hasLimit = limitText !== null
		const multipleLimits = hasLimit && multipleFields && !settingOf(field).sameLimit
		const fields = multipleFields ? sourceFields(field) : [field]
		const limits = multipleLimits && limitText !== null ? limitText.split(':') : hasLimit && limitText !== null ? [limitText] : []
		fields.forEach((sub, index) => addItem(sub, reverse, closest, index < limits.length ? (limits[index] ?? null) : hasLimit && !multipleLimits ? (limits[0] ?? null) : null))
	}

	const valueOf = (format: YtDlpSelectableFormat, field: string): unknown => {
		const record: Readonly<Record<string, unknown>> = format
		return record[sourceFields(field)[0] ?? field]
	}

	// `_calculate_field_preference_from_value`
	const preferenceFromValue = (field: string, type: FieldType, raw: unknown): Preference => {
		const {reverse, closest, limit} = data.get(field) ?? {reverse: false, closest: false, limit: null}
		let value: unknown = raw
		if (type === 'extractor') {
			const maximum = settingOf(field).max
			if (value === null || value === undefined || (maximum !== undefined && typeof value === 'number' && value >= maximum)) value = -1
		} else if (type === 'boolean') {
			const notInList = settingOf(field).notInList ?? [null]
			value = indexIn(notInList, value) >= 0 ? -1 : 0
		} else if (type === 'ordered') {
			value = resolveFieldValue(field, value, true)
		}
		const numeric = value === null || value === undefined ? (settingOf(field).default ?? null) : (floatOrNull(value) ?? settingOf(field).default ?? null)
		if (convertOf(field) === 'string' || numeric === null) {
			if (value === null || value === undefined) return [-10, 0]
			// Strings rank above numbers in a field that mixes them, as in yt-dlp.
			return [1, typeof value === 'string' ? value : typeof value === 'number' ? `${value}` : '', 0]
		}
		const v = numeric
		const lim = typeof limit === 'number' ? limit : null
		if (closest && lim !== null) return [0, -Math.abs(v - lim), reverse ? v - lim : lim - v]
		if (!reverse && (lim === null || v <= lim)) return [0, v, 0]
		if (lim === null || (reverse && v === lim) || v > lim) return [0, -v, 0]
		return [-1, v, 0]
	}

	const preferenceOf = (format: YtDlpSelectableFormat, field: string): Preference => {
		const type = typeOf(field)
		if (type === 'multiple') {
			const values = sourceFields(field).map(sub => valueOf(format, sub))
			return preferenceFromValue(field, 'field', settingOf(field).function?.(values) ?? null)
		}
		return preferenceFromValue(field, type, valueOf(format, field))
	}

	const cache = new WeakMap<YtDlpSelectableFormat, Preference[]>()
	const preferencesOf = (format: YtDlpSelectableFormat): Preference[] => {
		const cached = cache.get(format)
		if (cached) return cached
		const computed = order.map(field => preferenceOf(format, field))
		cache.set(format, computed)
		return computed
	}

	return {
		fields: order,
		compare(a, b) {
			const left = preferencesOf(a)
			const right = preferencesOf(b)
			for (let i = 0; i < left.length; i++) {
				const result = compareTuples(left[i] ?? [], right[i] ?? [])
				if (result !== 0) return result
			}
			return 0
		}
	}
}

// Python tuple order: element by element, numbers before strings never mixed here.
function compareTuples(a: Preference, b: Preference): number {
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		const x = a[i]
		const y = b[i]
		if (x === y) continue
		if (x === undefined) return -1
		if (y === undefined) return 1
		if (typeof x === 'number' && typeof y === 'number') return x - y
		return String(x) < String(y) ? -1 : 1
	}
	return 0
}

// yt-dlp's `_fill_sorting_fields` and the per-format fixes `process_video_result`
// makes before sorting (DRM-protected formats left out, as yt-dlp leaves them).
export function prepareForSort(formats: readonly YtDlpSelectableFormat[], durationSeconds: number | undefined): YtDlpSelectableFormat[] {
	return formats
		.filter(format => format.has_drm !== true)
		.map(original => {
			const format: YtDlpSelectableFormat = {...original}
			// `_fill_sorting_fields`
			if (format.vcodec === 'none') {
				format.audio_ext = format.acodec !== 'none' ? format.ext : 'none'
				format.video_ext = 'none'
			} else {
				format.video_ext = format.ext
				format.audio_ext = 'none'
			}
			if (format.vcodec === 'none') format.vbr = 0
			if (format.acodec === 'none') format.abr = 0
			if (!format.vbr && format.vcodec !== 'none') format.vbr = format.tbr !== undefined && format.abr !== undefined ? format.tbr - format.abr || undefined : undefined
			if (!format.abr && format.acodec !== 'none') format.abr = format.tbr !== undefined && format.vbr !== undefined ? format.tbr - format.vbr || undefined : undefined
			if (format.tbr === undefined || format.tbr === 0) format.tbr = format.vbr !== undefined && format.abr !== undefined ? format.vbr + format.abr || undefined : undefined
			// then, in `process_video_result`
			if (format.acodec === undefined && format.ext !== undefined && ['aac', 'opus', 'mp3', 'flac', 'vorbis'].includes(format.ext)) format.acodec = format.ext
			if (format.dynamic_range === undefined && format.vcodec !== 'none') format.dynamic_range = 'SDR'
			if (!format.manifest_url && !format.filesize && !format.filesize_approx && format.tbr !== undefined && durationSeconds !== undefined) format.filesize_approx = Math.trunc(durationSeconds * format.tbr * (1000 / 8))
			return format
		})
}

// Worst first, as yt-dlp keeps them: a stable sort, so exact ties keep the
// probe's order, and "best" is taken from the end.
export function sortFormats(formats: readonly YtDlpSelectableFormat[], sorter: FormatSorter): YtDlpSelectableFormat[] {
	return formats.toSorted((a, b) => sorter.compare(a, b))
}
