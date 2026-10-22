import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {createHotkeyMock, type HotkeyMock} from '@renderer/dev/hotkeyMock.js'
import {createIntakeMock} from '@renderer/dev/intakeMock.js'
import {defaultAppSettings} from '@shared/constants.js'
import {transition, type QueueEvent} from '@shared/queueTransition.js'
import {fail, ok, type Result} from '@shared/result.js'
import type {AppSettings, HotkeyOutcomeEvent, PlaylistEntry, ProbeError, ProbeResult, QueueItem} from '@shared/types.js'

// The browser mock's hotkey answers a press with main's rules: an ack for the
// placement, then one follow-up when the intake ends needing the user. Every
// outcome is a toast, since the mock window is always focused.

const URL = 'https://www.youtube.com/watch?v=one'
const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLtest'

function playlist(count: number): ProbeResult {
	const entries: PlaylistEntry[] = Array.from({length: count}, (_, index) => ({id: `e${index + 1}`, title: `Entry ${index + 1}`, url: `https://youtu.be/v${index + 1}`, thumbnail: '', duration: 60, playlistIndex: index + 1, videoId: `v${index + 1}`}))
	return {kind: 'playlist', extractor: 'youtube:tab', extractorKey: 'YoutubeTab', webpageUrl: PLAYLIST_URL, isAudioOnlySource: false, playlistTitle: 'Road trip mix', playlistId: 'PLtest', isMultiVideo: false, entries}
}

interface Harness {
	hotkey: HotkeyMock
	rows: QueueItem[]
	settings: AppSettings
	heard: HotkeyOutcomeEvent[]
	answer(result: Result<ProbeResult, ProbeError>): void
}

// The real intake mock over an in-memory queue; only the probe is scripted.
function harness(): Harness {
	vi.stubGlobal('window', {platform: 'linux'})
	const rows: QueueItem[] = []
	const settings = defaultAppSettings('/downloads')
	let next: Result<ProbeResult, ProbeError> = fail({kind: 'other', code: 'unknown', message: 'offline'})
	const intake = createIntakeMock({
		probe: () => Promise.resolve(next),
		add: items => {
			rows.push(...items)
			return Promise.resolve(ok({ids: items.map(item => item.id), skippedAlreadyQueued: 0}))
		},
		replaceProbing: ({itemId, items}) => {
			rows.splice(
				rows.findIndex(row => row.id === itemId),
				1,
				...items
			)
			return Promise.resolve(ok({ids: items.map(item => item.id), skippedAlreadyQueued: 0}))
		},
		items: () => rows,
		transition: (itemId: string, event: QueueEvent) => {
			const index = rows.findIndex(row => row.id === itemId)
			const row = rows[index]
			if (!row) return Promise.resolve(fail({code: 'validation', message: `no row ${itemId}`}))
			rows[index] = transition(row, event)
			return Promise.resolve(ok(undefined))
		},
		settings: () => settings,
		clearListOffer: itemId => {
			const index = rows.findIndex(row => row.id === itemId)
			const row = rows[index]
			if (row) rows[index] = {...row, listOffer: undefined}
		}
	})
	const hotkey = createHotkeyMock({intake: intake.hotkey, state: () => ({accelerator: 'CommandOrControl+Shift+D', registered: true})})
	const heard: HotkeyOutcomeEvent[] = []
	hotkey.onOutcome(event => heard.push(event))
	return {
		hotkey,
		rows,
		settings,
		heard,
		answer: result => {
			next = result
		}
	}
}

describe('browser mock hotkey', () => {
	let h: Harness
	beforeEach(() => {
		h = harness()
	})
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	it('answers a press with no single link at once, taking nothing in', async () => {
		await h.hotkey.press({kind: 'empty'})
		await h.hotkey.press({kind: 'single', url: 'not a url at all'})
		await h.hotkey.press({kind: 'multiple'})
		expect(h.heard).toEqual([
			{outcome: 'invalid-clipboard', toast: true},
			{outcome: 'invalid-clipboard', toast: true},
			{outcome: 'multiple-urls', toast: true}
		])
		expect(h.rows).toEqual([])
	})

	it('follows a failed probe up after the ack, keyed by the same intake', async () => {
		await h.hotkey.press({kind: 'single', url: URL})
		await vi.waitFor(() => expect(h.heard).toHaveLength(2))
		const intakeId = h.rows[0]?.origin?.intakeId
		expect(intakeId).toEqual(expect.any(String))
		expect(h.heard).toEqual([
			{outcome: 'queued', intakeId, toast: true},
			{outcome: 'submission-failed', intakeId, toast: true}
		])
		expect(h.rows[0]).toMatchObject({status: 'error', origin: {kind: 'hotkey'}})
	})

	it('follows a playlist that needs a choice up as needing review', async () => {
		h.settings.common = {...h.settings.common, playlistProbeLimit: 2}
		h.answer(ok(playlist(3)))
		await h.hotkey.press({kind: 'single', url: PLAYLIST_URL})
		await vi.waitFor(() => expect(h.heard.map(event => event.outcome)).toEqual(['queued', 'needs-review']))
		expect(h.rows[0]?.status).toBe('needs-choice')
	})

	it('runs the Settings test press through the same rules', async () => {
		expect(await h.hotkey.api.testPress()).toEqual(ok(undefined))
		await vi.waitFor(() => expect(h.heard.map(event => event.outcome)).toEqual(['queued', 'submission-failed']))
	})
})
