// User-facing filename templates. Users type `{uploader}/{title} [{id}]`; we
// split that into directory segments and a filename segment. Arroxy renders the
// directories itself; the filename segment becomes a yt-dlp output template
// handed to `-o`, where yt-dlp does the field lookup, truncation, and writing.
//
// Why the split: Arroxy must know the final directory *before* the download to
// drive playlist dedupe, folder scanning, and M3U writing. It cannot learn that
// from a template it never expands. Rendering directories here also means the
// compiled `-o` addresses exactly one path component and can never contain a
// separator — a compromised renderer cannot redirect yt-dlp anywhere.
//
// Token names are enumerated in schemas.ts (enum SSOT); the field mapping below
// is the implementation detail that belongs here.

import {FILENAME_TEMPLATE_MAX, FILENAME_TOKENS, type FilenameToken} from './schemas.js'
import {isValidSubfolder, joinSubfolder, sanitizeDirSegment} from './subfolder.js'

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
const TOKEN_FIELDS: Record<Exclude<FilenameToken, 'title'>, string> = {
	uploader: '%(uploader,channel,creator,uploader_id).60B',
	id: '%(id)s',
	date: '%(upload_date>%Y-%m-%d|)s',
	resolution: '%(height&{}p|)s',
	playlist_index: '%(playlist_index|)03d',
	playlist_title: '%(playlist_title|).60B',
	playlist_id: '%(playlist_id|)s'
}

// Worst-case bytes each token can contribute. `uploader` matches its own `.60B`
// cap; `id` is an allowance rather than a cap because playlist dedupe matches
// the full video id — truncating it would silently break that.
const TOKEN_MAX_BYTES: Record<FilenameToken, number> = {title: 150, uploader: 60, id: 64, date: 10, resolution: 6, playlist_index: 6, playlist_title: 60, playlist_id: 40}

// 255 is the usual filesystem limit for one path component; the margin leaves
// room for the suffixes yt-dlp appends while working (`.part`, `.f137`). The
// budget applies per path component, so a long folder name never shrinks the
// title cap in the filename.
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

/**
 * Metadata Arroxy renders directory segments from. Every field is optional
 * because extractors vary; an absent field renders empty, and a segment that
 * renders empty collapses instead of writing an "NA" folder.
 */
export interface TemplateMetadata {
	title?: string
	id?: string | null
	uploader?: string
	channel?: string
	uploaderId?: string
	/** Raw yt-dlp `upload_date` (YYYYMMDD); formatted to YYYY-MM-DD on render. */
	uploadDate?: string
	resolution?: string
	playlistTitle?: string
	playlistId?: string
	playlistIndex?: number
}

// Values a single 1080p video download would produce, used to render the live
// preview without spawning yt-dlp. The playlist fields are absent because the
// sample is a single download — the same thing the compiled `|` defaults yield.
const VIDEO_SAMPLE: TemplateMetadata = {title: 'Big Buck Bunny', uploader: 'Blender Foundation', id: 'YE7VzlLtp-4', uploadDate: '20260803', resolution: '1080p'}
const PLAYLIST_SAMPLE: TemplateMetadata = {...VIDEO_SAMPLE, playlistTitle: 'Nature Docs', playlistId: 'PL123', playlistIndex: 7}
const SAMPLE_EXT = 'mp4'

