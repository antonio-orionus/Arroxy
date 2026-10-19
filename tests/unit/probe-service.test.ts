import {EventEmitter} from 'node:events'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it, vi, beforeEach} from 'vite-plus/test'
import {ProbeService} from '@main/services/ProbeService.js'
import {YtDlp, type YtDlpResult} from '@main/services/YtDlp.js'
import type {ProbeProgressEvent} from '@shared/types.js'
import type {ExploreSignInState} from '@shared/schemas.js'
import {ProbeInfoJsonCache} from '@main/services/ProbeInfoJsonCache.js'

vi.mock('@main/utils/process', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/utils/process.js')>()
	return {...actual, spawnYtDlp: vi.fn()}
})

vi.mock('@main/services/ytDlpJsRuntime', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/services/ytDlpJsRuntime.js')>()
	return {...actual, probeElectronNodeRuntime: vi.fn()}
})

import {spawnYtDlp} from '@main/utils/process.js'
import {probeElectronNodeRuntime} from '@main/services/ytDlpJsRuntime.js'
import log from 'electron-log/main.js'
import {effectiveExtractorArgs} from 'yt-dlp-bridge'

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
	const binaryManager = {ensureYtDlp: vi.fn().mockResolvedValue('/fake/yt-dlp'), ensureFFmpeg: vi.fn().mockResolvedValue('/fake/ffmpeg'), ensureFFprobe: vi.fn().mockResolvedValue(null)}
	const settingsStore = {get: vi.fn().mockResolvedValue({common: {}, playlist: {}})}
	return new YtDlp(binaryManager as never, tokenService as never, settingsStore)
}

function makeProbeService(mockMode = false, cache?: ProbeInfoJsonCache): ProbeService {
	return new ProbeService(makeYtDlp(), mockMode, cache)
}

