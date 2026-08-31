// @vitest-environment node
import {EventEmitter} from 'node:events'
import {describe, expect, it, vi, beforeEach} from 'vitest'
import {ProbeService} from '@main/services/ProbeService.js'
import {YtDlp} from '@main/services/YtDlp.js'
import {patchInfoJsonTitle, smuggledRefererOf} from '@main/services/vhxTitleRecovery.js'
import type {VhxTitleFetcher} from '@main/services/vhxTitleRecovery.js'
import type {ProbeInfoJsonCache} from '@main/services/ProbeInfoJsonCache.js'

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
	const settingsStore = {get: vi.fn().mockResolvedValue({common: {}, single: {}, playlist: {}})}
	return new YtDlp(binaryManager as never, tokenService as never, settingsStore as never)
}

const PARENT_URL = 'https://www.trilogyplus.com/free-videos/videos/scammer-sobs-during-police-interrogation'
const EMBED_URL = 'https://embed.vhx.tv/videos/3851601?api=1&product_id=122755'
const SMUGGLED_EMBED_URL = `${EMBED_URL}#__youtubedl_smuggle=${encodeURIComponent(JSON.stringify({referer: PARENT_URL}))}`
const REAL_TITLE = 'Scammer Sobs During Police Interrogation'
const PARENT_HTML = `<html><head><meta property="og:title" content="${REAL_TITLE} - Free Videos - Trilogy Plus"><meta property="og:site_name" content="Trilogy Plus"></head><body></body></html>`

function vhxInfoJson(overrides: Record<string, unknown> = {}): string {
	return JSON.stringify({_type: 'video', id: '3851601', title: 'Untitled', extractor: 'vhx:embed', extractor_key: 'VHXEmbed', webpage_url: SMUGGLED_EMBED_URL, formats: [{format_id: 'http-1080p', ext: 'mp4', vcodec: 'avc1', acodec: 'mp4a.40.2', height: 1080}], ...overrides})
}

function okFetcher(html: string | null): VhxTitleFetcher {
	return vi.fn(async () => html)
}

beforeEach(() => {
	vi.clearAllMocks()
	vi.mocked(probeElectronNodeRuntime).mockResolvedValue({ok: true, runtime: {kind: 'electron-node', executablePath: '/mock/Arroxy', version: '24.16.0'}, output: 'v24.16.0'})
})

describe('smuggledRefererOf', () => {
	it('parses the yt-dlp referer smuggled in the webpage_url fragment', () => {
		expect(smuggledRefererOf(SMUGGLED_EMBED_URL)).toBe(PARENT_URL)
	})

	it('parses the http_headers.Referer smuggle shape', () => {
		const url = `${EMBED_URL}#__youtubedl_smuggle=${encodeURIComponent(JSON.stringify({http_headers: {Referer: PARENT_URL}}))}`
		expect(smuggledRefererOf(url)).toBe(PARENT_URL)
	})

	it('returns null for URLs without a smuggle fragment', () => {
		expect(smuggledRefererOf(EMBED_URL)).toBeNull()
		expect(smuggledRefererOf(undefined)).toBeNull()
	})

	it('returns null when the smuggled referer is the VHX embed host itself', () => {
		const url = `${EMBED_URL}#__youtubedl_smuggle=${encodeURIComponent(JSON.stringify({referer: EMBED_URL}))}`
		expect(smuggledRefererOf(url)).toBeNull()
	})
})

describe('patchInfoJsonTitle', () => {
	it('overwrites a non-empty string title, keeping the rest of the dict', () => {
		expect(patchInfoJsonTitle({id: 'x', title: 'Untitled', formats: []}, 'New')).toEqual({id: 'x', title: 'New', formats: []})
	})

	it('returns arrays unchanged', () => {
		const arr = [{title: 'Untitled'}]
		expect(patchInfoJsonTitle(arr, 'New')).toBe(arr)
	})

	it('returns non-object payloads unchanged', () => {
		expect(patchInfoJsonTitle(null, 'New')).toBeNull()
		expect(patchInfoJsonTitle('raw', 'New')).toBe('raw')
	})

	it('leaves a missing or empty title alone', () => {
		expect(patchInfoJsonTitle({id: 'x'}, 'New')).toEqual({id: 'x'})
		expect(patchInfoJsonTitle({id: 'x', title: ''}, 'New')).toEqual({id: 'x', title: ''})
	})
})

