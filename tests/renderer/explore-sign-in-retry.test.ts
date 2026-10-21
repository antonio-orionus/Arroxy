// @vitest-environment jsdom
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {setNotificationSink, type NotificationLevel} from '@renderer/lib/notify.js'
import {defaultAppSettings} from '@shared/constants.js'
import {ok, type Result} from '@shared/result.js'
import type {AppApi, SettingsPatch} from '@shared/api.js'
import type {AppSettings, ExploreViewState, ProbeError, ProbeResult, QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// "Sign in with Explore" (P2-R51): the failed item is remembered, in memory
// only, and probed again once Explore reports the sign-in — exactly once, and
// never after the row is gone, the cookie mode moved on, or the app restarted.

const VIEW: ExploreViewState = {url: '', title: '', canGoBack: false, canGoForward: false, loading: false, signedIn: false, error: null, adBlock: 'off'}
const UNRESOLVED: QueueItem['job'] = {kind: 'unresolved', extractor: '', extractorKey: ''}
const ERROR = {kind: 'loginRequired', raw: 'Sign in to view this video'} as const
const YOUTUBE_SIGN_IN = {kind: 'youtube'} as const

function errorRow(id: string): QueueItem {
	return makeItem({id, status: 'error', url: `https://www.youtube.com/watch?v=${id}`, title: id, error: ERROR, job: UNRESOLVED, probeMode: 'video'})
}

let api: AppApi
const toasts: {level: NotificationLevel; message: string}[] = []

// Main answers a settings write with the merged settings, as the real store does.
function echoSettingsWrites(): void {
	api.settings.update = vi.fn((patch: SettingsPatch) => {
		const current = useAppStore.getState().settings
		if (!current) throw new Error('no settings')
		return Promise.resolve(ok({...current, common: {...current.common, ...patch.common}}))
	})
}

function seed(common: Partial<AppSettings['common']> = {}, signedIn: boolean | null = false, queue: QueueItem[] = [errorRow('a')]): void {
	const base = defaultAppSettings('/tmp')
	useAppStore.setState({...useAppStore.getInitialState(), ...RESET_WIZARD_STATE, settings: {...base, common: {...base.common, cookiesMode: 'off', exploreNoticeSeen: true, ...common}}, exploreView: signedIn === null ? null : {...VIEW, signedIn}, queue})
}

function signIn(): void {
	useAppStore.setState({exploreView: {...VIEW, signedIn: true}})
}

function reprobed(): string[] {
	return vi.mocked(api.intake.retry).mock.calls.map(([input]) => input.itemId)
}

beforeEach(() => {
	api = buildMockAppApi()
	api.downloads.probe = vi.fn(() => new Promise<Result<ProbeResult, ProbeError>>(() => undefined))
	echoSettingsWrites()
	window.appApi = api
	window.history.replaceState(null, '', '#queue')
	toasts.length = 0
	setNotificationSink((level, message) => toasts.push({level, message}))
})

afterEach(() => {
	setNotificationSink(null)
	window.history.replaceState(null, '', '#download')
})

describe('Sign in with Explore on a failed row', () => {
	it('switches to the explore mode, marks the first open done, opens Explore and remembers the row', async () => {
		seed()
		await useAppStore.getState().signInWithExploreThenRetry({kind: 'row', itemId: 'a'}, YOUTUBE_SIGN_IN)

		expect(useAppStore.getState().settings?.common).toMatchObject({cookiesMode: 'explore', exploreModeAutoSwitched: true})
		expect(api.settings.update).toHaveBeenCalledWith({common: {cookiesMode: 'explore', exploreModeAutoSwitched: true}})
		expect(window.location.hash).toBe('#explore')
		expect(useAppStore.getState().exploreRetryTargets).toEqual([{kind: 'row', itemId: 'a'}])
		expect(reprobed()).toEqual([])
	})

	it('probes the row again once Explore reports the sign-in, exactly once, and says so', async () => {
		seed({}, null, [errorRow('a'), errorRow('b')])
		await useAppStore.getState().signInWithExploreThenRetry({kind: 'row', itemId: 'a'}, YOUTUBE_SIGN_IN)
		await useAppStore.getState().signInWithExploreThenRetry({kind: 'row', itemId: 'b'}, YOUTUBE_SIGN_IN)
		await useAppStore.getState().signInWithExploreThenRetry({kind: 'row', itemId: 'a'}, YOUTUBE_SIGN_IN)

		useAppStore.setState({exploreView: {...VIEW, signedIn: false}})
		expect(reprobed()).toEqual([])
		signIn()
		signIn()
		useAppStore.setState({exploreView: {...VIEW, signedIn: false}})
		signIn()

		await vi.waitFor(() => expect(reprobed()).toEqual(['a', 'b']))
		expect(useAppStore.getState().exploreRetryTargets).toEqual([])
		expect(toasts).toEqual([{level: 'info', message: 'Signed in with Explore — retrying 2 links'}])
	})

	it('forgets a row the user removed', async () => {
		seed()
		await useAppStore.getState().signInWithExploreThenRetry({kind: 'row', itemId: 'a'}, YOUTUBE_SIGN_IN)
		useAppStore.setState({queue: []})
		expect(useAppStore.getState().exploreRetryTargets).toEqual([])
		useAppStore.setState({queue: [errorRow('a')]})
		signIn()
		expect(reprobed()).toEqual([])
		expect(toasts).toEqual([])
	})

	it.each([
		['off', {cookiesMode: 'off'}],
		['file', {cookiesMode: 'file'}],
		['explore with the Explore tab off', {exploreEnabled: false}]
	] as const)('is cancelled when the cookie mode changes to %s', async (_label, patch) => {
		seed()
		await useAppStore.getState().signInWithExploreThenRetry({kind: 'row', itemId: 'a'}, YOUTUBE_SIGN_IN)
		const settings = useAppStore.getState().settings
		if (!settings) throw new Error('no settings')
		useAppStore.setState({settings: {...settings, common: {...settings.common, ...patch}}})
		expect(useAppStore.getState().exploreRetryTargets).toEqual([])
		const restored = useAppStore.getState().settings
		if (!restored) throw new Error('no settings')
		useAppStore.setState({settings: {...restored, common: {...restored.common, cookiesMode: 'explore', exploreEnabled: true}}})
		signIn()
		expect(reprobed()).toEqual([])
	})

	it('is cancelled when the mode switch could not be saved', async () => {
		seed()
		api.settings.update = vi.fn().mockResolvedValue({ok: false, error: {code: 'io', message: 'disk full', recoverable: true}})
		api.settings.get = vi.fn(() => Promise.resolve(ok(defaultAppSettings('/tmp'))))
		await useAppStore.getState().signInWithExploreThenRetry({kind: 'row', itemId: 'a'}, YOUTUBE_SIGN_IN)
		await vi.waitFor(() => expect(useAppStore.getState().settings?.common.cookiesMode ?? 'off').toBe('off'))
		expect(useAppStore.getState().exploreRetryTargets).toEqual([])
	})

	it('does not survive a restart: the remembered rows live in memory only', async () => {
		seed()
		await useAppStore.getState().signInWithExploreThenRetry({kind: 'row', itemId: 'a'}, YOUTUBE_SIGN_IN)
		expect(
			vi
				.mocked(api.settings.update)
				.mock.calls.flat()
				.some(patch => JSON.stringify(patch).includes('exploreRetryTargets'))
		).toBe(false)
		// A restart: a fresh renderer state over the same persisted settings and queue.
		const {settings, queue} = useAppStore.getState()
		useAppStore.setState({...useAppStore.getInitialState(), settings, queue, exploreView: null})
		signIn()
		expect(reprobed()).toEqual([])
	})

	// Main answers each write with what it holds at that moment, not with the
	// renderer's optimistic state: a write already in flight when the user
	// clicks echoes the old `off` after the click's optimistic `explore`.
	it('survives the echo of a settings write that was in flight when the user clicked', async () => {
		seed()
		const base = useAppStore.getState().settings
		if (!base) throw new Error('no settings')
		let canonical: AppSettings = base
		let releaseEarlier: () => void = () => undefined
		const earlier = new Promise<void>(resolve => (releaseEarlier = resolve))
		let writes = 0
		api.settings.update = vi.fn((patch: SettingsPatch) => {
			canonical = {...canonical, common: {...canonical.common, ...patch.common}}
			const answer = ok(canonical)
			writes += 1
			return writes === 1 ? earlier.then(() => answer) : Promise.resolve(answer)
		})

		const proxySaved = useAppStore.getState().setProxyUrl('http://proxy.test:8080')
		const signingIn = useAppStore.getState().signInWithExploreThenRetry({kind: 'row', itemId: 'a'}, YOUTUBE_SIGN_IN)
		releaseEarlier()
		await Promise.all([proxySaved, signingIn])
		expect(useAppStore.getState().settings?.common.cookiesMode).toBe('explore')

		signIn()
		await vi.waitFor(() => expect(reprobed()).toEqual(['a']))
	})

	it('reports a retry that rejects once signed in instead of leaving it unhandled', async () => {
		const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined)
		seed()
		await useAppStore.getState().signInWithExploreThenRetry({kind: 'row', itemId: 'a'}, YOUTUBE_SIGN_IN)
		api.intake.retry = vi.fn().mockRejectedValue(new Error('IPC closed'))
		signIn()
		await vi.waitFor(() => expect(logged).toHaveBeenCalledWith(expect.stringContaining('[quick-download]'), expect.any(Error)))
		logged.mockRestore()
	})

	it('retries at once when Explore is already signed in by the time the mode is switched', async () => {
		seed({}, true)
		await useAppStore.getState().signInWithExploreThenRetry({kind: 'row', itemId: 'a'}, YOUTUBE_SIGN_IN)
		await vi.waitFor(() => expect(reprobed()).toEqual(['a']))
	})
})