beforeEach(() => {
	vi.clearAllMocks()
	vi.mocked(probeElectronNodeRuntime).mockResolvedValue({ok: true, runtime: {kind: 'electron-node', executablePath: '/mock/Arroxy', version: '24.16.0'}, output: 'v24.16.0'})
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
		expect(spawnYtDlp).toHaveBeenCalledTimes(1)
	})

	it('uses one combined-client YouTube probe so Dolby formats are in the same extraction context', async () => {
		const json = JSON.stringify({
			_type: 'video',
			id: 'yt1',
			title: 'Combined Title',
			thumbnail: 'https://example.com/combined.jpg',
			extractor: 'youtube',
			extractor_key: 'Youtube',
			webpage_url: 'https://www.youtube.com/watch?v=yt1',
			formats: [
				{format_id: '18', ext: 'mp4', vcodec: 'avc1', acodec: 'mp4a.40.2', resolution: '360p'},
				{format_id: '140', ext: 'm4a', vcodec: 'none', acodec: 'mp4a.40.2', abr: 128},
				{format_id: '328', ext: 'm4a', vcodec: 'none', acodec: 'ec-3', abr: 384},
				{format_id: '380', ext: 'm4a', vcodec: 'none', acodec: 'ac-3', abr: 384}
			]
		})
		vi.mocked(spawnYtDlp).mockImplementationOnce(() => makeFakeProcessEmitting(json) as never)

		const r = await makeProbeService().probe('https://www.youtube.com/watch?v=yt1', {playlistMode: 'video'})

		expect(spawnYtDlp).toHaveBeenCalledTimes(1)
		const args: string[] = vi.mocked(spawnYtDlp).mock.calls[0][1]
		expect(args).toContain('--no-playlist')
		expect(effectiveExtractorArgs(args).youtube?.player_client).toEqual(['default', 'web_embedded'])
		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'video') {
			expect(r.data.title).toBe('Combined Title')
			expect(r.data.thumbnail).toBe('https://example.com/combined.jpg')
			const byId = new Map(r.data.formats.map(format => [format.formatId, format]))
			expect(byId.get('328')?.label).toContain('ec-3')
			expect(byId.get('380')?.label).toContain('ac-3')
			expect(byId.get('140')?.label).toContain('AAC')
			expect(byId.get('140')?.label).toContain('128 kbps')
		}
	})

	it('writes a durable info-json ref for explicit single-video probes', async () => {
		const json = JSON.stringify({_type: 'video', id: 'yt1', title: 'Ref Title', extractor: 'youtube', extractor_key: 'Youtube', webpage_url: 'https://www.youtube.com/watch?v=yt1', formats: [{format_id: '251', ext: 'webm', vcodec: 'none', acodec: 'opus', abr: 143}]})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)
		const ref = {id: '00000000-0000-4000-8000-000000000001', createdAt: '2026-06-14T00:00:00.000Z', videoId: 'yt1'}
		const cache = {write: vi.fn().mockResolvedValue(ref), resolve: vi.fn().mockResolvedValue('/cache/probe-info-cache-v1/00000000-0000-4000-8000-000000000001.info.json')} as unknown as ProbeInfoJsonCache
		vi.mocked(log.info).mockClear()

		const r = await makeProbeService(false, cache).probe('https://www.youtube.com/watch?v=yt1', {playlistMode: 'video'})

		expect(cache.write).toHaveBeenCalledWith(expect.objectContaining({id: 'yt1', title: 'Ref Title'}), {videoId: 'yt1'})
		expect(cache.resolve).toHaveBeenCalledWith(ref)
		expect(log.info).toHaveBeenCalledWith('Probe info-json cached', expect.objectContaining({url: 'https://www.youtube.com/watch?v=yt1', probeInfoJsonRef: ref, probeInfoJsonPath: '/cache/probe-info-cache-v1/00000000-0000-4000-8000-000000000001.info.json'}))
		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'video') {
			expect(r.data.probeInfoJsonRef).toEqual(ref)
		}
	})

	it('marks the info-json ref when the probe saw YouTube withhold format URLs', async () => {
		const json = JSON.stringify({_type: 'video', id: 'yt2', title: 'Limited', extractor: 'youtube', extractor_key: 'Youtube', webpage_url: 'https://www.youtube.com/watch?v=yt2', formats: [{format_id: '18', ext: 'mp4', vcodec: 'avc1', acodec: 'mp4a', height: 360}]})
		const warning = 'WARNING: [youtube] yt2: Some web_embedded client https formats have been skipped as they are missing a URL. YouTube may have enabled the SABR-only streaming experiment for your account.\n'
		vi.mocked(spawnYtDlp).mockImplementation(() => {
			const proc = Object.assign(new EventEmitter(), {stdout: new EventEmitter(), stderr: new EventEmitter(), kill: vi.fn()})
			setTimeout(() => {
				proc.stderr.emit('data', Buffer.from(warning))
				proc.stdout.emit('data', Buffer.from(json))
				proc.emit('close', 0)
			}, 5)
			return proc as never
		})
		const cache = {write: vi.fn().mockResolvedValue({id: '00000000-0000-4000-8000-000000000002', createdAt: '2026-06-14T00:00:00.000Z', videoId: 'yt2', formatsWithheld: true}), resolve: vi.fn().mockResolvedValue('/cache/x.info.json')} as unknown as ProbeInfoJsonCache

		const r = await makeProbeService(false, cache).probe('https://www.youtube.com/watch?v=yt2', {playlistMode: 'video'})

		expect(r.ok).toBe(true)
		expect(cache.write).toHaveBeenCalledWith(expect.objectContaining({id: 'yt2'}), {videoId: 'yt2', formatsWithheld: true})
	})

	it('does not write info-json refs for auto-mode probes even when they resolve to a video', async () => {
		const json = JSON.stringify({_type: 'video', id: 'auto-video', title: 'Auto Video', extractor: 'youtube', extractor_key: 'Youtube', webpage_url: 'https://www.youtube.com/watch?v=auto-video', formats: [{format_id: '251', ext: 'webm', vcodec: 'none', acodec: 'opus', abr: 143}]})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)
		const cache = {write: vi.fn()} as unknown as ProbeInfoJsonCache

		const r = await makeProbeService(false, cache).probe('https://www.youtube.com/watch?v=auto-video', {playlistMode: 'auto'})

		expect(cache.write).not.toHaveBeenCalled()
		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'video') expect(r.data.probeInfoJsonRef).toBeUndefined()
	})

	it('does not write info-json refs for explicit video probes that fail content validation', async () => {
		const json = JSON.stringify({_type: 'video', id: 'empty-video', title: 'Empty Video', extractor: 'youtube', extractor_key: 'Youtube', webpage_url: 'https://www.youtube.com/watch?v=empty-video', formats: [], subtitles: {}, automatic_captions: {}})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)
		const cache = {write: vi.fn()} as unknown as ProbeInfoJsonCache

		const r = await makeProbeService(false, cache).probe('https://www.youtube.com/watch?v=empty-video', {playlistMode: 'video'})

		expect(cache.write).not.toHaveBeenCalled()
		expect(r.ok).toBe(false)
		if (!r.ok && r.error.kind === 'other') expect(r.error.code).toBe('no_formats')
	})
})

