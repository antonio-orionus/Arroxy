import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it} from 'vitest'
import {QueueStore} from '@main/stores/QueueStore.js'
import {makeItem} from '../shared/fixtures.js'

async function tempStore(): Promise<[QueueStore, string]> {
	const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'queue-store-'))
	return [new QueueStore(dir), dir]
}

async function loadOk(store: QueueStore) {
	const result = await store.load()
	if (!result.ok) throw new Error(`expected ok, got fail: ${result.error.message}`)
	return result.data.items
}

describe('QueueStore', () => {
	it('returns empty array when no file exists', async () => {
		const [store] = await tempStore()
		expect(await loadOk(store)).toEqual([])
	})

	it('round-trips pending items unchanged', async () => {
		const [store] = await tempStore()
		const item = makeItem({id: 'a', status: 'pending'})
		await store.save([item])

		const loaded = await loadOk(store)
		expect(loaded).toHaveLength(1)
		expect(loaded[0].id).toBe('a')
		expect(loaded[0].status).toBe('pending')
		expect(loaded[0].progressPercent).toBe(0)
	})

	it('round-trips done items with progress and finishedAt preserved', async () => {
		const [store] = await tempStore()
		const item = makeItem({id: 'b', status: 'done', progressPercent: 100, finishedAt: '2024-01-01T12:00:00.000Z'})
		await store.save([item])

		const loaded = await loadOk(store)
		expect(loaded[0].status).toBe('done')
		expect(loaded[0].progressPercent).toBe(100)
		expect(loaded[0].finishedAt).toBe('2024-01-01T12:00:00.000Z')
	})

	it('round-trips error items with error preserved', async () => {
		const [store] = await tempStore()
		const item = makeItem({id: 'c', status: 'error', error: {kind: 'unknown', raw: 'Network error'}})
		await store.save([item])

		const loaded = await loadOk(store)
		expect(loaded[0].status).toBe('error')
		expect(loaded[0].error?.raw).toBe('Network error')
	})

	it('round-trips failed media resume context', async () => {
		const [store] = await tempStore()
		const item = makeItem({id: 'resume', status: 'error', error: {kind: 'network', raw: 'read reset'}, resumeContext: {kind: 'media-retry', tempDir: '/tmp/.arroxy-temp/resume', reason: 'media-transfer', failureKind: 'network'}})
		await store.save([item])

		const loaded = await loadOk(store)
		expect(loaded[0].status).toBe('error')
		expect(loaded[0].resumeContext).toEqual({kind: 'media-retry', tempDir: '/tmp/.arroxy-temp/resume', reason: 'media-transfer', failureKind: 'network'})
	})

	it('round-trips probe info-json refs for restart-bound single-video jobs', async () => {
		const [store] = await tempStore()
		const ref = {id: '00000000-0000-4000-8000-000000000001', createdAt: '2026-06-14T00:00:00.000Z', videoId: 'abc'}
		const item = makeItem({id: 'probe-ref', status: 'pending', probeInfoJsonRef: ref})
		await store.save([item])

		const loaded = await loadOk(store)
		expect(loaded[0].probeInfoJsonRef).toEqual(ref)
	})

	it('demotes running → pending and clears progress + lastJobId on save (process did not survive)', async () => {
		const [store] = await tempStore()
		const item = makeItem({id: 'd', status: 'running', progressPercent: 67, progressDetail: '4.5MiB/s ETA 00:10', lastJobId: 'job-xyz'})
		await store.save([item])

		const loaded = await loadOk(store)
		expect(loaded[0].status).toBe('pending')
		expect(loaded[0].progressPercent).toBe(0)
		expect(loaded[0].progressDetail).toBeNull()
		expect(loaded[0].lastJobId).toBeUndefined()
	})

	it('preserves paused-active status + tempDir + lastJobId across save (resume context survives)', async () => {
		const [store] = await tempStore()
		const item = makeItem({id: 'e', status: 'paused-active', progressPercent: 40, tempDir: '/tmp/.arroxy-temp/abc', lastJobId: 'job-abc'})
		await store.save([item])

		const loaded = await loadOk(store)
		expect(loaded[0].status).toBe('paused-active')
		expect(loaded[0].tempDir).toBe('/tmp/.arroxy-temp/abc')
		expect(loaded[0].lastJobId).toBe('job-abc')
	})

	it('preserves paused-held status (held items have no job context)', async () => {
		const [store] = await tempStore()
		const item = makeItem({id: 'h', status: 'paused-held'})
		await store.save([item])
		const loaded = await loadOk(store)
		expect(loaded[0].status).toBe('paused-held')
		expect(loaded[0].lastJobId).toBeUndefined()
	})

	it('excludes cancelled items from save', async () => {
		const [store] = await tempStore()
		await store.save([makeItem({id: 'keep', status: 'pending'}), makeItem({id: 'drop', status: 'cancelled'})])

		const loaded = await loadOk(store)
		expect(loaded).toHaveLength(1)
		expect(loaded[0].id).toBe('keep')
	})

	it('overwrites previous save on subsequent saves', async () => {
		const [store] = await tempStore()
		await store.save([makeItem({id: 'first', status: 'pending'})])
		await store.save([makeItem({id: 'second', status: 'done', progressPercent: 100})])

		const loaded = await loadOk(store)
		expect(loaded).toHaveLength(1)
		expect(loaded[0].id).toBe('second')
	})

	it('resets to empty queue when startup file is corrupt JSON (clearInvalidConfig repairs on construction)', async () => {
		const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'queue-store-'))
		await fs.writeFile(path.join(dir, 'queue.json'), 'not valid json', 'utf-8')
		const store = new QueueStore(dir)

		expect(await loadOk(store)).toEqual([])
	})

	it('returns validation failure for non-array JSON (no silent recovery)', async () => {
		const [store, dir] = await tempStore()
		await fs.writeFile(path.join(dir, 'queue.json'), '{"not": "an array"}', 'utf-8')

		const result = await store.load()
		expect(result.ok).toBe(false)
		if (!result.ok) {
			expect(result.error.code).toBe('validation')
			expect(result.error.message).toMatch(/corrupted/i)
		}
	})
})

