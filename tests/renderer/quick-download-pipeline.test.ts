// @vitest-environment jsdom
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {handleHotkeyTrigger} from '@renderer/store/wizard/hotkeyTrigger.js'
import {keptChoiceProbe} from '@renderer/store/quickDownload/quickDownloadPipeline.js'
import {setNotificationSink, type NotificationActions, type NotificationLevel} from '@renderer/lib/notify.js'
import {defaultAppSettings} from '@shared/constants.js'
import {fail, ok} from '@shared/result.js'
import type {AppApi, SettingsPatch} from '@shared/api.js'
import type {ProbeError, QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'
import {armQueue, BOT_BLOCK, deferredProbe as deferredProbeOn, entries, OTHER_URL, playlist, PLAYLIST_URL, queue, row, VIDEO, VIDEO_URL, type DeferredProbe} from '../shared/quickDownloadHarness.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// One background pipeline for every quick download: the URL tab, Explore, the
// hotkey, and the Downloads tab's own Retry and choices (P2-R37/R38). The
// harness's queue IPC applies commands through the real state machine, so the
// store's queue reads exactly as main would project it.

interface Toast {
	level: NotificationLevel
	message: string
	id: string
	actions: NotificationActions | undefined
}
const toasts: Toast[] = []

let api: AppApi

function deferredProbe(): DeferredProbe {
	return deferredProbeOn(api)
}

beforeEach(() => {
	api = buildMockAppApi()
	armQueue(api)
	window.appApi = api
	window.history.replaceState(null, '', '#download')
	toasts.length = 0
	setNotificationSink((level, message, id, actions) => toasts.push({level, message, id, actions}))
	useAppStore.setState({...RESET_WIZARD_STATE, settings: defaultAppSettings('/tmp'), wizardOutputDir: '/tmp', queue: [], queueFocus: null, exploreView: null})
})

afterEach(() => {
	setNotificationSink(null)
	vi.restoreAllMocks()
})

describe('Quick Download from the URL tab', () => {
	it('places a probing row at once, says so with View, and clears the input', async () => {
		const probe = deferredProbe()
		useAppStore.setState({wizardUrl: VIDEO_URL})
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})

		expect(queue()).toHaveLength(1)
		const [placeholder] = queue()
		expect(placeholder).toMatchObject({url: VIDEO_URL, title: VIDEO_URL, status: 'probing', probeMode: 'video'})
		expect(probe.calls).toEqual([{url: VIDEO_URL, playlistMode: 'video', ownerKey: placeholder?.id}])
		expect(toasts.map(toast => toast.message)).toEqual(['Added: youtube.com · abc'])
		expect(useAppStore.getState().wizardUrl).toBe('')

		toasts[0]?.actions?.[0].onClick()
		expect(window.location.hash).toBe('#queue')
		expect(useAppStore.getState().queueFocus?.itemId).toBe(placeholder?.id)
	})

	it('swaps the row for the queued video, keeping its id', async () => {
		const probe = deferredProbe()
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})
		const placeholderId = queue()[0]?.id
		probe.resolve(ok(VIDEO))

		await vi.waitFor(() => expect(queue()[0]).toMatchObject({id: placeholderId, status: 'pending', title: 'Fixture Video'}))
		expect(queue()).toHaveLength(1)
	})

	// Another form of the same link went live while the probe ran: the row is
	// a duplicate, not a failure a Retry could ever fix.
	it('drops the row as already queued when the swap meets a live duplicate', async () => {
		const probe = deferredProbe()
		await useAppStore.getState().quickDownload({url: 'https://youtu.be/abc', entry: 'url-tab'})
		const id = queue()[0]?.id ?? ''
		useAppStore.setState({queue: [...queue(), makeItem({id: 'live', status: 'pending', url: VIDEO_URL})]})
		toasts.length = 0
		probe.resolve(ok(VIDEO))

		await vi.waitFor(() => expect(row(id)).toBeUndefined())
		expect(api.queue.cmd.probeFailed).not.toHaveBeenCalled()
		expect(toasts.map(toast => toast.message)).toEqual(['Already in the queue'])
		toasts[0]?.actions?.[0].onClick()
		expect(useAppStore.getState().queueFocus?.itemId).toBe('live')
	})

	// Two overlapping playlists prepared at once: the second swap meets the
	// entries the first one just queued. Its new entries are still queued.
	it('queues the new entries of a playlist that overlaps one prepared at the same time', async () => {
		const probe = deferredProbe()
		const otherPlaylist = 'https://www.youtube.com/playlist?list=PLother'
		await useAppStore.getState().quickDownload({url: PLAYLIST_URL, entry: 'url-tab'})
		await useAppStore.getState().quickDownload({url: otherPlaylist, entry: 'url-tab'})
		const otherId = queue()[1]?.id ?? ''
		toasts.length = 0
		probe.resolve(ok(playlist(3)))
		probe.resolve(ok({...playlist(4), webpageUrl: otherPlaylist, playlistId: 'PLother', entries: entries(4).slice(1)}))

		await vi.waitFor(() => expect(queue().map(item => item.url)).toEqual(['https://youtu.be/v1', 'https://youtu.be/v2', 'https://youtu.be/v3', 'https://youtu.be/v4']))
		expect(row(otherId)?.url).toBe('https://youtu.be/v4')
		expect(toasts.map(toast => toast.message)).toEqual(['2 videos are already in the queue — skipped'])
	})

	it('prepares several links in parallel', async () => {
		const probe = deferredProbe()
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})
		await useAppStore.getState().quickDownload({url: OTHER_URL, entry: 'url-tab'})
		expect(queue().map(item => item.status)).toEqual(['probing', 'probing'])
		expect(probe.calls).toHaveLength(2)
	})

	it('answers Already in the queue for a link that is live, with View on that row', async () => {
		deferredProbe()
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})
		const liveId = queue()[0]?.id
		toasts.length = 0
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})

		expect(queue()).toHaveLength(1)
		expect(toasts.map(toast => toast.message)).toEqual(['Already in the queue'])
		toasts[0]?.actions?.[0].onClick()
		expect(useAppStore.getState().queueFocus?.itemId).toBe(liveId)
	})

	it('keeps the incomplete cookies dialog upfront and places nothing', async () => {
		useAppStore.setState({settings: {...defaultAppSettings('/tmp'), common: {...defaultAppSettings('/tmp').common, cookiesMode: 'file', cookiesPath: ''}}})
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})
		expect(useAppStore.getState().cookiesConfigDialogIssue).not.toBeNull()
		expect(queue()).toEqual([])
	})

	it('asks "this video or the whole playlist?" first, then places the answer', async () => {
		const probe = deferredProbe()
		const mixed = 'https://www.youtube.com/watch?v=abc&list=PLtest'
		useAppStore.setState({wizardUrl: mixed})
		await useAppStore.getState().quickDownload({url: mixed, entry: 'url-tab'})
		expect(useAppStore.getState()).toMatchObject({mixedUrlPromptOpen: true, mixedUrlPending: mixed, mixedUrlPromptSource: 'url-tab'})
		expect(queue()).toEqual([])

		await useAppStore.getState().dismissMixedPrompt('playlist')
		expect(queue()[0]).toMatchObject({url: mixed, probeMode: 'playlist', status: 'probing'})
		expect(probe.calls[0]?.playlistMode).toBe('playlist')
		expect(useAppStore.getState().wizardUrl).toBe('')
	})
})

