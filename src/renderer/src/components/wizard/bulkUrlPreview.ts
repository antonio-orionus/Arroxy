import {parseBulkUrls} from '@shared/bulkUrls.js'

export const BULK_URL_PREVIEW_LIMIT = 200

type BulkUrlParseResult = ReturnType<typeof parseBulkUrls>

export interface BulkUrlPreview extends BulkUrlParseResult {
	acceptedUrls: string[]
	canConfirm: boolean
	omittedCount: number
	previewAccepted: BulkUrlParseResult['accepted']
	previewRejected: BulkUrlParseResult['rejected']
}

export function buildBulkUrlPreview(raw: string, limit = BULK_URL_PREVIEW_LIMIT): BulkUrlPreview {
	const parsed = parseBulkUrls(raw)
	const acceptedBudget = Math.min(parsed.accepted.length, limit)
	const rejectedBudget = Math.max(0, limit - acceptedBudget)
	const previewAccepted = parsed.accepted.slice(0, acceptedBudget)
	const previewRejected = parsed.rejected.slice(0, rejectedBudget)
	const totalRows = parsed.accepted.length + parsed.rejected.length

	return {...parsed, acceptedUrls: parsed.accepted.map(item => item.url), canConfirm: parsed.accepted.length >= 1, omittedCount: Math.max(0, totalRows - previewAccepted.length - previewRejected.length), previewAccepted, previewRejected}
}
