import {describe, expect, it} from 'vite-plus/test'
import {queueItemFilesMissing, queueItemSizeBytes} from '@renderer/components/queue/queueFileSize.js'
import type {QueueArtifact} from '@shared/types.js'

function artifact(overrides: Partial<QueueArtifact>): QueueArtifact {
	return {id: `artifact:${overrides.path ?? '/d/a.mp4'}`, kind: 'media', path: '/d/a.mp4', fileName: 'a.mp4', discoveredAt: '2026-10-17T00:00:00.000Z', ...overrides}
}

describe('queueItemSizeBytes', () => {
	it('sums the sizes of the visible files', () => {
		expect(queueItemSizeBytes([artifact({path: '/d/a.mp4', sizeBytes: 1000}), artifact({path: '/d/a.en.srt', kind: 'subtitle', sizeBytes: 24})])).toBe(1024)
	})

	it('leaves out internal and missing files', () => {
		expect(queueItemSizeBytes([artifact({path: '/d/a.mp4', sizeBytes: 1000}), artifact({path: '/d/_arroxy.info.json', fileName: '_arroxy.info.json', kind: 'companion', sizeBytes: 50}), artifact({path: '/d/gone.srt', kind: 'subtitle', sizeBytes: 7, missing: true})])).toBe(1000)
	})

	it('is null rather than a partial sum when a file on disk has no known size', () => {
		expect(queueItemSizeBytes([artifact({path: '/d/a.mp4'}), artifact({path: '/d/a.en.srt', kind: 'subtitle', sizeBytes: 24})])).toBeNull()
	})

	it('is null when no file has a known size', () => {
		expect(queueItemSizeBytes([])).toBeNull()
		expect(queueItemSizeBytes([artifact({})])).toBeNull()
	})
})

describe('queueItemFilesMissing', () => {
	it('is true only when every visible file is gone', () => {
		expect(queueItemFilesMissing([artifact({missing: true}), artifact({path: '/d/_arroxy.info.json', fileName: '_arroxy.info.json', kind: 'companion'})])).toBe(true)
		expect(queueItemFilesMissing([artifact({missing: true}), artifact({path: '/d/a.en.srt', kind: 'subtitle'})])).toBe(false)
		expect(queueItemFilesMissing([])).toBe(false)
	})
})
