// User-facing filename templates. Users type `{title} [{id}]`; we translate
// that into a yt-dlp output template and hand it to `-o`. yt-dlp does the field
// lookup, truncation, and file writing — we never substitute or rename
// ourselves, which is what keeps this module small.
//
// Token names are enumerated in schemas.ts (enum SSOT); the field mapping below
// is the implementation detail that belongs here.

import {FILENAME_TEMPLATE_MAX, FILENAME_TOKENS, type FilenameToken} from './schemas.js'

export const DEFAULT_FILENAME_TEMPLATE = '{title} [{id}]'

// Every mapping below is verified output from yt-dlp 2026.07.04.
//
// The `|` empty-default on the optional tokens is load-bearing, not polish:
// without it an audio-only download under `{title} {resolution}` writes
// "Song NAp.m4a" to disk, and a single (non-playlist) download under
// `{playlist_index}` writes "NA".
//
// `{uploader}` resolves through a fallback chain because `uploader` is absent
// on several extractors Arroxy supports; the chain degrades to a real value
// instead of printing "NA".
//
// `{title}` takes a byte cap computed per template rather than a fixed one —
// see titleCapFor(). Capping fields individually is not enough: the limit
// applies to the whole rendered component, and literals are counted in UTF-8
// bytes, so 120 multibyte characters plus a 150-byte title reaches 390 bytes
// against a 255-byte limit.
const TOKEN_FIELDS: Record<Exclude<FilenameToken, 'title'>, string> = {uploader: '%(uploader,channel,creator,uploader_id).60B', id: '%(id)s', date: '%(upload_date>%Y-%m-%d|)s', resolution: '%(height&{}p|)s', playlist_index: '%(playlist_index|)03d'}

// Worst-case bytes each token can contribute. `uploader` matches its own `.60B`
// cap; `id` is an allowance rather than a cap because playlist dedupe matches
// the full video id — truncating it would silently break that.
const TOKEN_MAX_BYTES: Record<FilenameToken, number> = {title: 150, uploader: 60, id: 64, date: 10, resolution: 6, playlist_index: 6}

// 255 is the usual filesystem limit for one path component; the margin leaves
// room for the suffixes yt-dlp appends while working (`.part`, `.f137`).
const COMPONENT_BUDGET_BYTES = 240
const EXTENSION_BYTES = 6
const TITLE_MIN_BYTES = 40

function utf8Length(value: string): number {
	return new TextEncoder().encode(value).length
}

/**
 * Bytes left for `{title}` once literals, the extension, and every other token's
 * worst case are accounted for. Split evenly when `{title}` appears more than
 * once. Negative or below TITLE_MIN_BYTES means the template cannot fit.
 */
function titleCapFor(segments: Segment[]): number {
	let fixed = EXTENSION_BYTES
	let titleCount = 0
	for (const segment of segments) {
		if (segment.kind === 'literal') fixed += utf8Length(segment.text)
		else if (segment.token === 'title') titleCount++
		else fixed += TOKEN_MAX_BYTES[segment.token]
	}
	const remaining = COMPONENT_BUDGET_BYTES - fixed
	if (titleCount === 0) return remaining
	return Math.min(TOKEN_MAX_BYTES.title, Math.floor(remaining / titleCount))
}

// Values a single 1080p video download would produce, used to render the live
// preview without spawning yt-dlp. `playlist_index` is empty because the sample
// is a single download — the same thing the compiled `|` default yields.
const SAMPLE_VALUES: Record<FilenameToken, string> = {title: 'Big Buck Bunny', uploader: 'Blender Foundation', id: 'YE7VzlLtp-4', date: '2026-08-03', resolution: '1080p', playlist_index: ''}
const SAMPLE_EXT = 'mp4'