// The offer may only replace a stored `off` with the Explore tab on: a stale
// button never moves a file / browser mode, or writes `explore` while the tab is off.
describe('a stale offer', () => {
	it.each([
		['the file mode', {cookiesMode: 'file', cookiesPath: '/tmp/cookies.txt'}],
		['the browser mode', {cookiesMode: 'browser', cookiesBrowser: 'firefox'}],
		['the Explore tab turned off', {exploreEnabled: false}]
	] as const)('Sign in with Explore leaves %s alone and just retries', async (_label, common) => {
		seed(common)
		window.history.replaceState(null, '', '#queue')
		void useAppStore.getState().signInWithExploreThenRetry({kind: 'row', itemId: 'a'}, YOUTUBE_SIGN_IN)
		await vi.waitFor(() => expect(reprobed()).toEqual(['a']))
		expect(api.settings.update).not.toHaveBeenCalled()
		expect(useAppStore.getState().exploreRetryTargets).toEqual([])
		expect(window.location.hash).toBe('#queue')
	})

	it.each([
		['the file mode', {cookiesMode: 'file', cookiesPath: '/tmp/cookies.txt'}],
		['the Explore tab turned off', {exploreEnabled: false}]
	] as const)('Use my Explore sign-in leaves %s alone and just retries', async (_label, common) => {
		seed(common, true)
		void useAppStore.getState().retryWithExploreSignIn({kind: 'row', itemId: 'a'})
		await vi.waitFor(() => expect(reprobed()).toEqual(['a']))
		expect(api.settings.update).not.toHaveBeenCalled()
	})

	it('Sign in with Explore under the explore mode already waits for the sign-in without a write', async () => {
		seed({cookiesMode: 'explore'})
		await useAppStore.getState().signInWithExploreThenRetry({kind: 'row', itemId: 'a'}, YOUTUBE_SIGN_IN)
		expect(api.settings.update).not.toHaveBeenCalled()
		expect(useAppStore.getState().exploreRetryTargets).toEqual([{kind: 'row', itemId: 'a'}])
		expect(window.location.hash).toBe('#explore')
	})
})