// The wizard's own cancel (a new URL, Enter, leaving for cookie settings)
// reaches main as probeCancel(), which aborts unkeyed probes only (see
// probe-service tests). Here main is modelled that way: a placeholder's keyed
// probe keeps running and its row is never failed.
describe('the wizard cancelling its probes', () => {
	it('leaves a probing row alone across Enter and Open cookies settings', async () => {
		const probe = deferredProbe()
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})
		const id = queue()[0]?.id ?? ''

		useAppStore.getState().setWizardUrl(OTHER_URL)
		const submitting = useAppStore.getState().submitUrl()
		useAppStore.getState().openCookiesSettings()
		expect(api.downloads.probeCancel).toHaveBeenCalled()
		expect(probe.calls.filter(call => call.ownerKey === id)).toHaveLength(1)

		probe.resolve(ok(VIDEO))
		await vi.waitFor(() => expect(row(id)?.status).toBe('pending'))
		probe.resolve(ok(VIDEO))
		await submitting
		expect(api.queue.cmd.probeFailed).not.toHaveBeenCalled()
		expect(toasts.filter(toast => toast.level === 'error')).toEqual([])
	})
})

// The row is labelled with the profile active when the link was placed, and
// its folder resolved then. Switching profile (or folder) while the probe runs
// must not change what that link downloads as, or where it lands.
describe('a profile switch while a quick download prepares', () => {
	function activate(id: string, wizardOutputDir: string): void {
		const settings = useAppStore.getState().settings
		if (!settings) throw new Error('no settings')
		useAppStore.setState({wizardOutputDir, settings: {...settings, profiles: {...settings.profiles, active: {kind: 'builtin', id}}}})
	}

	async function placeAsAudioThenSwitch(url: string): Promise<string> {
		activate('audio-only', '/music')
		await useAppStore.getState().quickDownload({url, entry: 'url-tab'})
		const id = queue()[0]?.id ?? ''
		expect(row(id)).toMatchObject({formatLabel: 'Audio only · best', outputDir: '/music/Audio only'})
		activate('balanced', '/videos')
		return id
	}

	it('downloads with the profile and folder the row was placed with', async () => {
		const probe = deferredProbe()
		const id = await placeAsAudioThenSwitch(VIDEO_URL)
		probe.resolve(ok(VIDEO))

		await vi.waitFor(() => expect(row(id)?.status).toBe('pending'))
		expect(row(id)).toMatchObject({formatLabel: 'Audio only · best', outputDir: '/music/Audio only'})
		expect(row(id)?.job).toMatchObject({intent: {kind: 'audio-only'}})
	})

	// The store's queue is a projection flushed on animation frames, which do
	// not run while the window is hidden. A second link placed then (the
	// hotkey) sees a queue without the first row; the first keeps its profile.
	it('keeps the profile of a row the queue projection does not show yet', async () => {
		const probe = deferredProbe()
		const project = api.queue.cmd.add
		let unprojected: QueueItem | undefined
		api.queue.cmd.add = vi.fn((items: QueueItem[]) => {
			unprojected = items[0]
			return Promise.resolve(ok({ids: items.map(item => item.id), skippedAlreadyQueued: 0}))
		})
		activate('audio-only', '/music')
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})
		api.queue.cmd.add = project
		await useAppStore.getState().quickDownload({url: OTHER_URL, entry: 'url-tab'})
		if (!unprojected) throw new Error('expected the first row')
		const first = unprojected
		useAppStore.setState({queue: [first, ...queue()]})
		activate('balanced', '/videos')
		probe.resolve(ok(VIDEO))

		await vi.waitFor(() => expect(row(first.id)?.status).toBe('pending'))
		expect(row(first.id)).toMatchObject({formatLabel: 'Audio only · best', outputDir: '/music/Audio only'})
	})

	it('keeps them when the review queues the loaded videos', async () => {
		const probe = deferredProbe()
		const settings = useAppStore.getState().settings
		if (!settings) throw new Error('no settings')
		useAppStore.setState({settings: {...settings, common: {...settings.common, playlistProbeLimit: 2}}})
		const id = await placeAsAudioThenSwitch(PLAYLIST_URL)
		probe.resolve(ok(playlist(3)))
		await vi.waitFor(() => expect(row(id)?.status).toBe('needs-choice'))
		await useAppStore.getState().chooseQuickDownloadRow(id, 'review')
		await useAppStore.getState().queueLoadedPlaylistWithActiveProfile()

		expect(queue().map(item => item.formatLabel)).toEqual(['Audio only · best', 'Audio only · best'])
	})

	it('keeps them through a needs-choice answer and a Retry', async () => {
		const probe = deferredProbe()
		const settings = useAppStore.getState().settings
		if (!settings) throw new Error('no settings')
		useAppStore.setState({settings: {...settings, common: {...settings.common, playlistProbeLimit: 2}}})
		const id = await placeAsAudioThenSwitch(PLAYLIST_URL)
		probe.resolve(ok(playlist(3)))
		await vi.waitFor(() => expect(row(id)?.status).toBe('needs-choice'))
		await useAppStore.getState().chooseQuickDownloadRow(id, 'first')
		expect(queue().map(item => [item.formatLabel, item.outputDir])).toEqual([
			['Audio only · best', '/music/Audio only'],
			['Audio only · best', '/music/Audio only']
		])

		useAppStore.setState({queue: []})
		const retried = await placeAsAudioThenSwitch(OTHER_URL)
		probe.resolve(fail(BOT_BLOCK))
		await vi.waitFor(() => expect(row(retried)?.status).toBe('error'))
		const retrying = useAppStore.getState().retryQuickDownloadRow(retried)
		await vi.waitFor(() => expect(probe.calls).toHaveLength(3))
		probe.resolve(ok({...VIDEO, webpageUrl: OTHER_URL}))
		await retrying
		expect(row(retried)?.status).toBe('pending')
		expect(row(retried)).toMatchObject({formatLabel: 'Audio only · best', outputDir: '/music/Audio only'})
	})
})

