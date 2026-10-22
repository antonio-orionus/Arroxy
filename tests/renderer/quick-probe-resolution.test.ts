import {beforeEach, describe, expect, it} from 'vite-plus/test'
import {resolvePinnedQuickProbe, scopeForTake, widenForSkip, type QuickProbeContext, type QuickProbeResolution} from '@shared/intake/probeResolution.js'
import {pinActiveDownloadProfile, rendererPreparationEnv} from '@renderer/store/wizard/queueSubmission.js'
import type {AppState} from '@renderer/store/types.js'
import type {Result} from '@shared/result.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {defaultAppSettings} from '@shared/constants.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {i18next} from '@shared/i18n/index.js'
import {fail, ok} from '@shared/result.js'
import type {PlaylistEntry, ProbeError, ProbeResult, QueueItem} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// What a quick download's placeholder row becomes once its probe answers. One
// rule set for every entry point (URL tab, Explore, the hotkey): a video or a
// collection under the load limit is queued, a collection over it or one the
// link did not announce waits for the user's choice, and a failure is kept
// with the error the row's guidance is built from.

const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLtest'
const VIDEO_URL = 'https://www.youtube.com/watch?v=abc'
const MIXED_URL = 'https://www.youtube.com/watch?v=abc&list=PLtest'
const VIDEO: Extract<ProbeResult, {kind: 'video'}> = {
	kind: 'video',
	extractor: 'youtube',
	extractorKey: 'Youtube',
	webpageUrl: 'https://www.youtube.com/watch?v=abc',
	isAudioOnlySource: false,
	title: 'Fixture Video',
	thumbnail: '',
	duration: 60,
	videoId: 'abc',
	uploader: '',
	uploadDate: '',
	formats: [],
	subtitles: {},
	automaticCaptions: {}
} as unknown as Extract<ProbeResult, {kind: 'video'}>

function entries(count: number): PlaylistEntry[] {
	return Array.from({length: count}, (_, index) => ({id: `e${index + 1}`, title: `Entry ${index + 1}`, url: `https://youtu.be/v${index + 1}`, thumbnail: '', duration: 60, playlistIndex: index + 1, videoId: `v${index + 1}`}))
}

function playlist(count: number): Extract<ProbeResult, {kind: 'playlist'}> {
	return {kind: 'playlist', extractor: 'youtube:tab', extractorKey: 'YoutubeTab', webpageUrl: PLAYLIST_URL, isAudioOnlySource: false, playlistTitle: 'Road trip mix', playlistId: 'PLtest', isMultiVideo: false, entries: entries(count)}
}

// Main resolves with the row's pinned profile; these rows were placed with the active one.
function resolveQuickProbe(result: Result<ProbeResult, ProbeError>, context: QuickProbeContext, current: AppState): QuickProbeResolution {
	return resolvePinnedQuickProbe(result, {...context, profile: context.profile ?? pinActiveDownloadProfile(current)}, current, {
		...rendererPreparationEnv(),
		probeFailedText: () => i18next.t('wizard.url.quickProbeFailed'),
		prepareFailedText: () => i18next.t('wizard.url.quickPrepareFailed'),
		outputMissingText: () => i18next.t('wizard.url.profile.outputMissing')
	})
}

function state(queue: QueueItem[] = []) {
	Object.defineProperty(globalThis, 'window', {configurable: true, value: {appApi: buildMockAppApi()}})
	useAppStore.setState({...RESET_WIZARD_STATE, settings: defaultAppSettings('/tmp'), wizardOutputDir: '/tmp', queue})
	return useAppStore.getState()
}

beforeEach(() => {
	state()
})