describe('Use my Explore sign-in and retry', () => {
	it('switches to the explore mode and probes the row again at once', async () => {
		seed({}, true)
		void useAppStore.getState().retryWithExploreSignIn({kind: 'row', itemId: 'a'})
		await vi.waitFor(() => expect(reprobed()).toEqual(['a']))
		expect(useAppStore.getState().settings?.common.cookiesMode).toBe('explore')
		expect(window.location.hash).toBe('#queue')
		expect(useAppStore.getState().exploreRetryTargets).toEqual([])
	})
})

describe('from the wizard error step', () => {
	it('leaves the wizard for Explore and probes the link again once signed in, without leaving Explore', async () => {
		seed({}, false, [])
		const url = 'https://www.youtube.com/watch?v=wizard'
		useAppStore.setState({wizardStep: 'error', wizardUrl: url, wizardError: {kind: 'ytdlp', error: ERROR}, wizardErrorOrigin: 'formats'})
		window.history.replaceState(null, '', '#download')
		await useAppStore.getState().signInWithExploreThenRetry({kind: 'wizard', url}, YOUTUBE_SIGN_IN)

		expect(window.location.hash).toBe('#explore')
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'url', wizardError: null})
		signIn()
		await vi.waitFor(() => expect(api.downloads.probe).toHaveBeenCalledWith(expect.objectContaining({url})))
		expect(window.location.hash).toBe('#explore')
	})

	it('drops the wizard retry once the user started something else', async () => {
		seed({}, false, [])
		const url = 'https://www.youtube.com/watch?v=wizard'
		useAppStore.setState({wizardStep: 'error', wizardUrl: url, wizardError: {kind: 'ytdlp', error: ERROR}, wizardErrorOrigin: 'formats'})
		await useAppStore.getState().signInWithExploreThenRetry({kind: 'wizard', url}, YOUTUBE_SIGN_IN)
		useAppStore.setState({wizardUrl: 'https://www.youtube.com/watch?v=other'})
		signIn()
		expect(api.downloads.probe).not.toHaveBeenCalled()
		expect(toasts).toEqual([])
	})

	it('Use my Explore sign-in and retry runs the wizard probe again in place', async () => {
		seed({}, true, [])
		const url = 'https://www.youtube.com/watch?v=wizard'
		useAppStore.setState({wizardStep: 'error', wizardUrl: url, wizardError: {kind: 'ytdlp', error: ERROR}, wizardErrorOrigin: 'formats'})
		window.history.replaceState(null, '', '#download')
		void useAppStore.getState().retryWithExploreSignIn({kind: 'wizard', url})
		await vi.waitFor(() => expect(api.downloads.probe).toHaveBeenCalledWith(expect.objectContaining({url})))
		expect(useAppStore.getState().settings?.common.cookiesMode).toBe('explore')
		expect(useAppStore.getState().wizardStep).toBe('formats')
		expect(window.location.hash).toBe('#download')
	})
})

