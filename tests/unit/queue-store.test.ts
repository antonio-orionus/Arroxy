import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import {QueueStore} from '@main/stores/QueueStore.js'
import {makeItem} from '../shared/fixtures.js'
import type {QueueItem} from '@shared/types.js'

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

	// A row this version cannot read (a newer shape after a downgrade, or one
	// damaged on disk) costs only itself: the rest of the queue loads.
	it('drops only the rows that fail validation and keeps the rest', async () => {
		const [store, dir] = await tempStore()
		const first = makeItem({id: 'first', status: 'pending'})
		const last = makeItem({id: 'last', status: 'done', progressPercent: 100, finishedAt: '2024-01-01T12:00:00.000Z'})
		const future = {...makeItem({id: 'future', status: 'pending'}), status: 'some-future-status'}
		await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify({items: [first, future, 'not a row', last]}), 'utf-8')

		expect((await loadOk(store)).map(item => item.id)).toEqual(['first', 'last'])
	})

	// Rows saved before Control API clients existed carry a window or hotkey
	// origin, or none: each loads as saved, next to a client's row.
	it('loads rows saved with every intake origin, and with none', async () => {
		const [store] = await tempStore()
		const rows = [
			makeItem({id: 'none', status: 'pending'}),
			makeItem({id: 'window', status: 'pending', origin: {kind: 'window', intakeId: 'i1'}}),
			makeItem({id: 'hotkey', status: 'pending', origin: {kind: 'hotkey', intakeId: 'i2'}}),
			makeItem({id: 'client', status: 'pending', origin: {kind: 'localClient', clientId: 'c1', intakeId: 'i3'}})
		]
		await store.save(rows)
		expect((await loadOk(store)).map(item => [item.id, item.origin])).toEqual(rows.map(item => [item.id, item.origin]))
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
					job: {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '22', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}
				}
			]
		}
		await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify(legacy), 'utf-8')
		const loaded = await loadOk(store)
		expect(loaded[0].status).toBe('pending')
		expect(loaded[0].progressPercent).toBe(0)
		expect((loaded[0] as unknown as Record<string, unknown>).downloadJobId).toBeUndefined()
	})

	// A hotkey placeholder saved before rows kept their probe mode cannot be
	// retried faithfully. It is dropped on its own; the rest of the queue loads.
	it('drops a placeholder row saved without its probe mode and keeps the rest', async () => {
		const [store, dir] = await tempStore()
		const kept = makeItem({id: 'kept', status: 'pending'})
		const stale = {...makeItem({id: 'stale', status: 'error', error: {kind: 'network', raw: 'x'}, job: {kind: 'unresolved', extractor: '', extractorKey: ''}, probeMode: 'video'}), probeMode: undefined}
		await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify({items: [kept, stale]}), 'utf-8')
		expect((await loadOk(store)).map(item => item.id)).toEqual(['kept'])
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
					job: {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '22', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}
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
					job: {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '22', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}
				}
			]
		}
		await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify(legacy), 'utf-8')
		const loaded = await loadOk(store)
		expect(loaded[0].error).toEqual({kind: 'botBlock', raw: 'sign in to confirm'})
	})
})

