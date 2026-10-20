// yt-dlp's format selection (`YoutubeDL.build_format_selector`), translated for the
// part of its language `mediaIntentSpec` writes: alternatives (`/`), a merge
// (`+`), the best / bestvideo / bestaudio atoms with or without `*`, and
// `[...]` filters. Evaluated over formats sorted worst first (formatSorter.ts),
// it answers what the yt-dlp run would download, as yt-dlp's `format_id`
// ("137+140"). Anything outside that part throws rather than guess.

import type {YtDlpSelectableFormat} from './selectableFormat.js'

type Format = YtDlpSelectableFormat

interface Atom {
	spec: string
	filters: ((format: Format) => boolean)[]
}

// One alternative: an atom, or two merged.
type Alternative = readonly [Atom] | readonly [Atom, Atom]

interface Context {
	formats: readonly Format[]
	hasMergedFormat: boolean
	incompleteFormats: boolean
}

// What one alternative picked: the formats yt-dlp would download together.
export interface SelectedFormats {
	formatId: string
	formats: readonly Format[]
}

// Splits at `separator` outside `[...]` and quotes.
function splitTopLevel(text: string, separator: string): string[] {
	const parts: string[] = []
	let depth = 0
	let quote: string | null = null
	let start = 0
	for (let i = 0; i < text.length; i++) {
		const char = text[i]
		if (quote) {
			if (char === '\\') i++
			else if (char === quote) quote = null
		} else if (char === '"' || char === "'") quote = char
		else if (char === '[') depth++
		else if (char === ']') depth--
		else if (char === separator && depth === 0) {
			parts.push(text.slice(start, i))
			start = i + 1
		}
	}
	parts.push(text.slice(start))
	return parts
}

const NUMERIC_FILTER = /^\s*([\w.-]+)\s*(<=|>=|!=|<|>|=)(\s*\?)?\s*([0-9.]+)\s*$/
const STRING_FILTER = /^\s*([a-zA-Z0-9._-]+)\s*(!\s*)?(=|\^=|\$=|\*=|~=)\s*(\?\s*)?(?:"((?:[^"\\]|\\.)+)"|'((?:[^'\\]|\\.)+)'|([\w.-]+))\s*$/

// Python's `(?i)` at the start of a pattern is a flag; JavaScript takes it apart.
function pythonRegex(pattern: string): RegExp {
	// eslint-disable-next-line security/detect-non-literal-regexp -- the pattern comes from a selector mediaIntentSpec writes, not from user input
	return pattern.startsWith('(?i)') ? new RegExp(pattern.slice(4), 'i') : new RegExp(pattern)
}

