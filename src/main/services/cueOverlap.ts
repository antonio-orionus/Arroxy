// Timing-only overlap normalization for SRT and WebVTT.
//
// Distinct from cueDedupe.ts: that one rewrites the *text* of YouTube's rolling
// auto-captions and can only run where that pattern is known to exist. This
// pass never reads or rewrites cue text. It edits exactly one token per
// overlapping cue — the end timestamp — and copies every other byte through
// untouched, so cue identifiers, cue settings (`align:start position:10%`),
// STYLE/NOTE blocks, headers, and CRLF line endings all survive. That is what
// makes it safe to run on any subtitle file, from any extractor.
//
// The rule is the one media players want: when a cue would still be on screen
// as the next one starts, its end moves to that start, so only one cue is ever
// active. A cue whose successor starts at or before its own start is left
// alone — clamping there would produce an empty or inverted cue.

// `(?:\d+:)?\d{1,3}:\d{2}[.,]\d{1,3}` covers SRT's `HH:MM:SS,mmm` and both
// WebVTT shapes (`HH:MM:SS.mmm` and the hour-less `MM:SS.mmm`).
const TIMESTAMP = String.raw`(?:\d+:)?\d{1,3}:\d{2}[.,]\d{1,3}`
const TIMESTAMP_PARTS = /^(?:(\d+):)?(\d{1,3}):(\d{2})([.,])(\d{1,3})$/

// Anchored to the start of a single line. The four groups split it into
// indent / start / arrow / end, which gives the end token's exact offset
// without a second scan.
// eslint-disable-next-line security/detect-non-literal-regexp -- TIMESTAMP is a module-local literal, not user input
const CUE_TIMING_RE = new RegExp(String.raw`^([^\S\r\n]*)(${TIMESTAMP})([^\S\r\n]*-->[^\S\r\n]*)(${TIMESTAMP})`)

// WebVTT blocks that are not cues. Their content is free text and may well
// contain a timing-shaped line (`NOTE\n00:00:00.000 --> 00:00:10.000 chapter`),
// which must never be treated as a cue.
const METADATA_BLOCK_RE = /^(?:NOTE|STYLE|REGION)(?:[ \t]|$)/

export interface CueOverlapResult {
	// The rewritten file. Identical to the input when `clamped` is 0.
	content: string
	// How many cue ends were pulled back. Reported so the caller can log what
	// the pass actually did rather than just that it ran.
	clamped: number
}

interface CueTiming {
	startMs: number
	endMs: number
	// Absolute offsets of the end timestamp token in the source string.
	endOffset: number
	endLength: number
	// The original end token, used to render its replacement in the same shape.
	endText: string
}

function parseTimestamp(text: string): number | null {
	const parts = TIMESTAMP_PARTS.exec(text)
	if (!parts) return null
	const [, hours, minutes, seconds, , fraction] = parts
	// A 1- or 2-digit fraction is tenths/hundredths, not milliseconds.
	return (hours ? Number(hours) * 3_600_000 : 0) + Number(minutes) * 60_000 + Number(seconds) * 1_000 + Number(fraction.padEnd(3, '0'))
}

// Render `ms` in the same shape as `template`: same hour component (present or
// absent), same minute width, same decimal separator. The fraction is always
// emitted as 3 digits — the only shape drift possible, on a token this pass is
// rewriting anyway, and valid in both formats.
function formatLike(ms: number, template: string): string | null {
	const parts = TIMESTAMP_PARTS.exec(template)
	if (!parts) return null
	const [, hours, minutes, , separator] = parts
	const pad = (value: number, width: number): string => String(value).padStart(width, '0')
	const fraction = pad(ms % 1_000, 3)
	const totalSeconds = Math.floor(ms / 1_000)
	const seconds = pad(totalSeconds % 60, 2)
	if (hours === undefined) return `${pad(Math.floor(totalSeconds / 60), minutes.length)}:${seconds}${separator}${fraction}`
	return `${pad(Math.floor(totalSeconds / 3_600), hours.length)}:${pad(Math.floor(totalSeconds / 60) % 60, minutes.length)}:${seconds}${separator}${fraction}`
}

// Walk the file as blank-line-separated blocks rather than scanning every line,
// because "looks like a timing line" is not enough to identify a cue. Both
// formats put the timing on the first such line of a cue block; anything after
// it is payload, and a NOTE/STYLE/REGION block is not a cue at all. Scanning
// line-wise would rewrite a timestamp printed inside subtitle text or a comment.
function collectTimings(content: string): CueTiming[] {
	const timings: CueTiming[] = []
	let inBlock = false
	let blockIsMetadata = false
	let blockHasTiming = false

	for (let offset = 0; offset <= content.length; ) {
		const newline = content.indexOf('\n', offset)
		const lineEnd = newline === -1 ? content.length : newline
		const line = content.slice(offset, lineEnd)
		const nextOffset = newline === -1 ? content.length + 1 : newline + 1

		if (line.trim() === '') {
			inBlock = false
		} else {
			if (!inBlock) {
				inBlock = true
				blockIsMetadata = METADATA_BLOCK_RE.test(line)
				blockHasTiming = false
			}
			if (!blockIsMetadata && !blockHasTiming) {
				const match = CUE_TIMING_RE.exec(line)
				if (match) {
					const [, indent, start, arrow, end] = match
					const startMs = parseTimestamp(start)
					const endMs = parseTimestamp(end)
					// A cue block has exactly one timing line even if this one is
					// unparseable — do not fall through to its payload.
					blockHasTiming = true
					if (startMs !== null && endMs !== null) {
						timings.push({startMs, endMs, endOffset: offset + indent.length + start.length + arrow.length, endLength: end.length, endText: end})
					}
				}
			}
		}
		offset = nextOffset
	}
	return timings
}

export function normalizeCueOverlaps(content: string): CueOverlapResult {
	const timings = collectTimings(content)
	if (timings.length < 2) return {content, clamped: 0}

	const edits: {offset: number; length: number; text: string}[] = []
	for (let i = 0; i + 1 < timings.length; i++) {
		const cue = timings[i]
		const nextStart = timings[i + 1].startMs
		// Already sequential, or a successor that starts no later than this cue
		// does — nothing a clamp can improve.
		if (cue.endMs <= nextStart || nextStart <= cue.startMs) continue
		const replacement = formatLike(nextStart, cue.endText)
		if (replacement === null || replacement === cue.endText) continue
		edits.push({offset: cue.endOffset, length: cue.endLength, text: replacement})
	}
	if (edits.length === 0) return {content, clamped: 0}

	let out = ''
	let cursor = 0
	for (const edit of edits) {
		out += content.slice(cursor, edit.offset) + edit.text
		cursor = edit.offset + edit.length
	}
	out += content.slice(cursor)
	return {content: out, clamped: edits.length}
}
