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

import {fitName, renderName, type BudgetFailure, type BudgetPiece, type InFlightFiles} from './nameBudget.js'
import {templateLiteral} from 'yt-dlp-bridge/output-template'
import {limitsFor} from './pathLimits.js'
import {FILENAME_TEMPLATE_MAX, FILENAME_TOKENS, PLAYLIST_FILENAME_TOKENS, type FilenameToken} from './schemas.js'
import {isValidSubfolder, joinSubfolder, sanitizeDirSegment} from './subfolder.js'
import {isYouTubeHostname} from './sites/youtubeHost.js'

export const DEFAULT_FILENAME_TEMPLATE = '{title} [{id}]'

// The byte cap of each token yt-dlp expands with `.NB`. yt-dlp cuts the value
// to N bytes and only then sanitizes it (YoutubeDL.prepare_outtmpl), writing
// each of `"*:<>?|/\` as a 3-byte full-width look-alike, so a capped field can
// be written at three times its cap. `{title}` is capped too where it is left to
// yt-dlp: on a bound template whose title Arroxy does not know, and on the
// unbound fallback path, where there is no metadata to measure. Its 40 bytes
// written as 120 still fit Linux's 255 beside the longest in-flight suffix.
const SANITIZED_BYTES_PER_BYTE = 3
const LATE_TOKEN_CAP = {title: 40, uploader: 20, categories: 20, artist: 20, album: 20, track: 26, playlist_title: 20} as const satisfies Partial<Record<FilenameToken, number>>

// Every mapping below is verified output from yt-dlp 2026.07.04.
//
// The `|` empty-default on the optional tokens is load-bearing, not polish:
// without it an audio-only download under `{title} {resolution}` writes
// "Song NAp.m4a" to disk, and a single (non-playlist) download under
// `{playlist_index}` writes "NA".
//
// `{uploader}` resolves through a fallback chain because `uploader` is absent
// on several extractors Arroxy supports; the chain degrades to a real value
// instead of printing "NA". `{artist}` reuses that chain after `artist`, so a
// video that is not music still files under whoever posted it.
//
// `{categories}` is the first category only: YouTube sets exactly one, and a
// joined list would make a poor folder name on the sites that set several.
//
// These mappings are only reached on the *unbound* path — a template that was
// never run through bindFilenameTemplate, which in practice means main's
// fallback to DEFAULT_FILENAME_TEMPLATE after a persisted template failed to
// parse. A bound template carries literal text for every token but
// `{resolution}`, because yt-dlp's own truncation cannot be trusted to respect
// a budget: `.NB` truncates before sanitization, and sanitization grows the
// string (`:` or `|` to a 3-byte full-width form). See nameBudget.ts.
//
// The same table serves a token a bound template still leaves for yt-dlp, so
// each `.NB` cap is a third of what the budget reserves for that token: N bytes
// of `|` are written as 3N (LATE_TOKEN_CAP).
const TOKEN_FIELDS: Record<Exclude<FilenameToken, 'title'>, string> = {
	uploader: `%(uploader,channel,creator,uploader_id).${LATE_TOKEN_CAP.uploader}B`,
	id: '%(id)s',
	date: '%(upload_date>%Y-%m-%d|)s',
	year: '%(upload_date>%Y|)s',
	resolution: '%(height&{}p|)s',
	site: '%(webpage_url_domain|)s',
	categories: `%(categories.0|).${LATE_TOKEN_CAP.categories}B`,
	artist: `%(artist,uploader,channel,creator,uploader_id|).${LATE_TOKEN_CAP.artist}B`,
	album: `%(album|).${LATE_TOKEN_CAP.album}B`,
	track: `%(track|).${LATE_TOKEN_CAP.track}B`,
	playlist_index: '%(playlist_index|)03d',
	playlist_title: `%(playlist_title|).${LATE_TOKEN_CAP.playlist_title}B`,
	playlist_id: '%(playlist_id|)s'
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
	/** The page's domain without `www.`, as yt-dlp's `webpage_url_domain`. */
	site?: string
	/** First of yt-dlp's `categories`. */
	category?: string
	/** Set only by music sites; `{artist}` falls back to the uploader chain. */
	artist?: string
	album?: string
	track?: string
	playlistTitle?: string
	playlistId?: string
	playlistIndex?: number
}

