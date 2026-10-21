import {beforeEach, describe, expect, it} from 'vite-plus/test'
import {resolvePinnedQuickProbe, type QuickProbeContext, type QuickProbeResolution} from '@shared/intake/probeResolution.js'
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

// What a quick download's placeholder row becomes once its probe answers. One
// rule set for every entry point (URL tab, Explore, the hotkey): a video or a
// collection under the load limit is queued, a collection over it or one the
// link did not announce waits for the user's choice, and a failure is kept
// with the error the row's guidance is built from.

const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLtest'
const VIDEO_URL = 'https://www.youtube.com/watch?v=abc'
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
	return resolvePinnedQuickProbe(result, {...context, profile: context.profile ?? pinActiveDownloadProfile(current)}, current, {...rendererPreparationEnv(), probeFailedText: () => i18next.t('wizard.url.quickProbeFailed'), prepareFailedText: () => i18next.t('wizard.url.quickPrepareFailed'), outputMissingText: () => i18next.t('wizard.url.profile.outputMissing')})
}

function state(queue: QueueItem[] = []) {
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

	it('asks how many to queue when the probe stopped at the load limit', () => {
		// The probe asks for one entry past the limit; seeing it means "more".
		const resolution = resolveQuickProbe(ok(playlist(3)), {url: PLAYLIST_URL, playlistMode: 'playlist', limit: 2}, state())
		expect(resolution).toMatchObject({kind: 'needs-choice', choice: {kind: 'playlist-cap', loaded: 2}, capped: true, title: 'Road trip mix'})
	})

	it('asks for a review when a link that was not a collection turned out to be one', () => {
		const resolution = resolveQuickProbe(ok(playlist(3)), {url: 'https://media.example/course/42', playlistMode: 'auto', limit: 100}, state())
		expect(resolution).toMatchObject({kind: 'needs-choice', choice: {kind: 'playlist-review', count: 3}, capped: false})
	})

	// The old rule: a collection result is reviewed unless the link was an
	// obvious collection or the user answered "whole playlist" to the mixed prompt.
	it('asks for a review when a video link probes as a list', () => {
		expect(resolveQuickProbe(ok(playlist(3)), {url: VIDEO_URL, playlistMode: 'video', limit: 100}, state())).toMatchObject({kind: 'needs-choice', choice: {kind: 'playlist-review'}})
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