describe('resolveQuickProbe', () => {
	it('names a profile with no output folder in the app language on the row', () => {
		const base = defaultAppSettings('/tmp')
		const balanced = BUILTIN_DOWNLOAD_PROFILES.find(profile => profile.id === 'balanced')
		if (!balanced) throw new Error('expected the balanced profile')
		useAppStore.setState({...RESET_WIZARD_STATE, settings: {...base, profiles: {...base.profiles, overrides: [{...balanced, output: {kind: 'fixed', dir: ' '}}]}}, wizardOutputDir: '/tmp', queue: []})

		const resolution = resolveQuickProbe(ok(VIDEO), {url: VIDEO_URL, playlistMode: 'video', limit: 100}, useAppStore.getState())
		expect(resolution.kind).toBe('failed')
		expect(JSON.stringify(resolution)).toContain(i18next.t('wizard.url.profile.outputMissing'))
	})

	it('queues a video with the active profile', () => {
		const resolution = resolveQuickProbe(ok(VIDEO), {url: VIDEO_URL, playlistMode: 'video', limit: 100}, state())
		expect(resolution.kind).toBe('queue')
		if (resolution.kind === 'queue') expect(resolution.prepared.items.map(item => item.title)).toEqual(['Fixture Video'])
	})

	it('expands a collection link under the load limit into its videos', () => {
		const resolution = resolveQuickProbe(ok(playlist(3)), {url: PLAYLIST_URL, playlistMode: 'playlist', limit: 100}, state())
		expect(resolution.kind).toBe('queue')
		if (resolution.kind === 'queue') {
			expect(resolution.prepared.items).toHaveLength(3)
			expect(resolution.prepared.manifest?.playlistTitle).toBe('Road trip mix')
		}
	})

	// One size question (spec §3.7): it carries how many videos the probe kept
	// and whether the list goes on past them. A plain list link asks only past
	// the load limit; a list the link did not announce (another site's, or a
	// video link that probed as a list) always asks, capped or not.
	describe('the size question', () => {
		const OTHER_SITE = 'https://media.example/course/42'
		it.each([
			{name: 'a plain list link under the limit queues', url: PLAYLIST_URL, mode: 'playlist', found: 3, limit: 100, expected: null},
			{name: 'a plain list link past the limit asks, capped', url: PLAYLIST_URL, mode: 'playlist', found: 3, limit: 2, expected: {loaded: 2, capped: true}},
			{name: "another site's list under the limit asks, uncapped", url: OTHER_SITE, mode: 'auto', found: 3, limit: 100, expected: {loaded: 3, capped: false}},
			{name: "another site's list past the limit asks, capped", url: OTHER_SITE, mode: 'auto', found: 3, limit: 2, expected: {loaded: 2, capped: true}},
			{name: 'a video link that probed as a list asks, uncapped', url: VIDEO_URL, mode: 'video', found: 3, limit: 100, expected: {loaded: 3, capped: false}}
		] as const)('$name', ({url, mode, found, limit, expected}) => {
			// The probe asks for one entry past the limit; seeing it means "more".
			const resolution = resolveQuickProbe(ok(playlist(found)), {url, playlistMode: mode, limit}, state())
			if (expected === null) expect(resolution.kind).toBe('queue')
			else expect(resolution).toMatchObject({kind: 'needs-choice', choice: {kind: 'list-size', ...expected}, title: 'Road trip mix'})
		})

		// Rule 4: the count is part of the answer, so a row that carries one is
		// never asked again, Review included.
		it.each([
			{name: 'a plain list link past the limit', url: PLAYLIST_URL, mode: 'playlist'},
			{name: "another site's list", url: OTHER_SITE, mode: 'auto'},
			{name: 'a video link that probed as a list', url: VIDEO_URL, mode: 'video'}
		] as const)('$name with a take queues without asking', ({url, mode}) => {
			expect(resolveQuickProbe(ok(playlist(5)), {url, playlistMode: mode, limit: 2, take: {kind: 'first', count: 2}}, state()).kind).toBe('queue')
			expect(resolveQuickProbe(ok(playlist(5)), {url, playlistMode: mode, limit: 5000, take: {kind: 'all'}}, state()).kind).toBe('queue')
		})
	})

	it('queues a mixed link answered "whole playlist" without a review', () => {
		const resolution = resolveQuickProbe(ok(playlist(3)), {url: `${VIDEO_URL}&list=PLtest`, playlistMode: 'playlist', limit: 100}, state())
		expect(resolution.kind).toBe('queue')
	})

	// Background preparation names nothing after the URL tab's field or the
	// wizard's last playlist.
	it('never reads the wizard state for a fallback', () => {
		useAppStore.setState({wizardUrl: 'https://typed.example/elsewhere', playlistTitle: 'Wizard playlist'})
		const untitled = {...playlist(2), playlistTitle: ''}
		const resolution = resolveQuickProbe(ok(untitled), {url: PLAYLIST_URL, playlistMode: 'playlist', limit: 100}, useAppStore.getState())
		expect(resolution.kind === 'queue' && resolution.prepared.manifest?.playlistTitle).toBe('Playlist')
		const noPage = {...VIDEO, webpageUrl: ''}
		const video = resolveQuickProbe(ok(noPage), {url: VIDEO_URL, playlistMode: 'video', limit: 100}, useAppStore.getState())
		expect(video.kind === 'queue' && video.prepared.items[0]?.url).toBe(VIDEO_URL)
	})

	it('queues only the first N once the user chose First N', () => {
		const resolution = resolveQuickProbe(ok(playlist(5)), {url: PLAYLIST_URL, playlistMode: 'playlist', limit: 2, take: {kind: 'first', count: 2}}, state())
		expect(resolution.kind).toBe('queue')
		if (resolution.kind === 'queue') expect(resolution.prepared.items.map(item => item.url)).toEqual(['https://youtu.be/v1', 'https://youtu.be/v2'])
	})

	it('queues everything the wider probe found once the user chose All', () => {
		const resolution = resolveQuickProbe(ok(playlist(5)), {url: PLAYLIST_URL, playlistMode: 'playlist', limit: 5000, take: {kind: 'all'}}, state())
		expect(resolution.kind === 'queue' && resolution.prepared.items.length).toBe(5)
	})

	it('a take larger than the list queues every entry without a choice', () => {
		const resolution = resolveQuickProbe(ok(playlist(3)), {url: MIXED_URL, playlistMode: 'playlist', limit: 10, take: {kind: 'first', count: 10}}, state())
		expect(resolution.kind).toBe('queue')
		if (resolution.kind === 'queue') expect(resolution.prepared.items).toHaveLength(3)
	})

	it('a take stops the cap question even when the probe found more than the take', () => {
		const resolution = resolveQuickProbe(ok(playlist(5)), {url: MIXED_URL, playlistMode: 'playlist', limit: 2, take: {kind: 'first', count: 2}}, state())
		expect(resolution.kind).toBe('queue')
	})

	it('reports nothing new when every video is already live in the queue', () => {
		const live = entries(2).map((entry, index) => ({id: `q${index}`, url: entry.url, status: 'pending'}) as QueueItem)
		expect(resolveQuickProbe(ok(playlist(2)), {url: PLAYLIST_URL, playlistMode: 'playlist', limit: 100}, state(live))).toEqual({kind: 'nothing-new', skippedAlreadyQueued: 2})
	})

	it('keeps a yt-dlp failure verbatim for the row and its guidance', () => {
		const error = {kind: 'ytdlp', error: {kind: 'botBlock', raw: 'Sign in to confirm'}} as const
		expect(resolveQuickProbe(fail(error), {url: PLAYLIST_URL, playlistMode: 'video', limit: 100}, state())).toEqual({kind: 'failed', error: {kind: 'botBlock', raw: 'Sign in to confirm'}, probeError: error})
	})

	it('turns any other probe failure into an unknown row error with its message', () => {
		const error = {kind: 'other', code: 'invalid_url', message: 'Unsupported URL'} as const
		expect(resolveQuickProbe(fail(error), {url: PLAYLIST_URL, playlistMode: 'auto', limit: 100}, state())).toEqual({kind: 'failed', error: {kind: 'unknown', raw: 'Unsupported URL'}, probeError: error})
	})

	// The row keeps everything the probe said, so its guidance reads the same
	// text as the toast's (DPAPI detection reads the details).
	it('keeps the details of any other probe failure on the row', () => {
		const error = {kind: 'other', code: 'unknown', message: 'Cookies could not be read', details: 'ERROR: Failed to decrypt with DPAPI'} as const
		expect(resolveQuickProbe(fail(error), {url: VIDEO_URL, playlistMode: 'video', limit: 100}, state())).toMatchObject({kind: 'failed', error: {kind: 'unknown', raw: 'Cookies could not be read\nERROR: Failed to decrypt with DPAPI'}})
	})

	it('fails a collection with nothing queueable in it', () => {
		const containers = {...playlist(2), entries: entries(2).map(entry => ({...entry, isContainer: true as const}))}
		const resolution = resolveQuickProbe(ok(containers), {url: PLAYLIST_URL, playlistMode: 'playlist', limit: 100}, state())
		expect(resolution).toMatchObject({kind: 'failed', probeError: null})
	})
})