describe('QueueStore — beta migration', () => {
	it('migrates old downloading status → pending', async () => {
		const [store, dir] = await tempStore()
		const legacy = {
			items: [
				{
					id: 'x',
					url: 'https://yt/x',
					title: 'x',
					thumbnail: '',
					outputDir: '/tmp',
					formatLabel: 'Best',
					status: 'downloading',
					progressPercent: 50,
					progressDetail: '1MiB/s',
					lastStatus: null,
					error: null,
					finishedAt: null,
					downloadJobId: 'job-old',
					job: {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '22', preset: 'custom', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}
				}
			]
		}
		await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify(legacy), 'utf-8')
		const loaded = await loadOk(store)
		expect(loaded[0].status).toBe('pending')
		expect(loaded[0].progressPercent).toBe(0)
		expect((loaded[0] as unknown as Record<string, unknown>).downloadJobId).toBeUndefined()
	})

	it('migrates old paused (with downloadJobId) → paused-held + strips downloadJobId', async () => {
		const [store, dir] = await tempStore()
		const legacy = {
			items: [
				{
					id: 'y',
					url: 'https://yt/y',
					title: 'y',
					thumbnail: '',
					outputDir: '/tmp',
					formatLabel: 'Best',
					status: 'paused',
					progressPercent: 30,
					progressDetail: 'speed',
					lastStatus: null,
					error: null,
					finishedAt: null,
					downloadJobId: 'job-stale',
					job: {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '22', preset: 'custom', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}
				}
			]
		}
		await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify(legacy), 'utf-8')
		const loaded = await loadOk(store)
		expect(loaded[0].status).toBe('paused-held')
		expect(loaded[0].progressPercent).toBe(0)
		expect((loaded[0] as unknown as Record<string, unknown>).downloadJobId).toBeUndefined()
	})

	it('migrates beta error shape { key, rawMessage } → { kind, raw }', async () => {
		const [store, dir] = await tempStore()
		const legacy = {
			items: [
				{
					id: 'z',
					url: 'https://yt/z',
					title: 'z',
					thumbnail: '',
					outputDir: '/tmp',
					formatLabel: 'Best',
					status: 'error',
					progressPercent: 0,
					progressDetail: null,
					lastStatus: null,
					error: {key: 'botBlock', rawMessage: 'sign in to confirm'},
					finishedAt: null,
					job: {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '22', preset: 'custom', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}
				}
			]
		}
		await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify(legacy), 'utf-8')
		const loaded = await loadOk(store)
		expect(loaded[0].error).toEqual({kind: 'botBlock', raw: 'sign in to confirm'})
	})
})
