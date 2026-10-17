// @vitest-environment node

import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {EventEmitter} from 'node:events'
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

vi.unmock('node:fs/promises')

import {QueueService} from '@main/services/QueueService.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import {queueArtifactFromPath} from '@shared/queueArtifacts.js'
import type {QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

class FakeDownloadService extends EventEmitter {
	start = vi.fn()
	cancel = vi.fn()
	pause = vi.fn()
	resume = vi.fn()
}

function storeWith(items: QueueItem[]): QueueStore {
	return {load: vi.fn().mockResolvedValue({ok: true, data: {items, schedulerPaused: false}}), save: vi.fn().mockResolvedValue({ok: true, data: undefined})} as unknown as QueueStore
}

const AT = '2026-10-01T10:00:00.000Z'

describe('artifact disk check on queue load', () => {
	let workDir: string

	beforeEach(() => {
		workDir = mkdtempSync(join(tmpdir(), 'arroxy-size-backfill-'))
	})

	afterEach(() => {
		rmSync(workDir, {recursive: true, force: true})
	})

	it('fills sizes for finished rows recorded before sizes were stored', async () => {
		const mediaPath = join(workDir, 'Old Video.mp4')
		const subtitlePath = join(workDir, 'Old Video.en.srt')
		writeFileSync(mediaPath, 'x'.repeat(2048))
		writeFileSync(subtitlePath, 'x'.repeat(10))
		const done = makeItem({id: 'old-done', status: 'done', artifacts: [queueArtifactFromPath(mediaPath, {discoveredAt: AT}), queueArtifactFromPath(subtitlePath, {discoveredAt: AT, sizeBytes: 99})]})
		const qs = new QueueService(storeWith([done]), new FakeDownloadService() as unknown as DownloadService)

		await qs.init()

		await vi.waitFor(() => expect(qs.snapshot()[0].artifacts[0].sizeBytes).toBe(2048))
		// A size already on record is kept.
		expect(qs.snapshot()[0].artifacts[1].sizeBytes).toBe(99)
		expect(qs.snapshot()[0].artifacts.every(artifact => artifact.missing === undefined)).toBe(true)
	})

	it('marks files that are no longer on disk as missing', async () => {
		const keptPath = join(workDir, 'Kept.mp4')
		writeFileSync(keptPath, 'x'.repeat(5))
		const gonePath = join(workDir, 'Deleted.mp4')
		const goneFolderPath = join(workDir, 'Removed folder', 'Video.mkv')
		const kept = makeItem({id: 'kept', status: 'done', artifacts: [queueArtifactFromPath(keptPath, {discoveredAt: AT})]})
		const gone = makeItem({id: 'gone', status: 'done', artifacts: [queueArtifactFromPath(gonePath, {discoveredAt: AT, sizeBytes: 1234}), queueArtifactFromPath(goneFolderPath, {discoveredAt: AT})]})
		const qs = new QueueService(storeWith([kept, gone]), new FakeDownloadService() as unknown as DownloadService)

		await qs.init()

		await vi.waitFor(() => expect(qs.snapshot()[1].artifacts.map(artifact => artifact.missing)).toEqual([true, true]))
		expect(qs.snapshot()[0].artifacts[0]).toMatchObject({sizeBytes: 5})
		expect(qs.snapshot()[0].artifacts[0].missing).toBeUndefined()
	})

	it('clears the missing mark once the file is back', async () => {
		const returnedPath = join(workDir, 'Back again.mp4')
		writeFileSync(returnedPath, 'x'.repeat(7))
		const returned = makeItem({id: 'returned', status: 'done', artifacts: [{...queueArtifactFromPath(returnedPath, {discoveredAt: AT}), missing: true}]})
		const qs = new QueueService(storeWith([returned]), new FakeDownloadService() as unknown as DownloadService)

		await qs.init()

		await vi.waitFor(() => expect(qs.snapshot()[0].artifacts[0].sizeBytes).toBe(7))
		expect(qs.snapshot()[0].artifacts[0].missing).toBeUndefined()
	})

	it('survives a failing disk check without an unhandled rejection', async () => {
		const unhandled = vi.fn()
		process.on('unhandledRejection', unhandled)
		try {
			const done = makeItem({id: 'bad-patch', status: 'done', artifacts: [queueArtifactFromPath(join(workDir, 'Gone.mp4'), {discoveredAt: AT})]})
			const qs = new QueueService(storeWith([done]), new FakeDownloadService() as unknown as DownloadService)
			qs.on('updated', () => {
				throw new Error('listener failed')
			})

			await qs.init()
			await new Promise(resolve => setTimeout(resolve, 100))

			expect(unhandled).not.toHaveBeenCalled()
		} finally {
			process.off('unhandledRejection', unhandled)
		}
	})
})
