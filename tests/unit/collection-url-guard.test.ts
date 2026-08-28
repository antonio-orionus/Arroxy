// @vitest-environment node

// A queued job runs with `--no-playlist`, which yt-dlp defines as "download only
// the video, if the URL refers to a video AND a playlist". A bare collection URL
// refers to no video, so the flag is inert and yt-dlp expands the whole
// collection under one pre-bound filename. Nothing downstream re-checks the URL,
// so the queue boundary is the last place this can be caught.

import {describe, expect, it, vi} from 'vitest'
import {QueueService} from '@main/services/QueueService.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import {QueueStore} from '@main/stores/QueueStore.js'
import {EventEmitter} from 'node:events'
import {isCollectionUrl} from '@shared/urlIntent.js'
import {makeItem} from '../shared/fixtures.js'

const PLAYLIST = 'https://www.youtube.com/playlist?list=PLQVcWM0lqXE4YKXd3ShwlKC0ER2SZ7xY0'
const CHANNEL = 'https://www.youtube.com/@someartist'
const SEARCH = 'https://www.youtube.com/results?search_query=jazz'
const VIDEO = 'https://www.youtube.com/watch?v=zGVsggMhoT0'
const MIXED = 'https://www.youtube.com/watch?v=zGVsggMhoT0&list=PLxyz'

class FakeDownloadService extends EventEmitter {
	start = vi.fn()
	cancel = vi.fn()
	pause = vi.fn()
	resume = vi.fn()
}

function fakeStore(): QueueStore {
	return {load: vi.fn().mockResolvedValue({ok: true, data: {items: [], schedulerPaused: false}}), save: vi.fn().mockResolvedValue({ok: true, data: undefined})} as unknown as QueueStore
}

function makeService(): QueueService {
	return new QueueService(fakeStore(), new FakeDownloadService() as unknown as DownloadService)
}

describe('isCollectionUrl', () => {
	it.each([
		[PLAYLIST, true],
		[CHANNEL, true],
		[SEARCH, true],
		[VIDEO, false],
		// `--no-playlist` genuinely works on a video-with-list URL, so it is not a
		// collection for this purpose.
		[MIXED, false],
		['https://vimeo.com/1234', false],
		['not a url', false],
		// A `/browse/<id>` URL has no `list=` param and no telling path segment;
		// the id prefix is the only signal that it addresses a whole release.
		['https://music.youtube.com/browse/MPREb_abc123', true],
		['https://music.youtube.com/browse/VLPLxyz', true],
		['https://www.youtube.com/browse/UCabcdefghijklmnopqrstuv', true],
		// A browse id that names no container stays unclassified.
		['https://music.youtube.com/browse/FEmusic_home', false]
	])('%s → %s', (url, expected) => {
		expect(isCollectionUrl(url)).toBe(expected)
	})
})

describe('QueueService.add — collection URL guard', () => {
	it('rejects an item whose URL addresses a collection', () => {
		const qs = makeService()
		const result = qs.add([makeItem({id: 'a', status: 'pending', url: PLAYLIST})])
		expect(result.ok).toBe(false)
		if (!result.ok) expect(result.error.message).toContain(PLAYLIST)
		expect(qs.snapshot()).toHaveLength(0)
	})

	it.each([
		['channel', CHANNEL],
		['search', SEARCH]
	])('rejects a %s URL too', (_label, url) => {
		expect(makeService().add([makeItem({id: 'a', status: 'pending', url})]).ok).toBe(false)
	})

	it('rejects the whole batch rather than silently dropping one item', () => {
		const qs = makeService()
		const result = qs.add([makeItem({id: 'good', status: 'pending', url: VIDEO}), makeItem({id: 'bad', status: 'pending', url: CHANNEL})])
		expect(result.ok).toBe(false)
		expect(qs.snapshot()).toHaveLength(0)
	})

	it('still accepts single-video and video-with-list URLs', () => {
		const qs = makeService()
		const result = qs.add([makeItem({id: 'a', status: 'pending', url: VIDEO}), makeItem({id: 'b', status: 'pending', url: MIXED})])
		expect(result.ok).toBe(true)
		expect(qs.snapshot().map(i => i.id)).toEqual(['a', 'b'])
	})

	it('accepts an empty batch', () => {
		expect(makeService().add([]).ok).toBe(true)
	})
})

// --- source 2: containers that survive the probe's heterogeneous filter ------
//
// `mapPlaylistEntriesInner` deliberately keeps nested containers when a result
// contains nothing else, so the picker isn't empty. Those rows are real and
// worth showing — they just must never become download jobs, because their URL
// is a whole channel/playlist/album. Unlike source 1 they are not always
// URL-shape-detectable (`music.youtube.com/browse/MPRE…` reads as `unknown`),
// so the entry carries the fact instead.

describe('PlaylistEntry.isContainer', () => {
	it('is set on containers kept by the all-nested fallback', async () => {
		const {mapPlaylistEntries} = await import('@main/services/ProbeService.js')
		const rows = mapPlaylistEntries(
			[
				{_type: 'url', id: 'UCabcdefghijklmnopqrstuv', url: 'https://www.youtube.com/channel/UCabcdefghijklmnopqrstuv'},
				{_type: 'url', id: 'VLPLxyz', url: 'https://music.youtube.com/browse/VLPLxyz'},
				{_type: 'url', id: 'MPREb_album', url: 'https://music.youtube.com/browse/MPREb_album'}
			] as never,
			'https://music.youtube.com/search?q=x',
			'youtube'
		)
		expect(rows).toHaveLength(3)
		expect(rows.map(r => r.isContainer)).toEqual([true, true, true])
	})

	it('is absent on real video entries', async () => {
		const {mapPlaylistEntries} = await import('@main/services/ProbeService.js')
		const rows = mapPlaylistEntries([{_type: 'url', id: 'realvid111', title: 'Video', url: 'https://www.youtube.com/watch?v=realvid111'}] as never, 'https://www.youtube.com/playlist?list=PL', 'youtube')
		expect(rows[0].isContainer).toBeUndefined()
	})
})

describe('expandBulkCollectionUrls — abort', () => {
	// Probes are sequential and a channel can take seconds. A user who starts a
	// new list must not wait on the previous run marching through its remainder.
	it('stops probing once the run is superseded', async () => {
		const {expandBulkCollectionUrls} = await import('@renderer/store/wizard/bulkCollectionExpansion.js')
		const probe = vi.fn().mockResolvedValue({ok: true, data: {kind: 'playlist', entries: [{id: 'e1', title: 'E1', url: 'https://youtu.be/e1', thumbnail: '', playlistIndex: 1, videoId: 'e1'}]}})
		let active = true

		const result = await expandBulkCollectionUrls([PLAYLIST, CHANNEL, SEARCH], probe as never, {items: {kind: 'app-limit'}} as never, () => {
			const wasActive = active
			active = false
			return wasActive
		})

		expect(result.aborted).toBe(true)
		expect(probe).toHaveBeenCalledTimes(1)
	})
})

describe('QueueService.add — browse-URL containers', () => {
	// Regression: these reached the queue because classifyUrlIntent read them as
	// `unknown`, so an album pasted into the bulk list downloaded whole under one
	// filename — the original bug, by a different door.
	it.each([
		['album', 'https://music.youtube.com/browse/MPREb_abc123'],
		['playlist', 'https://music.youtube.com/browse/VLPLxyz']
	])('rejects a YouTube Music %s browse URL', (_label, url) => {
		expect(makeService().add([makeItem({id: 'a', status: 'pending', url})]).ok).toBe(false)
	})
})
