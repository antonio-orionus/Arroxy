import {describe, expect, it} from 'vitest'
import {queueItemSchema} from '@shared/schemas.js'
import {makeItem} from '../shared/fixtures.js'

describe('queue item schema', () => {
	it('defaults addedAt to null for persisted queue items that predate the field', () => {
		expect(makeItem({id: 'legacy', status: 'pending'}).addedAt).toBeNull()
	})

	it('preserves addedAt for newly queued items', () => {
		expect(makeItem({id: 'new', status: 'pending', addedAt: '2026-06-19T09:00:00.000Z'}).addedAt).toBe('2026-06-19T09:00:00.000Z')
	})

	it('round-trips the placeholder-title flag', () => {
		expect(makeItem({id: 'placeholder', status: 'pending', titleIsPlaceholder: true}).titleIsPlaceholder).toBe(true)
	})

	it('omits the placeholder-title flag by default', () => {
		expect(makeItem({id: 'real', status: 'pending'}).titleIsPlaceholder).toBeUndefined()
	})

	it('rejects a non-true placeholder-title flag', () => {
		const candidate = {...makeItem({id: 'bad-flag', status: 'pending'}), titleIsPlaceholder: false}
		expect(queueItemSchema.safeParse(candidate).success).toBe(false)
	})
})
