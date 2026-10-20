// How long a filename is allowed to be, resolved against real metadata rather
// than worst-case guesses.
//
// Why this is not done at typing time: a template alone says nothing about how
// long its output will be. Budgeting it requires assuming every token
// simultaneously hits a ceiling, which rejects ordinary templates whose real
// output is a third of the assumed size. By the time a download is queued
// Arroxy knows the actual title, uploader, id, and playlist fields from the
// probe, plus the resolved output directory and the platform — so the budget
// becomes arithmetic on known values instead of a guess.
//
// Why yt-dlp's own truncation cannot be trusted with this: `%(title).150B`
// truncates to 150 bytes and *then* sanitizes, and sanitization grows the
// string. `:` becomes " -" (one character to two) and `|`, `*`, `<`, `>` become
// their full-width counterparts (one byte to three). A cap applied before that
// pass is advisory, not binding — so Arroxy resolves the name itself and hands
// yt-dlp literal text.

import {graphemes, measure, normalizeName, truncateTo, type PlatformLimits} from './pathLimits.js'
import type {FilenameToken} from './schemas.js'

// The name on disk during a download is longer than the finished name, and how
// much longer depends on what the job downloads. yt-dlp writes each format of a
// split download as `<name>.f<format_id>.<ext>` (YoutubeDL.process_info), every
// download into `<file>.part` (FileDownloader.temp_name) beside a `<file>.ytdl`
// resume record, and every fragment of a DASH/HLS stream into
// `<file>.part-Frag<N>`, itself downloaded to `<file>.part-Frag<N>.part`
// (FragmentFD._download_fragment). Merging and remuxing write
// `<name>.temp.<ext>` and cutting at keyframes `<name>.keyframes.temp.<ext>`,
// both shorter than a fragment name, as is the finished `<name>.<ext>`.
// Subtitles land beside the video as `<name>.<lang>.<ext>.part`. So the longest
// name is a fragment name for the longest format id — a 22-character DASH id
// (Instagram) costs 50 bytes, not the handful a YouTube id needs.

/** One format yt-dlp may write for a job, as the probe reported it. */
export interface InFlightFormat {
	formatId: string
	ext: string
}

/**
 * What a job will have yt-dlp write, as far as it is known when the name is
 * bound. `formats` is null when a selector is resolved only at download time
 * against formats Arroxy never saw (playlist entries); an empty list means no
 * media at all (a subtitles-only job).
 */
export interface InFlightFiles {
	formats: readonly InFlightFormat[] | null
	subtitleLanguages: readonly string[]
}

/** How much the longest in-flight name adds to the bound name, per ceiling. */
export interface InFlightReserve {
	component: number
	path: number
}

// Fragment indexes are counted, not padded; six digits is 999,999 fragments,
// over eleven days of one-second segments.
const FRAGMENT_INDEX = '9'.repeat(6)

// yt-dlp sets no maximum on format ids: DASH and HLS ids embed manifest names,
// which can be UUIDs (`dash-` + 36). Where no format is known yet this is the
// allowance, comfortably over every id recorded in the probe sources (longest:
// 22). `unknown_video` is yt-dlp's own fallback extension, the longest it emits.
const UNKNOWN_FORMAT: InFlightFormat = {formatId: 'f'.repeat(48), ext: 'unknown_video'}

// The extension in a format's in-flight name is either its own or the merge
// container's (`mp4`, `mkv`, `webm`), and the finished name may carry a converted
// audio one (`opus`, `flac`). None of those is longer than four characters.
const MIN_EXT = 'webm'

// Downloaded subtitle formats (`json3`, `srv3`, `ttml`, `vtt`) run to five
// characters before conversion. Profiles ask for base languages and also take
// regional variants, so `zh` may land as `zh-Hans`.
const SUBTITLE_EXT = 'json3'
const REGIONAL_VARIANT = '-Hans'

// Media is downloaded into `<outputDir>/.arroxy-temp/<job id, 8 chars>/` and
// moved out when finished, so its in-flight names sit that much deeper than the
// output folder; subtitles a media job embeds land there too. A subtitles-only
// job never uses that folder, and goes at most one `subtitles/` deeper.
export const JOB_TEMP_DIR_DEPTH = '/.arroxy-temp/'.length + 8
const SUBTITLE_DIR_DEPTH = '/subtitles'.length

