// @vitest-environment node

import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {EventEmitter} from 'node:events'
import {HotkeyIntake} from '@main/intake/HotkeyIntake.js'
import {IntakeService, type IntakeAddRequest} from '@main/intake/IntakeService.js'
import {mainTranslator} from '@main/i18n.js'
import {QueueService} from '@main/services/QueueService.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {intakeHotkeyTrigger, outcomeForProbeError} from '@shared/intake/hotkeyIntake.js'
import type {IntakeEvent, IntakePlacement} from '@shared/intake/intakeEvents.js'
import {profileFormatLabel} from '@shared/profileFormatLabel.js'
import {fail, ok, type Result} from '@shared/result.js'
import type {AppSettings, HotkeyOutcomePayload, PlaylistEntry, ProbeError, ProbeResult, QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

// The global hotkey's intake, in main: a press is acknowledged the moment its
// link is placed (or refused), and earns one follow-up only when the intake
// ends needing the user. Main holds every press, so a window reload can
// neither repeat nor lose a notification.

const URL = 'https://www.youtube.com/watch?v=one'
const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLtest'

const VIDEO = {kind: 'video', videoId: 'one', extractor: 'youtube', extractorKey: 'Youtube', webpageUrl: URL, isAudioOnlySource: false, formats: [], title: 'Fixture Video', thumbnail: '', subtitles: {}, automaticCaptions: {}, isLive: false, hasDrm: false} as unknown as ProbeResult

function entries(count: number): PlaylistEntry[] {
	return Array.from({length: count}, (_, index) => ({id: `e${index + 1}`, title: `Entry ${index + 1}`, url: `https://youtu.be/v${index + 1}`, thumbnail: '', duration: 60, playlistIndex: index + 1, videoId: `v${index + 1}`}))
}

function playlist(count: number): ProbeResult {
	return {kind: 'playlist', extractor: 'youtube:tab', extractorKey: 'YoutubeTab', webpageUrl: PLAYLIST_URL, isAudioOnlySource: false, playlistTitle: 'Road trip mix', playlistId: 'PLtest', isMultiVideo: false, entries: entries(count)}
}

class FakeDownloadService extends EventEmitter {
	start = vi.fn().mockResolvedValue(ok({job: {id: 'j', url: ''}}))
	cancel = vi.fn()
	pause = vi.fn()
	resume = vi.fn()
}

describe('intakeHotkeyTrigger', () => {
	it('runs a single URL with video probe mode', () => {
		expect(intakeHotkeyTrigger({kind: 'single', url: URL})).toEqual({kind: 'run', url: URL, playlistMode: 'video'})
	})

	it('runs an unknown-site URL in auto mode instead of refusing it', () => {
		expect(intakeHotkeyTrigger({kind: 'single', url: 'https://www.tiktok.com/@user/video/123'})).toMatchObject({kind: 'run', playlistMode: 'auto'})
	})

	it('runs an obvious collection URL with playlist probe mode', () => {
		expect(intakeHotkeyTrigger({kind: 'single', url: PLAYLIST_URL})).toMatchObject({kind: 'run', playlistMode: 'playlist'})
	})

	it('reports invalid clipboard for empty and multiple payloads', () => {
		expect(intakeHotkeyTrigger({kind: 'empty'})).toEqual({kind: 'outcome', outcome: 'invalid-clipboard'})
		expect(intakeHotkeyTrigger({kind: 'multiple'})).toEqual({kind: 'outcome', outcome: 'multiple-urls'})
	})

	it('reports invalid clipboard for a non-URL string', () => {
		expect(intakeHotkeyTrigger({kind: 'single', url: 'not a url at all'})).toEqual({kind: 'outcome', outcome: 'invalid-clipboard'})
	})

	// The hotkey has no way to ask. `v=` is guaranteed present and correct on a
	// mixed URL, and one unwanted video is a far cheaper mistake than one
	// unwanted 200-item playlist — so the press downloads the video it names.
	it('downloads the video for mixed intent instead of bouncing to review', () => {
		expect(intakeHotkeyTrigger({kind: 'single', url: 'https://www.youtube.com/watch?v=one&list=PL1'})).toMatchObject({kind: 'run', playlistMode: 'video'})
	})

	// The press can't ask, so the video's row offers the list afterwards.
	it('keeps the link of a video in a list or Mix as the list offer, and offers nothing on a plain link', () => {
		const inList = 'https://www.youtube.com/watch?v=one&list=PL1'
		const inMix = 'https://www.youtube.com/watch?v=one&list=RDone'
		expect(intakeHotkeyTrigger({kind: 'single', url: inList})).toEqual({kind: 'run', url: inList, playlistMode: 'video', listOffer: inList})
		expect(intakeHotkeyTrigger({kind: 'single', url: inMix})).toEqual({kind: 'run', url: inMix, playlistMode: 'video', listOffer: inMix})
		expect(intakeHotkeyTrigger({kind: 'single', url: URL})).not.toHaveProperty('listOffer')
		expect(intakeHotkeyTrigger({kind: 'single', url: PLAYLIST_URL})).not.toHaveProperty('listOffer')
	})

	it('runs a radio URL as a plain video', () => {
		expect(intakeHotkeyTrigger({kind: 'single', url: 'https://www.youtube.com/watch?v=one&list=RDone&start_radio=1'})).toMatchObject({kind: 'run', playlistMode: 'video'})
	})
})

describe('outcomeForProbeError', () => {
	it('maps cookies-config probe failures to their own outcome', () => {
		expect(outcomeForProbeError({kind: 'other', code: 'cookies_config', message: 'needs cookies'})).toBe('cookies-setup')
	})

	it('maps other probe failures, and failures to prepare the rows, to submission-failed', () => {
		expect(outcomeForProbeError({kind: 'other', code: 'invalid_url', message: 'bad url'})).toBe('submission-failed')
		expect(outcomeForProbeError(null)).toBe('submission-failed')
	})
})

// The real intake and queue, so placement, dedupe and the probe's outcomes
// are the real rules; only the probe and the notification sink are fakes.
interface Harness {
	hotkey: HotkeyIntake
	intake: IntakeService
	queue: QueueService
	settings: AppSettings
	sent: HotkeyOutcomePayload[]
	// Intake events that reached the window.
	window: IntakeEvent[]
	added: IntakeAddRequest[]
	answer(result: Result<ProbeResult, ProbeError>): void
	settled(): Promise<void>
}

function harness(): Harness {
	const store = {load: vi.fn().mockResolvedValue(ok({items: [], schedulerPaused: true})), save: vi.fn().mockResolvedValue(ok(undefined))} as unknown as QueueStore
	const queue = new QueueService(store, new FakeDownloadService() as unknown as DownloadService)
	void queue.pauseAll()
	const settings = defaultAppSettings('/downloads')
	const sent: HotkeyOutcomePayload[] = []
	const windowEvents: IntakeEvent[] = []
	const added: IntakeAddRequest[] = []
	let next: Result<ProbeResult, ProbeError> = ok(VIDEO)
	let pending: Promise<unknown>[] = []
	let id = 0
	const newId = (): string => `id-${++id}`
	const intake = new IntakeService({
		queue,
		probe: () => {
			const answer = Promise.resolve(next)
			pending.push(answer)
			return answer
		},
		registerManifest: () => Promise.resolve(),
		settings: () => Promise.resolve(settings),
		text: key => `text:${key}`,
		profileFormatLabel: profile => profileFormatLabel(profile, mainTranslator('en'), 'en'),
		emit: event => {
			if (!hotkey.hear(event)) windowEvents.push(event)
		},
		platform: 'linux',
		newId
	})
	const spy: Pick<IntakeService, 'add' | 'windowProfile'> = {
		add: request => {
			added.push(request)
			return intake.add(request)
		},
		windowProfile: () => intake.windowProfile()
	}
	const hotkey = new HotkeyIntake({intake: spy, notify: event => sent.push(event), newId})
	intake.setWindowContext({currentOutputDir: '/wizard-folder', displayShowsHdr: false})
	return {
		hotkey,
		intake,
		queue,
		settings,
		sent,
		window: windowEvents,
		added,
		answer: result => {
			next = result
		},
		settled: async () => {
			await vi.waitFor(async () => {
				const waiting = pending
				pending = []
				await Promise.all(waiting)
				await new Promise(resolve => setTimeout(resolve, 0))
				expect(pending).toHaveLength(0)
			})
		}
	}
}

const rowIntakeId = (h: Harness): string | undefined => h.queue.snapshot()[0]?.origin?.intakeId

describe('HotkeyIntake', () => {
	let h: Harness
	beforeEach(() => {
		h = harness()
	})

	it('answers a clipboard with no single link at once, taking nothing in', async () => {
		await h.hotkey.take({kind: 'empty'})
		await h.hotkey.take({kind: 'multiple'})
		await h.hotkey.take({kind: 'single', url: 'not a url at all'})
		expect(h.sent).toEqual([{outcome: 'invalid-clipboard'}, {outcome: 'multiple-urls'}, {outcome: 'invalid-clipboard'}])
		expect(h.added).toEqual([])
	})

	it("places a video from a list with the list's link as its offer", async () => {
		const inList = 'https://www.youtube.com/watch?v=one&list=PL1'
		await h.hotkey.take({kind: 'single', url: inList})
		expect(h.added).toEqual([{requestId: expect.any(String), url: inList, playlistMode: 'video', listOffer: inList, origin: {kind: 'hotkey'}}])
	})

	it('takes a link in as the hotkey, and a clean queue sends nothing after the ack', async () => {
		await h.hotkey.take({kind: 'single', url: URL})
		expect(h.added).toEqual([{requestId: expect.any(String), url: URL, playlistMode: 'video', origin: {kind: 'hotkey'}}])
		expect(h.sent).toEqual([{outcome: 'queued', intakeId: rowIntakeId(h)}])

		await h.settled()
		expect(h.queue.snapshot()[0]).toMatchObject({status: 'pending', origin: {kind: 'hotkey'}})
		expect(h.sent).toEqual([{outcome: 'queued', intakeId: rowIntakeId(h)}])
	})

	it('follows a failed probe up once, keyed by the same intake as the ack', async () => {
		h.answer(fail({kind: 'other', code: 'unknown', message: 'offline'}))
		await h.hotkey.take({kind: 'single', url: URL})
		await h.settled()
		const intakeId = rowIntakeId(h)
		expect(intakeId).toEqual(expect.any(String))
		expect(h.sent).toEqual([
			{outcome: 'queued', intakeId},
			{outcome: 'submission-failed', intakeId}
		])
		expect(h.queue.snapshot()[0]).toMatchObject({status: 'error', probeMode: 'video'})
	})

	it('follows an incomplete cookies setup up as its own outcome', async () => {
		h.answer(fail({kind: 'other', code: 'cookies_config', message: 'needs cookies'}))
		await h.hotkey.take({kind: 'single', url: URL})
		await h.settled()
		expect(h.sent.map(event => event.outcome)).toEqual(['queued', 'cookies-setup'])
	})

	it('follows a playlist that needs a choice up as needing review', async () => {
		h.settings.common = {...h.settings.common, playlistProbeLimit: 2}
		h.answer(ok(playlist(3)))
		await h.hotkey.take({kind: 'single', url: PLAYLIST_URL})
		await h.settled()
		expect(h.sent.map(event => event.outcome)).toEqual(['queued', 'needs-review'])
		expect(h.queue.snapshot()[0]?.status).toBe('needs-choice')
	})

	it('follows a playlist whose videos are all queued already up as already queued', async () => {
		h.queue.add([makeItem({id: 'a', url: 'https://youtu.be/v1', status: 'pending'}), makeItem({id: 'b', url: 'https://youtu.be/v2', status: 'pending'})])
		h.answer(ok(playlist(2)))
		await h.hotkey.take({kind: 'single', url: PLAYLIST_URL})
		await h.settled()
		expect(h.sent.map(event => event.outcome)).toEqual(['queued', 'already-queued'])
	})

	it('keeps hotkey outcomes out of the window, which hears only its own', async () => {
		h.answer(fail({kind: 'other', code: 'unknown', message: 'offline'}))
		await h.hotkey.take({kind: 'single', url: URL})
		await h.intake.add({requestId: 'w1', url: 'https://www.youtube.com/watch?v=two', playlistMode: 'video', origin: {kind: 'window'}})
		await h.settled()
		expect(h.window.map(event => (event.kind === 'outcome' ? [event.requestId, event.origin] : event.kind))).toEqual([['w1', 'window']])
		expect(h.hotkey.hear({kind: 'filename-budget-failed', reason: 'path-too-deep', outputDir: '/x'})).toBe(false)
	})

	it('sends at most one follow-up for one intake', async () => {
		h.answer(fail({kind: 'other', code: 'unknown', message: 'offline'}))
		await h.hotkey.take({kind: 'single', url: URL})
		await h.settled()
		const event: IntakeEvent = {kind: 'outcome', requestId: 'again', intakeId: rowIntakeId(h) ?? null, origin: 'hotkey', outcome: {kind: 'failed', itemId: 'x', title: URL, probeError: null}}
		expect(h.hotkey.hear(event)).toBe(true)
		expect(h.sent.map(sent => sent.outcome)).toEqual(['queued', 'submission-failed'])
	})

	// A probe can answer before the placement does: the ack still goes first.
	it('sends the ack before a follow-up that arrived ahead of it', async () => {
		const sent: HotkeyOutcomePayload[] = []
		let early: IntakeEvent | null = null
		const placed = Promise.withResolvers<IntakePlacement>()
		const hotkey = new HotkeyIntake({
			intake: {
				add: request => {
					early = {kind: 'outcome', requestId: request.requestId, intakeId: 'i1', origin: 'hotkey', outcome: {kind: 'failed', itemId: 'p1', title: URL, probeError: null}}
					return placed.promise
				},
				windowProfile: () => undefined
			},
			notify: event => sent.push(event),
			newId: () => 'r1'
		})
		const pressed = hotkey.take({kind: 'single', url: URL})
		await vi.waitFor(() => expect(early).not.toBeNull())
		expect(hotkey.hear(early as unknown as IntakeEvent)).toBe(true)
		expect(sent).toEqual([])
		placed.resolve({kind: 'added', itemId: 'p1', title: URL, intakeId: 'i1'})
		await pressed
		expect(sent).toEqual([
			{outcome: 'queued', intakeId: 'i1'},
			{outcome: 'submission-failed', intakeId: 'i1'}
		])
	})

	it('reports a placement that failed outright, and a rejected one, as submission-failed', async () => {
		const sent: HotkeyOutcomePayload[] = []
		let calls = 0
		const add = (): Promise<IntakePlacement> => (++calls === 1 ? Promise.resolve({kind: 'not-added'}) : Promise.reject(new Error('settings unreadable')))
		const hotkey = new HotkeyIntake({intake: {add, windowProfile: () => undefined}, notify: event => sent.push(event), newId: () => 'r'})
		await hotkey.take({kind: 'single', url: URL})
		await hotkey.take({kind: 'single', url: URL})
		expect(sent).toEqual([{outcome: 'submission-failed'}, {outcome: 'submission-failed'}])
	})

	// A profile pick is saved through a queue of settings writes, so main can
	// still hold the previous one when the hotkey fires: the row pins the
	// profile the window shows, as an in-app link does.
	it('pins the profile the window has active before main has saved it', async () => {
		h.intake.setWindowContext({currentOutputDir: '/wizard-folder', displayShowsHdr: false, activeProfile: {kind: 'builtin', id: 'audio-only'}})
		await h.hotkey.take({kind: 'single', url: URL})
		expect(h.added[0]?.profile).toEqual({kind: 'builtin', id: 'audio-only'})
		expect(h.queue.snapshot()[0]).toMatchObject({formatLabel: 'Audio only · Keep as-is', pinnedProfile: {ref: {kind: 'builtin', id: 'audio-only'}}})
		await h.settled()
		expect(h.queue.snapshot()[0]?.job).toMatchObject({intent: {kind: 'audio-only'}})
	})

	it("pins main's active profile while the window has reported none", async () => {
		h.settings.profiles = {...h.settings.profiles, active: {kind: 'builtin', id: 'audio-only'}}
		await h.hotkey.take({kind: 'single', url: URL})
		expect(h.added[0]).not.toHaveProperty('profile')
		expect(h.queue.snapshot()[0]?.pinnedProfile?.ref).toEqual({kind: 'builtin', id: 'audio-only'})
	})
})

// Follow-ups are deduped by intake id, over a bounded memory of intakes.
describe('HotkeyIntake follow-up dedupe', () => {
	// HotkeyIntake's FOLLOWED_UP_LIMIT.
	const LIMIT = 200
	const failed = (intakeId: string | null): IntakeEvent => ({kind: 'outcome', requestId: `r-${intakeId ?? 'none'}`, intakeId, origin: 'hotkey', outcome: {kind: 'failed', itemId: 'x', title: URL, probeError: null}})
	function hotkey(): {hotkey: HotkeyIntake; sent: HotkeyOutcomePayload[]} {
		const sent: HotkeyOutcomePayload[] = []
		const add = (): Promise<IntakePlacement> => Promise.resolve({kind: 'not-added'})
		return {hotkey: new HotkeyIntake({intake: {add, windowProfile: () => undefined}, notify: event => sent.push(event), newId: () => 'r'}), sent}
	}

	// A row gone before its outcome names no intake, so nothing can repeat it.
	it('sends every follow-up that names no intake, without an intake id', () => {
		const h = hotkey()
		expect(h.hotkey.hear(failed(null))).toBe(true)
		expect(h.hotkey.hear(failed(null))).toBe(true)
		expect(h.sent).toEqual([{outcome: 'submission-failed'}, {outcome: 'submission-failed'}])
	})

	it('forgets the oldest intake past the limit, and keeps deduping the recent ones', () => {
		const h = hotkey()
		const ids = Array.from({length: LIMIT + 1}, (_, index) => `i${index}`)
		for (const id of ids) h.hotkey.hear(failed(id))
		expect(h.sent).toHaveLength(LIMIT + 1)

		// The newest LIMIT intakes are still remembered.
		for (const id of ids.slice(1)) h.hotkey.hear(failed(id))
		expect(h.sent).toHaveLength(LIMIT + 1)

		// The first was evicted, so its follow-up goes out again.
		h.hotkey.hear(failed('i0'))
		expect(h.sent).toHaveLength(LIMIT + 2)
		expect(h.sent.at(-1)).toEqual({outcome: 'submission-failed', intakeId: 'i0'})
	})
})

// Dedupe lives in intake; the hotkey hears it as already-queued.
describe('a press on a link already live in the queue', () => {
	const unresolved = {kind: 'unresolved', extractor: '', extractorKey: ''} as const
	async function press(url: string, rows: QueueItem[]): Promise<HotkeyOutcomePayload[]> {
		const h = harness()
		h.queue.add(rows)
		await h.hotkey.take({kind: 'single', url})
		return h.sent
	}

	it('dedupes against a live row by cleaned URL, and leaves the queue alone', async () => {
		expect(await press(URL, [makeItem({id: 'q1', url: URL, status: 'pending'}), makeItem({id: 'q2', url: 'https://other.example/x', status: 'pending'})])).toEqual([{outcome: 'already-queued'}])
	})

	it('treats a probing placeholder as live: same URL is already-queued', async () => {
		expect(await press(URL, [makeItem({id: 'q1', url: URL, status: 'probing', probeMode: 'video', job: unresolved})])).toEqual([{outcome: 'already-queued'}])
	})

	it('lets a different URL run while another probe is in flight', async () => {
		expect((await press(URL, [makeItem({id: 'q1', url: 'https://other.example/in-flight', status: 'probing', probeMode: 'video', job: unresolved})]))[0]?.outcome).toBe('queued')
	})

	it('ignores youtu.be/watch URL-shape differences only via cleanUrl, not canonical IDs (known v1 limitation)', async () => {
		expect((await press(URL, [makeItem({id: 'q1', url: 'https://youtu.be/one', status: 'paused-active'})]))[0]?.outcome).toBe('queued')
	})

	it('does not dedupe against done, error, or cancelled items', async () => {
		for (const status of ['done', 'error', 'cancelled'] as const) {
			const sent = await press(URL, [makeItem({id: 'q1', url: URL, status, ...(status === 'error' ? {error: {kind: 'network', raw: 'x'}} : {})})])
			expect(sent[0]?.outcome).toBe('queued')
		}
	})
})
