import {cleanUrl} from './cleanUrl.js'
import type {BulkUrlKind, BulkUrlRejectReason} from './schemas.js'
import {isYouTubeHostname} from './sites/youtubeHost.js'
import {classifyBulkUrlIntent, deriveUrlIntentLabel, extractUrlIntentYouTubeVideoId, isObviousSingleUrlIntent, isYouTubeSearchLink, type UrlIntent, urlIntentBulkLabel} from './urlIntent.js'

export interface BulkUrlAccepted {
	url: string
	kind: BulkUrlKind
	intent: UrlIntent
}

export interface BulkUrlRejected {
	id: string
	url: string
	reason: BulkUrlRejectReason
}

export interface BulkUrlParseResult {
	accepted: BulkUrlAccepted[]
	rejected: BulkUrlRejected[]
	duplicateCount: number
	nonMediaCount: number
	invalidCount: number
	ignoredCount: number
}

// `,` and `;` are valid inside a URL, so they end a link only where the next
// link starts; one that ends a link in prose is trimmed as trailing punctuation.
// An apostrophe is valid too (`John's-video.mp4`), but only with more of the
// link after it: one before a space, a closer or a separator ends the link
// (`'https://a','title'`), and a possessive `'s` ending it is the sentence's.
const URL_RE = /https?:\/\/(?:[^\s,;|<>"'`]|'(?=[^\s,;|<>"'`)\]])|[,;](?!\s*['"]?https?:\/\/))+/gi
const TRAILING_PUNCTUATION_RE = /[)\].,;:']+$/
const TRAILING_POSSESSIVE_RE = /'s$/i
// `!` and `?` end a sentence, but also a query value (`?token=abc!`).
const TRAILING_SENTENCE_MARKS_RE = /[!?]+$/
const OBVIOUS_NON_MEDIA_FILE_EXTENSIONS = new Set([
	'7z',
	'apk',
	'avif',
	'bmp',
	'bz2',
	'cab',
	'css',
	'csv',
	'deb',
	'dmg',
	'doc',
	'docx',
	'eot',
	'exe',
	'gif',
	'gz',
	'heic',
	'heif',
	'ico',
	'iso',
	'jfif',
	'jpeg',
	'jpg',
	'js',
	'json',
	'map',
	'mjs',
	'msi',
	'odp',
	'ods',
	'odt',
	'otf',
	'pdf',
	'png',
	'ppt',
	'pptx',
	'rar',
	'rpm',
	'rtf',
	'svg',
	'tar',
	'tgz',
	'tif',
	'tiff',
	'ttf',
	'txt',
	'txz',
	'wasm',
	'webp',
	'woff',
	'woff2',
	'xls',
	'xlsx',
	'xml',
	'xz',
	'zip'
])

// A query, no fragment after it, and an `=` in its last parameter.
function endsInQueryValue(url: string): boolean {
	const queryStart = url.indexOf('?')
	if (queryStart < 0 || url.includes('#', queryStart)) return false
	const query = url.slice(queryStart + 1)
	const lastParameter = query.slice(Math.max(query.lastIndexOf('&'), query.lastIndexOf(';')) + 1)
	return lastParameter.includes('=')
}

// A YouTube link other than a search, whose query is free text: its ids and
// values never hold an apostrophe nor end in `!` or `?`.
function isYouTubeIdLink(url: string): boolean {
	try {
		return isYouTubeHostname(new URL(url).hostname) && !isYouTubeSearchLink(url)
	} catch {
		return false
	}
}

// A final `'s` is the sentence's possessive, except in a YouTube search's query
// value (`?search_query=it's`).
function trimPossessive(token: string): string {
	const possessive = TRAILING_POSSESSIVE_RE.exec(token)
	if (!possessive) return token
	const rest = token.slice(0, possessive.index)
	return isYouTubeSearchLink(rest) && endsInQueryValue(rest) ? token : rest
}

// A `!` or `?` run after a link is the sentence's, unless it ends a query value
// (`?q=what?`) right after the value itself, not after a closing `)` or quote.
// After a YouTube link other than a search it is always the sentence's.
function trimSentenceMarks(token: string): string {
	const marks = TRAILING_SENTENCE_MARKS_RE.exec(token)
	if (!marks) return token
	const rest = token.slice(0, marks.index)
	return endsInQueryValue(rest) && !TRAILING_PUNCTUATION_RE.test(rest) && !isYouTubeIdLink(rest) ? token : rest
}

// An apostrophe ends a YouTube link other than a search.
function cutYouTubeAtApostrophe(token: string): string {
	const apostrophe = token.indexOf("'")
	return apostrophe >= 0 && isYouTubeIdLink(token.slice(0, apostrophe)) ? token.slice(0, apostrophe) : token
}

function trimUrlToken(token: string): string {
	let trimmed = cutYouTubeAtApostrophe(token)
	for (;;) {
		const next = trimSentenceMarks(trimPossessive(trimmed.replace(TRAILING_PUNCTUATION_RE, '')))
		if (next === trimmed) return trimmed
		trimmed = next
	}
}

function decodedPathname(url: URL): string {
	try {
		return decodeURIComponent(url.pathname)
	} catch {
		return url.pathname
	}
}

function isObviouslyNonMediaUrl(url: string): boolean {
	try {
		const parsed = new URL(url)
		const lastPathSegment = decodedPathname(parsed).replace(/\/+$/, '').split('/').pop()?.toLowerCase() ?? ''
		const extension = /\.([a-z0-9]+)$/.exec(lastPathSegment)?.[1]
		return extension ? OBVIOUS_NON_MEDIA_FILE_EXTENSIONS.has(extension) : false
	} catch {
		return false
	}
}

export function classifyBulkUrlKind(url: string): BulkUrlKind {
	return urlIntentBulkLabel(classifyBulkUrlIntent(url))
}

export function isClearlyIndividualYouTubeUrl(url: string): boolean {
	return isObviousSingleUrlIntent(classifyBulkUrlIntent(url))
}

export function extractYouTubeVideoId(url: string): string | null {
	return extractUrlIntentYouTubeVideoId(classifyBulkUrlIntent(url))
}

export function deriveBulkUrlLabel(url: string): string | null {
	return deriveUrlIntentLabel(url)
}

export function parseBulkUrls(raw: string): BulkUrlParseResult {
	const accepted: BulkUrlAccepted[] = []
	const rejected: BulkUrlRejected[] = []
	const seen = new Set<string>()
	let duplicateCount = 0
	let nonMediaCount = 0
	let invalidCount = 0
	let rejectedIndex = 0

	for (const match of raw.matchAll(URL_RE)) {
		const cleaned = cleanUrl(trimUrlToken(match[0]))

		if (!URL.canParse(cleaned)) {
			invalidCount++
			continue
		}

		if (isObviouslyNonMediaUrl(cleaned)) {
			nonMediaCount++
			continue
		}

		if (seen.has(cleaned)) {
			duplicateCount++
			rejectedIndex++
			rejected.push({id: `rejected-${rejectedIndex}`, url: cleaned, reason: 'duplicate'})
			continue
		}

		seen.add(cleaned)
		const intent = classifyBulkUrlIntent(cleaned)
		accepted.push({url: cleaned, kind: urlIntentBulkLabel(intent), intent})
	}

	return {accepted, rejected, duplicateCount, nonMediaCount, invalidCount, ignoredCount: rejected.length + nonMediaCount + invalidCount}
}