describe('ProbeService — playlist probe', () => {
	it('parses the final JSON object when yt-dlp emits playlist status before stdout JSON', async () => {
		const json = JSON.stringify({_type: 'playlist', id: 'PL1', title: 'My Songs', extractor: 'youtube:tab', extractor_key: 'YoutubeTab', webpage_url: 'https://www.youtube.com/playlist?list=PL1', entries: [{_type: 'url', id: 'song-1', title: 'First Song', url: 'https://www.youtube.com/watch?v=song-1'}]})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(`[download] Downloading playlist: My Songs\n[download] Downloading item 1 of 2\n${json}\n`) as never)

		const r = await makeProbeService().probe('https://www.youtube.com/playlist?list=PL1')

		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'playlist') {
			expect(r.data.playlistTitle).toBe('My Songs')
			expect(r.data.entries).toHaveLength(1)
		}
		expect(spawnYtDlp).toHaveBeenCalledTimes(1)
	})

	it('emits playlist probe progress from yt-dlp item status lines', async () => {
		const json = JSON.stringify({_type: 'playlist', id: 'PL1', title: 'My Songs', extractor: 'youtube:tab', extractor_key: 'YoutubeTab', webpage_url: 'https://www.youtube.com/playlist?list=PL1', entries: [{_type: 'url', id: 'song-1', title: 'First Song', url: 'https://www.youtube.com/watch?v=song-1'}]})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(`[download] Downloading item 1 of 3\n[download] Downloading item 2 of 3\n${json}`) as never)
		const svc = makeProbeService()
		const events: ProbeProgressEvent[] = []
		svc.on('progress', event => events.push(event as ProbeProgressEvent))

		await svc.probe('https://www.youtube.com/playlist?list=PL1', {playlistMode: 'playlist'})

		expect(events).toMatchObject([
			{url: 'https://www.youtube.com/playlist?list=PL1', playlistMode: 'playlist', phase: 'items', loaded: 1, total: 3},
			{url: 'https://www.youtube.com/playlist?list=PL1', playlistMode: 'playlist', phase: 'items', loaded: 2, total: 3}
		])
	})

	it('emits page progress before item enumeration for large YouTube tabs', async () => {
		const json = JSON.stringify({_type: 'playlist', id: 'PL1', title: 'My Songs', extractor: 'youtube:tab', extractor_key: 'YoutubeTab', webpage_url: 'https://www.youtube.com/playlist?list=PL1', entries: [{_type: 'url', id: 'song-1', title: 'First Song', url: 'https://www.youtube.com/watch?v=song-1'}]})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(`[youtube:tab] UCLS06KHRaHWUwUkYnhXsZpQ page 23: Downloading API JSON\n[youtube:tab] UCLS06KHRaHWUwUkYnhXsZpQ page 24: Downloading API JSON\n[download] Downloading item 1 of 3\n${json}`) as never)
		const svc = makeProbeService()
		const events: ProbeProgressEvent[] = []
		svc.on('progress', event => events.push(event as ProbeProgressEvent))

		await svc.probe('https://www.youtube.com/@sunnyboy66/videos', {playlistMode: 'playlist'})

		expect(events).toMatchObject([
			{url: 'https://www.youtube.com/@sunnyboy66/videos', playlistMode: 'playlist', phase: 'pages', loaded: 23},
			{url: 'https://www.youtube.com/@sunnyboy66/videos', playlistMode: 'playlist', phase: 'pages', loaded: 24},
			{url: 'https://www.youtube.com/@sunnyboy66/videos', playlistMode: 'playlist', phase: 'items', loaded: 1, total: 3}
		])
	})

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
		const json = JSON.stringify({_type: 'video', id: 'x', title: 't', extractor: 'generic', formats: [{format_id: 'mp4', ext: 'mp4', vcodec: 'avc1', acodec: 'aac', resolution: '720p'}]})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		await makeProbeService().probe('https://www.youtube.com/watch?v=x&list=PLabc', {playlistMode: mode})

		const args = vi.mocked(spawnYtDlp).mock.calls[0][1]
		expect(args).toContain(expectedFlag)
	})

	it("default playlistMode='auto' adds neither --no-playlist nor --yes-playlist", async () => {
		const json = JSON.stringify({_type: 'video', id: 'x', title: 't', extractor: 'generic', formats: [{format_id: 'mp4', ext: 'mp4', vcodec: 'avc1', acodec: 'aac'}]})
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

describe('ProbeService — uploader and upload date for filename templates', () => {
	// Filename templates can name directories after {uploader} and {date}, and
	// Arroxy renders those itself (it needs the path before the download starts).
	// That only works if the probe carries the fields through.
	it('carries uploader and uploadDate on a video probe', async () => {
		const json = JSON.stringify({_type: 'video', id: 'v1', title: 'Clip', uploader: 'Blender Foundation', upload_date: '20260803', extractor: 'youtube', extractor_key: 'Youtube', webpage_url: 'https://www.youtube.com/watch?v=v1', formats: [{format_id: '18', ext: 'mp4', vcodec: 'avc1', acodec: 'mp4a.40.2'}]})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		const r = await makeProbeService().probe('https://www.youtube.com/watch?v=v1')

		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'video') {
			expect(r.data.uploader).toBe('Blender Foundation')
			expect(r.data.uploadDate).toBe('20260803')
		}
	})

	it('resolves uploader through the same fallback chain the compiled token uses', async () => {
		// Compiled token is %(uploader,channel,creator,uploader_id) — resolving the
		// chain once here keeps a directory name identical to the filename yt-dlp
		// would have written.
		const json = JSON.stringify({_type: 'video', id: 'v2', title: 'Clip', channel: 'Fallback Channel', extractor: 'youtube', extractor_key: 'Youtube', webpage_url: 'https://www.youtube.com/watch?v=v2', formats: [{format_id: '18', ext: 'mp4', vcodec: 'avc1', acodec: 'mp4a.40.2'}]})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		const r = await makeProbeService().probe('https://www.youtube.com/watch?v=v2')

		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'video') expect(r.data.uploader).toBe('Fallback Channel')
	})

	it('leaves uploader undefined when no field in the chain is present', async () => {
		const json = JSON.stringify({_type: 'video', id: 'v3', title: 'Clip', extractor: 'generic', extractor_key: 'Generic', webpage_url: 'https://example.com/v3', formats: [{format_id: '18', ext: 'mp4', vcodec: 'avc1', acodec: 'mp4a.40.2'}]})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		const r = await makeProbeService().probe('https://example.com/v3')

		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'video') {
			expect(r.data.uploader).toBeUndefined()
			expect(r.data.uploadDate).toBeUndefined()
		}
	})

	it('carries uploader and uploadDate onto each playlist entry', async () => {
		// Playlist items are queued from flat-probe entries, so a per-entry
		// {uploader} folder depends on the entry itself carrying the field.
		const json = JSON.stringify({
			_type: 'playlist',
			id: 'PL1',
			title: 'Nature Docs',
			extractor: 'youtube:tab',
			extractor_key: 'YoutubeTab',
			webpage_url: 'https://www.youtube.com/playlist?list=PL1',
			entries: [{_type: 'url', id: 'e1', title: 'First', url: 'https://www.youtube.com/watch?v=e1', uploader: 'Blender Foundation', upload_date: '20260803'}]
		})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		const r = await makeProbeService().probe('https://www.youtube.com/playlist?list=PL1')

		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'playlist') {
			expect(r.data.entries[0]?.uploader).toBe('Blender Foundation')
			expect(r.data.entries[0]?.uploadDate).toBe('20260803')
		}
	})

	it('leaves playlist entry uploader undefined when the flat probe omits it', async () => {
		// Flat playlist entries are sparse on many extractors. The template must
		// then collapse the folder, not create one named after a blank.
		const json = JSON.stringify({_type: 'playlist', id: 'PL2', title: 'Sparse', extractor: 'youtube:tab', extractor_key: 'YoutubeTab', webpage_url: 'https://www.youtube.com/playlist?list=PL2', entries: [{_type: 'url', id: 'e1', title: 'First', url: 'https://www.youtube.com/watch?v=e1'}]})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		const r = await makeProbeService().probe('https://www.youtube.com/playlist?list=PL2')

		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'playlist') expect(r.data.entries[0]?.uploader).toBeUndefined()
	})

	it('carries timestamp on a video probe', async () => {
		const json = JSON.stringify({_type: 'video', id: 'v1', title: 'Clip', timestamp: 1754000000, extractor: 'youtube', extractor_key: 'Youtube', webpage_url: 'https://www.youtube.com/watch?v=v1', formats: [{format_id: '18', ext: 'mp4', vcodec: 'avc1', acodec: 'mp4a.40.2'}]})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		const r = await makeProbeService().probe('https://www.youtube.com/watch?v=v1')

		expect(r.ok).toBe(true)
		if (!r.ok) throw new Error('expected ok probe result')
		expect(r.data.kind).toBe('video')
		if (r.data.kind !== 'video') throw new Error('expected video probe result')
		expect(r.data.timestamp).toBe(1754000000)
	})

	it('leaves timestamp undefined when yt-dlp omits it', async () => {
		const json = JSON.stringify({_type: 'video', id: 'v1', title: 'Clip', extractor: 'generic', extractor_key: 'Generic', webpage_url: 'https://example.com/v1', formats: [{format_id: 'f1', ext: 'mp4'}]})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)

		const r = await makeProbeService().probe('https://example.com/v1')

		expect(r.ok).toBe(true)
		if (!r.ok) throw new Error('expected ok probe result')
		expect(r.data.kind).toBe('video')
		if (r.data.kind !== 'video') throw new Error('expected video probe result')
		expect(r.data.timestamp).toBeUndefined()
	})
})

