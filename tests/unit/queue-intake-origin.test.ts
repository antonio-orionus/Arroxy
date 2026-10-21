// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'
import {EventEmitter} from 'node:events'
import {QueueService} from '@main/services/QueueService.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {ok} from '@shared/result.js'
import type {IntakeOrigin} from '@shared/intake/intakeSchemas.js'
import type {QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

// The probe-stage swap carries the placeholder's intake origin onto every row
// it becomes, and refuses a batch over the intake's admission limit before
// anything is committed.

const UNRESOLVED: QueueItem['job'] = {kind: 'unresolved', extractor: '', extractorKey: ''}
const REAL_JOB: QueueItem['job'] = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}
const ORIGIN: IntakeOrigin = {kind: 'hotkey', intakeId: 'intake-1'}

class FakeDownloadService extends EventEmitter {
	start = vi.fn().mockResolvedValue(ok({job: {id: 'j', url: ''}}))
	cancel = vi.fn()
	pause = vi.fn()
	resume = vi.fn()
}

function makeService(): QueueService {
	const store = {load: vi.fn().mockResolvedValue(ok({items: [], schedulerPaused: false})), save: vi.fn().mockResolvedValue(ok(undefined))} as unknown as QueueStore
	return new QueueService(store, new FakeDownloadService() as unknown as DownloadService)
}

function placeholder(origin?: IntakeOrigin): QueueItem {
	return makeItem({id: 'p1', status: 'probing', url: 'https://youtube.com/playlist?list=PL1', title: 'Playlist', job: UNRESOLVED, probeMode: 'playlist', ...(origin ? {origin} : {})})
}

function prepared(count: number): QueueItem[] {
	return Array.from({length: count}, (_, index) => makeItem({id: `r${index + 1}`, status: 'pending', url: `https://youtu.be/v${index + 1}`, job: REAL_JOB}))
}

describe('replaceProbing and the intake origin', () => {
	it('copies the placeholder origin onto every admitted row', async () => {
		const qs = makeService()
		qs.add([placeholder(ORIGIN)])
		const result = await qs.replaceProbing('p1', prepared(3))
		expect(result.ok).toBe(true)
		expect(qs.snapshot().map(item => item.origin)).toEqual([ORIGIN, ORIGIN, ORIGIN])
	})

	it('leaves rows without an origin when the placeholder had none', async () => {
		const qs = makeService()
		qs.add([placeholder()])
		await qs.replaceProbing('p1', prepared(1))
		expect(qs.snapshot()[0]?.origin).toBeUndefined()
	})

	it('refuses a batch over the intake admission limit and keeps the placeholder', async () => {
		const qs = makeService()
		const limit = vi.fn((origin: IntakeOrigin) => (origin.kind === 'hotkey' ? 2 : null))
		qs.onIntakeAdmission(limit)
		qs.add([placeholder(ORIGIN)])
		const result = await qs.replaceProbing('p1', prepared(3))
		expect(result.ok).toBe(false)
		expect(limit).toHaveBeenCalledWith(ORIGIN)
		expect(qs.snapshot().map(item => item.id)).toEqual(['p1'])
	})

	it('admits a batch within the limit', async () => {
		const qs = makeService()
		qs.onIntakeAdmission(() => 3)
		qs.add([placeholder(ORIGIN)])
		const result = await qs.replaceProbing('p1', prepared(3))
		expect(result.ok).toBe(true)
		expect(qs.snapshot()).toHaveLength(3)
	})
})
