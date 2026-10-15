import {describe, expect, it} from 'vite-plus/test'
import {WINDOW_MIN_HEIGHT} from '@shared/constants.js'

describe('window sizing constants', () => {
	it('keeps the minimum height within common 768px laptop displays', () => {
		expect(WINDOW_MIN_HEIGHT).toBeLessThanOrEqual(760)
	})
})
