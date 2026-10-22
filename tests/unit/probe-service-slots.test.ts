// @vitest-environment node
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {ProbeService} from '@main/services/ProbeService.js'
import {ProbeSlots} from '@main/services/ProbeSlots.js'
import {SiteRequestState} from '@main/services/SiteRequestState.js'
import {RATE_LIMIT_COOLDOWN_MESSAGE, type YtDlpRequest, type YtDlpResult} from '@main/services/YtDlp.js'

// ProbeService runs each logical probe in one probe slot: every spawn of it
// (timeout retry, degradation retry, redirect, escalation) happens inside that
// slot, and a probe cancelled while it waits for one never spawns.

const VIDEO_URL = 'https://www.youtube.com/watch?v=abc'
const OTHER_URL = 'https://www.youtube.com/watch?v=def'
const VIDEO = {_type: 'video', id: 'abc', title: 'Video', extractor: 'youtube', extractor_key: 'Youtube', webpage_url: VIDEO_URL, formats: [{format_id: '18', ext: 'mp4', vcodec: 'avc1', acodec: 'mp4a.40.2'}]}
const FORMATS_MISSING = 'WARNING: [youtube] abc: Some formats may be missing'
const BOT_CHECK = 'ERROR: [youtube] abc: Sign in to confirm you’re not a bot. Use --cookies-from-browser or --cookies for the authentication.'

const success = (stderr = ''): YtDlpResult => ({kind: 'success', stdout: JSON.stringify(VIDEO), stderr, usedExtractorFallback: false})
const held = (): YtDlpResult => ({kind: 'exit-error', exitCode: -1, errorKind: 'rateLimit', rawError: RATE_LIMIT_COOLDOWN_MESSAGE, stdout: '', stderr: ''})
const cancelled = (): YtDlpResult => ({kind: 'exit-error', exitCode: -1, errorKind: 'unknown', rawError: 'Cancelled', stdout: '', stderr: ''})

async function settle(): Promise<void> {
	for (let i = 0; i < 30; i++) await Promise.resolve()
}

// A yt-dlp whose every run waits until the test answers it, in call order.
function controlledYtDlp() {
	const pending: Array<{url: string; answer: (result: YtDlpResult) => void}> = []
	const spawned: string[] = []
	const run = vi.fn(
		(req: YtDlpRequest, signal?: {abortSignal?: AbortSignal}) =>
			new Promise<YtDlpResult>(resolve => {
				spawned.push(req.url)
				pending.push({url: req.url, answer: resolve})
				signal?.abortSignal?.addEventListener('abort', () => resolve(cancelled()), {once: true})
			})
	)
	const answer = async (result: YtDlpResult): Promise<void> => {
		const next = pending.shift()
		if (!next) throw new Error('no run is waiting')
		next.answer(result)
		await settle()
	}
	return {ytDlp: {run} as never, spawned, answer, pending}
}

afterEach(() => {
	vi.useRealTimers()
})