function formatSuffix({formatId, ext}: InFlightFormat): number {
	const longestExt = ext.length > MIN_EXT.length ? ext : MIN_EXT
	return measure(`.f${formatId}.${longestExt}.part-Frag${FRAGMENT_INDEX}.part`, 'utf8-bytes')
}

function subtitleSuffix(language: string): number {
	return measure(`.${language}${REGIONAL_VARIANT}.${SUBTITLE_EXT}.part`, 'utf8-bytes')
}

/**
 * The reserve for the longest name yt-dlp will write for this job. Counted in
 * UTF-8 bytes, which is never less than UTF-16 code units, so one number is an
 * upper bound in either platform unit.
 */
export function inFlightReserve(files: InFlightFiles): InFlightReserve {
	const formats = files.formats ?? [UNKNOWN_FORMAT]
	const media = Math.max(0, ...formats.map(formatSuffix))
	const subtitles = Math.max(0, ...files.subtitleLanguages.map(subtitleSuffix))
	const longest = Math.max(media, subtitles)
	return {component: longest, path: longest + (media > 0 ? JOB_TEMP_DIR_DEPTH : SUBTITLE_DIR_DEPTH)}
}

/**
 * The formats a job may write, given the `-f` it carries and the probe's list.
 * An exact `id` or `id+id` request names its formats; anything else is a
 * selector yt-dlp resolves itself, which can only pick from what the probe
 * listed. With no probed formats the ids are unknown until yt-dlp runs.
 */
export function requestedFormats(formatSpec: string | undefined, probed: readonly InFlightFormat[]): readonly InFlightFormat[] | null {
	if (probed.length === 0) return null
	if (formatSpec === undefined) return probed
	const named = formatSpec.split('+').map(id => probed.find(format => format.formatId === id))
	return named.every((format): format is InFlightFormat => format !== undefined) ? named : probed
}

/**
 * The order in which tokens give up length: context is sacrificed before
 * identity. A shortened playlist name still leaves a recognisable file; a
 * shortened title does not.
 *
 * `{id}` is absent by design and must stay absent — playlist dedupe
 * (`findPlayableFileName`) and M3U writing locate files by matching `[videoId]`
 * before the extension, so truncating it silently breaks both.
 */
export const SHRINK_ORDER = ['playlist_title', 'uploader', 'title'] as const

export type ShrinkableToken = (typeof SHRINK_ORDER)[number]

/** What each shrinkable token keeps before the next one starts giving. */
export const TOKEN_FLOOR: Record<ShrinkableToken, number> = {playlist_title: 12, uploader: 12, title: 40}

/**
 * `placeholder` is a token left for yt-dlp to expand: its text survives into the
 * output but is *not* measured, because what it expands to is what lands on
 * disk. `reserve` is that expansion's worst-case width. Measuring the
 * placeholder text instead would charge the name for `{resolution}` (12
 * characters) on top of what it renders to ("1080p", 5) — and count it twice.
 */
export type BudgetPiece = {kind: 'literal'; text: string} | {kind: 'placeholder'; text: string; reserve: number} | {kind: 'token'; token: FilenameToken; text: string}

export type BudgetFailure = 'path-too-deep' | 'template-cannot-fit'

export type BudgetResult = {ok: true; pieces: BudgetPiece[]; truncated: FilenameToken[]} | {ok: false; reason: BudgetFailure}

export interface BudgetRequest {
	/** The filename segment, already rendered to text, in order. */
	pieces: readonly BudgetPiece[]
	/** Absolute directory the file lands in, template directories included. */
	outputDir: string
	limits: PlatformLimits
	/** What yt-dlp writes on the way to the finished file. */
	inFlight: InFlightFiles
}

function joinPath(dir: string, name: string): string {
	return /[/\\]$/.test(dir) ? `${dir}${name}` : `${dir}/${name}`
}

