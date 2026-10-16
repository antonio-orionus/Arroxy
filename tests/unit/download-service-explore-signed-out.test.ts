// @vitest-environment node
import {describe, expect, it, vi} from 'vite-plus/test'
import {DownloadService} from '@main/services/DownloadService.js'
import {STATUS_KEY} from '@shared/schemas.js'
import type {StatusEvent} from '@shared/types.js'

describe('DownloadService.onExploreVerifiedSignedOut', () => {
	it('is not fired by the exploreSignedOut status alone (a gate refusal is not a verified sign-out)', () => {
		const svc = new DownloadService({} as never, {push: async () => {}} as never)
		const listener = vi.fn()
		svc.onExploreVerifiedSignedOut(listener)

		const refusal: StatusEvent = {jobId: 'job-1', stage: 'error', statusKey: STATUS_KEY.exploreSignedOut, at: '2026-10-14T00:00:00.000Z'}
		svc.emit('status', refusal)

		expect(listener).not.toHaveBeenCalled()
	})
})