describe('ProbeService — chapters for part of video', () => {
	async function probeVideo(fields: Record<string, unknown>) {
		const json = JSON.stringify({_type: 'video', id: 'v1', title: 'Clip', duration: 600, extractor: 'youtube', extractor_key: 'Youtube', webpage_url: 'https://www.youtube.com/watch?v=v1', formats: [{format_id: '18', ext: 'mp4', vcodec: 'avc1', acodec: 'mp4a.40.2'}], ...fields})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)
		const r = await makeProbeService().probe('https://www.youtube.com/watch?v=v1')
		if (!r.ok || r.data.kind !== 'video') throw new Error('expected a video probe result')
		return r.data
	}

	it("carries yt-dlp's chapters in whole seconds", async () => {
		const result = await probeVideo({
			chapters: [
				{start_time: 0, end_time: 220.4, title: 'Intro'},
				{start_time: 220.4, end_time: 600, title: 'Main'}
			]
		})
		expect(result.chapters).toEqual([
			{title: 'Intro', startSeconds: 0, endSeconds: 220},
			{title: 'Main', startSeconds: 220, endSeconds: 600}
		])
	})

	it('drops malformed chapters instead of failing the probe', async () => {
		const result = await probeVideo({chapters: [{start_time: 10, end_time: 5, title: 'Backwards'}, {start_time: 'x', title: 'Junk'}, null, {start_time: 0, end_time: 30}]})
		expect(result.chapters).toEqual([{title: '', startSeconds: 0, endSeconds: 30}])
	})

	it('has no chapters when yt-dlp reports none', async () => {
		expect((await probeVideo({chapters: null})).chapters).toEqual([])
		expect((await probeVideo({})).chapters).toEqual([])
	})
})

