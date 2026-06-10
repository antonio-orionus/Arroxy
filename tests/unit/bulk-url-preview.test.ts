import {describe, expect, it} from 'vitest'
import {buildBulkUrlPreview, BULK_URL_PREVIEW_LIMIT} from '@renderer/components/wizard/bulkUrlPreview.js'

function urls(count: number): string {
	return Array.from({length: count}, (_, index) => `https://example.com/video-${index}`).join('\n')
}

describe('BulkUrlPreview', () => {
	it('caps preview rows while preserving full accepted URLs for actions', () => {
		const preview = buildBulkUrlPreview(urls(BULK_URL_PREVIEW_LIMIT + 25))

		expect(preview.acceptedUrls).toHaveLength(BULK_URL_PREVIEW_LIMIT + 25)
		expect(preview.previewAccepted).toHaveLength(BULK_URL_PREVIEW_LIMIT)
		expect(preview.previewRejected).toHaveLength(0)
		expect(preview.omittedCount).toBe(25)
		expect(preview.canConfirm).toBe(true)
	})

	it('includes rejected rows in the same preview budget', () => {
		const preview = buildBulkUrlPreview(`${urls(BULK_URL_PREVIEW_LIMIT - 1)}\nhttps://example.com/video-0\nnot a url`)

		expect(preview.previewAccepted).toHaveLength(BULK_URL_PREVIEW_LIMIT - 1)
		expect(preview.previewRejected).toHaveLength(1)
		expect(preview.omittedCount).toBe(0)
	})
})
