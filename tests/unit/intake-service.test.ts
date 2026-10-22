// @vitest-environment node

import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {EventEmitter} from 'node:events'
import {IntakeService, type IntakeProbeRequest} from '@main/intake/IntakeService.js'
import {mainTranslator} from '@main/i18n.js'
import {QueueService} from '@main/services/QueueService.js'
import type {DownloadService} from '@main/services/DownloadService.js'
import type {QueueStore} from '@main/stores/QueueStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {SupportedLang} from '@shared/i18n/types.js'
import {profileFormatLabel} from '@shared/profileFormatLabel.js'
import type {IntakeEvent} from '@shared/intake/intakeEvents.js'
import {fail, ok, type Result} from '@shared/result.js'
import type {AppSettings, PlaylistEntry, ProbeError, ProbeResult} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'

// Link intake in main: a link becomes a placeholder row pinned to the active
// profile and the window's folder, its probe runs here, and the outcome goes
// out as an event for the call that caused it. The queue is the real one, so
// admission and the probe-stage swap are the real rules.

const VIDEO_URL = 'https://www.youtube.com/watch?v=abc'
const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLtest'

const VIDEO = {kind: 'video', videoId: 'abc', extractor: 'youtube', extractorKey: 'Youtube', webpageUrl: VIDEO_URL, isAudioOnlySource: false, formats: [], title: 'Fixture Video', thumbnail: '', subtitles: {}, automaticCaptions: {}, isLive: false, hasDrm: false} as unknown as ProbeResult

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

interface Harness {
	intake: IntakeService
	queue: QueueService
	settings: AppSettings
	events: IntakeEvent[]
	probes: IntakeProbeRequest[]
	answer: (result: Result<ProbeResult, ProbeError>) => void
	// The window's language, which main labels rows in.
	speak: (language: SupportedLang) => void
	settled: () => Promise<void>
}