// ADR 0011: Explore reports YouTube's sign-in only, and on any other site a
// cookie appears on the first visit, so nothing tells Arroxy the user signed
// in there. The offer opens the site in Explore and the user retries; no wait
// is armed for a YouTube sign-in to set off.
describe('for a link on another site', () => {
	const VIMEO = 'https://vimeo.com/123456'
	const VIMEO_SITE = {kind: 'web', host: 'vimeo.com', address: VIMEO} as const

	function vimeoRow(id: string): QueueItem {
		return {...errorRow(id), url: VIMEO}
	}

	it('switches to the explore mode and opens the link in Explore, waiting for nothing', async () => {
		seed({}, false, [vimeoRow('a')])
		await useAppStore.getState().signInWithExploreThenRetry({kind: 'row', itemId: 'a'}, VIMEO_SITE)

		expect(useAppStore.getState().settings?.common.cookiesMode).toBe('explore')
		expect(window.location.hash).toBe('#explore')
		expect(useAppStore.getState().explorePendingAddress).toBe(VIMEO)
		expect(useAppStore.getState().exploreRetryTargets).toEqual([])
		signIn()
		expect(reprobed()).toEqual([])
		expect(toasts).toEqual([])
	})

	it('under the explore mode opens the link in Explore without a write', async () => {
		seed({cookiesMode: 'explore'}, true, [vimeoRow('a')])
		await useAppStore.getState().signInWithExploreThenRetry({kind: 'row', itemId: 'a'}, VIMEO_SITE)
		expect(api.settings.update).not.toHaveBeenCalled()
		expect(useAppStore.getState()).toMatchObject({explorePendingAddress: VIMEO, exploreRetryTargets: []})
		expect(reprobed()).toEqual([])
	})

	it('Sign in in Explore opens the link; for YouTube Explore stays where it was', () => {
		seed({cookiesMode: 'explore'}, false, [vimeoRow('a')])
		useAppStore.getState().openExploreSignIn(VIMEO_SITE)
		expect(window.location.hash).toBe('#explore')
		expect(useAppStore.getState().explorePendingAddress).toBe(VIMEO)

		useAppStore.getState().openExploreSignIn({kind: 'youtube'})
		expect(useAppStore.getState().explorePendingAddress).toBeNull()
	})

	it('a later Retry probes the row again, as the user presses it', async () => {
		seed({cookiesMode: 'explore'}, false, [vimeoRow('a')])
		useAppStore.getState().openExploreSignIn(VIMEO_SITE)
		void useAppStore.getState().retryQuickDownloadRow('a')
		await vi.waitFor(() => expect(reprobed()).toEqual(['a']))
	})
})