describe('ProbeService — VHX Untitled title recovery', () => {
	it('replaces the Untitled sentinel with the parent page og:title', async () => {
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(vhxInfoJson()) as never)
		const fetcher = okFetcher(PARENT_HTML)

		const r = await new ProbeService(makeYtDlp(), false, undefined, {vhxTitleFetcher: fetcher}).probe(PARENT_URL, 'off', 'video')

		expect(fetcher).toHaveBeenCalledWith(PARENT_URL, expect.anything())
		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'video') expect(r.data.title).toBe(REAL_TITLE)
	})

	it('patches the cached info JSON so the download names the file with the real title', async () => {
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(vhxInfoJson()) as never)
		const ref = {id: '00000000-0000-4000-8000-000000000001', createdAt: '2026-08-31T00:00:00.000Z', videoId: '3851601'}
		const cache = {write: vi.fn().mockResolvedValue(ref), resolve: vi.fn().mockResolvedValue('/cache/00000000-0000-4000-8000-000000000001.info.json')} as unknown as ProbeInfoJsonCache

		const r = await new ProbeService(makeYtDlp(), false, cache, {vhxTitleFetcher: okFetcher(PARENT_HTML)}).probe(PARENT_URL, 'off', 'video')

		expect(cache.write).toHaveBeenCalledWith(expect.objectContaining({id: '3851601', title: REAL_TITLE}), {videoId: '3851601'})
		if (r.ok && r.data.kind === 'video') expect(r.data.probeInfoJsonRef).toEqual(ref)
	})

	it('keeps the original format list in the patched cache payload', async () => {
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(vhxInfoJson()) as never)
		const cache = {write: vi.fn().mockResolvedValue({id: '00000000-0000-4000-8000-000000000002', createdAt: 'x'})} as unknown as ProbeInfoJsonCache

		await new ProbeService(makeYtDlp(), false, cache, {vhxTitleFetcher: okFetcher(PARENT_HTML)}).probe(PARENT_URL, 'off', 'video')

		const raw = vi.mocked(cache.write).mock.calls[0]?.[0] as {formats?: Array<{format_id?: string}>; extractor_key?: string}
		expect(raw.formats?.[0]?.format_id).toBe('http-1080p')
		expect(raw.extractor_key).toBe('VHXEmbed')
	})

	it('keeps the sentinel when the parent page has no og:title', async () => {
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(vhxInfoJson()) as never)
		const fetcher = okFetcher('<html><head><title>Vimeo OTT</title></head></html>')

		const r = await new ProbeService(makeYtDlp(), false, undefined, {vhxTitleFetcher: fetcher}).probe(PARENT_URL, 'off', 'video')

		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'video') expect(r.data.title).toBe('Untitled')
	})

	it('keeps the sentinel when the parent fetch fails', async () => {
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(vhxInfoJson()) as never)
		const fetcher: VhxTitleFetcher = vi.fn(async () => {
			throw new Error('network down')
		})

		const r = await new ProbeService(makeYtDlp(), false, undefined, {vhxTitleFetcher: fetcher}).probe(PARENT_URL, 'off', 'video')

		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'video') expect(r.data.title).toBe('Untitled')
	})

	it('does not fetch when the extractor already returned a real title', async () => {
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(vhxInfoJson({title: 'Real VHX Title'})) as never)
		const fetcher = okFetcher(PARENT_HTML)

		await new ProbeService(makeYtDlp(), false, undefined, {vhxTitleFetcher: fetcher}).probe(PARENT_URL, 'off', 'video')

		expect(fetcher).not.toHaveBeenCalled()
	})

	it('does not fetch for non-VHX extractors even when the title is Untitled', async () => {
		const json = JSON.stringify({_type: 'video', id: 'v1', title: 'Untitled', extractor: 'generic', extractor_key: 'Generic', webpage_url: 'https://example.com/watch/v1', formats: [{format_id: 'f1', ext: 'mp4'}]})
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(json) as never)
		const fetcher = okFetcher(PARENT_HTML)

		await new ProbeService(makeYtDlp(), false, undefined, {vhxTitleFetcher: fetcher}).probe('https://example.com/watch/v1', 'off', 'video')

		expect(fetcher).not.toHaveBeenCalled()
	})

	it('does not fetch when the input URL is the embed itself with no smuggled referer', async () => {
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(vhxInfoJson({webpage_url: EMBED_URL})) as never)
		const fetcher = okFetcher(PARENT_HTML)

		await new ProbeService(makeYtDlp(), false, undefined, {vhxTitleFetcher: fetcher}).probe(EMBED_URL, 'off', 'video')

		expect(fetcher).not.toHaveBeenCalled()
	})

	it('recovers in auto playlist mode too when the probe resolves to a single video', async () => {
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(vhxInfoJson()) as never)
		const fetcher = okFetcher(PARENT_HTML)

		const r = await new ProbeService(makeYtDlp(), false, undefined, {vhxTitleFetcher: fetcher}).probe(PARENT_URL, 'off', 'auto')

		expect(fetcher).toHaveBeenCalledWith(PARENT_URL, expect.anything())
		if (r.ok && r.data.kind === 'video') expect(r.data.title).toBe(REAL_TITLE)
	})

	it('keeps the sentinel when the probe is aborted during the parent fetch', async () => {
		vi.mocked(spawnYtDlp).mockReturnValue(makeFakeProcessEmitting(vhxInfoJson()) as never)
		const service = new ProbeService(makeYtDlp(), false, undefined, {
			vhxTitleFetcher: async () => {
				service.cancelInFlight() // aborts this probe's own controller, as the renderer would
				return PARENT_HTML
			}
		})

		const r = await service.probe(PARENT_URL, 'off', 'video')

		expect(r.ok).toBe(true)
		if (r.ok && r.data.kind === 'video') expect(r.data.title).toBe('Untitled')
	})
})
