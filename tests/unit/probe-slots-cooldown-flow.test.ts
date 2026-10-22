// @vitest-environment node

import {EventEmitter} from 'node:events'
import {describe, expect, it, vi} from 'vite-plus/test'
import type {BrowserWindow} from 'electron'
import {createIntakeService} from '@main/intake/createIntakeService.js'
import {ProbeService} from '@main/services/ProbeService.js'
import {ProbeSlots} from '@main/services/ProbeSlots.js'
import {QueueService} from '@main/services/QueueService.js'
import {SiteRequestState} from '@main/services/SiteRequestState.js'
import {RATE_LIMIT_COOLDOWN_MESSAGE, type YtDlpRequest, type YtDlpResult} from '@main/services/YtDlp.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {PlaylistManifestStore} from '@main/stores/PlaylistManifestStore.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import type {SettingsStore} from '@main/stores/SettingsStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {ok} from '@shared/result.js'
import {requestSiteFor} from '@shared/sites/index.js'

vi.mock('electron-log/main.js', () => {
	const logger = {debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()}
	return {default: {...logger, scope: () => logger}}
})

// Background probes, the real rate-limit cooldown and a yt-dlp that asks it
// before every run, as YtDlp.run does: a held run spawns nothing.

const ONE = 'https://www.youtube.com/watch?v=one'
const TWO = 'https://www.youtube.com/watch?v=two'
const SHORT = 'https://short.example/v'
const FATAL_429 = 'ERROR: [youtube] one: Unable to download webpage: HTTP Error 429: Too Many Requests'

const video = (url: string): YtDlpResult => ({
	kind: 'success',
	stdout: JSON.stringify({_type: 'video', id: url.slice(-3), title: `Title ${url.slice(-3)}`, extractor: 'youtube', extractor_key: 'Youtube', webpage_url: url, formats: [{format_id: '18', ext: 'mp4', vcodec: 'avc1', acodec: 'mp4a.40.2', url: 'https://media.example/x.mp4'}]}),
	stderr: '',
	usedExtractorFallback: false
})
const redirect = (to: string): YtDlpResult => ({kind: 'success', stdout: JSON.stringify({_type: 'url', url: to, extractor: 'generic', extractor_key: 'Generic'}), stderr: '', usedExtractorFallback: false})
const rateLimited = (): YtDlpResult => ({kind: 'exit-error', exitCode: 1, errorKind: 'rateLimit', rawError: FATAL_429, stdout: '', stderr: FATAL_429})
const held = (): YtDlpResult => ({kind: 'exit-error', exitCode: -1, errorKind: 'rateLimit', rawError: RATE_LIMIT_COOLDOWN_MESSAGE, stdout: '', stderr: ''})
const cancelled = (): YtDlpResult => ({kind: 'exit-error', exitCode: -1, errorKind: 'unknown', rawError: 'Cancelled', stdout: '', stderr: ''})

async function settle(): Promise<void> {
	for (let i = 0; i < 60; i++) await Promise.resolve()
}

// Every run is admitted by the cooldown first; one that launches waits until
// the test answers it, and its answer is observed as YtDlp.run observes it.
function gatedYtDlp(siteRequests: SiteRequestState) {
	const pending: Array<{url: string; answer: (result: YtDlpResult) => void}> = []
	const spawned: string[] = []
	const run = vi.fn((req: YtDlpRequest, signal?: {abortSignal?: AbortSignal}) => {
		const admission = siteRequests.admit(requestSiteFor(req.url))
		if (admission.kind === 'wait') return Promise.resolve(held())
		spawned.push(req.url)
		return new Promise<YtDlpResult>(resolve => {
			pending.push({
				url: req.url,
				answer: result => {
					admission.run.finish(result.stderr, result.kind === 'success')
					resolve(result)
				}
			})
			signal?.abortSignal?.addEventListener('abort', () => resolve(cancelled()), {once: true})
		})
	})
	const answer = async (result: YtDlpResult): Promise<void> => {
		const next = pending.shift()
		if (!next) throw new Error('no run is waiting')
		next.answer(result)
		await settle()
	}
	return {ytDlp: {run} as never, spawned, answer}
}