// A rejected IPC call is the transport failing, not a refusal. No detached
// task may leave it unhandled, and no row may stay stuck in probing.
describe('a rejected IPC call in the background pipeline', () => {
	beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => undefined))

	it.each([
		['replaceProbing', VIDEO_URL, VIDEO],
		['needsChoice', 'https://media.example/watch/42', {...playlist(1), webpageUrl: 'https://media.example/watch/42'}]
	] as const)('settles the row as a probe error when %s rejects', async (command, url, result) => {
		const probe = deferredProbe()
		api.queue.cmd[command] = vi.fn().mockRejectedValue(new Error('IPC closed'))
		await useAppStore.getState().quickDownload({url, entry: 'url-tab'})
		const id = queue()[0]?.id ?? ''
		probe.resolve(ok(result))

		await vi.waitFor(() => expect(row(id)).toMatchObject({status: 'error', error: {kind: 'unknown', raw: 'IPC closed'}}))
		expect(toasts.find(toast => toast.level === 'error')?.message).toMatch(/^Couldn't prepare/)
		expect(console.error).toHaveBeenCalled()
	})

	it('says the link was not added when placing it rejects', async () => {
		api.queue.cmd.add = vi.fn().mockRejectedValue(new Error('IPC closed'))
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})
		expect(toasts.map(toast => toast.message)).toEqual(["Couldn't add that link — try again"])
	})

	// The Downloads tab calls these without waiting for them.
	it('never rejects a row Retry or choice whose restart rejects', async () => {
		const probe = deferredProbe()
		const settings = useAppStore.getState().settings
		if (settings) useAppStore.setState({settings: {...settings, common: {...settings.common, playlistProbeLimit: 2}}})
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})
		await useAppStore.getState().quickDownload({url: PLAYLIST_URL, entry: 'url-tab'})
		const [failedId, choiceId] = queue().map(item => item.id)
		probe.resolve(fail(BOT_BLOCK))
		probe.resolve(ok(playlist(3)))
		await vi.waitFor(() => expect(queue().map(item => item.status)).toEqual(['error', 'needs-choice']))
		api.queue.cmd.reprobe = vi.fn().mockRejectedValue(new Error('IPC closed'))

		await expect(useAppStore.getState().retryQuickDownloadRow(failedId ?? '')).resolves.toBeUndefined()
		await expect(useAppStore.getState().chooseQuickDownloadRow(choiceId ?? '', 'first')).resolves.toBeUndefined()
		await expect(useAppStore.getState().chooseQuickDownloadRow(choiceId ?? '', 'all')).resolves.toBeUndefined()
		expect(queue().map(item => item.status)).toEqual(['error', 'needs-choice'])
		expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[quick-download]'), expect.any(Error))
	})

	it('reports a toast Retry whose restart rejects', async () => {
		const probe = deferredProbe()
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})
		probe.resolve(fail(BOT_BLOCK))
		await vi.waitFor(() => expect(toasts.some(toast => toast.level === 'error')).toBe(true))
		api.queue.cmd.reprobe = vi.fn().mockRejectedValue(new Error('IPC closed'))
		const settings = useAppStore.getState().settings
		if (settings) useAppStore.setState({settings: {...settings, common: {...settings.common, exploreEnabled: false}}})
		toasts.find(toast => toast.level === 'error')?.actions?.[0].onClick()
		await vi.waitFor(() => expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[quick-download]'), expect.any(Error)))
	})
})

