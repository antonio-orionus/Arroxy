import {describe, expect, it} from 'vitest'
import {AUTO_RETRY_BACKOFF_MS, autoRetryDelayMs, decideAutoRetry} from '@shared/autoRetry.js'
import type {YtDlpErrorKind} from '@shared/types.js'

describe('decideAutoRetry', () => {
	it('never retries when the setting is off', () => {
		expect(decideAutoRetry('network', 0, 0).retry).toBe(false)
	})

	it('retries transient transport failures', () => {
		for (const kind of ['network', 'chunkTransferFailure', 'postprocessFailure', 'rateLimit'] as const) {
			expect(decideAutoRetry(kind, 0, 3).retry, kind).toBe(true)
		}
	})

	it('never retries a bot wall or IP block, which retrying only escalates', () => {
		expect(decideAutoRetry('botBlock', 0, 3).retry).toBe(false)
		expect(decideAutoRetry('ipBlock', 0, 3).retry).toBe(false)
	})

	it('never retries failures a retry cannot fix', () => {
		const hopeless: YtDlpErrorKind[] = ['unavailable', 'drmProtected', 'parse', 'geoBlocked', 'ageRestricted', 'loginRequired', 'unsupportedUrl', 'outOfDiskSpace', 'missingDependency', 'unknown']
		for (const kind of hopeless) {
			expect(decideAutoRetry(kind, 0, 5).retry, kind).toBe(false)
		}
	})

	it('stops once the configured attempts are consumed', () => {
		expect(decideAutoRetry('network', 2, 3).retry).toBe(true)
		expect(decideAutoRetry('network', 3, 3).retry).toBe(false)
		expect(decideAutoRetry('network', 9, 3).retry).toBe(false)
	})

	it('reports the human-facing attempt number', () => {
		expect(decideAutoRetry('network', 0, 3).attempt).toBe(1)
		expect(decideAutoRetry('network', 2, 3).attempt).toBe(3)
	})

	it('backs off further with each consumed retry and then plateaus', () => {
		expect(autoRetryDelayMs(0)).toBe(AUTO_RETRY_BACKOFF_MS[0])
		expect(autoRetryDelayMs(1)).toBe(AUTO_RETRY_BACKOFF_MS[1])
		expect(autoRetryDelayMs(99)).toBe(AUTO_RETRY_BACKOFF_MS[AUTO_RETRY_BACKOFF_MS.length - 1])
		expect(autoRetryDelayMs(-1)).toBe(AUTO_RETRY_BACKOFF_MS[0])
	})
})
