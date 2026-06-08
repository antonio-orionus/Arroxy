import {describe, expect, it} from 'vitest'
import {redactUrlForLog} from '@renderer/lib/bulkLogger.js'

describe('redactUrlForLog', () => {
	it('removes query, hash, and credentials from logged URLs', () => {
		expect(redactUrlForLog('https://user:pass@example.com/path/video?token=secret#frag')).toBe('https://example.com/path/video?<redacted>#<redacted>')
	})

	it('does not throw for invalid URLs', () => {
		expect(redactUrlForLog('not a url')).toBe('<invalid-url>')
	})
})