describe('Download from Explore', () => {
	it('titles the row with the page title and leaves the URL tab alone', async () => {
		deferredProbe()
		useAppStore.setState({wizardUrl: 'typed on the URL tab'})
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'explore', title: 'Fixture Video - YouTube'})

		expect(queue()[0]).toMatchObject({title: 'Fixture Video - YouTube', status: 'probing'})
		expect(toasts.map(toast => toast.message)).toEqual(['Added: Fixture Video - YouTube'])
		expect(useAppStore.getState().wizardUrl).toBe('typed on the URL tab')
	})
})

describe('a failed probe', () => {
	it('becomes a probe-error row, with a toast offering Retry and View', async () => {
		const probe = deferredProbe()
		const settings = defaultAppSettings('/tmp')
		useAppStore.setState({settings: {...settings, common: {...settings.common, exploreEnabled: false}}})
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})
		const id = queue()[0]?.id ?? ''
		probe.resolve(fail(BOT_BLOCK))

		await vi.waitFor(() => expect(row(id)).toMatchObject({status: 'error', error: BOT_BLOCK.error}))
		const failure = toasts.find(toast => toast.level === 'error')
		expect(failure?.message).toBe("Couldn't prepare youtube.com · abc")
		expect(failure?.actions?.map(action => action.label)).toEqual(['Retry', 'View'])
	})

	it('offers Sign in in Explore as the main action where the guidance does', async () => {
		const probe = deferredProbe()
		const settings = defaultAppSettings('/tmp')
		useAppStore.setState({settings: {...settings, common: {...settings.common, cookiesMode: 'explore', exploreEnabled: true}}, exploreView: {url: '', title: '', canGoBack: false, canGoForward: false, loading: false, signedIn: false, error: null, adBlock: 'off'}})
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})
		probe.resolve(fail({kind: 'ytdlp', error: {kind: 'loginRequired', raw: 'Sign in'}}))

		await vi.waitFor(() => expect(toasts.find(toast => toast.level === 'error')?.actions?.[0].label).toBe('Sign in in Explore'))
		toasts.find(toast => toast.level === 'error')?.actions?.[0].onClick()
		expect(window.location.hash).toBe('#explore')
	})

	// P2-R41: while a wizard run is open, a toast neither offers View (it
	// would have to abandon the run) nor Sign in in Explore (which leaves it).
	it('offers only Retry while a wizard run is open', async () => {
		const probe = deferredProbe()
		const settings = defaultAppSettings('/tmp')
		useAppStore.setState({settings: {...settings, common: {...settings.common, cookiesMode: 'explore', exploreEnabled: true}}, exploreView: {url: '', title: '', canGoBack: false, canGoForward: false, loading: false, signedIn: false, error: null, adBlock: 'off'}})
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})
		useAppStore.setState({wizardStep: 'formats'})
		probe.resolve(fail({kind: 'ytdlp', error: {kind: 'loginRequired', raw: 'Sign in'}}))

		await vi.waitFor(() => expect(toasts.find(toast => toast.level === 'error')?.actions?.map(action => action.label)).toEqual(['Retry']))
	})

	it('raises the Added toast without View while a wizard run is open', async () => {
		deferredProbe()
		useAppStore.setState({wizardStep: 'playlistItems'})
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'explore'})
		expect(toasts.map(toast => [toast.message, toast.actions])).toEqual([['Added: youtube.com · abc', undefined]])
	})

	// The action was chosen when the toast was raised; by the click a wizard
	// run may have started, which Sign in in Explore would abandon.
	it('retries instead of signing in when a wizard run started after the toast', async () => {
		const probe = deferredProbe()
		const settings = defaultAppSettings('/tmp')
		useAppStore.setState({settings: {...settings, common: {...settings.common, cookiesMode: 'explore', exploreEnabled: true}}, exploreView: {url: '', title: '', canGoBack: false, canGoForward: false, loading: false, signedIn: false, error: null, adBlock: 'off'}})
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})
		const id = queue()[0]?.id ?? ''
		probe.resolve(fail({kind: 'ytdlp', error: {kind: 'loginRequired', raw: 'Sign in'}}))
		await vi.waitFor(() => expect(toasts.find(toast => toast.level === 'error')?.actions?.[0].label).toBe('Sign in in Explore'))

		useAppStore.setState({wizardStep: 'formats'})
		toasts.find(toast => toast.level === 'error')?.actions?.[0].onClick()

		expect(window.location.hash).toBe('#download')
		expect(useAppStore.getState().wizardStep).toBe('formats')
		await vi.waitFor(() => expect(api.queue.cmd.reprobe).toHaveBeenCalledWith({itemId: id}))
	})

	it('retries from the row with the same probe mode and succeeds', async () => {
		const probe = deferredProbe()
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})
		const id = queue()[0]?.id ?? ''
		probe.resolve(fail(BOT_BLOCK))
		await vi.waitFor(() => expect(row(id)?.status).toBe('error'))

		const retry = useAppStore.getState().retryQuickDownloadRow(id)
		await vi.waitFor(() => expect(probe.calls).toHaveLength(2))
		expect(row(id)?.status).toBe('probing')
		expect(probe.calls[1]).toEqual({url: VIDEO_URL, playlistMode: 'video', ownerKey: id})
		probe.resolve(ok(VIDEO))
		await retry
		expect(row(id)).toMatchObject({status: 'pending', title: 'Fixture Video'})
	})

	// The successor of the wizard-era retryQuickDownloadWithCookies('explore'):
	// the row itself carries what an Explore download started with.
	it('Enable cookies & retry on an Explore row switches the mode, then probes that row again', async () => {
		const probe = deferredProbe()
		const settings = defaultAppSettings('/tmp')
		useAppStore.setState({settings: {...settings, common: {...settings.common, cookiesMode: 'off', cookiesBrowser: 'firefox'}}})
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'explore', title: 'Fixture Video - YouTube'})
		const id = queue()[0]?.id ?? ''
		probe.resolve(fail(BOT_BLOCK))
		await vi.waitFor(() => expect(row(id)?.status).toBe('error'))

		const retry = useAppStore.getState().retryQuickDownloadRowWithCookies(id)
		await vi.waitFor(() => expect(row(id)?.status).toBe('probing'))
		expect(api.settings.update).toHaveBeenCalledWith({common: {cookiesMode: 'browser'}})
		expect(probe.calls[1]).toEqual({url: VIDEO_URL, playlistMode: 'video', ownerKey: id})
		expect(row(id)?.title).toBe('Fixture Video - YouTube')
		probe.resolve(ok(VIDEO))
		await retry
		expect(row(id)).toMatchObject({status: 'pending', title: 'Fixture Video'})
	})

	it('says nothing once the row was cancelled while its probe ran', async () => {
		const probe = deferredProbe()
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})
		const id = queue()[0]?.id ?? ''
		await useAppStore.getState().cancelItemDownload(id)
		probe.resolve(fail(BOT_BLOCK))

		await vi.waitFor(() => expect(api.queue.cmd.probeFailed).toHaveBeenCalled())
		expect(toasts.filter(toast => toast.level === 'error')).toEqual([])
		expect(queue()).toEqual([])
	})
})