// Values a single 1080p video download would produce, used to render the live
// preview without spawning yt-dlp. The playlist fields are absent because the
// sample is a single download — the same thing the compiled `|` defaults yield.
// The album and track are invented so the music tokens show a value too.
const VIDEO_SAMPLE: TemplateMetadata = {title: 'Big Buck Bunny', uploader: 'Blender Foundation', id: 'YE7VzlLtp-4', uploadDate: '20260803', resolution: '1080p', site: 'youtube.com', category: 'Film & Animation', album: 'Open Movies', track: 'Big Buck Bunny'}
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
}

/**
 * Two kinds of string reach this parser and they obey different rules.
 *
 * `typed` is what the user entered, and carries the constraints that exist to
 * keep the field usable: a character cap, and at least one distinguishing token.
 *
 * `bound` is Arroxy's own generated output, where both constraints are wrong.
 * A bound name contains literal text where `{title}` and `{id}` used to be, so
 * it has no tokens to require — and it is routinely *longer* than the typed cap,
 * because a 200-character cap on a template says nothing about the length of a
 * name rendered from it. Applying either rule here silently rejected the bound
 * template and sent main to its default-template fallback, throwing away the
 * whole budget for exactly the long titles it exists to handle.
 */
interface ParseOptions {
	source: 'typed' | 'bound'
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

function parse(raw: string, options: ParseOptions = {source: 'typed'}): ParsedTemplate | FilenameTemplateFailure {
	const template = raw.trim()
	if (!template) return {ok: false, code: 'empty'}
	// `too-long` means exactly this and nothing else: the user typed more
	// characters than the field accepts. It used to double as the report for a
	// blown byte budget, which told someone with an 84-character template that
	// their template was too long. Length-of-output failures now live in
	// nameBudget.ts and carry their own reasons.
	if (options.source === 'typed' && template.length > FILENAME_TEMPLATE_MAX) return {ok: false, code: 'too-long'}

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
	if (options.source === 'typed' && !hasToken(file, 'title') && !hasToken(file, 'id')) return {ok: false, code: 'no-unique-token'}

	return {ok: true, dirs, file}
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
	// Parsed as generated output, not as something a user typed — see ParseOptions.
	const parsed = parse(template, {source: 'bound'})
	if (!parsed.ok) return parsed
	// Literal text must survive yt-dlp's own expansion pass, which runs before
	// it fills fields: templateLiteral escapes each `%`, `$` and `~` without
	// changing what is written. Fields need nothing, because yt-dlp fills them
	// in after expanding.
	const body = parsed.file
		.map(segment => {
			if (segment.kind === 'token') return segment.token === 'title' ? `%(title).${LATE_TOKEN_CAP.title}B` : TOKEN_FIELDS[segment.token]
			return templateLiteral(segment.text)
		})
		.join('')
	return {ok: true, template: `${body}.%(ext)s`}
}

/** yt-dlp's `upload_date` is YYYYMMDD; the compiled token renders YYYY-MM-DD. */
function formatUploadDate(raw: string | undefined): string {
	if (!raw || !/^\d{8}$/.test(raw)) return ''
	return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`
}

function uploadYear(raw: string | undefined): string {
	return raw && /^\d{8}$/.test(raw) ? raw.slice(0, 4) : ''
}

// A blank counts as absent, not as a winning value — `??` would stop at an
// empty string and render an empty folder instead of falling through.
function firstPresent(...values: (string | undefined)[]): string {
	return values.find(value => value !== undefined && value.trim().length > 0)?.trim() ?? ''
}

/**
 * The site a page belongs to, as `{site}` names it: yt-dlp's
 * `webpage_url_domain`, which is the host without a leading `www.`. The port is
 * dropped too, because no folder can carry `:` on Windows. Every YouTube
 * address is `youtube.com`: yt-dlp reports the watch page whichever form was
 * pasted, and a pasted `youtu.be` link would otherwise file apart.
 */
export function templateSite(url: string): string | undefined {
	try {
		const host = new URL(url).hostname
		if (isYouTubeHostname(host)) return 'youtube.com'
		return host.startsWith('www.') ? host.slice(4) : host || undefined
	} catch {
		return undefined
	}
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
			return firstPresent(meta.uploader, meta.channel, meta.uploaderId)
		case 'id':
			return meta.id ?? ''
		case 'date':
			return formatUploadDate(meta.uploadDate)
		case 'year':
			return uploadYear(meta.uploadDate)
		case 'resolution':
			return meta.resolution ?? ''
		case 'site':
			return meta.site ?? ''
		case 'categories':
			return meta.category ?? ''
		case 'artist':
			return firstPresent(meta.artist, meta.uploader, meta.channel, meta.uploaderId)
		case 'album':
			return meta.album ?? ''
		case 'track':
			return meta.track ?? ''
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

// Tokens Arroxy is authoritative for. Arroxy queues each playlist entry as its
// own single-video job (`watch?v=…`), so by the time yt-dlp runs there is no
// playlist context at all and `%(playlist_index)s` and friends resolve empty.
// These bind to whatever Arroxy holds — including nothing, which is the correct
// answer for a single video and is why no "NA" reaches the disk.
const ARROXY_OWNED_TOKENS: readonly FilenameToken[] = PLAYLIST_FILENAME_TOKENS

// Worst-case width of each token yt-dlp expands itself, as written after it
// sanitizes the value, charged only when the token actually stays unbound. A
// capped token reserves its cap three times over (LATE_TOKEN_CAP);
// `resolution` is exact, since `%(height&{}p|)s` renders at most "4320p"; `id`
// is an allowance rather than a cap, because playlist dedupe matches the full
// video id and truncating it would silently break that.
const sanitized = (cap: number): number => cap * SANITIZED_BYTES_PER_BYTE
const LATE_TOKEN_RESERVE: Record<FilenameToken, number> = {
	title: sanitized(LATE_TOKEN_CAP.title),
	uploader: sanitized(LATE_TOKEN_CAP.uploader),
	id: 24,
	date: 10,
	year: 4,
	resolution: 6,
	site: 40,
	categories: sanitized(LATE_TOKEN_CAP.categories),
	artist: sanitized(LATE_TOKEN_CAP.artist),
	album: sanitized(LATE_TOKEN_CAP.album),
	track: sanitized(LATE_TOKEN_CAP.track),
	playlist_index: 6,
	playlist_title: sanitized(LATE_TOKEN_CAP.playlist_title),
	playlist_id: 40
}

// A bound value becomes literal template text, so anything that would change
// the template's meaning has to go: separators would invent a folder, braces
// would invent a token, and the rest are illegal in filenames anyway. `%` is
// left alone, as are `$` and `~`: compileFilenameTemplate escapes literals on
// the way out, and the escape does not change what is written.
//
// Length is deliberately not handled here. Trimming each value against its own
// allowance cannot see the whole name, which is what the filesystem measures;
// fitName does that once, against the assembled result.
function sanitizeBoundLiteral(value: string): string {
	return (
		value
			// eslint-disable-next-line no-control-regex -- control bytes are intentionally matched here
			.replace(/[<>:"/\\|?*{}\x00-\x1F]/g, '_')
			.replace(/\s+/g, ' ')
			.trim()
	)
}

// What a token binds to in the filename. `{artist}` binds only a known artist:
// its uploader fallback is a guess where the probe was sparse (a flat playlist
// entry never carries credits), and binding it would hide the performer yt-dlp
// finds at download time. Left unbound, yt-dlp walks the same chain itself.
function boundValue(token: FilenameToken, meta: TemplateMetadata): string {
	return token === 'artist' ? (meta.artist?.trim() ?? '') : renderToken(token, meta)
}

export interface BindContext {
	/** Absolute directory the file lands in, template directories included. */
	outputDir: string
	/** Whose filesystem limits apply. Injected so this stays testable per-OS. */
	platform: NodeJS.Platform
	/** What yt-dlp writes before the finished file, which must fit too. */
	inFlight: InFlightFiles
}

export type BoundFilename = {ok: true; template: string; truncated: FilenameToken[]} | {ok: false; reason: BudgetFailure}

/**
 * Resolve a template into the filename segment yt-dlp will write, with every
 * token but `{resolution}` replaced by sanitized literal text sized to fit the
 * user's filesystem. Directory segments are dropped because the caller has
 * already folded them into `outputDir`.
 *
 * Binding rather than delegating to yt-dlp is what makes the budget binding:
 * `%(title).NB` truncates before yt-dlp sanitizes, and sanitizing grows the
 * string, so any cap handed to yt-dlp can be overrun after the fact.
 */
export function bindFilenameTemplate(template: string, meta: TemplateMetadata, ctx: BindContext, suffix?: string): BoundFilename {
	const parsed = parse(template)
	// An unparseable template is not this function's error to report — the
	// validator owns that — so hand it back and let the caller fall back.
	// With a suffix it is not handed back as-is: main would fall back to the
	// default and the suffix would be lost, so the default is bound with it.
	if (!parsed.ok) return suffix ? bindFilenameTemplate(DEFAULT_FILENAME_TEMPLATE, meta, ctx, suffix) : {ok: true, template, truncated: []}

	const pieces: BudgetPiece[] = parsed.file.map(segment => {
		if (segment.kind === 'literal') return {kind: 'literal' as const, text: segment.text}
		const value = sanitizeBoundLiteral(boundValue(segment.token, meta))
		// Arroxy's metadata is not always richer than yt-dlp's. Where Arroxy has
		// no value and yt-dlp might — an extractor that omits `uploader`, a probe
		// that never filled in the id — binding to empty would throw away a field
		// yt-dlp could still resolve, turning `{title} [{id}]` into "Title []".
		// Leave those as tokens and pay a reserve for them instead. Playlist
		// fields are exempt: yt-dlp genuinely cannot know them, so empty is right.
		const arroxyOwned = ARROXY_OWNED_TOKENS.includes(segment.token)
		if (value === '' && !arroxyOwned) return {kind: 'placeholder' as const, text: `{${segment.token}}`, reserve: LATE_TOKEN_RESERVE[segment.token]}
		return {kind: 'token' as const, token: segment.token, text: value}
	})

	// A generated suffix (a part's range) is a literal the budget measures and
	// never shrinks. Appending it to the template text instead would count it
	// against the typed-length limit and hide it from directory resolution.
	if (suffix) pieces.push({kind: 'literal', text: ` ${suffix}`})

	const fitted = fitName({pieces, outputDir: ctx.outputDir, limits: limitsFor(ctx.platform), inFlight: ctx.inFlight})
	if (!fitted.ok) return fitted

	return {ok: true, template: renderName(fitted.pieces), truncated: fitted.truncated}
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
 * files by matching `[videoId]` right before the extension, so only a filename
 * ending in `[{id}]` counts: `{id}` elsewhere, or in a folder, names files the
 * matcher never finds. Without it both must degrade rather than silently
 * mismatch.
 */
export function templateEndsWithBracketedId(template: string): boolean {
	const parsed = parse(template)
	if (!parsed.ok) return false
	const [open, id, close] = parsed.file.slice(-3)
	return open?.kind === 'literal' && open.text.endsWith('[') && id?.kind === 'token' && id.token === 'id' && close?.kind === 'literal' && close.text === ']'
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