describe('ProbeService — Explore session escalation', () => {
	const VIDEO_URL = 'https://www.youtube.com/watch?v=abc'
	const AGE_GATE = 'ERROR: [youtube] abc: Sign in to confirm your age. This video may be inappropriate for some users.'

	function exitError(rawError: string): YtDlpResult {
		return {kind: 'exit-error', exitCode: 1, errorKind: 'unknown', rawError, stdout: '', stderr: rawError}
	}

	function success(info: unknown): YtDlpResult {
		return {kind: 'success', stdout: JSON.stringify(info), stderr: '', usedExtractorFallback: false}
	}

	function videoInfo(): unknown {
		return {_type: 'video', id: 'abc', title: 'Signed-in Video', extractor: 'youtube', extractor_key: 'Youtube', webpage_url: VIDEO_URL, formats: [{format_id: '18', ext: 'mp4', vcodec: 'avc1', acodec: 'mp4a.40.2'}]}
	}

	function playlistWith(ids: string[]): unknown {
		return {_type: 'playlist', id: 'WL', title: 'Watch later', extractor: 'youtube:tab', extractor_key: 'YoutubeTab', webpage_url: 'https://www.youtube.com/playlist?list=WL', entries: ids.map(id => ({_type: 'url', id, url: `https://www.youtube.com/watch?v=${id}`, title: `Video ${id}`, ie_key: 'Youtube'}))}
	}

	function makeEscalationService(results: YtDlpResult[], canEscalate: () => Promise<boolean>, cache?: ProbeInfoJsonCache, verified: ExploreSignInState = 'signedIn') {
		const run = vi.fn<(...args: unknown[]) => Promise<YtDlpResult>>(async () => {
			const next = results.shift()
			if (!next) throw new Error('unexpected yt-dlp run')
			return next
		})
		const gate = {canEscalate: vi.fn(canEscalate)}
		const verifySignedIn = vi.fn((_siteId: string) => Promise.resolve(verified))
		const service = new ProbeService({run} as never, false, cache, {exploreGate: gate, exploreSession: {verifySignedIn}})
		return {service, run, gate, verifySignedIn}
	}

	// A2-3: yt-dlp warned that the session's cookies are no longer valid on the escalated probe.
	describe('rejected account cookies on an escalated probe', () => {
		const rejected = (result: YtDlpResult): YtDlpResult => ({...result, accountCookiesRejected: true})

		it('retries once with a fresh jar when the session is still signed in', async () => {
			const {service, run, verifySignedIn} = makeEscalationService([exitError(AGE_GATE), rejected(exitError(AGE_GATE)), success(videoInfo())], async () => true, undefined, 'signedIn')

			const result = await service.probe(VIDEO_URL, {playlistMode: 'video'})

			expect(verifySignedIn).toHaveBeenCalledWith('youtube')
			expect(run.mock.calls.map(call => call[2])).toEqual([{identity: 'configured'}, {identity: 'exploreSession'}, {identity: 'exploreSession'}])
			expect(result.ok && result.data.auth).toBe('exploreSession')
		})

		it('retries only once', async () => {
			const {service, run, verifySignedIn} = makeEscalationService([exitError(AGE_GATE), rejected(exitError(AGE_GATE)), rejected(exitError(AGE_GATE))], async () => true, undefined, 'signedIn')

			const result = await service.probe(VIDEO_URL, {playlistMode: 'video'})

			expect(result.ok).toBe(false)
			expect(run).toHaveBeenCalledTimes(3)
			expect(verifySignedIn).toHaveBeenCalledOnce()
		})

		it('fails as signed out, and tells the Explore view, when the site says signed out — even if the run succeeded anonymously', async () => {
			for (const signedInRun of [rejected(exitError(AGE_GATE)), rejected(success(videoInfo()))]) {
				const {service, run} = makeEscalationService([exitError(AGE_GATE), signedInRun], async () => true, undefined, 'signedOut')
				const verifiedSignedOut = vi.fn()
				service.onExploreVerifiedSignedOut(verifiedSignedOut)

				const result = await service.probe(VIDEO_URL, {playlistMode: 'video'})

				expect(result).toEqual({ok: false, error: {kind: 'ytdlp', error: {kind: 'loginRequired', raw: 'Signed out of the Explore session'}}})
				expect(run).toHaveBeenCalledTimes(2)
				expect(verifiedSignedOut).toHaveBeenCalledTimes(1)
			}
		})

		it('fails a failed probe as retryable when the check cannot tell, and keeps a successful one', async () => {
			const failed = makeEscalationService([exitError(AGE_GATE), rejected(exitError(AGE_GATE))], async () => true, undefined, 'unknown')
			expect(await failed.service.probe(VIDEO_URL, {playlistMode: 'video'})).toEqual({ok: false, error: {kind: 'ytdlp', error: {kind: 'network', raw: 'Could not confirm the Explore session'}}})
			expect(failed.run).toHaveBeenCalledTimes(2)

			const succeeded = makeEscalationService([exitError(AGE_GATE), rejected(success(videoInfo()))], async () => true, undefined, 'unknown')
			const result = await succeeded.service.probe(VIDEO_URL, {playlistMode: 'video'})
			expect(result.ok && result.data.auth).toBe('exploreSession')
			expect(succeeded.run).toHaveBeenCalledTimes(2)
		})

		// M3: that run went out without the account's cookies, so its info-json is not a signed-in one.
		it('does not cache the info-json of a kept success that ran without the cookies', async () => {
			const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-probe-rejected-cache-'))
			try {
				const {service} = makeEscalationService([exitError(AGE_GATE), rejected(success(videoInfo()))], async () => true, new ProbeInfoJsonCache(dir), 'unknown')
				const result = await service.probe(VIDEO_URL, {playlistMode: 'video'})
				expect(result.ok && result.data.kind === 'video' && result.data.probeInfoJsonRef).toBeUndefined()
				await expect(fs.readdir(path.join(dir, 'probe-info-cache-v1'))).rejects.toThrow()
			} finally {
				await fs.rm(dir, {recursive: true, force: true})
			}
		})

		it('still caches the info-json of the fresh-jar retry that was accepted', async () => {
			const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-probe-retry-cache-'))
			try {
				const {service} = makeEscalationService([exitError(AGE_GATE), rejected(success(videoInfo())), success(videoInfo())], async () => true, new ProbeInfoJsonCache(dir), 'signedIn')
				const result = await service.probe(VIDEO_URL, {playlistMode: 'video'})
				expect(result.ok && result.data.kind === 'video' && result.data.probeInfoJsonRef?.auth).toBe('exploreSession')
			} finally {
				await fs.rm(dir, {recursive: true, force: true})
			}
		})

		it('ignores the warning on a probe that never escalated', async () => {
			const {service, verifySignedIn} = makeEscalationService([rejected(success(videoInfo()))], async () => true)
			expect((await service.probe(VIDEO_URL, {playlistMode: 'video'})).ok).toBe(true)
			expect(verifySignedIn).not.toHaveBeenCalled()
		})

		it('checks a rejected escalated playlist that came back empty', async () => {
			const {service, run, verifySignedIn} = makeEscalationService([success(playlistWith([])), rejected(success(playlistWith([]))), success(playlistWith(['a']))], async () => true, undefined, 'signedIn')

			const result = await service.probe('https://www.youtube.com/playlist?list=WL')

			expect(verifySignedIn).toHaveBeenCalledOnce()
			expect(run).toHaveBeenCalledTimes(3)
			expect(result.ok && result.data.kind === 'playlist' && result.data.entries.map(entry => entry.videoId)).toEqual(['a'])
		})
	})

	it('re-runs a sign-in-required probe with the Explore session and marks the result', async () => {
		const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-probe-escalate-'))
		try {
			const {service, run, gate} = makeEscalationService([exitError(AGE_GATE), success(videoInfo())], async () => true, new ProbeInfoJsonCache(dir))

			const result = await service.probe(VIDEO_URL, {playlistMode: 'video'})

			expect(gate.canEscalate).toHaveBeenCalledWith('youtube')
			expect(run).toHaveBeenCalledTimes(2)
			expect(run.mock.calls[0]?.[2]).toEqual({identity: 'configured'})
			expect(run.mock.calls[1]?.[2]).toEqual({identity: 'exploreSession'})
			expect(result.ok && result.data.auth).toBe('exploreSession')
			expect(result.ok && result.data.kind === 'video' && result.data.probeInfoJsonRef?.auth).toBe('exploreSession')
			expect(log.info).toHaveBeenCalledWith('Probe escalated to the Explore session', {url: VIDEO_URL})
		} finally {
			await fs.rm(dir, {recursive: true, force: true})
		}
	})

	it('does not escalate when the gate says no (not explore mode / signed out / disabled)', async () => {
		const {service, run} = makeEscalationService([exitError(AGE_GATE)], async () => false)

		const result = await service.probe(VIDEO_URL, {playlistMode: 'video'})

		expect(result.ok).toBe(false)
		expect(run).toHaveBeenCalledTimes(1)
	})

	it('does not consult the gate for a failure an account cannot fix', async () => {
		const {service, run, gate} = makeEscalationService([exitError('ERROR: [youtube] abc: Video unavailable. This video has been removed by the uploader')], async () => true)

		const result = await service.probe(VIDEO_URL, {playlistMode: 'video'})

		expect(result.ok).toBe(false)
		expect(run).toHaveBeenCalledTimes(1)
		expect(gate.canEscalate).not.toHaveBeenCalled()
	})

	it('escalates at most once and reports the signed-in failure', async () => {
		const {service, run} = makeEscalationService([exitError(AGE_GATE), exitError(AGE_GATE)], async () => true)

		const result = await service.probe(VIDEO_URL, {playlistMode: 'video'})

		expect(run).toHaveBeenCalledTimes(2)
		expect(result.ok).toBe(false)
	})

	it('escalates an empty Watch Later playlist and marks the result', async () => {
		const {service, run} = makeEscalationService([success(playlistWith([])), success(playlistWith(['a', 'b']))], async () => true)

		const result = await service.probe('https://www.youtube.com/playlist?list=WL')

		expect(run).toHaveBeenCalledTimes(2)
		expect(run.mock.calls[1]?.[2]).toEqual({identity: 'exploreSession'})
		expect(result.ok && result.data.kind === 'playlist' && result.data.auth).toBe('exploreSession')
		expect(result.ok && result.data.kind === 'playlist' && result.data.entries.map(entry => entry.videoId)).toEqual(['a', 'b'])
	})

	it('signs in every item of a playlist only an account can open', async () => {
		const {service} = makeEscalationService([success(playlistWith([])), success(playlistWith(['a', 'b']))], async () => true)

		const result = await service.probe('https://www.youtube.com/playlist?list=WL')

		expect(result.ok && result.data.kind === 'playlist' && result.data.entries.map(entry => entry.auth)).toEqual(['exploreSession', 'exploreSession'])
	})

	it('enumerates a bot-walled playlist signed in but leaves its items anonymous (R20)', async () => {
		const BOT_WALL = "ERROR: [youtube:tab] PLx: Sign in to confirm you're not a bot. This helps protect our community."
		const publicPlaylist = {...(playlistWith(['a', 'b']) as object), id: 'PLx', webpage_url: 'https://www.youtube.com/playlist?list=PLx'}
		const {service, run} = makeEscalationService([exitError(BOT_WALL), success(publicPlaylist)], async () => true)

		const result = await service.probe('https://www.youtube.com/playlist?list=PLx')

		expect(run.mock.calls.map(call => call[2])).toEqual([{identity: 'configured'}, {identity: 'exploreSession'}])
		expect(result.ok && result.data.auth).toBe('exploreSession')
		expect(result.ok && result.data.kind === 'playlist' && result.data.entries.map(entry => entry.videoId)).toEqual(['a', 'b'])
		expect(result.ok && result.data.kind === 'playlist' && result.data.entries.every(entry => entry.auth === undefined)).toBe(true)
	})

	it('does not escalate an empty ordinary playlist', async () => {
		const {service, run, gate} = makeEscalationService([success({...(playlistWith([]) as object), id: 'PLx', webpage_url: 'https://www.youtube.com/playlist?list=PLx'})], async () => true)

		const result = await service.probe('https://www.youtube.com/playlist?list=PLx')

		expect(result.ok).toBe(false)
		expect(run).toHaveBeenCalledTimes(1)
		expect(gate.canEscalate).not.toHaveBeenCalled()
	})

	it('does not escalate a cancelled probe', async () => {
		const {service, run, gate} = makeEscalationService([], async () => true)
		run.mockImplementationOnce(async () => {
			service.cancelInFlight()
			return exitError(AGE_GATE)
		})

		const result = await service.probe(VIDEO_URL, {playlistMode: 'video'})

		expect(result.ok).toBe(false)
		expect(run).toHaveBeenCalledTimes(1)
		expect(gate.canEscalate).not.toHaveBeenCalled()
	})

	// A keyed probe belongs to a Downloads placeholder row: the wizard's cancel
	// (a new URL, Enter, leaving for Settings) must never abort it.
	it('leaves a keyed probe running when the wizard cancels its probes', async () => {
		const {service, run} = makeEscalationService([], async () => false)
		const signals: AbortSignal[] = []
		run.mockImplementation(async (...args: unknown[]) => {
			const options = args[1] as {abortSignal: AbortSignal}
			signals.push(options.abortSignal)
			service.cancelInFlight()
			return success(videoInfo())
		})

		await service.probe(VIDEO_URL, {playlistMode: 'video', ownerKey: 'row-1'})

		expect(signals[0]?.aborted).toBe(false)
	})

	it('aborts a keyed probe only through its own key', async () => {
		const {service, run} = makeEscalationService([], async () => false)
		const signals: AbortSignal[] = []
		run.mockImplementation(async (...args: unknown[]) => {
			signals.push((args[1] as {abortSignal: AbortSignal}).abortSignal)
			service.cancelProbe('row-1')
			return exitError('ERROR: cancelled')
		})

		await service.probe(VIDEO_URL, {playlistMode: 'video', ownerKey: 'row-1'})

		expect(signals[0]?.aborted).toBe(true)
	})

	it('never escalates a probe that opted out (title backfill), even with an open gate', async () => {
		const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-probe-no-escalate-'))
		try {
			const {service, run, gate} = makeEscalationService([exitError(AGE_GATE), success(videoInfo())], async () => true, new ProbeInfoJsonCache(dir))

			const result = await service.probe(VIDEO_URL, {playlistMode: 'video', timeoutMs: 180_000, escalate: false})

			expect(result.ok).toBe(false)
			expect(run).toHaveBeenCalledTimes(1)
			expect(run.mock.calls[0]?.[2]).toEqual({identity: 'configured'})
			expect(gate.canEscalate).not.toHaveBeenCalled()
			await expect(fs.readdir(path.join(dir, 'probe-info-cache-v1'))).rejects.toThrow()
		} finally {
			await fs.rm(dir, {recursive: true, force: true})
		}
	})

	it('keeps the Explore session on the degraded-success retry after escalation', async () => {
		const degraded = {...(success(videoInfo()) as Extract<YtDlpResult, {kind: 'success'}>), stderr: 'WARNING: [youtube] abc: Some formats may be missing'}
		const {service, run} = makeEscalationService([exitError(AGE_GATE), degraded, success(videoInfo())], async () => true)

		const result = await service.probe(VIDEO_URL, {playlistMode: 'video'})

		expect(result.ok && result.data.auth).toBe('exploreSession')
		expect(run.mock.calls.map(call => call[2])).toEqual([{identity: 'configured'}, {identity: 'exploreSession'}, {identity: 'exploreSession'}])
	})

	it('keeps the Explore session on the timeout retry after escalation', async () => {
		const timedOut: YtDlpResult = {kind: 'exit-error', exitCode: -1, errorKind: 'unknown', rawError: 'Probe timed out', stdout: '', stderr: ''}
		const {service, run} = makeEscalationService([exitError(AGE_GATE), timedOut, success(videoInfo())], async () => true)

		const result = await service.probe(VIDEO_URL, {playlistMode: 'video'})

		expect(result.ok && result.data.auth).toBe('exploreSession')
		expect(run.mock.calls.map(call => call[2])).toEqual([{identity: 'configured'}, {identity: 'exploreSession'}, {identity: 'exploreSession'}])
	})

	it('leaves an ordinary success anonymous', async () => {
		const {service, run, gate} = makeEscalationService([success(videoInfo())], async () => true)

		const result = await service.probe(VIDEO_URL, {playlistMode: 'video'})

		expect(result.ok && result.data.auth).toBeUndefined()
		expect(run.mock.calls[0]?.[2]).toEqual({identity: 'configured'})
		expect(gate.canEscalate).not.toHaveBeenCalled()
	})

	it('runs anonymously and never escalates without a gate', async () => {
		const {run} = makeEscalationService([], async () => true)
		run.mockResolvedValueOnce(exitError(AGE_GATE))
		const service = new ProbeService({run} as never)

		const result = await service.probe(VIDEO_URL, {playlistMode: 'video'})

		expect(result.ok).toBe(false)
		expect(run).toHaveBeenCalledTimes(1)
	})
})