// `_build_format_filter`: a field missing from the format matches only with `?`.
function buildFilter(spec: string): (format: Format) => boolean {
	const numeric = NUMERIC_FILTER.exec(spec)
	if (numeric) {
		const [, key = '', op, noneInclusive, value = ''] = numeric
		const target = Number(value)
		return format => {
			const record: Readonly<Record<string, unknown>> = format
			const actual = record[key]
			if (actual === undefined || actual === null) return noneInclusive !== undefined
			if (typeof actual !== 'number') return false
			switch (op) {
				case '<':
					return actual < target
				case '<=':
					return actual <= target
				case '>':
					return actual > target
				case '>=':
					return actual >= target
				case '=':
					return actual === target
				default:
					return actual !== target
			}
		}
	}
	const text = STRING_FILTER.exec(spec)
	if (!text) throw new Error(`yt-dlp format filter not supported: ${spec}`)
	const [, key = '', negation, op, noneInclusive, doubleQuoted, singleQuoted, bare] = text
	const raw = doubleQuoted ?? singleQuoted ?? bare ?? ''
	const regex = op === '~=' ? pythonRegex(raw) : null
	const value = raw.replaceAll(/\\(["'\\])/g, '$1')
	const test = (actual: string): boolean => {
		switch (op) {
			case '=':
				return actual === value
			case '^=':
				return actual.startsWith(value)
			case '$=':
				return actual.endsWith(value)
			case '*=':
				return actual.includes(value)
			default:
				return regex?.test(actual) ?? false
		}
	}
	return format => {
		const record: Readonly<Record<string, unknown>> = format
		const actual = record[key]
		if (actual === undefined || actual === null) return noneInclusive !== undefined
		const matched = typeof actual === 'string' ? test(actual) : typeof actual === 'number' ? test(`${actual}`) : false
		return negation !== undefined ? !matched : matched
	}
}

const ATOM = /^(best|worst|b|w)(video|audio|v|a)?(\*)?$/

function parseAtom(text: string): Atom {
	const bracket = text.indexOf('[')
	const spec = (bracket < 0 ? text : text.slice(0, bracket)).trim() || 'best'
	if (!ATOM.test(spec)) throw new Error(`yt-dlp format atom not supported: ${spec}`)
	const filters: ((format: Format) => boolean)[] = []
	for (const match of (bracket < 0 ? '' : text.slice(bracket)).matchAll(/\[((?:[^\]"']|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')*)\]/g)) filters.push(buildFilter(match[1] ?? ''))
	return {spec, filters}
}

function parseFormatSelector(selector: string): readonly Alternative[] {
	return splitTopLevel(selector, '/').map(alternative => {
		const parts = splitTopLevel(alternative, '+').map(parseAtom)
		const [first, second] = parts
		if (!first || parts.length > 2) throw new Error(`yt-dlp format merge not supported: ${alternative}`)
		return second ? ([first, second] as const) : ([first] as const)
	})
}

const hasVideo = (format: Format): boolean => format.vcodec !== 'none'
const hasAudio = (format: Format): boolean => format.acodec !== 'none'

// One atom: the best (or worst) format of its kind among the filtered ones.
function pickAtom(atom: Atom, ctx: Context): Format | null {
	const formats = ctx.formats.filter(format => atom.filters.every(filter => filter(format)))
	const match = ATOM.exec(atom.spec)
	if (!match) return null
	const best = match[1]?.startsWith('b') ?? true
	const type = match[2]?.[0]
	const modified = match[3] !== undefined
	const kind = (format: Format): boolean => {
		if (type && modified) return type === 'v' ? hasVideo(format) : hasAudio(format)
		if (type) return type === 'v' ? !hasAudio(format) : !hasVideo(format)
		if (!modified) return hasVideo(format) && hasAudio(format)
		return true
	}
	let matches = formats.filter(format => kind(format) && (hasVideo(format) || hasAudio(format)))
	// `b` / `w` fall back to video-only or audio-only on a site that has no other kind.
	if (matches.length === 0 && !type && !modified && ctx.incompleteFormats) matches = formats.filter(format => hasVideo(format) || hasAudio(format))
	return (best ? matches.at(-1) : matches[0]) ?? null
}

// `_merge` without multiple audio or video streams: a second stream of a kind
// already present is dropped (a muxed video keeps its own sound), as is one
// with neither. The pop-while-iterating of the original skips the next entry.
function merge(first: Format, second: Format): SelectedFormats {
	const formats: Format[] = [first, second]
	const taken = {audio: false, video: false}
	for (let i = 0; i < formats.length; i++) {
		const format = formats[i]
		if (!format) continue
		if (format.acodec === 'none' && format.vcodec === 'none') {
			formats.splice(i, 1)
			continue
		}
		for (const kind of ['audio', 'video'] as const) {
			if ((kind === 'audio' ? format.acodec : format.vcodec) === 'none') continue
			if (taken[kind]) {
				formats.splice(i, 1)
				break
			}
			taken[kind] = true
		}
	}
	return {formatId: formats.map(format => format.format_id ?? '').join('+'), formats}
}

// What yt-dlp downloads for `selector` from `sorted` (worst first), or null when nothing matches.
export function selectFormats(selector: string | readonly Alternative[], sorted: readonly Format[]): SelectedFormats | null {
	const alternatives = typeof selector === 'string' ? parseFormatSelector(selector) : selector
	const ctx: Context = {formats: sorted, hasMergedFormat: sorted.some(format => hasVideo(format) && hasAudio(format)), incompleteFormats: sorted.every(format => !hasVideo(format)) || sorted.every(format => !hasAudio(format))}
	for (const [first, second] of alternatives) {
		const one = pickAtom(first, ctx)
		if (!one) continue
		if (!second) return {formatId: one.format_id ?? '', formats: [one]}
		const two = pickAtom(second, ctx)
		if (two) return merge(one, two)
	}
	return null
}