describe('QueueStore — filename template migration', () => {
	function legacyRow(id: string, job: Record<string, unknown>): Record<string, unknown> {
		return {id, url: `https://yt/${id}`, title: id, thumbnail: '', outputDir: '/tmp', formatLabel: 'Best', status: 'pending', progressPercent: 0, progressDetail: null, lastStatus: null, error: null, finishedAt: null, job}
	}

	const RANGED = {
		kind: 'ranged-format',
		extractor: 'youtube',
		extractorKey: 'Youtube',
		intent: {kind: 'video-audio', goal: 'best-picture', tier: 'best', fileType: 'auto', audio: {native: {kind: 'default'}}},
		sponsorBlock: {mode: 'off'},
		embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
	}

	it('maps a legacy compiled outputTemplate back to the equivalent app template', async () => {
		const [store, dir] = await tempStore()
		const items = [legacyRow('with-id', {...RANGED, outputTemplate: '%(title).200B [%(id)s].%(ext)s'}), legacyRow('no-id', {...RANGED, outputTemplate: '%(title).200B.%(ext)s'})]
		await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify({items}), 'utf-8')

		const loaded = await loadOk(store)
		// A ranged-format job *requires* filenameTemplate and load() validates the
		// whole array at once, so without this migration one legacy playlist item
		// would fail the parse and wipe the entire queue on upgrade.
		expect(loaded).toHaveLength(2)
		expect(loaded[0].job).toMatchObject({filenameTemplate: '{title} [{id}]'})
		expect(loaded[1].job).toMatchObject({filenameTemplate: '{title}'})
		expect(loaded[0].job).not.toHaveProperty('outputTemplate')
	})

	it('falls back to the default rather than trusting an unknown legacy template as app syntax', async () => {
		const [store, dir] = await tempStore()
		const items = [legacyRow('odd', {...RANGED, outputTemplate: '%(uploader)s/%(title)s.%(ext)s'})]
		await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify({items}), 'utf-8')

		expect((await loadOk(store))[0].job).toMatchObject({filenameTemplate: '{title} [{id}]'})
	})

	it('keeps an existing filenameTemplate untouched', async () => {
		const [store, dir] = await tempStore()
		const items = [legacyRow('new', {...RANGED, filenameTemplate: '{uploader} - {title}', outputTemplate: '%(title).200B.%(ext)s'})]
		await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify({items}), 'utf-8')

		expect((await loadOk(store))[0].job).toMatchObject({filenameTemplate: '{uploader} - {title}'})
	})
})

// A queue saved by 0.7.2, when a job held its subtitle languages (track keys,
// or a profile's codes) plus the yt-dlp flags. Written by that version's own
// queue builders, one row per kind of job that carried subtitles.
describe('QueueStore — subtitle requests from 0.7.2', () => {
	async function loadFixture(): Promise<QueueItem[]> {
		const [store, dir] = await tempStore()
		await fs.copyFile(path.join(import.meta.dirname, '../fixtures/queue/queue-0.7.2.json'), path.join(dir, 'queue.json'))
		return loadOk(store)
	}
	const requests = (items: QueueItem[]): unknown[] => items.map(item => ('subtitles' in item.job ? item.job.subtitles?.request : undefined))

	it('keeps every row, each subtitle job asking by request', async () => {
		const items = await loadFixture()
		expect(items).toHaveLength(11)
		expect(requests(items)).toEqual([
			// Format screen: one kind of track each, so exact tracks.
			{kind: 'tracks', tracks: [{key: 'en', auto: false}]},
			{kind: 'tracks', tracks: [{key: 'ja', auto: true}]},
			// Both kinds fetched: an -orig key is the caption, and a bare key whichever yt-dlp finds first, as before.
			{
				kind: 'tracks',
				tracks: [
					{key: 'en', auto: false},
					{key: 'en', auto: true},
					{key: 'en-orig', auto: true}
				]
			},
			// Codes keep their source.
			{kind: 'languages', languages: ['en', 'pl'], source: 'manual-first'},
			{kind: 'languages', languages: ['de'], source: 'auto-only'},
			{kind: 'tracks', tracks: [{key: 'en-GB', auto: false}]},
			// A subtitles-only job left with no tracks still asks for none.
			{kind: 'tracks', tracks: []},
			{kind: 'languages', languages: ['en', 'ja'], source: 'manual-and-auto'},
			{kind: 'languages', languages: ['en', 'ja'], source: 'auto-only'},
			{kind: 'languages', languages: ['en', 'ja'], source: 'manual-only'},
			undefined
		])
	})

	it('keeps the rest of each subtitle option and drops the old flags', async () => {
		const [, , , batch] = await loadFixture()
		expect(batch?.job).toMatchObject({kind: 'subtitle-only', subtitles: {mode: 'subfolder', format: 'vtt'}})
		expect(Object.keys('subtitles' in batch.job ? (batch.job.subtitles ?? {}) : {}).sort()).toEqual(['format', 'mode', 'request'])
	})

	// The old job asked yt-dlp for exact keys with both write flags: each bare key
	// came from the uploaded tracks if the video had one, else from the captions.
	it('keeps a mixed exact-key job asking for the same keys, either kind for a bare key', async () => {
		const [store, dir] = await tempStore()
		const rows = [
			{...makeItem({id: 'mixed', status: 'pending'}), job: {kind: 'subtitle-only', extractor: 'youtube', extractorKey: 'Youtube', subtitles: {languages: ['en-orig', 'ja'], mode: 'sidecar', format: 'srt', writeAuto: true}}},
			// A Quick Download resolved a manual-and-auto profile's codes to keys and kept the flag.
			{...makeItem({id: 'both', status: 'pending'}), job: {kind: 'subtitle-only', extractor: 'youtube', extractorKey: 'Youtube', subtitles: {languages: ['de'], mode: 'sidecar', format: 'srt', writeAuto: true, autoAlongsideManual: true}}}
		]
		await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify({items: rows}), 'utf-8')
		expect(requests(await loadOk(store))).toEqual([
			{
				kind: 'tracks',
				tracks: [
					{key: 'en-orig', auto: true},
					{key: 'ja', auto: false},
					{key: 'ja', auto: true}
				]
			},
			{
				kind: 'tracks',
				tracks: [
					{key: 'de', auto: false},
					{key: 'de', auto: true}
				]
			}
		])
	})

	it('drops a row whose old subtitle options are malformed and keeps the rest', async () => {
		const [store, dir] = await tempStore()
		const kept = makeItem({id: 'kept', status: 'pending'})
		const broken = {...makeItem({id: 'broken', status: 'pending'}), job: {kind: 'subtitle-only', extractor: 'youtube', extractorKey: 'Youtube', subtitles: {languages: 'en', mode: 'sidecar', format: 'srt', writeAuto: true}}}
		await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify({items: [kept, broken]}), 'utf-8')
		expect((await loadOk(store)).map(item => item.id)).toEqual(['kept'])
	})
})

