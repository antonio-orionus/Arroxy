import {describe, expect, it} from 'vitest'
import {makeItem} from '../shared/fixtures.js'

describe('queue item schema', () => {
	it('defaults addedAt to null for persisted queue items that predate the field', () => {
		expect(makeItem({id: 'legacy', status: 'pending'}).addedAt).toBeNull()
	})

	it('preserves addedAt for newly queued items', () => {
		expect(makeItem({id: 'new', status: 'pending', addedAt: '2026-06-19T09:00:00.000Z'}).addedAt).toBe('2026-06-19T09:00:00.000Z')
	})
})
