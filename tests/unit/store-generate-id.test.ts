import {describe, expect, it} from 'vite-plus/test'
import {generateId} from '@renderer/store/helpers.js'

describe('generateId', () => {
	it('returns a random UUID, unique per call', () => {
		const ids = Array.from({length: 50}, generateId)
		for (const id of ids) expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
		expect(new Set(ids).size).toBe(ids.length)
	})
})
