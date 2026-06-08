import {EventEmitter} from 'node:events'
import {describe, expect, it, vi, beforeEach} from 'vitest'
import {ProbeService} from '@main/services/ProbeService.js'
import {YtDlp} from '@main/services/YtDlp.js'

vi.mock('@main/utils/process', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/utils/process.js')>()
	return {...actual, spawnYtDlp: vi.fn()}
})

import {spawnYtDlp} from '@main/utils/process.js'

// Fake child process that emits a canned stdout payload then exits cleanly.
// Mirrors the pattern in ytdlp-args.test.ts but lets each test inject its own
// JSON body (so we can drive ProbeService through every InfoDict shape).
function makeFakeProcessEmitting(stdout: string, exitCode = 0): EventEmitter & {stdout: EventEmitter; stderr: EventEmitter; kill: ReturnType<typeof vi.fn>} {
	const proc = Object.assign(new EventEmitter(), {stdout: new EventEmitter(), stderr: new EventEmitter(), kill: vi.fn()})
	setTimeout(() => {
		proc.stdout.emit('data', Buffer.from(stdout))
		proc.emit('close', exitCode)
	}, 5)
	return proc
}

function makeYtDlp(): YtDlp {
	const tokenService = {mintTokenForUrl: vi.fn().mockResolvedValue({token: 't', visitorData: 'vd'}), invalidateCache: vi.fn()}
	const binaryManager = {ensureYtDlp: vi.fn().mockResolvedValue('/fake/yt-dlp'), ensureFFmpeg: vi.fn().mockResolvedValue('/fake/ffmpeg'), ensureDeno: vi.fn().mockResolvedValue('/fake/deno'), ensureFFprobe: vi.fn().mockResolvedValue(null)}
	const settingsStore = {get: vi.fn().mockResolvedValue({common: {}, single: {}, playlist: {}})}
	return new YtDlp(binaryManager as never, tokenService as never, settingsStore as never)
}

function makeProbeService(mockMode = false): ProbeService {
	return new ProbeService(makeYtDlp(), mockMode)
}

beforeEach(() => {
	vi.clearAllMocks()
})

describe('ProbeService — mockMode', () => {
	it('returns a canned video result without spawning yt-dlp', async () => {
		const svc = makeProbeService(true)
		const r = await svc.probe('https://example.com/x')
		expect(r.ok).toBe(true)
		if (r.ok) {
			expect(r.data.kind).toBe('video')
			if (r.data.kind === 'video') {
				expect(r.data.extractor).toBe('youtube')
				expect(r.data.formats.length).toBeGreaterThan(0)
			}
		}
		expect(spawnYtDlp).not.toHaveBeenCalled()
	})
})

describe('ProbeService — video probe', () => {
	it('parses _type:video and derives isAudioOnlySource from extractor', async () => {
		const json = JSON.stringify({_type: 'video', id: 'abc', title: 'Bandcamp Track', extractor: 'bandcamp', extractor_key: 'Bandcamp', webpage_url: 'https://artist.bandcamp.com/track/x', formats: [{format_id: 'mp3-128', ext: 'mp3', acodec: 'mp3', vcodec: 'none', abr: 128}]})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		const r = await makeProbeService().probe('https://artist.bandcamp.com/track/x')
		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'video') {
			expect(r.data.extractor).toBe('bandcamp')
			expect(r.data.isAudioOnlySource).toBe(true)
			expect(r.data.title).toBe('Bandcamp Track')
			expect(r.data.formats.length).toBe(1)
		}
	})
})