function wired() {
	vi.useFakeTimers()
	const siteRequests = new SiteRequestState({random: () => 0})
	const {ytDlp, spawned, answer} = gatedYtDlp(siteRequests)
	const probeService = new ProbeService(ytDlp, false, undefined, {slots: new ProbeSlots({backgroundLimit: 2, cooldown: siteRequests})})
	const store = {load: vi.fn().mockResolvedValue(ok({items: [], schedulerPaused: true})), save: vi.fn().mockResolvedValue(ok(undefined))} as unknown as QueueStore
	const queueService = new QueueService(store, Object.assign(new EventEmitter(), {start: vi.fn(), cancel: vi.fn(), pause: vi.fn(), resume: vi.fn()}) as unknown as DownloadService)
	void queueService.pauseAll()
	const settings = defaultAppSettings('/downloads')
	const {intake} = createIntakeService({
		probeService,
		queueService,
		settingsStore: {get: () => Promise.resolve(settings)} as unknown as SettingsStore,
		playlistManifestStore: {save: vi.fn().mockResolvedValue(undefined)} as unknown as PlaylistManifestStore,
		languageRef: {current: 'en'},
		mainWindow: {isDestroyed: () => false, webContents: {send: vi.fn()}} as unknown as BrowserWindow,
		hotkeyFeedback: vi.fn()
	})
	intake.setWindowContext({currentOutputDir: '/wizard-folder', displayShowsHdr: false})
	const status = (url: string): string | undefined => queueService.snapshot().find(item => item.url === url)?.status
	const rowId = (url: string): string => queueService.snapshot().find(item => item.url === url)?.id ?? ''
	return {siteRequests, probeService, intake, spawned, answer, status, rowId}
}

describe('probe slots and the rate-limit cooldown', () => {
	it("Try now on a rate-limited row's Retry probes at once, and a clean answer wakes the rows waiting behind it", async () => {
		const h = wired()
		try {
			await h.intake.add({requestId: 'r1', url: ONE, playlistMode: 'video', origin: {kind: 'window'}})
			await settle()
			await h.answer(rateLimited())
			await vi.waitFor(() => expect(h.status(ONE)).toBe('error'))
			expect(h.siteRequests.rateLimitedUntil('youtube')).not.toBeNull()

			// The row's Try now: one request may go through, then the row's Retry.
			h.siteRequests.allowOnce('youtube')
			h.intake.retry({requestId: 'r2', itemId: h.rowId(ONE), origin: 'window'})
			await settle()
			expect(h.spawned).toEqual([ONE, ONE])

			// A row added now waits out the cooldown: the pass is spent.
			await h.intake.add({requestId: 'r3', url: TWO, playlistMode: 'video', origin: {kind: 'window'}})
			await settle()
			expect(h.spawned).toEqual([ONE, ONE])

			// The site answered the Try now request: its cooldown ends, the waiting row goes.
			await h.answer(video(ONE))
			await settle()
			expect(h.spawned).toEqual([ONE, ONE, TWO])
		} finally {
			vi.useRealTimers()
		}
	})

	it('a probe held on the site a redirect led to waits out that site, never failing its row', async () => {
		const h = wired()
		try {
			const probe = h.probeService.probe(SHORT, {kind: 'intake', playlistMode: 'video', ownerKey: 'row-1'})
			await settle()
			// The link redirects to YouTube, which starts cooling before the second run.
			h.siteRequests.recordRateLimit('youtube', 'rateLimited')
			await h.answer(redirect(ONE))
			let settled = false
			void probe.then(() => (settled = true))
			await settle()
			expect(settled).toBe(false)
			expect(h.spawned).toEqual([SHORT])

			await vi.advanceTimersByTimeAsync(60_000)
			await settle()
			expect(h.spawned).toEqual([SHORT, SHORT])
			await h.answer(redirect(ONE))
			expect(h.spawned).toEqual([SHORT, SHORT, ONE])
			await h.answer(video(ONE))
			expect((await probe).ok).toBe(true)
		} finally {
			vi.useRealTimers()
		}
	})
})
