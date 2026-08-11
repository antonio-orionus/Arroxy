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

// The name on disk during a download is longer than the finished name. For
// split video/audio yt-dlp writes `<name>.f<format_id>.<ext>.part` — worst case
// roughly ".f<8 chars>" + ".<5 char ext>" + ".part". Reserving only the final
// extension leaves the intermediate name to overrun.
export const SUFFIX_RESERVE = 22

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
	// The reserved suffixes are ASCII, so one number is correct in either unit.
	// Placeholder reserves are worst cases for fields yt-dlp will expand, and are
	// only charged for tokens that actually stayed unbound.
	const reserve = SUFFIX_RESERVE + request.pieces.reduce((total, piece) => total + (piece.kind === 'placeholder' ? piece.reserve : 0), 0)

	// Composing up front is load-bearing, not tidiness: decomposed text costs
	// double for the same visible characters, so measuring it raw would truncate
	// half of a perfectly legal title away.
	const pieces: BudgetPiece[] = request.pieces.map(piece => (piece.kind === 'token' ? {...piece, text: normalizeName(piece.text)} : piece))

	const fits = (candidate: readonly BudgetPiece[]): boolean => {
		const name = renderMeasured(candidate)
		if (measure(name, limits.componentUnit) + reserve > limits.componentMax) return false
		return measure(joinPath(outputDir, name), limits.pathUnit) + reserve <= limits.pathMax
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
	const componentOverflows = measure(name, limits.componentUnit) + reserve > limits.componentMax
	return {ok: false, reason: componentOverflows ? 'template-cannot-fit' : 'path-too-deep'}
}