// A list placed by a row's list offer leaves out the video the hotkey already
// took, whatever the answer: All, First N (counted after the skip) or Review.
describe("the list offer's skipped video", () => {
	const queued = (resolution: QuickProbeResolution): string[] => (resolution.kind === 'queue' ? resolution.prepared.items.map(item => item.url) : [])

	it('queues the list without the video', () => {
		expect(queued(resolveQuickProbe(ok(playlist(4)), {url: MIXED_URL, playlistMode: 'playlist', limit: 3, skipVideoId: 'v2'}, state()))).toEqual(['https://youtu.be/v1', 'https://youtu.be/v3', 'https://youtu.be/v4'])
	})

	it('asks past the limit, counting after the skip, and the review leaves the video out', () => {
		const resolution = resolveQuickProbe(ok(playlist(5)), {url: MIXED_URL, playlistMode: 'playlist', limit: 3, skipVideoId: 'v2'}, state())
		expect(resolution).toMatchObject({kind: 'needs-choice', choice: {kind: 'list-size', loaded: 3, capped: true}})
		if (resolution.kind === 'needs-choice') expect(resolution.probe.entries.map(entry => entry.videoId)).not.toContain('v2')
	})

	it('First N counts the list after the skip', () => {
		expect(queued(resolveQuickProbe(ok(playlist(3)), {url: MIXED_URL, playlistMode: 'playlist', limit: 2, take: {kind: 'first', count: 2}, skipVideoId: 'v1'}, state()))).toEqual(['https://youtu.be/v2', 'https://youtu.be/v3'])
	})

	it('All leaves the video out', () => {
		expect(queued(resolveQuickProbe(ok(playlist(3)), {url: MIXED_URL, playlistMode: 'playlist', limit: 5000, take: {kind: 'all'}, skipVideoId: 'v3'}, state()))).toEqual(['https://youtu.be/v1', 'https://youtu.be/v2'])
	})

	// The duplicate check only sees rows still live; a finished video would come back.
	it('leaves the video out even once its own row has finished', () => {
		const done = {id: 'done', url: 'https://youtu.be/v1', status: 'done'} as QueueItem
		expect(queued(resolveQuickProbe(ok(playlist(2)), {url: MIXED_URL, playlistMode: 'playlist', limit: 100, skipVideoId: 'v1'}, state([done])))).toEqual(['https://youtu.be/v2'])
	})
})

describe('widenForSkip', () => {
	it('looks one entry further, so a count holds after the skip', () => {
		expect(widenForSkip({items: {kind: 'first', count: 7}})).toEqual({items: {kind: 'first', count: 8}})
	})

	it('stays at the load ceiling', () => {
		expect(widenForSkip({items: {kind: 'first', count: 5000}})).toEqual({items: {kind: 'first', count: 5000}})
	})
})

describe('scopeForTake', () => {
	it('looks at exactly the first N for a count, and as wide as the load ceiling for All', () => {
		expect(scopeForTake({kind: 'first', count: 7})).toEqual({items: {kind: 'first', count: 7}})
		expect(scopeForTake({kind: 'all'})).toEqual({items: {kind: 'first', count: 5000}})
	})
})