// P2-R51: under `off` with the Explore tab on, the failure toast leads with
// Explore — except that, while a wizard run is open, it never navigates (P2-R41).
describe('a failed probe under the off cookie mode with Explore enabled', () => {
	const LOGIN_REQUIRED: ProbeError = {kind: 'ytdlp', error: {kind: 'loginRequired', raw: 'Sign in'}}
	const VIEW = {url: '', title: '', canGoBack: false, canGoForward: false, loading: false, error: null, adBlock: 'off'} as const

	function failureToast(): Toast | undefined {
		return toasts.find(toast => toast.level === 'error')
	}

	async function failQuickDownload(signedIn: boolean, wizardStep?: 'formats'): Promise<string> {
		api.settings.update = vi.fn((patch: SettingsPatch) => {
			const current = useAppStore.getState().settings
			if (!current) throw new Error('no settings')
			return Promise.resolve(ok({...current, common: {...current.common, ...patch.common}}))
		})
		const probe = deferredProbe()
		useAppStore.setState({exploreView: {...VIEW, signedIn}})
		await useAppStore.getState().quickDownload({url: VIDEO_URL, entry: 'url-tab'})
		const id = queue()[0]?.id ?? ''
		if (wizardStep) useAppStore.setState({wizardStep})
		probe.resolve(fail(LOGIN_REQUIRED))
		await vi.waitFor(() => expect(failureToast()).toBeDefined())
		return id
	}

	it('offers Sign in with Explore, which switches the mode, opens Explore and waits to retry the row', async () => {
		const id = await failQuickDownload(false)
		expect(failureToast()?.actions?.map(action => action.label)).toEqual(['Sign in with Explore', 'View'])
		failureToast()?.actions?.[0].onClick()
		expect(window.location.hash).toBe('#explore')
		expect(useAppStore.getState().settings?.common.cookiesMode).toBe('explore')
		await vi.waitFor(() => expect(useAppStore.getState().exploreRetryTargets).toEqual([{kind: 'row', itemId: id}]))
	})

	it('offers only Retry while a wizard run is open', async () => {
		await failQuickDownload(false, 'formats')
		expect(failureToast()?.actions?.map(action => action.label)).toEqual(['Retry'])
	})

	it('retries instead when a wizard run started after the toast', async () => {
		const id = await failQuickDownload(false)
		useAppStore.setState({wizardStep: 'formats'})
		failureToast()?.actions?.[0].onClick()
		expect(window.location.hash).toBe('#download')
		await vi.waitFor(() => expect(api.queue.cmd.reprobe).toHaveBeenCalledWith({itemId: id}))
		expect(useAppStore.getState().exploreRetryTargets).toEqual([])
	})

	// The action is checked again at click time: a toast raised under `off`
	// must not switch a mode the user has since set to a cookies file.
	it.each([false, true])('falls back to Retry when the mode changed after the toast (signed in: %s)', async signedIn => {
		const id = await failQuickDownload(signedIn)
		const settings = useAppStore.getState().settings
		if (!settings) throw new Error('no settings')
		useAppStore.setState({settings: {...settings, common: {...settings.common, cookiesMode: 'file', cookiesPath: '/tmp/cookies.txt'}}})
		failureToast()?.actions?.[0].onClick()
		await vi.waitFor(() => expect(api.queue.cmd.reprobe).toHaveBeenCalledWith({itemId: id}))
		expect(api.settings.update).not.toHaveBeenCalled()
		expect(useAppStore.getState().settings?.common.cookiesMode).toBe('file')
		expect(window.location.hash).toBe('#download')
	})

	it.each([undefined, 'formats'] as const)('offers "Use my Explore sign-in and retry" once signed in, retrying in place (wizard step %s)', async wizardStep => {
		const id = await failQuickDownload(true, wizardStep)
		expect(failureToast()?.actions?.[0].label).toBe('Use my Explore sign-in and retry')
		failureToast()?.actions?.[0].onClick()
		await vi.waitFor(() => expect(api.queue.cmd.reprobe).toHaveBeenCalledWith({itemId: id}))
		expect(useAppStore.getState().settings?.common.cookiesMode).toBe('explore')
		expect(window.location.hash).toBe('#download')
	})
})