describe('ProbeService — playlist probe', () => {
	it('parses _type:playlist and surfaces entries with isAudioOnlySource', async () => {
		const json = JSON.stringify({
			_type: 'playlist',
			id: 'PL1',
			title: 'My Songs',
			extractor: 'qqmusic:playlist',
			extractor_key: 'QQMusicPlaylist',
			webpage_url: 'https://y.qq.com/n/ryqq/playlist/PL1',
			entries: [
				{_type: 'url', id: 'song-1', title: 'First Song', url: 'https://y.qq.com/song/1'},
				{_type: 'url', id: 'song-2', title: 'Second Song', url: 'https://y.qq.com/song/2'}
			]
		})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		const r = await makeProbeService().probe('https://y.qq.com/n/ryqq/playlist/PL1')
		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'playlist') {
			expect(r.data.extractor).toBe('qqmusic:playlist')
			expect(r.data.isAudioOnlySource).toBe(true)
			expect(r.data.entries).toHaveLength(2)
			expect(r.data.entries[0].title).toBe('First Song')
		}
	})

	it('assigns a unique row id even when the same video appears multiple times (YouTube mix / radio)', async () => {
		// Simulates a YouTube radio mix where the same video appears at two
		// playlist positions. Before the fix, both rows shared the same id and a
		// single user selection produced two queue items.
		const json = JSON.stringify({
			_type: 'playlist',
			id: 'RDmix',
			title: 'Mix',
			extractor: 'youtube:tab',
			extractor_key: 'YoutubeTab',
			webpage_url: 'https://www.youtube.com/watch?v=dup&list=RDmix',
			entries: [
				{_type: 'url', id: 'dup', title: 'Repeated Song', url: 'https://www.youtube.com/watch?v=dup', playlist_index: 1},
				{_type: 'url', id: 'unique', title: 'Other Song', url: 'https://www.youtube.com/watch?v=unique', playlist_index: 2},
				{_type: 'url', id: 'dup', title: 'Repeated Song', url: 'https://www.youtube.com/watch?v=dup', playlist_index: 3}
			]
		})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		const r = await makeProbeService().probe('https://www.youtube.com/watch?v=dup&list=RDmix')
		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'playlist') {
			const ids = r.data.entries.map(e => e.id)
			expect(new Set(ids).size).toBe(3)
			expect(ids).toEqual(['1::dup', '2::unique', '3::dup'])
		}
	})
})

describe('ProbeService — heterogeneous playlist filter', () => {
	it('drops nested-container entries when real videos are present', async () => {
		const json = JSON.stringify({
			_type: 'playlist',
			id: 'mixed',
			title: 'Mixed Results',
			extractor: 'youtube:music:search_url',
			entries: [
				{_type: 'url', id: 'realvid111', title: 'Video Title', url: 'https://www.youtube.com/watch?v=realvid111'},
				{_type: 'url', id: 'UCabcdefghijklmnopqrstuv', url: 'https://www.youtube.com/channel/UCabcdefghijklmnopqrstuv'},
				{_type: 'url', id: 'VLPLxyz', url: 'https://music.youtube.com/browse/VLPLxyz'},
				{_type: 'url', id: 'MPREb_album', url: 'https://music.youtube.com/browse/MPREb_album'}
			]
		})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		const r = await makeProbeService().probe('https://music.youtube.com/search?q=x')
		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'playlist') {
			expect(r.data.entries).toHaveLength(1)
			// PlaylistEntry.id is index-prefixed so YouTube-mix duplicates each get
			// a unique row id; the underlying video id appears after the "::".
			expect(r.data.entries[0].id.endsWith('::realvid111')).toBe(true)
		}
	})

	it('keeps all entries when set is 100% nested containers (avoids empty picker)', async () => {
		const json = JSON.stringify({
			_type: 'playlist',
			id: 'all-nested',
			extractor: 'youtube:music:search_url',
			entries: [
				{_type: 'url', id: 'UCabcdefghijklmnopqrstuv', url: 'https://www.youtube.com/channel/UCabcdefghijklmnopqrstuv'},
				{_type: 'url', id: 'VLPLxyz', url: 'https://music.youtube.com/browse/VLPLxyz'}
			]
		})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		const r = await makeProbeService().probe('https://music.youtube.com/search?q=x')
		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'playlist') {
			expect(r.data.entries).toHaveLength(2)
		}
	})
})

describe('ProbeService — title fallback chain', () => {
	it('falls back to YouTube id-prefix hint when title empty', async () => {
		const json = JSON.stringify({
			_type: 'playlist',
			id: 'all-nested',
			extractor: 'youtube:music:search_url',
			entries: [
				{_type: 'url', id: 'UCabcdefghijklmnopqrstuv', url: 'https://www.youtube.com/channel/UCabcdefghijklmnopqrstuv'},
				{_type: 'url', id: 'VLPLxyz', url: 'https://music.youtube.com/browse/VLPLxyz'},
				{_type: 'url', id: 'MPREb_alb1', url: 'https://music.youtube.com/browse/MPREb_alb1'}
			]
		})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		const r = await makeProbeService().probe('https://music.youtube.com/search?q=x')
		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'playlist') {
			expect(r.data.entries[0].title).toMatch(/^Channel · /)
			expect(r.data.entries[1].title).toMatch(/^Playlist · /)
			expect(r.data.entries[2].title).toMatch(/^Album · /)
		}
	})

	it('falls back to "Untitled · #N" when neither title nor id-hint available', async () => {
		// Last.fm-style entries — no id, no title, just URL.
		const json = JSON.stringify({
			_type: 'playlist',
			id: 'lastfm',
			extractor: 'LastFMUser',
			entries: [
				{_type: 'url', url: 'https://www.youtube.com/watch?v=v1'},
				{_type: 'url', url: 'https://www.youtube.com/watch?v=v2'}
			]
		})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		const r = await makeProbeService().probe('https://last.fm/user/x/playlists/1')
		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'playlist') {
			expect(r.data.entries[0].title).toBe('Untitled · #1')
			expect(r.data.entries[1].title).toBe('Untitled · #2')
		}
	})
})