function harness(): Harness {
	const store = {load: vi.fn().mockResolvedValue(ok({items: [], schedulerPaused: true})), save: vi.fn().mockResolvedValue(ok(undefined))} as unknown as QueueStore
	const queue = new QueueService(store, new FakeDownloadService() as unknown as DownloadService)
	// Paused, so prepared rows stay pending and the snapshot is stable.
	void queue.pauseAll()
	const settings = defaultAppSettings('/downloads')
	const events: IntakeEvent[] = []
	const probes: IntakeProbeRequest[] = []
	let next: Result<ProbeResult, ProbeError> = ok(VIDEO)
	let pending: Promise<unknown>[] = []
	let id = 0
	let language: SupportedLang = 'en'
	const intake = new IntakeService({
		queue,
		probe: request => {
			probes.push(request)
			const answer = Promise.resolve(next)
			pending.push(answer)
			return answer
		},
		registerManifest: () => Promise.resolve(),
		settings: () => Promise.resolve(settings),
		text: key => `text:${key}`,
		profileFormatLabel: profile => profileFormatLabel(profile, mainTranslator(language), language),
		emit: event => events.push(event),
		platform: 'linux',
		newId: () => `id-${++id}`
	})
	intake.setWindowContext({currentOutputDir: '/wizard-folder', displayShowsHdr: false})
	return {
		intake,
		queue,
		settings,
		events,
		probes,
		answer: result => {
			next = result
		},
		speak: lang => {
			language = lang
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

const WINDOW = {kind: 'window'} as const

function outcomes(h: Harness): unknown[] {
	return h.events.flatMap(event => (event.kind === 'outcome' ? [{requestId: event.requestId, ...event.outcome}] : []))
}

describe('IntakeService', () => {
	let h: Harness
	beforeEach(() => {
		h = harness()
	})

	it('places a probing row pinned to the active profile and the window folder, then queues the video', async () => {
		const placement = await h.intake.add({requestId: 'r1', url: VIDEO_URL, playlistMode: 'video', origin: WINDOW})
		expect(placement.kind).toBe('added')
		const placeholderId = placement.kind === 'added' ? placement.itemId : ''
		expect(h.probes).toEqual([{url: VIDEO_URL, playlistMode: 'video', ownerKey: placeholderId}])

		await h.settled()
		const [row] = h.queue.snapshot()
		expect(row?.id).toBe(placeholderId)
		expect(row?.status).toBe('pending')
		expect(row?.title).toBe('Fixture Video')
		expect(row?.outputDir.startsWith('/wizard-folder')).toBe(true)
		expect(row?.origin).toEqual({kind: 'window', intakeId: expect.any(String)})
		// The placement names the intake, as every outcome of it does.
		expect(placement).toMatchObject({intakeId: row?.origin?.intakeId})
		expect(outcomes(h)).toEqual([{requestId: 'r1', kind: 'queued', itemId: placeholderId, skippedAlreadyQueued: 0}])
	})

	it("keeps the window's active profile for callers that pin what the window shows", () => {
		expect(h.intake.windowProfile()).toBeUndefined()
		h.intake.setWindowContext({currentOutputDir: '/wizard-folder', displayShowsHdr: false, activeProfile: {kind: 'builtin', id: 'audio-only'}})
		expect(h.intake.windowProfile()).toEqual({kind: 'builtin', id: 'audio-only'})
	})

	it('stores the pinned profile on the placeholder row', async () => {
		h.answer(fail({kind: 'other', code: 'unknown', message: 'offline'}))
		await h.intake.add({requestId: 'r1', url: VIDEO_URL, playlistMode: 'video', origin: WINDOW})
		await h.settled()
		const [row] = h.queue.snapshot()
		expect(row?.status).toBe('error')
		expect(row?.pinnedProfile).toEqual({ref: {kind: 'builtin', id: 'balanced'}, outputContext: {currentOutputDir: '/wizard-folder', defaultOutputDir: '/downloads'}})
		expect(outcomes(h)).toEqual([{requestId: 'r1', kind: 'failed', itemId: row?.id, title: VIDEO_URL, probeError: {kind: 'other', code: 'unknown', message: 'offline'}}])
	})

	// The window saves a profile pick through a queue of settings writes, so
	// main's settings can still hold the previous one when the link arrives.
	it('pins the profile the window names, not the one main read from settings', async () => {
		h.answer(fail({kind: 'other', code: 'unknown', message: 'offline'}))
		await h.intake.add({requestId: 'r1', url: VIDEO_URL, playlistMode: 'video', profile: {kind: 'builtin', id: 'audio-only'}, origin: WINDOW})
		await h.settled()
		const [row] = h.queue.snapshot()
		expect(row?.pinnedProfile?.ref).toEqual({kind: 'builtin', id: 'audio-only'})
		expect(row?.formatLabel).toContain('Audio only')
	})

	it("labels the placeholder and the prepared row in the window's language", async () => {
		h.speak('de')
		h.answer(fail({kind: 'other', code: 'unknown', message: 'offline'}))
		await h.intake.add({requestId: 'r1', url: VIDEO_URL, playlistMode: 'video', origin: WINDOW})
		await h.settled()
		const itemId = h.queue.snapshot()[0]?.id ?? ''
		expect(h.queue.snapshot()[0]?.formatLabel).toBe('Bis 720p · Bestes Bild')

		h.answer(ok(VIDEO))
		expect(h.intake.retry({requestId: 'r2', itemId, origin: 'window'}).ok).toBe(true)
		await h.settled()
		expect(h.queue.snapshot()[0]).toMatchObject({status: 'pending', formatLabel: 'Bis 720p · Bestes Bild'})
	})

	it("a Retry prepares with the row's pinned profile, not the one active by then", async () => {
		h.answer(fail({kind: 'other', code: 'unknown', message: 'offline'}))
		await h.intake.add({requestId: 'r1', url: VIDEO_URL, playlistMode: 'video', origin: WINDOW})
		await h.settled()
		const itemId = h.queue.snapshot()[0]?.id ?? ''

		h.settings.profiles = {...h.settings.profiles, active: {kind: 'builtin', id: 'audio-only'}}
		h.intake.setWindowContext({currentOutputDir: '/elsewhere', displayShowsHdr: false})
		h.answer(ok(VIDEO))
		expect(h.intake.retry({requestId: 'r2', itemId, origin: 'window'}).ok).toBe(true)
		await h.settled()

		const [row] = h.queue.snapshot()
		expect(row?.formatLabel).toBe('Up to 720p · Best picture')
		expect(row?.outputDir).toBe('/wizard-folder/Balanced 720p')
		expect(outcomes(h).at(-1)).toEqual({requestId: 'r2', kind: 'queued', itemId, skippedAlreadyQueued: 0})
	})

	it('a row saved without a pinned profile prepares with the active profile and the window folder', async () => {
		const legacy = makeItem({id: 'old', status: 'error', url: VIDEO_URL, title: VIDEO_URL, job: {kind: 'unresolved', extractor: '', extractorKey: ''}, probeMode: 'video', error: {kind: 'unknown', raw: 'App restarted while fetching video details'}})
		h.queue.add([legacy])
		h.settings.profiles = {...h.settings.profiles, active: {kind: 'builtin', id: 'audio-only'}}
		expect(h.intake.retry({requestId: 'r1', itemId: 'old', origin: 'window'}).ok).toBe(true)
		await h.settled()
		const [row] = h.queue.snapshot()
		expect(row?.formatLabel).toContain('Audio only')
		expect(row?.outputDir.startsWith('/wizard-folder')).toBe(true)
	})

	it('a link already live in the queue is not taken in again', async () => {
		await h.intake.add({requestId: 'r1', url: VIDEO_URL, playlistMode: 'video', origin: WINDOW})
		const again = await h.intake.add({requestId: 'r2', url: VIDEO_URL, playlistMode: 'video', origin: WINDOW})
		expect(again).toEqual({kind: 'already-queued', itemId: h.queue.snapshot()[0]?.id})
		expect(h.probes).toHaveLength(1)
	})

	// The hotkey took the video from a link that also names a list; its row
	// offers the list, which loads nothing until taken.
	describe('the list offer', () => {
		const IN_LIST = 'https://www.youtube.com/watch?v=v2&list=PLtest'

		async function offered(): Promise<string> {
			await h.intake.add({requestId: 'r1', url: IN_LIST, playlistMode: 'video', listOffer: IN_LIST, origin: {kind: 'hotkey'}})
			await h.settled()
			const [video] = h.queue.snapshot()
			expect(video?.listOffer).toBe(IN_LIST)
			return video?.id ?? ''
		}

		it('places the list as its own row without the video, and clears the offer', async () => {
			const videoId = await offered()
			h.answer(ok(playlist(3)))

			const taken = await h.intake.takeListOffer({requestId: 'r2', itemId: videoId, origin: 'window'})
			expect(taken).toMatchObject({ok: true, data: {kind: 'added'}})
			expect(h.queue.snapshot().find(row => row.id === videoId)?.listOffer).toBeUndefined()
			// One entry further than the load limit, so the count holds after the skip.
			expect(h.probes.at(-1)).toMatchObject({url: IN_LIST, playlistMode: 'playlist', playlistScope: {items: {kind: 'first', count: 101}}})

			await h.settled()
			expect(h.queue.snapshot().map(row => row.url)).toEqual([VIDEO_URL, 'https://youtu.be/v1', 'https://youtu.be/v3'])
		})

		it('a list past the limit waits for a choice that counts after the skip, and keeps the skip through a Retry', async () => {
			h.settings.common = {...h.settings.common, playlistProbeLimit: 2}
			const videoId = await offered()
			h.answer(ok(playlist(4)))
			const taken = await h.intake.takeListOffer({requestId: 'r2', itemId: videoId, origin: 'window'})
			const listId = taken.ok && taken.data.kind === 'added' ? taken.data.itemId : ''
			await h.settled()

			const list = h.queue.snapshot().find(row => row.id === listId)
			expect(list).toMatchObject({status: 'needs-choice', choice: {kind: 'list-size', loaded: 2, capped: true}, skipVideoId: 'v2'})
			expect(h.intake.keptProbe(listId)?.entries.map(entry => entry.videoId)).toEqual(['v1', 'v3', 'v4'])

			expect(h.intake.choose({requestId: 'r3', itemId: listId, origin: 'window', take: 'first'}).ok).toBe(true)
			await vi.waitFor(() => expect(h.queue.snapshot().map(row => row.url)).toEqual([VIDEO_URL, 'https://youtu.be/v1', 'https://youtu.be/v3']))
		})

		it('Dismiss clears the offer and places nothing', async () => {
			const videoId = await offered()
			expect(h.intake.dismissListOffer(videoId).ok).toBe(true)
			expect(h.queue.snapshot()).toHaveLength(1)
			expect(h.queue.snapshot()[0]?.listOffer).toBeUndefined()
			expect(h.probes).toHaveLength(1)
		})

		it('a row without an offer refuses it', async () => {
			await h.intake.add({requestId: 'r1', url: VIDEO_URL, playlistMode: 'video', origin: WINDOW})
			await h.settled()
			const taken = await h.intake.takeListOffer({requestId: 'r2', itemId: h.queue.snapshot()[0]?.id ?? '', origin: 'window'})
			expect(taken.ok).toBe(false)
			expect(h.probes).toHaveLength(1)
		})
	})

	it('a playlist over the load limit waits for a choice, and First N uses the kept probe', async () => {
		h.settings.common = {...h.settings.common, playlistProbeLimit: 2}
		h.answer(ok(playlist(3)))
		await h.intake.add({requestId: 'r1', url: PLAYLIST_URL, playlistMode: 'playlist', origin: WINDOW})
		await h.settled()
		const itemId = h.queue.snapshot()[0]?.id ?? ''
		expect(h.queue.snapshot()[0]?.status).toBe('needs-choice')
		expect(outcomes(h)).toEqual([{requestId: 'r1', kind: 'needs-choice', itemId, choice: {kind: 'list-size', loaded: 2, capped: true}}])
		expect(h.intake.keptProbe(itemId)?.entries).toHaveLength(3)

		expect(h.intake.choose({requestId: 'r2', itemId, origin: 'window', take: 'first'}).ok).toBe(true)
		await vi.waitFor(() => expect(h.queue.snapshot().map(row => row.url)).toEqual(['https://youtu.be/v1', 'https://youtu.be/v2']))
		expect(h.probes).toHaveLength(1)
		expect(h.queue.snapshot().every(row => row.origin?.intakeId === h.queue.snapshot()[0]?.origin?.intakeId)).toBe(true)
		expect(h.intake.keptProbe(itemId)).toBeNull()
	})

	it('All probes the whole playlist again and queues every video', async () => {
		h.settings.common = {...h.settings.common, playlistProbeLimit: 2}
		h.answer(ok(playlist(3)))
		await h.intake.add({requestId: 'r1', url: PLAYLIST_URL, playlistMode: 'playlist', origin: WINDOW})
		await h.settled()
		const itemId = h.queue.snapshot()[0]?.id ?? ''

		expect(h.intake.choose({requestId: 'r2', itemId, origin: 'window', take: 'all'}).ok).toBe(true)
		await h.settled()
		expect(h.probes.at(-1)).toEqual({url: PLAYLIST_URL, playlistMode: 'playlist', ownerKey: itemId, playlistScope: {items: {kind: 'first', count: 5000}}})
		expect(h.queue.snapshot()).toHaveLength(3)
	})

	// The answer to "how many?" rides on the row, as a count chosen at intake
	// does: a Retry after the widened probe failed (or after a restart) keeps
	// to it and does not ask again.
	describe('an answered choice whose probe fails', () => {
		const OFFLINE = fail<ProbeResult, ProbeError>({kind: 'other', code: 'unknown', message: 'offline'})

		async function waitingRow(): Promise<string> {
			h.settings.common = {...h.settings.common, playlistProbeLimit: 2}
			h.answer(ok(playlist(3)))
			await h.intake.add({requestId: 'r1', url: PLAYLIST_URL, playlistMode: 'playlist', origin: WINDOW})
			await h.settled()
			expect(h.queue.snapshot()[0]?.status).toBe('needs-choice')
			return h.queue.snapshot()[0]?.id ?? ''
		}

		it('All stays on the row, and a Retry probes the whole playlist again', async () => {
			const itemId = await waitingRow()
			h.answer(OFFLINE)
			expect(h.intake.choose({requestId: 'r2', itemId, origin: 'window', take: 'all'}).ok).toBe(true)
			expect(h.queue.snapshot()[0]).toMatchObject({status: 'probing', probeTake: {kind: 'all'}})
			await h.settled()
			expect(h.queue.snapshot()[0]).toMatchObject({status: 'error', probeTake: {kind: 'all'}})

			h.answer(ok(playlist(3)))
			expect(h.intake.retry({requestId: 'r3', itemId, origin: 'window'}).ok).toBe(true)
			await h.settled()
			expect(h.probes.at(-1)).toEqual({url: PLAYLIST_URL, playlistMode: 'playlist', ownerKey: itemId, playlistScope: {items: {kind: 'first', count: 5000}}})
			expect(h.queue.snapshot()).toHaveLength(3)
			expect(outcomes(h).at(-1)).toEqual({requestId: 'r3', kind: 'queued', itemId, skippedAlreadyQueued: 0})
		})

		it('First N with no kept probe stays on the row, and a Retry probes those N again', async () => {
			h.answer(OFFLINE)
			await h.intake.add({requestId: 'r1', url: PLAYLIST_URL, playlistMode: 'playlist', origin: WINDOW})
			await h.settled()
			const itemId = h.queue.snapshot()[0]?.id ?? ''
			// A needs-choice row restored after a restart: its kept probe is gone.
			expect(h.queue.reprobe(itemId).ok).toBe(true)
			expect(h.queue.needsChoice(itemId, {kind: 'list-size', loaded: 2, capped: true}, 'Road trip mix').ok).toBe(true)
			h.settings.common = {...h.settings.common, playlistProbeLimit: 2}

			expect(h.intake.choose({requestId: 'r2', itemId, origin: 'window', take: 'first'}).ok).toBe(true)
			expect(h.queue.snapshot()[0]).toMatchObject({status: 'probing', probeTake: {kind: 'first', count: 2}})
			await h.settled()
			expect(h.queue.snapshot()[0]).toMatchObject({status: 'error', probeTake: {kind: 'first', count: 2}})

			h.answer(ok(playlist(3)))
			expect(h.intake.retry({requestId: 'r3', itemId, origin: 'window'}).ok).toBe(true)
			await h.settled()
			expect(h.probes.at(-1)).toEqual({url: PLAYLIST_URL, playlistMode: 'playlist', ownerKey: itemId, playlistScope: {items: {kind: 'first', count: 2}}})
			expect(h.queue.snapshot().map(row => row.url)).toEqual(['https://youtu.be/v1', 'https://youtu.be/v2'])
		})

		it('First N from the kept probe stays on the row, and a Retry probes those N', async () => {
			const itemId = await waitingRow()
			// The kept probe's rows are refused, so the row settles as a probe error.
			h.queue.onIntakeAdmission(() => 1)
			expect(h.intake.choose({requestId: 'r2', itemId, origin: 'window', take: 'first'}).ok).toBe(true)
			expect(h.queue.snapshot()[0]).toMatchObject({status: 'probing', probeTake: {kind: 'first', count: 2}})
			await vi.waitFor(() => expect(h.queue.snapshot()[0]).toMatchObject({status: 'error', probeTake: {kind: 'first', count: 2}}))

			h.queue.onIntakeAdmission(() => null)
			h.answer(ok(playlist(3)))
			expect(h.intake.retry({requestId: 'r3', itemId, origin: 'window'}).ok).toBe(true)
			await h.settled()
			expect(h.probes.at(-1)).toEqual({url: PLAYLIST_URL, playlistMode: 'playlist', ownerKey: itemId, playlistScope: {items: {kind: 'first', count: 2}}})
			expect(h.queue.snapshot().map(row => row.url)).toEqual(['https://youtu.be/v1', 'https://youtu.be/v2'])
		})
	})

	it('a Retry on a row that is not a probe error is refused and probes nothing', async () => {
		await h.intake.add({requestId: 'r1', url: VIDEO_URL, playlistMode: 'video', origin: WINDOW})
		await h.settled()
		const itemId = h.queue.snapshot()[0]?.id ?? ''
		expect(h.intake.retry({requestId: 'r2', itemId, origin: 'window'}).ok).toBe(false)
		expect(h.probes).toHaveLength(1)
	})

	// A list from another site asks even under the load limit: All and Review,
	// never a First N, since nothing was cut off.
	describe("another site's list under the load limit", () => {
		const url = 'https://media.example/watch/42'

		async function waitingRow(): Promise<string> {
			h.answer(ok({...playlist(3), webpageUrl: url}))
			await h.intake.add({requestId: 'r1', url, playlistMode: 'video', origin: WINDOW})
			await h.settled()
			const itemId = h.queue.snapshot()[0]?.id ?? ''
			expect(h.queue.snapshot()[0]).toMatchObject({status: 'needs-choice', choice: {kind: 'list-size', loaded: 3, capped: false}})
			expect(outcomes(h)).toEqual([{requestId: 'r1', kind: 'needs-choice', itemId, choice: {kind: 'list-size', loaded: 3, capped: false}}])
			return itemId
		}

		it('All probes it again as wide as the load ceiling and queues every video', async () => {
			const itemId = await waitingRow()
			expect(h.intake.choose({requestId: 'r2', itemId, origin: 'window', take: 'all'}).ok).toBe(true)
			expect(h.queue.snapshot()[0]).toMatchObject({status: 'probing', probeTake: {kind: 'all'}})
			await h.settled()
			expect(h.probes.at(-1)).toEqual({url, playlistMode: 'video', ownerKey: itemId, playlistScope: {items: {kind: 'first', count: 5000}}})
			expect(h.queue.snapshot()).toHaveLength(3)
			expect(outcomes(h).at(-1)).toEqual({requestId: 'r2', kind: 'queued', itemId, skippedAlreadyQueued: 0})
		})

		it('First is refused and the row keeps waiting for its choice', async () => {
			const itemId = await waitingRow()
			expect(h.intake.choose({requestId: 'r2', itemId, origin: 'window', take: 'first'})).toMatchObject({ok: false, error: {code: 'validation'}})
			await h.settled()
			expect(h.queue.snapshot()[0]).toMatchObject({status: 'needs-choice', choice: {kind: 'list-size', loaded: 3, capped: false}})
			expect(h.probes).toHaveLength(1)
		})
	})

	it('a choice on a probe-error row is refused and the row stays a probe error', async () => {
		h.answer(fail({kind: 'other', code: 'unknown', message: 'offline'}))
		await h.intake.add({requestId: 'r1', url: VIDEO_URL, playlistMode: 'video', origin: WINDOW})
		await h.settled()
		const itemId = h.queue.snapshot()[0]?.id ?? ''

		for (const take of ['first', 'all'] as const) {
			expect(h.intake.choose({requestId: 'r2', itemId, origin: 'window', take})).toMatchObject({ok: false, error: {code: 'validation'}})
		}
		await h.settled()
		expect(h.queue.snapshot()[0]?.status).toBe('error')
		expect(h.probes).toHaveLength(1)
	})

	// The intake admission limit is no conflict: nothing else holds the link,
	// so the row says why it was refused and a Retry stays possible.
	it('settles the row as a probe error when the swap is over the intake limit', async () => {
		h.queue.onIntakeAdmission(() => 2)
		h.answer(ok(playlist(3)))
		await h.intake.add({requestId: 'r1', url: PLAYLIST_URL, playlistMode: 'playlist', origin: WINDOW})
		await h.settled()
		await vi.waitFor(() => expect(h.queue.snapshot()).toEqual([expect.objectContaining({status: 'error', error: {kind: 'unknown', raw: expect.stringContaining('at most 2 rows')}})]))
		expect(outcomes(h).at(-1)).toMatchObject({requestId: 'r1', kind: 'failed'})
	})

	// A Control client's intake over its row cap ends as a probe failure its
	// client can read, never stays probing.
	it("settles a Control client's intake as a probe error when the swap is over its row cap", async () => {
		h.queue.onIntakeAdmission(origin => (origin.kind === 'localClient' ? 2 : null))
		h.answer(ok(playlist(3)))
		await h.intake.add({requestId: 'c1', url: PLAYLIST_URL, playlistMode: 'playlist', origin: {kind: 'localClient', clientId: 'client-1'}})
		await h.settled()
		await vi.waitFor(() => expect(h.queue.snapshot()).toEqual([expect.objectContaining({status: 'error', origin: {kind: 'localClient', clientId: 'client-1', intakeId: expect.any(String)}})]))
		expect(h.events.at(-1)).toMatchObject({kind: 'outcome', requestId: 'c1', origin: 'localClient', outcome: {kind: 'failed', probeError: null, overRowLimit: true}})
	})

	// A write that throws is a broken queue port, not a refusal: the row must
	// not stay stuck in probing.
	it('settles the row as a probe error when recording the outcome throws', async () => {
		const swap = vi.spyOn(h.queue, 'replaceProbing').mockRejectedValueOnce(new Error('disk full'))
		await h.intake.add({requestId: 'r1', url: VIDEO_URL, playlistMode: 'video', origin: WINDOW})
		await h.settled()
		await vi.waitFor(() => expect(h.queue.snapshot()[0]).toMatchObject({status: 'error', error: {kind: 'unknown', raw: 'disk full'}}))
		expect(swap).toHaveBeenCalledOnce()
		expect(outcomes(h).at(-1)).toMatchObject({requestId: 'r1', kind: 'failed'})
	})

	// A count the user chose at intake (the Mixed URL prompt's list answer)
	// rides on the placeholder row: the first probe, a Retry and one after a
	// restart keep to it, and nothing asks "how many?" again.
	describe('a link taken in with a chosen count', () => {
		const MIXED_URL = 'https://www.youtube.com/watch?v=abc&list=PLtest'

		it('keeps the count on the row and probes only that many, queueing them without a choice', async () => {
			h.answer(ok(playlist(3)))
			const placement = await h.intake.add({requestId: 'r1', url: MIXED_URL, playlistMode: 'playlist', take: {kind: 'first', count: 2}, origin: WINDOW})
			const itemId = placement.kind === 'added' ? placement.itemId : ''
			expect(h.queue.snapshot()[0]).toMatchObject({id: itemId, status: 'probing', probeMode: 'playlist', probeTake: {kind: 'first', count: 2}})
			await vi.waitFor(() => expect(h.probes).toEqual([{url: MIXED_URL, playlistMode: 'playlist', ownerKey: itemId, playlistScope: {items: {kind: 'first', count: 2}}}]))

			await h.settled()
			expect(h.queue.snapshot().map(row => row.url)).toEqual(['https://youtu.be/v1', 'https://youtu.be/v2'])
			expect(outcomes(h)).toEqual([{requestId: 'r1', kind: 'queued', itemId, skippedAlreadyQueued: 0}])
		})

		it('probes as wide as the load ceiling for an All take', async () => {
			h.settings.common = {...h.settings.common, playlistProbeLimit: 2}
			h.answer(ok(playlist(3)))
			await h.intake.add({requestId: 'r1', url: MIXED_URL, playlistMode: 'playlist', take: {kind: 'all'}, origin: WINDOW})
			expect(h.queue.snapshot()[0]?.probeTake).toEqual({kind: 'all'})
			await h.settled()
			expect(h.probes[0]?.playlistScope).toEqual({items: {kind: 'first', count: 5000}})
			expect(h.queue.snapshot()).toHaveLength(3)
		})

		it('places no count on a row that was given none', async () => {
			h.answer(fail({kind: 'other', code: 'unknown', message: 'offline'}))
			await h.intake.add({requestId: 'r1', url: MIXED_URL, playlistMode: 'playlist', origin: WINDOW})
			await h.settled()
			expect(h.queue.snapshot()[0]).not.toHaveProperty('probeTake')
			expect(h.probes[0]).not.toHaveProperty('playlistScope')
		})

		it("a Retry keeps the row's count and its scope", async () => {
			h.answer(fail({kind: 'other', code: 'unknown', message: 'offline'}))
			await h.intake.add({requestId: 'r1', url: MIXED_URL, playlistMode: 'playlist', take: {kind: 'first', count: 2}, origin: WINDOW})
			await h.settled()
			const itemId = h.queue.snapshot()[0]?.id ?? ''
			expect(h.queue.snapshot()[0]).toMatchObject({status: 'error', probeTake: {kind: 'first', count: 2}})

			h.answer(ok(playlist(5)))
			expect(h.intake.retry({requestId: 'r2', itemId, origin: 'window'}).ok).toBe(true)
			await h.settled()
			expect(h.probes.at(-1)).toEqual({url: MIXED_URL, playlistMode: 'playlist', ownerKey: itemId, playlistScope: {items: {kind: 'first', count: 2}}})
			expect(h.queue.snapshot().map(row => row.url)).toEqual(['https://youtu.be/v1', 'https://youtu.be/v2'])
			expect(outcomes(h).at(-1)).toEqual({requestId: 'r2', kind: 'queued', itemId, skippedAlreadyQueued: 0})
		})

		it('a Retry of a restored probe-error row keeps the count saved on it', async () => {
			const restored = makeItem({id: 'restored', status: 'error', url: MIXED_URL, title: MIXED_URL, job: {kind: 'unresolved', extractor: '', extractorKey: ''}, probeMode: 'playlist', probeTake: {kind: 'first', count: 2}, error: {kind: 'unknown', raw: 'App restarted while fetching video details'}})
			h.queue.add([restored])
			h.answer(ok(playlist(5)))
			expect(h.intake.retry({requestId: 'r1', itemId: 'restored', origin: 'window'}).ok).toBe(true)
			await h.settled()
			expect(h.probes).toEqual([{url: MIXED_URL, playlistMode: 'playlist', ownerKey: 'restored', playlistScope: {items: {kind: 'first', count: 2}}}])
			expect(h.queue.snapshot().map(row => row.url)).toEqual(['https://youtu.be/v1', 'https://youtu.be/v2'])
		})

		// Resolution never asks about a row that has a count, but the queue lets
		// one wait for a choice; the answer then decides, not the count it was placed with.
		it('a widening choice overrides the count the row was placed with', async () => {
			h.answer(fail({kind: 'other', code: 'unknown', message: 'offline'}))
			await h.intake.add({requestId: 'r1', url: MIXED_URL, playlistMode: 'playlist', take: {kind: 'first', count: 2}, origin: WINDOW})
			await h.settled()
			const itemId = h.queue.snapshot()[0]?.id ?? ''
			expect(h.queue.reprobe(itemId).ok).toBe(true)
			expect(h.queue.needsChoice(itemId, {kind: 'list-size', loaded: 4, capped: true}, 'Road trip mix').ok).toBe(true)

			h.answer(ok(playlist(5)))
			expect(h.intake.choose({requestId: 'r2', itemId, origin: 'window', take: 'all'}).ok).toBe(true)
			await h.settled()
			expect(h.probes.at(-1)).toEqual({url: MIXED_URL, playlistMode: 'playlist', ownerKey: itemId, playlistScope: {items: {kind: 'first', count: 5000}}})
			expect(h.queue.snapshot()).toHaveLength(5)
		})

		it('a First N choice probes the N it offered, not the count the row was placed with', async () => {
			h.answer(fail({kind: 'other', code: 'unknown', message: 'offline'}))
			await h.intake.add({requestId: 'r1', url: MIXED_URL, playlistMode: 'playlist', take: {kind: 'first', count: 2}, origin: WINDOW})
			await h.settled()
			const itemId = h.queue.snapshot()[0]?.id ?? ''
			expect(h.queue.reprobe(itemId).ok).toBe(true)
			expect(h.queue.needsChoice(itemId, {kind: 'list-size', loaded: 4, capped: true}, 'Road trip mix').ok).toBe(true)

			h.answer(ok(playlist(5)))
			expect(h.intake.choose({requestId: 'r2', itemId, origin: 'window', take: 'first'}).ok).toBe(true)
			await h.settled()
			expect(h.probes.at(-1)).toEqual({url: MIXED_URL, playlistMode: 'playlist', ownerKey: itemId, playlistScope: {items: {kind: 'first', count: 4}}})
			expect(h.queue.snapshot()).toHaveLength(4)
		})
	})

	it('a failure with no words of its own reads the localized fallback', async () => {
		h.answer(fail({kind: 'other', code: 'unknown', message: ''}))
		await h.intake.add({requestId: 'r1', url: VIDEO_URL, playlistMode: 'video', origin: WINDOW})
		await h.settled()
		expect(h.queue.snapshot()[0]?.error).toEqual({kind: 'unknown', raw: 'text:wizard.url.quickProbeFailed'})
	})
})
