import {describe, expect, it} from 'vitest'
import {DownloadStalledError, classifyDownloadError} from '@main/services/binary/BinaryDownloader.js'

describe('BinaryDownloader', () => {
	it('classifies no-progress download stalls as timeouts', () => {
		const err = new DownloadStalledError('No download progress for 60000ms')

		expect(classifyDownloadError(err)).toBe('timeout')
	})
})