describe('a probe that needs the user’s choice', () => {
	beforeEach(() => {
		const settings = defaultAppSettings('/tmp')
		useAppStore.setState({settings: {...settings, common: {...settings.common, playlistProbeLimit: 2}}})
	})

	async function cappedRow(probe: ReturnType<typeof deferredProbe>): Promise<string> {
		await useAppStore.getState().quickDownload({url: PLAYLIST_URL, entry: 'url-tab'})
		const id = queue()[0]?.id ?? ''
		probe.resolve(ok(playlist(3)))
		await vi.waitFor(() => expect(row(id)?.status).toBe('needs-choice'))
		return id
	}

	it('parks a playlist over the load limit as needs-choice, with a toast', async () => {
		const probe = deferredProbe()
		const id = await cappedRow(probe)
		expect(row(id)).toMatchObject({title: 'Road trip mix', choice: {kind: 'playlist-cap', loaded: 2}})
		expect(toasts.at(-1)?.message).toBe('2+ videos — choose how many')
		expect(toasts.at(-1)?.actions?.[0].label).toBe('View')
	})

	// The probe fetched one entry past the limit it ran with; a limit raised
	// while it ran must not turn that sentinel into a real entry.
	it('reads the result with the load limit the probe ran with', async () => {
		const probe = deferredProbe()
		await useAppStore.getState().quickDownload({url: PLAYLIST_URL, entry: 'url-tab'})
		const id = queue()[0]?.id ?? ''
		const settings = useAppStore.getState().settings
		if (!settings) throw new Error('no settings')
		useAppStore.setState({settings: {...settings, common: {...settings.common, playlistProbeLimit: 10}}})
		probe.resolve(ok(playlist(3)))

		await vi.waitFor(() => expect(row(id)).toMatchObject({status: 'needs-choice', choice: {kind: 'playlist-cap', loaded: 2}}))
	})

	it('First N queues the loaded videos without probing again', async () => {
		const probe = deferredProbe()
		const id = await cappedRow(probe)
		await useAppStore.getState().chooseQuickDownloadRow(id, 'first')

		expect(probe.calls).toHaveLength(1)
		expect(queue().map(item => item.url)).toEqual(['https://youtu.be/v1', 'https://youtu.be/v2'])
		expect(queue()[0]?.id).toBe(id)
	})

	it('First N probes again for exactly N once the kept probe is gone (after a restart)', async () => {
		const probe = deferredProbe()
		useAppStore.setState({queue: [makeItem({id: 'restored', status: 'needs-choice', url: PLAYLIST_URL, title: 'Road trip mix', probeMode: 'playlist', choice: {kind: 'playlist-cap', loaded: 2}, job: {kind: 'unresolved', extractor: '', extractorKey: ''}})]})
		const choosing = useAppStore.getState().chooseQuickDownloadRow('restored', 'first')
		await vi.waitFor(() => expect(probe.calls).toHaveLength(1))
		expect(probe.calls[0]).toMatchObject({url: PLAYLIST_URL, playlistMode: 'playlist', ownerKey: 'restored', playlistScope: {items: {kind: 'first', count: 2}}})
		probe.resolve(ok(playlist(3)))
		await choosing
		expect(queue()).toHaveLength(2)
	})

	it('forgets the kept probe once the row is cancelled', async () => {
		const probe = deferredProbe()
		const id = await cappedRow(probe)
		await useAppStore.getState().cancelItemDownload(id)
		expect(keptChoiceProbe(id)).toBeUndefined()
	})

	it('All probes again without the load limit and queues everything', async () => {
		const probe = deferredProbe()
		const id = await cappedRow(probe)
		const choosing = useAppStore.getState().chooseQuickDownloadRow(id, 'all')
		await vi.waitFor(() => expect(probe.calls).toHaveLength(2))
		expect(probe.calls[1]).toMatchObject({playlistMode: 'playlist', ownerKey: id, playlistScope: {items: {kind: 'first', count: 5000}}})
		probe.resolve(ok(playlist(3)))
		await choosing
		expect(queue()).toHaveLength(3)
	})

	// P2-R40: the row is the decision until the wizard actually queues.
	it('Review opens the wizard on the playlist and keeps the row', async () => {
		const probe = deferredProbe()
		const id = await cappedRow(probe)
		await useAppStore.getState().chooseQuickDownloadRow(id, 'review')

		expect(row(id)?.status).toBe('needs-choice')
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'playlistItems', wizardMode: 'playlist', wizardUrl: PLAYLIST_URL, playlistTitle: 'Road trip mix', reviewSourceRowId: id})
		expect(probe.calls).toHaveLength(1)
	})

	it('queueing from the review replaces the row with the chosen videos', async () => {
		const probe = deferredProbe()
		const id = await cappedRow(probe)
		await useAppStore.getState().chooseQuickDownloadRow(id, 'review')
		await useAppStore.getState().addToQueue()

		expect(api.queue.cmd.replaceProbing).toHaveBeenLastCalledWith({itemId: id, items: expect.any(Array)})
		expect(queue().map(item => [item.url, item.status])).toEqual([
			['https://youtu.be/v1', 'pending'],
			['https://youtu.be/v2', 'pending']
		])
		expect(queue()[0]?.id).toBe(id)
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'url', reviewSourceRowId: null})
	})

	it('queueing from the review adds plainly once the row is gone', async () => {
		const probe = deferredProbe()
		const id = await cappedRow(probe)
		await useAppStore.getState().chooseQuickDownloadRow(id, 'review')
		await useAppStore.getState().cancelItemDownload(id)
		await useAppStore.getState().addToQueue()

		expect(queue().map(item => item.url)).toEqual(['https://youtu.be/v1', 'https://youtu.be/v2'])
	})

	it('abandoning the review leaves the row waiting for its choice', async () => {
		const probe = deferredProbe()
		const id = await cappedRow(probe)
		await useAppStore.getState().chooseQuickDownloadRow(id, 'review')
		useAppStore.getState().reset()

		expect(row(id)?.status).toBe('needs-choice')
		expect(useAppStore.getState().reviewSourceRowId).toBeNull()
		// The kept probe survives: First N still needs no second probe.
		await useAppStore.getState().chooseQuickDownloadRow(id, 'first')
		expect(probe.calls).toHaveLength(1)
		expect(queue()).toHaveLength(2)
	})

	// The link lives exactly as long as its review run (P2-R40).
	it.each(['openCookiesSettings', 'openExploreSignIn', 'back'] as const)('leaving the review through %s never lets a later run replace the row', async leave => {
		const probe = deferredProbe()
		const id = await cappedRow(probe)
		await useAppStore.getState().chooseQuickDownloadRow(id, 'review')
		useAppStore.getState()[leave]({kind: 'youtube'})
		expect(useAppStore.getState().reviewSourceRowId).toBeNull()

		// A single-link Bulk run that turns out to be a list opens its own review.
		const bulk = useAppStore.getState().quickDownloadUrls(['https://media.example/list/9'])
		await vi.waitFor(() => expect(probe.calls).toHaveLength(2))
		probe.resolve(ok({...playlist(2), webpageUrl: 'https://media.example/list/9'}))
		await bulk
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'playlistItems', reviewSourceRowId: null})
		await useAppStore.getState().addToQueue()

		expect(api.queue.cmd.replaceProbing).not.toHaveBeenCalledWith(expect.objectContaining({itemId: id}))
		expect(row(id)?.status).toBe('needs-choice')
	})

	it('a retry within the review run keeps the link to its row', async () => {
		const probe = deferredProbe()
		useAppStore.setState({queue: [makeItem({id: 'restored', status: 'needs-choice', url: PLAYLIST_URL, title: 'Road trip mix', probeMode: 'playlist', choice: {kind: 'playlist-cap', loaded: 2}, job: {kind: 'unresolved', extractor: '', extractorKey: ''}})]})
		const reviewing = useAppStore.getState().chooseQuickDownloadRow('restored', 'review')
		await vi.waitFor(() => expect(probe.calls).toHaveLength(1))
		probe.resolve(fail(BOT_BLOCK))
		await reviewing
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'error', reviewSourceRowId: 'restored'})

		const retrying = useAppStore.getState().retry()
		await vi.waitFor(() => expect(probe.calls).toHaveLength(2))
		probe.resolve(ok(playlist(3)))
		await retrying
		expect(useAppStore.getState().reviewSourceRowId).toBe('restored')
		await useAppStore.getState().addToQueue()

		expect(api.queue.cmd.replaceProbing).toHaveBeenLastCalledWith({itemId: 'restored', items: expect.any(Array)})
		expect(queue()[0]?.id).toBe('restored')
		expect(queue().every(item => item.status === 'pending')).toBe(true)
	})

	it('settles the row when every reviewed video is already in the queue', async () => {
		const probe = deferredProbe()
		const id = await cappedRow(probe)
		await useAppStore.getState().chooseQuickDownloadRow(id, 'review')
		useAppStore.setState({queue: [...queue(), makeItem({id: 'live-1', status: 'pending', url: 'https://youtu.be/v1'}), makeItem({id: 'live-2', status: 'pending', url: 'https://youtu.be/v2'})]})
		await useAppStore.getState().addToQueue()

		expect(api.queue.cmd.replaceProbing).toHaveBeenLastCalledWith({itemId: id, items: []})
		expect(row(id)).toBeUndefined()
		expect(useAppStore.getState().reviewSourceRowId).toBeNull()
	})

	it('queueing the loaded slice from the review replaces the row too', async () => {
		const probe = deferredProbe()
		const id = await cappedRow(probe)
		await useAppStore.getState().chooseQuickDownloadRow(id, 'review')
		await useAppStore.getState().queueLoadedPlaylistWithActiveProfile()

		expect(api.queue.cmd.replaceProbing).toHaveBeenLastCalledWith({itemId: id, items: expect.any(Array)})
		expect(queue().map(item => item.url)).toEqual(['https://youtu.be/v1', 'https://youtu.be/v2'])
		expect(queue()[0]?.id).toBe(id)
	})

	it('asks for a review when a link that did not look like a collection is one', async () => {
		const probe = deferredProbe()
		const url = 'https://media.example/watch/42'
		await useAppStore.getState().quickDownload({url, entry: 'explore'})
		const id = queue()[0]?.id ?? ''
		probe.resolve(ok({...playlist(1), webpageUrl: url}))
		await vi.waitFor(() => expect(row(id)).toMatchObject({status: 'needs-choice', choice: {kind: 'playlist-review', count: 1}}))
	})
})

