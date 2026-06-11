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
	ignoredCount: number
}

const URL_RE = /https?:\/\/[^\s,;|<>"'`]+/gi
const TRAILING_PUNCTUATION_RE = /[)\].,;:!?]+$/

function trimUrlToken(token: string): string {
	return token.replace(TRAILING_PUNCTUATION_RE, '')
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
	let rejectedIndex = 0

	for (const match of raw.matchAll(URL_RE)) {
		const cleaned = cleanUrl(trimUrlToken(match[0]))

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

	return {accepted, rejected, duplicateCount, ignoredCount: rejected.length}
}
