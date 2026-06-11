import {cleanUrl} from './cleanUrl.js'
import type {BulkUrlKind, BulkUrlRejectReason} from './schemas.js'
import {classifyUrlIntent, deriveUrlIntentLabel, extractUrlIntentYouTubeVideoId, isObviousSingleUrlIntent, type UrlIntent, urlIntentBulkLabel} from './urlIntent.js'

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
	ignoredCount: number
}

const URL_RE = /https?:\/\/[^\s,;|<>"'`]+/gi
const TRAILING_PUNCTUATION_RE = /[)\].,;:!?]+$/
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

function trimUrlToken(token: string): string {
	return token.replace(TRAILING_PUNCTUATION_RE, '')
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
	return urlIntentBulkLabel(classifyUrlIntent(url))
}

export function isClearlyIndividualYouTubeUrl(url: string): boolean {
	return isObviousSingleUrlIntent(classifyUrlIntent(url))
}

export function extractYouTubeVideoId(url: string): string | null {
	return extractUrlIntentYouTubeVideoId(classifyUrlIntent(url))
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
	let rejectedIndex = 0

	for (const match of raw.matchAll(URL_RE)) {
		const cleaned = cleanUrl(trimUrlToken(match[0]))

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
		const intent = classifyUrlIntent(cleaned)
		accepted.push({url: cleaned, kind: urlIntentBulkLabel(intent), intent})
	}

	return {accepted, rejected, duplicateCount, nonMediaCount, ignoredCount: rejected.length + nonMediaCount}
}
