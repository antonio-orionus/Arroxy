// @vitest-environment jsdom
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {setNotificationSink, type NotificationLevel} from '@renderer/lib/notify.js'
import {defaultAppSettings} from '@shared/constants.js'
import {fail, ok} from '@shared/result.js'
import type {PlaylistEntry, ProbeError, ProbeResult} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// A wizard run remembers the tab it started from. Started in Explore (the
// interactive button, or a Download that turns into a playlist review), every
// way back to the download home lands on Explore: Back from the first step,
// Start over, and a successful queue. A run started on the URL tab leaves the
// tab alone, as before. The landing never depends on where the hash was left.

const WATCH_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLtest'
const ENTRIES: PlaylistEntry[] = ['a', 'b', 'c'].map((id, index) => ({id, title: `Entry ${id}`, url: `https://youtu.be/${id}`, thumbnail: '', duration: 60, playlistIndex: index + 1, videoId: id}))
const PLAYLIST_PROBE: Extract<ProbeResult, {kind: 'playlist'}> = {kind: 'playlist', extractor: 'youtube:tab', extractorKey: 'YoutubeTab', webpageUrl: PLAYLIST_URL, isAudioOnlySource: false, playlistTitle: 'Road trip mix', playlistId: 'PLtest', isMultiVideo: false, entries: ENTRIES}

const notices: {level: NotificationLevel; message: string; id: string}[] = []

function setHash(hash: string): void {
	window.history.replaceState(null, '', hash)
}

beforeEach(() => {
	window.appApi = buildMockAppApi()
	notices.length = 0
	setNotificationSink((level, message, id) => notices.push({level, message, id}))
	vi.spyOn(console, 'info').mockImplementation(() => {})
	useAppStore.setState({...RESET_WIZARD_STATE, settings: defaultAppSettings('/tmp'), wizardOutputDir: '/tmp', queue: []})
})

afterEach(() => {
	setNotificationSink(null)
	vi.restoreAllMocks()
	setHash('#download')
})

async function startFromExplore(): Promise<void> {
	setHash('#explore')
	useAppStore.getState().setWizardUrl(WATCH_URL)
	await useAppStore.getState().submitUrl('explore')
	expect(useAppStore.getState().wizardStep).toBe('formats')
	// Whatever the hash says while the steps are up, the landing is the origin's.
	setHash('#download')
}

describe('wizard run started in Explore', () => {
	it('Back from the first step lands on Explore', async () => {
		await startFromExplore()

		useAppStore.getState().back()

		expect(useAppStore.getState().wizardStep).toBe('url')
		expect(window.location.hash).toBe('#explore')
	})

	it('Start over lands on Explore', async () => {
		await startFromExplore()

		useAppStore.getState().reset()

		expect(useAppStore.getState().wizardStep).toBe('url')
		expect(window.location.hash).toBe('#explore')
	})

	it('a successful queue lands on Explore', async () => {
		await startFromExplore()

		await useAppStore.getState().addToQueue()

		expect(window.appApi.queue.cmd.add).toHaveBeenCalledTimes(1)
		expect(useAppStore.getState().wizardStep).toBe('url')
		expect(window.location.hash).toBe('#explore')
	})

	it('forgets the origin once it has landed', async () => {
		await startFromExplore()
		useAppStore.getState().back()
		expect(useAppStore.getState().wizardOrigin).toBe('download')

		setHash('#download')
		await useAppStore.getState().submitUrl()
		useAppStore.getState().back()
		expect(window.location.hash).toBe('#download')
	})
})

describe('wizard run started on the URL tab', () => {
	it('leaves the tab alone on Back and Start over', async () => {
		setHash('#download')
		useAppStore.getState().setWizardUrl(WATCH_URL)
		await useAppStore.getState().submitUrl()
		useAppStore.getState().back()
		expect(window.location.hash).toBe('#download')

		await useAppStore.getState().submitUrl()
		useAppStore.getState().reset()
		expect(window.location.hash).toBe('#download')
	})
})

// The origin belongs to one run. A retry within that run keeps it; leaving the
// run (Settings) or starting another from the URL tab drops it.
describe('the wizard origin across retries and other runs', () => {
	const botBlock: ProbeError = {kind: 'ytdlp', error: {kind: 'botBlock', raw: 'Sign in to confirm'}}

	it('Retry from the error step keeps the Explore origin', async () => {
		vi.mocked(window.appApi.downloads.probe).mockResolvedValueOnce(fail(botBlock))
		setHash('#explore')
		useAppStore.getState().setWizardUrl(WATCH_URL)
		await useAppStore.getState().submitUrl('explore')
		expect(useAppStore.getState().wizardStep).toBe('error')
		setHash('#download')

		await useAppStore.getState().retry()
		expect(useAppStore.getState().wizardStep).toBe('formats')
		expect(useAppStore.getState().wizardOrigin).toBe('explore')

		useAppStore.getState().back()
		expect(window.location.hash).toBe('#explore')
	})

	it('opening the advanced settings ends the run and its origin', async () => {
		await startFromExplore()

		useAppStore.getState().openAdvancedSettings('cookies')

		expect(useAppStore.getState().wizardStep).toBe('url')
		expect(useAppStore.getState().wizardOrigin).toBe('download')
	})

	// A Download from Explore prepares in the background (a row in
	// Downloads), so it starts no wizard run and leaves the origin alone.
	it('a Download from Explore starts no wizard run', async () => {
		setHash('#explore')
		await useAppStore.getState().quickDownload({url: WATCH_URL, entry: 'explore'})
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'url', wizardOrigin: 'download'})
		vi.mocked(window.appApi.downloads.probe).mockResolvedValue(ok(PLAYLIST_PROBE))
		setHash('#download')

		// A single collection link from Bulk URLs opens its review, a URL-tab run.
		await useAppStore.getState().quickDownloadUrls(['https://media.example/collection/42'])
		expect(useAppStore.getState().wizardOrigin).toBe('download')
		useAppStore.getState().reset()

		expect(window.location.hash).toBe('#download')
	})
})