// Chars that break filenames on Windows/macOS/Linux. `/` and `\` are rejected
// deliberately: subfolders are the download profile's `subfolder` field, and
// refusing separators here also forecloses `../` traversal into the -o path.
// eslint-disable-next-line no-control-regex -- control bytes are intentionally matched here
const FORBIDDEN_CHARS = /[<>:"/\\|?*\x00-\x1F]/

const TOKEN_PATTERN = /\{([^{}]*)\}/g

export type FilenameTemplateFailure = {ok: false; code: 'empty'} | {ok: false; code: 'too-long'} | {ok: false; code: 'forbidden-char'} | {ok: false; code: 'stray-brace'} | {ok: false; code: 'no-unique-token'} | {ok: false; code: 'unknown-token'; token: string}

export type FilenameTemplateValidation = {ok: true} | FilenameTemplateFailure
export type FilenameTemplateCompilation = {ok: true; template: string} | FilenameTemplateFailure

type Segment = {kind: 'literal'; text: string} | {kind: 'token'; token: FilenameToken}

function isFilenameToken(value: string): value is FilenameToken {
	return (FILENAME_TOKENS as readonly string[]).includes(value)
}

function parse(raw: string): {ok: true; segments: Segment[]; titleCap: number} | FilenameTemplateFailure {
	const template = raw.trim()
	if (!template) return {ok: false, code: 'empty'}
	if (template.length > FILENAME_TEMPLATE_MAX) return {ok: false, code: 'too-long'}

	const segments: Segment[] = []
	const literals: string[] = []
	let cursor = 0

	TOKEN_PATTERN.lastIndex = 0
	for (let match = TOKEN_PATTERN.exec(template); match !== null; match = TOKEN_PATTERN.exec(template)) {
		const name = match[1] ?? ''
		if (!isFilenameToken(name)) return {ok: false, code: 'unknown-token', token: name}
		const literal = template.slice(cursor, match.index)
		if (literal) {
			segments.push({kind: 'literal', text: literal})
			literals.push(literal)
		}
		segments.push({kind: 'token', token: name})
		cursor = match.index + match[0].length
	}

	const tail = template.slice(cursor)
	if (tail) {
		segments.push({kind: 'literal', text: tail})
		literals.push(tail)
	}

	const literalText = literals.join('')
	if (literalText.includes('{') || literalText.includes('}')) return {ok: false, code: 'stray-brace'}
	if (FORBIDDEN_CHARS.test(literalText)) return {ok: false, code: 'forbidden-char'}

	// Without `{title}` or `{id}` every download in a folder resolves to the
	// same name and silently overwrites the last one.
	const distinguishing = segments.some(segment => segment.kind === 'token' && (segment.token === 'title' || segment.token === 'id'))
	if (!distinguishing) return {ok: false, code: 'no-unique-token'}

	// The 120-character cap bounds what the user types; this bounds what yt-dlp
	// actually writes, which is what the filesystem limits.
	const titleCap = titleCapFor(segments)
	const hasTitle = segments.some(segment => segment.kind === 'token' && segment.token === 'title')
	if (titleCap < (hasTitle ? TITLE_MIN_BYTES : 0)) return {ok: false, code: 'too-long'}

	return {ok: true, segments, titleCap}
}

export function validateFilenameTemplate(template: string): FilenameTemplateValidation {
	const parsed = parse(template)
	return parsed.ok ? {ok: true} : parsed
}

export function compileFilenameTemplate(template: string): FilenameTemplateCompilation {
	const parsed = parse(template)
	if (!parsed.ok) return parsed
	// Literal `%` must survive yt-dlp's own expansion pass.
	const body = parsed.segments.map(segment => (segment.kind === 'token' ? (segment.token === 'title' ? `%(title).${parsed.titleCap}B` : TOKEN_FIELDS[segment.token]) : segment.text.replaceAll('%', '%%'))).join('')
	return {ok: true, template: `${body}.%(ext)s`}
}

/**
 * Playlist dedupe (`findPlayableFileName`) and M3U writing locate files by
 * matching `[videoId]` before the extension. Without `{id}` both must degrade
 * rather than silently mismatch.
 */
export function templateHasId(template: string): boolean {
	const parsed = parse(template)
	return parsed.ok && parsed.segments.some(segment => segment.kind === 'token' && segment.token === 'id')
}

/** Sample-rendered filename for live UI preview. Null when the template is invalid. */
export function previewFilenameTemplate(template: string): string | null {
	const parsed = parse(template)
	if (!parsed.ok) return null
	const body = parsed.segments.map(segment => (segment.kind === 'token' ? SAMPLE_VALUES[segment.token] : segment.text)).join('')
	return `${body}.${SAMPLE_EXT}`
}