/** Everything the name will contain, including not-yet-expanded placeholders. */
export function renderName(pieces: readonly BudgetPiece[]): string {
	return pieces.map(piece => piece.text).join('')
}

/** Only what counts against the budget — see BudgetPiece on why these differ. */
function renderMeasured(pieces: readonly BudgetPiece[]): string {
	return pieces
		.filter(piece => piece.kind !== 'placeholder')
		.map(piece => piece.text)
		.join('')
}

/**
 * Shorten `pieces` until the name fits both the per-component limit and the
 * total path limit, or report why it cannot.
 *
 * Both ceilings are checked against the candidate string rather than reduced to
 * one number, because they are not always in the same unit — on macOS the
 * component limit counts UTF-16 code units while PATH_MAX counts bytes.
 */
export function fitName(request: BudgetRequest): BudgetResult {
	const {outputDir, limits} = request
	// Placeholder reserves are worst cases for fields yt-dlp will expand, and are
	// only charged for tokens that actually stayed unbound.
	const placeholders = request.pieces.reduce((total, piece) => total + (piece.kind === 'placeholder' ? piece.reserve : 0), 0)
	const inFlight = inFlightReserve(request.inFlight)
	const componentReserve = inFlight.component + placeholders
	const pathReserve = inFlight.path + placeholders

	// Composing up front is load-bearing, not tidiness: decomposed text costs
	// double for the same visible characters, so measuring it raw would truncate
	// half of a perfectly legal title away.
	const pieces: BudgetPiece[] = request.pieces.map(piece => (piece.kind === 'token' ? {...piece, text: normalizeName(piece.text)} : piece))

	const fits = (candidate: readonly BudgetPiece[]): boolean => {
		const name = renderMeasured(candidate)
		if (measure(name, limits.componentUnit) + componentReserve > limits.componentMax) return false
		return measure(joinPath(outputDir, name), limits.pathUnit) + pathReserve <= limits.pathMax
	}

	if (fits(pieces)) return {ok: true, pieces, truncated: []}

	const working = [...pieces]
	const truncated: FilenameToken[] = []

	for (const token of SHRINK_ORDER) {
		// Every occurrence, not just the first. A template may repeat a token
		// (`{title} - {title}`), and shrinking one copy while the other stays at
		// full length wastes most of the available saving — enough to report
		// `template-cannot-fit` for a name that shortening both fits comfortably.
		const indices = working.flatMap((piece, index) => (piece.kind === 'token' && piece.token === token ? [index] : []))
		const firstIndex = indices[0]
		if (firstIndex === undefined) continue
		const original = working[firstIndex]
		if (original === undefined || original.kind !== 'token') continue

		// Grapheme boundaries, so a cut never lands inside an emoji sequence.
		const chars = graphemes(original.text)
		// The floor is per occurrence: two copies of a token each keep enough to
		// stay recognisable, rather than sharing one copy's worth between them.
		const floorLength = graphemes(truncateTo(original.text, TOKEN_FLOOR[token], limits.componentUnit)).length

		// One shared length across every occurrence — they hold the same value, so
		// shortening them evenly is both simpler and fairer than draining one
		// first. `fits` is monotonic in that length, so binary search finds the
		// longest one that still fits without walking every character.
		const applyLength = (length: number): void => {
			const text = chars.slice(0, length).join('')
			for (const index of indices) working[index] = {...original, text}
		}

		let low = floorLength
		let high = chars.length
		let best = floorLength
		while (low <= high) {
			const mid = (low + high) >> 1
			applyLength(mid)
			if (fits(working)) {
				best = mid
				low = mid + 1
			} else {
				high = mid - 1
			}
		}

		applyLength(best)
		if (best < chars.length) truncated.push(token)
		if (fits(working)) return {ok: true, pieces: working, truncated}
	}

	// Every shrinkable token is at its floor and it still does not fit. Which
	// ceiling is still violated decides which fix to offer the user.
	const name = renderMeasured(working)
	const componentOverflows = measure(name, limits.componentUnit) + componentReserve > limits.componentMax
	return {ok: false, reason: componentOverflows ? 'template-cannot-fit' : 'path-too-deep'}
}
