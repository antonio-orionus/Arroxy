// @vitest-environment node

import {describe, expect, it, vi} from 'vitest'
import {EventEmitter} from 'node:events'
import {QueueService} from '@main/services/QueueService.js'
import {QueueStore} from '@main/stores/QueueStore.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {PreparedJob} from '@shared/preparedJob.js'
import type {QueueArtifactEvent} from '@shared/types.js'
import {DEFAULT_FILENAME_TEMPLATE} from '@shared/filenameTemplate.js'
import {ok} from '@shared/result.js'
import {makeItem} from '../shared/fixtures.js'

class FakeDownloadService extends EventEmitter {
	start = vi.fn()
	cancel = vi.fn()
	pause = vi.fn()
	resume = vi.fn()
}

function fakeStore(): QueueStore {
	return {load: vi.fn().mockResolvedValue({ok: true, data: {items: [], schedulerPaused: false}}), save: vi.fn().mockResolvedValue({ok: true, data: undefined})} as unknown as QueueStore
}

const SB_OFF = {mode: 'off'} as const
const EMBED_OFF = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}

function jobWithTemplate(filenameTemplate: string): PreparedJob {
	return {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', preset: 'custom', filenameTemplate, sponsorBlock: SB_OFF, embed: EMBED_OFF}
}

function artifactEvent(jobId: string, path: string, kind: QueueArtifactEvent['kind'] = 'media'): QueueArtifactEvent {
	return {jobId, path, kind, at: '2026-06-18T10:00:00.000Z'}
}

describe('Layer 2 — artifact backstop', () => {
	it('derives the row title from a media artifact when the flag is set and the template is the default', () => {
		const ds = new FakeDownloadService()
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService)
		qs.add([makeItem({id: 'q-backfill', status: 'running', lastJobId: 'job-backfill', title: 'Untitled · #1', titleIsPlaceholder: true, job: jobWithTemplate(DEFAULT_FILENAME_TEMPLATE)})])

		ds.emit('artifact', artifactEvent('job-backfill', '/downloads/Real Title [abc123].mp4'))

		const [item] = qs.snapshot()
		expect(item.title).toBe('Real Title')
		expect(item.titleIsPlaceholder).toBeUndefined()
	})

	it('derives the row title for the exact `{title}` template', () => {
		const ds = new FakeDownloadService()
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService)
		qs.add([makeItem({id: 'q-exact', status: 'running', lastJobId: 'job-exact', title: 'Untitled · #2', titleIsPlaceholder: true, job: jobWithTemplate('{title}')})])

		ds.emit('artifact', artifactEvent('job-exact', '/downloads/Real Title.mp4'))

		const [item] = qs.snapshot()
		expect(item.title).toBe('Real Title')
		expect(item.titleIsPlaceholder).toBeUndefined()
	})

	it('leaves rows without the flag alone', () => {
		const ds = new FakeDownloadService()
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService)
		qs.add([makeItem({id: 'q-real', status: 'running', lastJobId: 'job-real', title: 'Real Title', job: jobWithTemplate(DEFAULT_FILENAME_TEMPLATE)})])

		ds.emit('artifact', artifactEvent('job-real', '/downloads/Other Title [abc123].mp4'))

		const [item] = qs.snapshot()
		expect(item.title).toBe('Real Title')
	})

	it('skips subtitle-only artifacts — subtitle jobs have no media to derive from', () => {
		const ds = new FakeDownloadService()
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService)
		qs.add([makeItem({id: 'q-subs', status: 'running', lastJobId: 'job-subs', title: 'Untitled · #3', titleIsPlaceholder: true, job: jobWithTemplate(DEFAULT_FILENAME_TEMPLATE)})])

		ds.emit('artifact', artifactEvent('job-subs', '/downloads/Real Title [abc123].en.srt', 'subtitle'))

		const [item] = qs.snapshot()
		expect(item.title).toBe('Untitled · #3')
		expect(item.titleIsPlaceholder).toBe(true)
	})

	it('skips custom filename templates without guessing', () => {
		const ds = new FakeDownloadService()
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService)
		qs.add([makeItem({id: 'q-custom', status: 'running', lastJobId: 'job-custom', title: 'Untitled · #4', titleIsPlaceholder: true, job: jobWithTemplate('{uploader} - {title}')})])

		ds.emit('artifact', artifactEvent('job-custom', '/downloads/Uploader - Real Title.mp4'))

		const [item] = qs.snapshot()
		expect(item.title).toBe('Untitled · #4')
		expect(item.titleIsPlaceholder).toBe(true)
	})

	it('still records the artifact even when the title cannot be derived', () => {
		const ds = new FakeDownloadService()
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService)
		qs.add([makeItem({id: 'q-artifact', status: 'running', lastJobId: 'job-artifact', title: 'Untitled · #5', titleIsPlaceholder: true, job: jobWithTemplate('{uploader} - {title}')})])

		ds.emit('artifact', artifactEvent('job-artifact', '/downloads/Uploader - Real Title.mp4'))

		const [item] = qs.snapshot()
		expect(item.artifacts).toEqual([expect.objectContaining({kind: 'media', fileName: 'Uploader - Real Title.mp4'})])
		expect(ok(true).ok).toBe(true)
	})
})

describe('Layer 1 — deferred background fill', () => {
	it('fills a queued placeholder row via the wired probe without user action', async () => {
		const ds = new FakeDownloadService()
		// Zero normal-lane cap: the row stays pending so the backfill (which
		// yields to running downloads) can reach it in this test.
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService, 0, 1)
		qs.setTitleBackfillProbe(async url => (url === 'https://example.com/a' ? 'Real Title' : null))

		qs.add([makeItem({id: 'q-wired', status: 'pending', url: 'https://example.com/a', title: 'Untitled · #1', titleIsPlaceholder: true})])

		await vi.waitFor(() => expect(qs.snapshot()[0]?.title).toBe('Real Title'))
		expect(qs.snapshot()[0]?.titleIsPlaceholder).toBeUndefined()
	})

	it('leaves the row flagged when the wired probe resolves nothing', async () => {
		const ds = new FakeDownloadService()
		const qs = new QueueService(fakeStore(), ds as unknown as DownloadService, 0, 1)
		qs.setTitleBackfillProbe(async () => null)

		qs.add([makeItem({id: 'q-miss', status: 'pending', url: 'https://example.com/miss', title: 'Untitled · #1', titleIsPlaceholder: true})])

		await new Promise(resolve => setTimeout(resolve, 30))
		expect(qs.snapshot()[0]?.title).toBe('Untitled · #1')
		expect(qs.snapshot()[0]?.titleIsPlaceholder).toBe(true)
	})
})