describe('ProbeService — probe slots', () => {
	it('holds one slot for the whole probe across its degradation retry', async () => {
		const {ytDlp, spawned, answer} = controlledYtDlp()
		const slots = new ProbeSlots({backgroundLimit: 1})
		const service = new ProbeService(ytDlp, false, undefined, {slots})

		const first = service.probe(VIDEO_URL, {kind: 'intake', playlistMode: 'video', ownerKey: 'row-1'})
		const second = service.probe(OTHER_URL, {kind: 'intake', playlistMode: 'video', ownerKey: 'row-2'})
		await settle()
		expect(spawned).toEqual([VIDEO_URL])

		await answer(success(FORMATS_MISSING))
		// The retry runs in the same slot; the second probe still waits.
		expect(spawned).toEqual([VIDEO_URL, VIDEO_URL])
		expect(slots.snapshot().running.intake).toBe(1)

		await answer(success())
		expect((await first).ok).toBe(true)
		expect(spawned).toEqual([VIDEO_URL, VIDEO_URL, OTHER_URL])
		await answer(success())
		expect((await second).ok).toBe(true)
	})

	it('holds one slot for the whole probe across its escalation to the Explore session', async () => {
		const {ytDlp, spawned, answer} = controlledYtDlp()
		const slots = new ProbeSlots({backgroundLimit: 1})
		const exploreGate = {canEscalate: vi.fn(async () => true)}
		const service = new ProbeService(ytDlp, false, undefined, {slots, exploreGate, exploreSession: {verifySignedIn: vi.fn(async () => 'signedIn' as const)}})

		const first = service.probe(VIDEO_URL, {kind: 'intake', playlistMode: 'video', ownerKey: 'row-1'})
		void service.probe(OTHER_URL, {kind: 'intake', playlistMode: 'video', ownerKey: 'row-2'})
		await settle()
		await answer({kind: 'exit-error', exitCode: 1, errorKind: 'botBlock', rawError: BOT_CHECK, stdout: '', stderr: BOT_CHECK})
		expect(exploreGate.canEscalate).toHaveBeenCalled()
		expect(spawned).toEqual([VIDEO_URL, VIDEO_URL])
		await answer(success())
		expect((await first).ok).toBe(true)
		expect(spawned).toEqual([VIDEO_URL, VIDEO_URL, OTHER_URL])
	})

	it("cancelProbe on a waiting row's probe returns it cancelled and spawns nothing", async () => {
		const {ytDlp, spawned} = controlledYtDlp()
		const service = new ProbeService(ytDlp, false, undefined, {slots: new ProbeSlots({backgroundLimit: 1})})

		void service.probe(VIDEO_URL, {kind: 'intake', playlistMode: 'video', ownerKey: 'row-1'})
		const waiting = service.probe(OTHER_URL, {kind: 'intake', playlistMode: 'video', ownerKey: 'row-2'})
		await settle()
		service.cancelProbe('row-2')

		expect(await waiting).toEqual({ok: false, error: {kind: 'other', code: 'cancelled', message: 'Probe cancelled'}})
		expect(spawned).toEqual([VIDEO_URL])
	})

	it("cancelInFlight on the window's waiting probe returns it cancelled and spawns nothing", async () => {
		const {ytDlp, spawned} = controlledYtDlp()
		// Limit 1 leaves a ceiling of 3: three window probes fill it, the fourth waits.
		const service = new ProbeService(ytDlp, false, undefined, {slots: new ProbeSlots({backgroundLimit: 1})})
		const probes = ['a', 'b', 'c', 'd'].map(id => service.probe(`https://www.youtube.com/watch?v=${id}`, {kind: 'interactive', playlistMode: 'video'}))
		await settle()
		expect(spawned).toHaveLength(3)

		service.cancelInFlight()
		const results = await Promise.all(probes)

		expect(results.every(result => !result.ok && result.error.kind === 'other' && result.error.code === 'cancelled')).toBe(true)
		expect(spawned).toHaveLength(3)
	})

	it('a duplicate owner supersedes a waiting probe, which never spawns', async () => {
		const {ytDlp, spawned, answer} = controlledYtDlp()
		const service = new ProbeService(ytDlp, false, undefined, {slots: new ProbeSlots({backgroundLimit: 1})})

		void service.probe(VIDEO_URL, {kind: 'intake', playlistMode: 'video', ownerKey: 'row-1'})
		const superseded = service.probe(OTHER_URL, {kind: 'intake', playlistMode: 'video', ownerKey: 'row-2'})
		await settle()
		const replacement = service.probe(OTHER_URL, {kind: 'intake', playlistMode: 'video', ownerKey: 'row-2'})
		expect(await superseded).toEqual({ok: false, error: {kind: 'other', code: 'cancelled', message: 'Probe cancelled'}})

		await answer(success())
		expect(spawned).toEqual([VIDEO_URL, OTHER_URL])
		await answer(success())
		expect((await replacement).ok).toBe(true)
	})

	it('puts a background probe held by a cooldown back to wait, and runs it after the cooldown', async () => {
		vi.useFakeTimers()
		const {ytDlp, spawned, answer} = controlledYtDlp()
		const siteRequests = new SiteRequestState({random: () => 0})
		const service = new ProbeService(ytDlp, false, undefined, {slots: new ProbeSlots({backgroundLimit: 1, cooldown: siteRequests})})

		const probe = service.probe(VIDEO_URL, {kind: 'intake', playlistMode: 'video', ownerKey: 'row-1'})
		await settle()
		// A cooldown began after the slot was given: YtDlp held the run, nothing spawned.
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		await answer(held())
		let settled = false
		void probe.then(() => (settled = true))
		await settle()
		expect(settled).toBe(false)

		await vi.advanceTimersByTimeAsync(60_000)
		await settle()
		expect(spawned).toEqual([VIDEO_URL, VIDEO_URL])
		await answer(success())
		expect((await probe).ok).toBe(true)
	})

	it("returns the window's held probe as today's rate-limit failure", async () => {
		const {ytDlp, spawned, answer} = controlledYtDlp()
		const siteRequests = new SiteRequestState({random: () => 0})
		siteRequests.recordRateLimit('youtube', 'rateLimited')
		const service = new ProbeService(ytDlp, false, undefined, {slots: new ProbeSlots({backgroundLimit: 1, cooldown: siteRequests})})

		const probe = service.probe(VIDEO_URL, {kind: 'interactive', playlistMode: 'video'})
		await settle()
		await answer(held())
		const result = await probe

		expect(spawned).toEqual([VIDEO_URL])
		expect(result.ok ? null : result.error).toMatchObject({kind: 'ytdlp', error: {kind: 'rateLimit', raw: RATE_LIMIT_COOLDOWN_MESSAGE}})
	})

	it('declines a probe whose caller says no once the slot is granted, spawning nothing', async () => {
		const {ytDlp, spawned, answer} = controlledYtDlp()
		const service = new ProbeService(ytDlp, false, undefined, {slots: new ProbeSlots({backgroundLimit: 1})})
		let downloading = false

		void service.probe(VIDEO_URL, {kind: 'intake', playlistMode: 'video', ownerKey: 'row-1'})
		const backfill = service.probe(OTHER_URL, {kind: 'backfill', playlistMode: 'video', ownerKey: 'title-backfill', admit: () => !downloading})
		await settle()
		downloading = true
		await answer(success())

		expect(await backfill).toEqual({ok: false, error: {kind: 'other', code: 'deferred', message: 'Probe deferred'}})
		expect(spawned).toEqual([VIDEO_URL])
	})

	it('without slots, declines at once when the caller says no', async () => {
		const {ytDlp, spawned} = controlledYtDlp()
		const service = new ProbeService(ytDlp)

		const result = await service.probe(VIDEO_URL, {kind: 'backfill', playlistMode: 'video', admit: () => false})

		expect(result).toEqual({ok: false, error: {kind: 'other', code: 'deferred', message: 'Probe deferred'}})
		expect(spawned).toEqual([])
	})

	it('mock mode answers at once without a slot', async () => {
		const slots = new ProbeSlots({backgroundLimit: 1})
		const run = vi.spyOn(slots, 'run')
		const service = new ProbeService({run: vi.fn()} as never, true, undefined, {slots})

		const result = await service.probe(VIDEO_URL, {kind: 'intake', playlistMode: 'video', ownerKey: 'row-1'})

		expect(result.ok).toBe(true)
		expect(run).not.toHaveBeenCalled()
	})
})
