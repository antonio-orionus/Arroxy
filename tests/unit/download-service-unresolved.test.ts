// @vitest-environment node

import {describe, expect, it, vi, afterEach} from 'vitest'
import {DownloadService} from '@main/services/DownloadService.js'
import type {PreparedJob} from '@shared/preparedJob.js'

const UNRESOLVED: PreparedJob = {kind: 'unresolved', extractor: '', extractorKey: ''}
const URL = 'https://www.youtube.com/watch?v=test'

afterEach(() => {
	vi.resetAllMocks()
	vi.restoreAllMocks()
})

describe('DownloadService.start — unresolved job guard', () => {
	it('refuses to start an unresolved (probe-stage) job', async () => {
		const svc = new DownloadService({} as never, {push: async () => {}} as never)
		const result = await svc.start({url: URL, outputDir: '/tmp', job: UNRESOLVED})
		expect(result.ok).toBe(false)
		if (!result.ok) expect(result.error.message).toContain('unresolved')
	})
})