// Chars that break filenames on Windows/macOS/Linux. `/` is absent because it
// is now the segment separator, parsed before this runs. `\` stays rejected so
// there is exactly one separator syntax to learn and to validate.
// eslint-disable-next-line no-control-regex -- control bytes are intentionally matched here
const FORBIDDEN_CHARS = /[<>:"\\|?*\x00-\x1F]/

const TOKEN_PATTERN = /\{([^{}]*)\}/g

export type FilenameTemplateFailure =
	| {ok: false; code: 'empty'}
	| {ok: false; code: 'too-long'}
	| {ok: false; code: 'forbidden-char'}
	| {ok: false; code: 'stray-brace'}
	| {ok: false; code: 'no-unique-token'}
	| {ok: false; code: 'unknown-token'; token: string}
	| {ok: false; code: 'empty-segment'}
	| {ok: false; code: 'invalid-segment'}
	| {ok: false; code: 'resolution-in-dir'}

export type FilenameTemplateValidation = {ok: true} | FilenameTemplateFailure
export type FilenameTemplateCompilation = {ok: true; template: string} | FilenameTemplateFailure

type Segment = {kind: 'literal'; text: string} | {kind: 'token'; token: FilenameToken}

interface ParsedTemplate {
	ok: true
	dirs: Segment[][]
	file: Segment[]
	titleCap: number
}

function isFilenameToken(value: string): value is FilenameToken {
	return (FILENAME_TOKENS as readonly string[]).includes(value)
}

/** Split one path component into literals and tokens. */
function parseSegment(text: string): {ok: true; segments: Segment[]} | FilenameTemplateFailure {
	const segments: Segment[] = []
	const literals: string[] = []
	let cursor = 0

	TOKEN_PATTERN.lastIndex = 0
	for (let match = TOKEN_PATTERN.exec(text); match !== null; match = TOKEN_PATTERN.exec(text)) {
		const name = match[1] ?? ''
		if (!isFilenameToken(name)) return {ok: false, code: 'unknown-token', token: name}
		const literal = text.slice(cursor, match.index)
		if (literal) {
			segments.push({kind: 'literal', text: literal})
			literals.push(literal)
		}
		segments.push({kind: 'token', token: name})
		cursor = match.index + match[0].length
	}

	const tail = text.slice(cursor)
	if (tail) {
		segments.push({kind: 'literal', text: tail})
		literals.push(tail)
	}

	const literalText = literals.join('')
	if (literalText.includes('{') || literalText.includes('}')) return {ok: false, code: 'stray-brace'}
	if (FORBIDDEN_CHARS.test(literalText)) return {ok: false, code: 'forbidden-char'}

	return {ok: true, segments}
}

function hasToken(segments: Segment[], token: FilenameToken): boolean {
	return segments.some(segment => segment.kind === 'token' && segment.token === token)
}

function parse(raw: string): ParsedTemplate | FilenameTemplateFailure {
	const template = raw.trim()
	if (!template) return {ok: false, code: 'empty'}
	if (template.length > FILENAME_TEMPLATE_MAX) return {ok: false, code: 'too-long'}

	const rawSegments = template.split('/')
	const parsed: Segment[][] = []
	for (const rawSegment of rawSegments) {
		const trimmed = rawSegment.trim()
		// Catches a leading `/` (absolute path), a trailing `/` (no filename),
		// and `//`. All three would otherwise produce a nameless directory.
		if (!trimmed) return {ok: false, code: 'empty-segment'}
		const segment = parseSegment(trimmed)
		if (!segment.ok) return segment
		parsed.push(segment.segments)
	}

	const file = parsed[parsed.length - 1] ?? []
	const dirs = parsed.slice(0, -1)

	for (const [index, dir] of dirs.entries()) {
		// Height is only known once the stream is chosen, and playlist entries
		// come from a flat probe with no per-entry formats — so a directory can
		// never be named after it.
		if (hasToken(dir, 'resolution')) return {ok: false, code: 'resolution-in-dir'}
		// A segment with no tokens is fully known now, so validate it now:
		// `..`, `.`, reserved device names, trailing dots. Segments containing
		// tokens are sanitized at render time instead.
		const literalOnly = dir.every(segment => segment.kind === 'literal')
		if (literalOnly) {
			const text = rawSegments[index]?.trim() ?? ''
			if (!isValidSubfolder(text)) return {ok: false, code: 'invalid-segment'}
		}
	}

	// Without `{title}` or `{id}` in the *filename*, every download in a folder
	// resolves to the same name and silently overwrites the last one. A
	// distinguishing token in a directory does not help — it only moves the
	// collision into that directory.
	if (!hasToken(file, 'title') && !hasToken(file, 'id')) return {ok: false, code: 'no-unique-token'}

	// The character cap bounds what the user types; this bounds what yt-dlp
	// actually writes, which is what the filesystem limits.
	const titleCap = titleCapFor(file)
	if (titleCap < (hasToken(file, 'title') ? TITLE_MIN_BYTES : 0)) return {ok: false, code: 'too-long'}

	return {ok: true, dirs, file, titleCap}
}

export function validateFilenameTemplate(template: string): FilenameTemplateValidation {
	const parsed = parse(template)
	return parsed.ok ? {ok: true} : parsed
}

/**
 * Compile the *filename* segment into a yt-dlp output template. Directory
 * segments are deliberately excluded — Arroxy renders those — which guarantees
 * the result names exactly one path component.
 */
export function compileFilenameTemplate(template: string): FilenameTemplateCompilation {
	const parsed = parse(template)
	if (!parsed.ok) return parsed
	// Literal `%` must survive yt-dlp's own expansion pass.
	const body = parsed.file.map(segment => (segment.kind === 'token' ? (segment.token === 'title' ? `%(title).${parsed.titleCap}B` : TOKEN_FIELDS[segment.token]) : segment.text.replaceAll('%', '%%'))).join('')
	return {ok: true, template: `${body}.%(ext)s`}
}

/** yt-dlp's `upload_date` is YYYYMMDD; the compiled token renders YYYY-MM-DD. */
function formatUploadDate(raw: string | undefined): string {
	if (!raw || !/^\d{8}$/.test(raw)) return ''
	return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
}

/**
 * Render one token the way yt-dlp would. Must stay in lockstep with
 * TOKEN_FIELDS: a token has to mean the same thing in a directory (rendered
 * here) as in a filename (rendered by yt-dlp).
 */
function renderToken(token: FilenameToken, meta: TemplateMetadata): string {
	switch (token) {
		case 'title':
			return meta.title ?? ''
		case 'uploader':
			// A blank counts as absent, not as a winning value — `??` would stop at
			// an empty string and render an empty folder instead of falling through.
			return [meta.uploader, meta.channel, meta.uploaderId].find(value => value !== undefined && value.trim().length > 0)?.trim() ?? ''
		case 'id':
			return meta.id ?? ''
		case 'date':
			return formatUploadDate(meta.uploadDate)
		case 'resolution':
			return meta.resolution ?? ''
		case 'playlist_index':
			return meta.playlistIndex === undefined ? '' : String(meta.playlistIndex).padStart(3, '0')
		case 'playlist_title':
			return meta.playlistTitle ?? ''
		case 'playlist_id':
			return meta.playlistId ?? ''
	}
}

function renderSegment(segments: Segment[], meta: TemplateMetadata): string {
	return segments.map(segment => (segment.kind === 'token' ? renderToken(segment.token, meta) : segment.text)).join('')
}

/**
 * Directory names a template creates below the output directory, in order.
 *
 * Segments that render empty collapse, so `{playlist_title}/{title}` writes no
 * folder for a single video. An invalid template yields no directories, which
 * lands files in the base directory rather than somewhere unexpected.
 */
export function renderTemplateDirs(template: string, meta: TemplateMetadata): string[] {
	const parsed = parse(template)
	if (!parsed.ok) return []
	const dirs: string[] = []
	for (const segment of parsed.dirs) {
		const safe = sanitizeDirSegment(renderSegment(segment, meta))
		if (safe !== null) dirs.push(safe)
	}
	return dirs
}

// Tokens yt-dlp cannot expand for an Arroxy download. Arroxy queues each
// playlist entry as its own single-video job (`watch?v=…`), so by the time
// yt-dlp runs there is no playlist context and `%(playlist_index)s` and friends
// resolve empty. Arroxy holds those values from the probe, so it binds them
// into the template as literals before handing it over. Everything else stays a
// token: yt-dlp knows per-video fields and truncates them correctly.
const PLAYLIST_BOUND_TOKENS: readonly FilenameToken[] = ['playlist_index', 'playlist_title', 'playlist_id']

/**
 * Truncate to a UTF-8 byte budget without splitting a character.
 *
 * Iterating with for..of walks code points, so a surrogate pair is either kept
 * whole or dropped whole — slicing by UTF-16 code units instead would leave a
 * lone surrogate in the filename.
 */
function truncateToBytes(value: string, maxBytes: number): string {
	if (utf8Length(value) <= maxBytes) return value
	let out = ''
	let used = 0
	for (const char of value) {
		const size = utf8Length(char)
		if (used + size > maxBytes) break
		out += char
		used += size
	}
	return out
}

// A bound value becomes literal template text, so anything that would change
// the template's meaning has to go: separators would invent a folder, braces
// would invent a token, and the rest are illegal in filenames anyway. `%` is
// left alone — compileFilenameTemplate escapes literals on the way out.
//
// The budget is the token's own byte allowance, and it is counted in bytes
// rather than characters: once bound, the value is a literal that titleCapFor
// measures with utf8Length, so a character-counted cap let a CJK title overrun
// the component budget, fail to compile, and silently fall back to the default
// template — losing the user's naming scheme entirely.
function sanitizeBoundLiteral(value: string, maxBytes: number): string {
	const cleaned = value
		// eslint-disable-next-line no-control-regex -- control bytes are intentionally matched here
		.replace(/[<>:"/\\|?*{}\x00-\x1F]/g, '_')
		.replace(/\s+/g, ' ')
		.trim()
	// Truncation can expose a trailing space, so trim again after cutting.
	return truncateToBytes(cleaned, maxBytes).trim()
}

/**
 * Resolve the tokens yt-dlp cannot know into literals and return the filename
 * segment alone. Directory segments are dropped because the caller has already
 * folded them into the output directory.
 *
 * An invalid template is returned untouched so the validator owns the error.
 */
export function bindFilenameTemplate(template: string, meta: TemplateMetadata): string {
	const parsed = parse(template)
	if (!parsed.ok) return template
	return parsed.file
		.map(segment => {
			if (segment.kind === 'literal') return segment.text
			if (!PLAYLIST_BOUND_TOKENS.includes(segment.token)) return `{${segment.token}}`
			return sanitizeBoundLiteral(renderToken(segment.token, meta), TOKEN_MAX_BYTES[segment.token])
		})
		.join('')
}

/**
 * Absolute directory a template writes into, below `baseDir`.
 *
 * Every segment is sanitized by renderTemplateDirs before it is joined, so the
 * result can never climb above `baseDir` regardless of what the extractor
 * returned for a title or uploader.
 */
export function templateOutputDir(baseDir: string, template: string, meta: TemplateMetadata): string {
	return renderTemplateDirs(template, meta).reduce((dir, segment) => joinSubfolder(dir, segment), baseDir)
}

// Tokens whose value is the same for every entry in a playlist. Anything else
// ({uploader}, {date}, {title}, {id}, {playlist_index}) differs per entry.
const PLAYLIST_LEVEL_TOKENS: readonly FilenameToken[] = ['playlist_title', 'playlist_id']

/**
 * Whether a template's *directories* differ between entries of one playlist.
 *
 * Folder sync resolves a single directory for the whole playlist and scans it
 * for already-downloaded files. That only holds while every directory segment
 * is playlist-level; a per-entry field scatters items across folders, so the
 * scan would look in the wrong place and report nothing downloaded — prompting
 * the user to re-download everything. Callers degrade instead, the same way
 * they already do when `{id}` is missing.
 *
 * Per-entry tokens in the *filename* are irrelevant here; only directories
 * decide where the scan looks.
 */
export function templateDirsVaryPerEntry(template: string): boolean {
	const parsed = parse(template)
	if (!parsed.ok) return false
	return parsed.dirs.some(dir => dir.some(segment => segment.kind === 'token' && !PLAYLIST_LEVEL_TOKENS.includes(segment.token)))
}

/** Whether a template takes over directory layout from the playlist auto-folder. */
export function templateHasDirs(template: string): boolean {
	const parsed = parse(template)
	return parsed.ok && parsed.dirs.length > 0
}

/**
 * Playlist dedupe (`findPlayableFileName`) and M3U writing locate downloaded
 * files by matching `[videoId]` before the extension, so only `{id}` in the
 * filename segment counts. Without it both must degrade rather than silently
 * mismatch.
 */
export function templateHasId(template: string): boolean {
	const parsed = parse(template)
	return parsed.ok && hasToken(parsed.file, 'id')
}

/**
 * Sample-rendered path for live UI preview. Null when the template is invalid.
 *
 * The two samples differ where it matters: a playlist template collapses to a
 * bare filename for a single video, and users need to see that before it
 * surprises them.
 */
export function previewFilenameTemplate(template: string, sample: 'video' | 'playlist' = 'video'): string | null {
	const parsed = parse(template)
	if (!parsed.ok) return null
	const meta = sample === 'playlist' ? PLAYLIST_SAMPLE : VIDEO_SAMPLE
	const dirs = renderTemplateDirs(template, meta)
	const filename = `${renderSegment(parsed.file, meta)}.${SAMPLE_EXT}`
	return [...dirs, filename].join('/')
}