describe('the global hotkey', () => {
	it('acknowledges at once and reports a needs-choice playlist as needing review', async () => {
		const probe = deferredProbe()
		const settings = defaultAppSettings('/tmp')
		useAppStore.setState({settings: {...settings, common: {...settings.common, playlistProbeLimit: 2}}})
		const pressed = handleHotkeyTrigger({kind: 'single', url: PLAYLIST_URL}, useAppStore.getState)
		await vi.waitFor(() => expect(api.hotkey.reportOutcome).toHaveBeenCalledWith({outcome: 'queued', url: PLAYLIST_URL}))
		probe.resolve(ok(playlist(3)))
		await pressed
		await vi.waitFor(() => expect(api.hotkey.reportOutcome).toHaveBeenLastCalledWith({outcome: 'needs-review', url: PLAYLIST_URL}))
		expect(toasts).toEqual([])
		expect(queue()[0]?.status).toBe('needs-choice')
	})

	it('reports a failed probe and leaves a retryable row', async () => {
		const probe = deferredProbe()
		await handleHotkeyTrigger({kind: 'single', url: VIDEO_URL}, useAppStore.getState)
		probe.resolve(fail(BOT_BLOCK))
		await vi.waitFor(() => expect(api.hotkey.reportOutcome).toHaveBeenLastCalledWith({outcome: 'submission-failed', url: VIDEO_URL}))
		expect(queue()[0]).toMatchObject({status: 'error', probeMode: 'video'})
	})
})