// Before one size question, a needs-choice row asked one of two things: how
// many of a playlist past the load limit (`playlist-cap`), or whether to review
// a link that turned out to be a list (`playlist-review`). Both load as the one
// question, and the row keeps waiting.
describe('QueueStore — needs-choice rows from 0.7.3', () => {
	function waitingRow(id: string, choice: Record<string, unknown>) {
		return {...makeItem({id, status: 'needs-choice', url: `https://media.example/${id}`, title: id, job: {kind: 'unresolved', extractor: '', extractorKey: ''}, probeMode: 'auto', choice: {kind: 'list-size', loaded: 1, capped: false}}), choice}
	}

	it('loads a playlist-cap row as a capped size question', async () => {
		const [store, dir] = await tempStore()
		await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify({items: [waitingRow('cap', {kind: 'playlist-cap', loaded: 100})]}), 'utf-8')
		expect(await loadOk(store)).toEqual([expect.objectContaining({id: 'cap', status: 'needs-choice', choice: {kind: 'list-size', loaded: 100, capped: true}})])
	})

	it('loads a playlist-review row as an uncapped size question', async () => {
		const [store, dir] = await tempStore()
		await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify({items: [waitingRow('review', {kind: 'playlist-review', count: 12})]}), 'utf-8')
		expect(await loadOk(store)).toEqual([expect.objectContaining({id: 'review', status: 'needs-choice', choice: {kind: 'list-size', loaded: 12, capped: false}})])
	})

	// The old row never stored whether its load hit the limit (#590): one whose
	// count reached the load limit was cut there.
	it('loads a playlist-review row that reached the load limit as capped', async () => {
		const [store, dir] = await tempStore()
		await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify({items: [waitingRow('full', {kind: 'playlist-review', count: 100})]}), 'utf-8')
		expect((await loadOk(store))[0]?.choice).toEqual({kind: 'list-size', loaded: 100, capped: true})
	})

	it('reads the load limit the settings hold now', async () => {
		const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'queue-store-'))
		const store = new QueueStore(dir, {playlistLoadLimit: () => 50})
		await fs.writeFile(path.join(dir, 'queue.json'), JSON.stringify({items: [waitingRow('fifty', {kind: 'playlist-review', count: 50}), waitingRow('short', {kind: 'playlist-review', count: 49})]}), 'utf-8')
		expect((await loadOk(store)).map(item => item.choice)).toEqual([
			{kind: 'list-size', loaded: 50, capped: true},
			{kind: 'list-size', loaded: 49, capped: false}
		])
	})

	it('round-trips a size question unchanged', async () => {
		const [store] = await tempStore()
		const row = waitingRow('new', {kind: 'list-size', loaded: 40, capped: true}) as unknown as QueueItem
		await store.save([row])
		expect((await loadOk(store))[0]?.choice).toEqual({kind: 'list-size', loaded: 40, capped: true})
	})
})