describe('ProbeService — thumbnail null skip', () => {
	it('parses entries with null thumbnail.url without crashing schema validation', async () => {
		// NicoVideo emits `thumbnails: [{ url: null }, { url: '...' }]` — schema
		// must accept null URLs (placeholder entries) and the entry-thumbnail
		// picker must skip them.
		const json = JSON.stringify({_type: 'playlist', id: 'p1', extractor: 'somesite:playlist', entries: [{_type: 'url', id: 'item1', title: 'Track', url: 'https://example.com/track1', thumbnails: [{url: null}, {url: 'https://example.com/thumb.jpg'}]}]})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		const r = await makeProbeService().probe('https://example.com/playlist')
		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'playlist') {
			expect(r.data.entries[0].thumbnail).toBe('https://example.com/thumb.jpg')
		}
	})
})

describe('ProbeService — error handling', () => {
	it('returns Result.fail when yt-dlp exits non-zero', async () => {
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting('', 1) as never)

		const r = await makeProbeService().probe('https://example.com/missing')
		expect(r.ok).toBe(false)
	})

	it('returns Result.fail when stdout is not valid JSON', async () => {
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting('not json {{{', 0) as never)

		const r = await makeProbeService().probe('https://example.com/garbage')
		expect(r.ok).toBe(false)
	})

	it('returns Result.fail when JSON does not match info_dict schema', async () => {
		// _type='playlist' but no entries field → schema rejects every arm of the
		// discriminated union.
		const bogusJson = JSON.stringify({_type: 'playlist', id: 'x'})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(bogusJson) as never)

		const r = await makeProbeService().probe('https://example.com/bogus')
		expect(r.ok).toBe(false)
	})
})

describe('ProbeService — playlistMode arg threading', () => {
	it.each([
		['video', '--no-playlist'],
		['playlist', '--yes-playlist']
	] as const)("playlistMode='%s' surfaces as %s in spawnYtDlp args", async (mode, expectedFlag) => {
		const json = JSON.stringify({_type: 'video', id: 'x', title: 't', extractor: 'youtube', formats: [{format_id: 'mp4', ext: 'mp4', vcodec: 'avc1', acodec: 'aac', resolution: '720p'}]})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		await makeProbeService().probe('https://www.youtube.com/watch?v=x&list=PLabc', 'off', mode)

		const args = vi.mocked(spawnYtDlp).mock.calls[0][1]
		expect(args).toContain(expectedFlag)
	})

	it("default playlistMode='auto' adds neither --no-playlist nor --yes-playlist", async () => {
		const json = JSON.stringify({_type: 'video', id: 'x', title: 't', extractor: 'youtube', formats: [{format_id: 'mp4', ext: 'mp4', vcodec: 'avc1', acodec: 'aac'}]})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		await makeProbeService().probe('https://www.youtube.com/watch?v=x')

		const args = vi.mocked(spawnYtDlp).mock.calls[0][1]
		expect(args).not.toContain('--no-playlist')
		expect(args).not.toContain('--yes-playlist')
	})
})

describe('ProbeService — _type: url redirect', () => {
	it('re-probes when first response is a url-redirect entry', async () => {
		// First call: _type:url pointing to a different URL
		const redirectJson = JSON.stringify({_type: 'url', url: 'https://example.com/resolved'})
		// Second call: actual video info — needs at least one format so the
		// empty-result guard doesn't reject it.
		const videoJson = JSON.stringify({_type: 'video', id: 'final', title: 'Resolved Video', extractor: 'generic', formats: [{format_id: 'mp4-720', ext: 'mp4', vcodec: 'avc1', acodec: 'aac', resolution: '720p'}]})

		let callCount = 0
		vi.mocked(spawnYtDlp).mockImplementation(() => {
			const json = callCount === 0 ? redirectJson : videoJson
			callCount++
			return makeFakeProcessEmitting(json) as never
		})

		const r = await makeProbeService().probe('https://shortener.example/abc')
		expect(spawnYtDlp).toHaveBeenCalledTimes(2)
		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'video') {
			expect(r.data.title).toBe('Resolved Video')
		}
	})
})
