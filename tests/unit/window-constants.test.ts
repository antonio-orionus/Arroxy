import {describe, expect, it} from 'vitest'
import {WINDOW_MIN_HEIGHT} from '@shared/constants.js'

describe('window sizing constants', () => {
	it('keeps the minimum height within common 768px laptop displays', () => {
		expect(WINDOW_MIN_HEIGHT).toBeLessThanOrEqual(760)
	})
})
