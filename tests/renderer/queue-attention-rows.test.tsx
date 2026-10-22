import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {QueueManagerTab} from '@renderer/components/queue/QueueManagerTab.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {defaultAppSettings} from '@shared/constants.js'
import {ok} from '@shared/result.js'
import type {SettingsPatch} from '@shared/api.js'
import type {AppSettings, ExploreViewState, LocalizedError, QueueItem} from '@shared/types.js'
import {makeItem} from '../shared/fixtures.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// The Downloads tab is where a quick download's outcome is resolved (P2-R38):
// a probing row can be cancelled, a probe-error row carries the same guidance
// as the probe error alert, and a needs-choice row offers its answers.

vi.mock('@tanstack/react-virtual', () => ({
	useVirtualizer: ({count, estimateSize}: {count: number; estimateSize: () => number}) => ({
		getTotalSize: () => count * estimateSize(),
		getVirtualItems: () => Array.from({length: count}, (_, index) => ({index, key: index, size: estimateSize(), start: index * estimateSize()})),
		measureElement: () => undefined,
		scrollToIndex: () => undefined
	})
}))

const UNRESOLVED: QueueItem['job'] = {kind: 'unresolved', extractor: '', extractorKey: ''}
const URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const BOT_BLOCK: LocalizedError = {kind: 'botBlock', raw: "Sign in to confirm you're not a bot"}
const VIEW: ExploreViewState = {url: '', title: '', canGoBack: false, canGoForward: false, loading: false, signedIn: false, error: null, adBlock: 'off'}

const actions = {retryQuickDownloadRow: vi.fn(), retryQuickDownloadRowWithCookies: vi.fn(), chooseQuickDownloadRow: vi.fn(), cancelItemDownload: vi.fn(), retryQueueItem: vi.fn(), takeListOffer: vi.fn(), dismissListOffer: vi.fn()}

function errorRow(error: LocalizedError = BOT_BLOCK): QueueItem {
	return makeItem({id: 'failed', status: 'error', url: URL, title: URL, error, job: UNRESOLVED, probeMode: 'video'})
}

function seed(queue: QueueItem[], common: Partial<AppSettings['common']> = {}, signedIn: boolean | null = false): void {
	const base = defaultAppSettings('/tmp')
	useAppStore.setState({...RESET_WIZARD_STATE, settings: {...base, common: {...base.common, ...common}}, exploreView: signedIn === null ? null : {...VIEW, signedIn}, queue, ...actions})
	render(<QueueManagerTab />)
}

function attention(id: string): HTMLElement {
	return screen.getByTestId(`queue-attention-${id}`)
}

beforeEach(() => {
	for (const fn of Object.values(actions)) fn.mockReset()
	window.appApi = buildMockAppApi()
	window.localStorage.clear()
	window.history.replaceState(null, '', '#queue')
})

afterEach(() => {
	window.history.replaceState(null, '', '#download')
})

describe('a probing row', () => {
	it('can be cancelled from the row', () => {
		seed([makeItem({id: 'probing', status: 'probing', url: URL, title: URL, job: UNRESOLVED, probeMode: 'video'})])
		fireEvent.click(within(screen.getByTestId('queue-manager-row-probing')).getByRole('button', {name: 'Cancel'}))
		expect(actions.cancelItemDownload).toHaveBeenCalledWith('probing')
	})

	it('carries no attention panel', () => {
		seed([makeItem({id: 'probing', status: 'probing', url: URL, title: URL, job: UNRESOLVED, probeMode: 'video'})])
		expect(screen.queryByTestId('queue-attention-probing')).not.toBeInTheDocument()
	})
})

describe('a probe-error row', () => {
	it('retries from the row', () => {
		seed([errorRow({kind: 'network', raw: 'offline'})])
		fireEvent.click(within(attention('failed')).getByRole('button', {name: 'Retry'}))
		expect(actions.retryQuickDownloadRow).toHaveBeenCalledWith('failed')
	})

	it('keeps a plain failure plain', () => {
		seed([errorRow({kind: 'network', raw: 'offline'})])
		const panel = attention('failed')
		expect(panel).toHaveTextContent('Network error')
		expect(within(panel).queryByTestId('bot-wall-notice')).toBeNull()
		expect(within(panel).queryByTestId('cookies-error-alert')).toBeNull()
	})

	it('enables configured cookies and retries, as the probe error alert does', () => {
		seed([errorRow()], {cookiesMode: 'off', cookiesPath: '/tmp/cookies.txt', exploreEnabled: false})
		const panel = attention('failed')
		expect(within(panel).getByTestId('bot-wall-notice')).toHaveTextContent('Cookies are configured but turned off')
		fireEvent.click(within(panel).getByRole('button', {name: 'Enable cookies and retry'}))
		expect(actions.retryQuickDownloadRowWithCookies).toHaveBeenCalledWith('failed')
	})

	it('opens cookie settings', () => {
		seed([errorRow()], {exploreEnabled: false})
		fireEvent.click(within(attention('failed')).getByRole('button', {name: 'Open cookies settings'}))
		expect(window.location.hash).toBe('#settings')
	})

	it('does not offer Retry on a row whose download (not probe) failed', () => {
		seed([makeItem({id: 'download-failed', status: 'error', error: BOT_BLOCK})], {exploreEnabled: false})
		expect(screen.queryByTestId('queue-attention-download-failed')).not.toBeInTheDocument()
	})
})

// The guidance under the Explore cookie mode, from the same inputs as the probe
// error alert: the cookies settings and the Explore sign-in state.
describe('a probe-error row under the explore cookie mode', () => {
	it.each([false, null])('asks to sign in in Explore exactly once while signed out (state %s)', signedIn => {
		seed([errorRow()], {cookiesMode: 'explore'}, signedIn)
		const panel = attention('failed')
		expect(within(panel).getAllByRole('button', {name: 'Sign in in Explore'})).toHaveLength(1)
		expect(within(panel).getByTestId('cookies-error-alert')).toHaveAttribute('data-variant', 'explore-sign-in')
		expect(within(panel).getByTestId('bot-wall-notice')).toHaveAttribute('data-variant', 'explore')
		expect(within(panel).queryByRole('button', {name: 'Open cookies settings'})).toBeNull()
	})

	it('opens the Explore tab from the sign-in call', () => {
		seed([errorRow()], {cookiesMode: 'explore'}, false)
		fireEvent.click(within(attention('failed')).getByRole('button', {name: 'Sign in in Explore'}))
		expect(window.location.hash).toBe('#explore')
	})

	it('says the user is signed in to Explore', () => {
		seed([errorRow()], {cookiesMode: 'explore'}, true)
		const panel = attention('failed')
		expect(within(panel).queryAllByRole('button', {name: 'Sign in in Explore'})).toHaveLength(0)
		expect(within(panel).getByTestId('cookies-error-alert')).toHaveTextContent('Signed in to Explore')
	})

	it('falls back to cookie settings while the Explore tab is turned off', () => {
		seed([errorRow()], {cookiesMode: 'explore', exploreEnabled: false}, false)
		const panel = attention('failed')
		expect(within(panel).queryAllByRole('button', {name: 'Sign in in Explore'})).toHaveLength(0)
		expect(within(panel).getByTestId('cookies-error-alert')).toHaveTextContent('This site requires sign-in')
		expect(within(panel).getByRole('button', {name: 'Open cookies settings'})).toBeInTheDocument()
	})
})

// ADR 0011: a row from another site leads to that site, whatever YouTube's
// sign-in, and keeps its own Retry for after the user signed in there.
describe('a probe-error row from another site under the explore cookie mode', () => {
	const VIMEO = 'https://vimeo.com/123456'

	it('opens the link in Explore to sign in, then retries from the row', () => {
		seed([{...errorRow({kind: 'loginRequired', raw: 'This video requires login'}), url: VIMEO}], {cookiesMode: 'explore', exploreNoticeSeen: true}, true)
		const panel = attention('failed')
		expect(within(panel).getByTestId('cookies-error-alert')).toHaveTextContent('This link may need an account on vimeo.com')
		fireEvent.click(within(panel).getByRole('button', {name: 'Sign in in Explore'}))
		expect(window.location.hash).toBe('#explore')
		expect(useAppStore.getState().explorePendingAddress).toBe(VIMEO)

		fireEvent.click(within(attention('failed')).getByRole('button', {name: 'Retry'}))
		expect(actions.retryQuickDownloadRow).toHaveBeenCalledWith('failed')
	})
})

// A failure the Explore session already ran into (the row's `auth`): the
// site refused it signed in, so the row offers its Retry and no sign-in.
describe('a row that already failed signed in', () => {
	const INSTAGRAM = 'https://www.instagram.com/stories/highlights/1/'
	// Instagram's API answering 500 to a signed-in run: not a login error.
	const REFUSED: LocalizedError = {kind: 'unknown', raw: 'ERROR: [instagram:story] 1: HTTP Error 500: Internal Server Error'}

	it.each(['explore', 'off'] as const)('says the site refused a probe signed in under the %s mode, with only Retry', mode => {
		seed([{...errorRow(REFUSED), url: INSTAGRAM, auth: 'exploreSession'}], {cookiesMode: mode, exploreNoticeSeen: true}, true)
		const panel = attention('failed')
		expect(within(panel).getByTestId('cookies-error-alert')).toHaveAttribute('data-variant', 'explore-refused')
		expect(within(panel).getByTestId('cookies-error-alert')).toHaveTextContent('The site refused this even with your Explore sign-in')
		expect(within(panel).queryByRole('button', {name: /sign in/i})).toBeNull()
		expect(within(panel).queryByRole('button', {name: 'Use my Explore sign-in and retry'})).toBeNull()
		fireEvent.click(within(panel).getByRole('button', {name: 'Retry'}))
		expect(actions.retryQuickDownloadRow).toHaveBeenCalledWith('failed')
	})

	it.each(['explore', 'off'] as const)('says the same under a download that still needed the account signed in under the %s mode', mode => {
		const ageRestricted: LocalizedError = {kind: 'ageRestricted', raw: 'ERROR: [instagram:story] 1: This content is age-restricted'}
		seed([makeItem({id: 'download-failed', status: 'error', url: INSTAGRAM, error: ageRestricted, auth: 'exploreSession'})], {cookiesMode: mode, exploreNoticeSeen: true}, true)
		const panel = attention('download-failed')
		expect(within(panel).getByTestId('cookies-error-alert')).toHaveAttribute('data-variant', 'explore-refused')
		expect(within(panel).queryByRole('button', {name: /sign in/i})).toBeNull()
	})

	// The download's job stays escalated: a later failure nothing names says nothing about the sign-in.
	it('gives a download that failed signed in with an unnamed error no sign-in guidance', () => {
		seed([makeItem({id: 'download-failed', status: 'error', url: INSTAGRAM, error: REFUSED, auth: 'exploreSession'})], {cookiesMode: 'explore', exploreNoticeSeen: true}, true)
		expect(screen.queryByTestId('queue-attention-download-failed')).not.toBeInTheDocument()
	})
})

// P2-R51: under `off` with the Explore tab on, a failure an account can fix
// leads with Explore; cookie settings stay the second way.
describe('a probe-error row under the off cookie mode with Explore enabled', () => {
	// Main answers a settings write with the merged settings.
	function echoSettingsWrites(): void {
		window.appApi.settings.update = vi.fn((patch: SettingsPatch) => {
			const current = useAppStore.getState().settings
			if (!current) throw new Error('no settings')
			return Promise.resolve(ok({...current, common: {...current.common, ...patch.common}}))
		})
	}

	it.each([false, null])('leads with Sign in with Explore exactly once, cookie settings second (state %s)', signedIn => {
		seed([errorRow()], {cookiesMode: 'off'}, signedIn)
		const panel = attention('failed')
		expect(within(panel).getByTestId('cookies-error-alert')).toHaveAttribute('data-variant', 'explore-offer')
		expect(panel).toHaveTextContent('This video may need a YouTube account')
		expect(panel).toHaveTextContent('Sign in with Explore and Arroxy will retry it.')
		expect(within(panel).getAllByRole('button', {name: 'Sign in with Explore'})).toHaveLength(1)
		expect(within(panel).getByRole('button', {name: 'Use a cookies file or browser instead…'})).toBeInTheDocument()
		expect(within(panel).getByTestId('bot-wall-notice')).toHaveAttribute('data-variant', 'explore')
		expect(within(panel).queryByRole('button', {name: 'Enable cookies and retry'})).toBeNull()
		expect(within(panel).queryByRole('button', {name: 'Open cookies settings'})).toBeNull()
	})

	it('Sign in with Explore switches the mode, opens Explore and waits for the sign-in to retry the row', async () => {
		echoSettingsWrites()
		seed([errorRow()], {cookiesMode: 'off'}, false)
		fireEvent.click(within(attention('failed')).getByRole('button', {name: 'Sign in with Explore'}))
		expect(window.location.hash).toBe('#explore')
		expect(useAppStore.getState().settings?.common).toMatchObject({cookiesMode: 'explore', exploreModeAutoSwitched: true})
		await waitFor(() => expect(useAppStore.getState().exploreRetryTargets).toEqual([{kind: 'row', itemId: 'failed'}]))
		expect(actions.retryQuickDownloadRow).not.toHaveBeenCalled()

		act(() => useAppStore.setState({exploreView: {...VIEW, signedIn: true}}))
		await waitFor(() => expect(actions.retryQuickDownloadRow).toHaveBeenCalledTimes(1))
		expect(actions.retryQuickDownloadRow).toHaveBeenCalledWith('failed')
	})

	it('opens cookie settings from the second action', () => {
		seed([errorRow()], {cookiesMode: 'off'}, false)
		fireEvent.click(within(attention('failed')).getByRole('button', {name: 'Use a cookies file or browser instead…'}))
		expect(window.location.hash).toBe('#settings')
	})

	it('offers "Use my Explore sign-in and retry" once signed in, and retries at once', async () => {
		echoSettingsWrites()
		seed([errorRow()], {cookiesMode: 'off', cookiesPath: '/tmp/cookies.txt'}, true)
		const panel = attention('failed')
		expect(within(panel).getByTestId('cookies-error-alert')).toHaveAttribute('data-variant', 'explore-reuse')
		expect(within(panel).queryByRole('button', {name: 'Sign in with Explore'})).toBeNull()
		fireEvent.click(within(panel).getByRole('button', {name: 'Use my Explore sign-in and retry'}))
		await waitFor(() => expect(actions.retryQuickDownloadRow).toHaveBeenCalledWith('failed'))
		expect(useAppStore.getState().settings?.common.cookiesMode).toBe('explore')
		expect(window.location.hash).toBe('#queue')
	})

	it('states the reason without cookie instructions that contradict the offer', () => {
		seed([errorRow({kind: 'loginRequired', raw: 'Sign in to view'})], {cookiesMode: 'off'}, false)
		const panel = attention('failed')
		expect(panel).toHaveTextContent('This video needs a signed-in account.')
		expect(panel.textContent).not.toMatch(/cookies\.txt|Settings →/)
		expect(screen.getByTestId('queue-error-msg').textContent).not.toMatch(/cookies/i)
	})

	it('makes Enable cookies and retry the second way when a cookies file is set up', () => {
		seed([errorRow()], {cookiesMode: 'off', cookiesPath: '/tmp/cookies.txt'}, false)
		const panel = attention('failed')
		expect(within(panel).getByRole('button', {name: 'Sign in with Explore'})).toBeInTheDocument()
		expect(within(panel).queryByRole('button', {name: 'Use a cookies file or browser instead…'})).toBeNull()
		expect(within(panel).getAllByRole('button', {name: 'Enable cookies and retry'})).toHaveLength(1)
		fireEvent.click(within(panel).getByRole('button', {name: 'Enable cookies and retry'}))
		expect(actions.retryQuickDownloadRowWithCookies).toHaveBeenCalledWith('failed')
	})

	it('shows no offer while the settings have not loaded', () => {
		seed([errorRow()], {cookiesMode: 'off'}, false)
		act(() => useAppStore.setState({settings: null}))
		expect(within(attention('failed')).queryByRole('button', {name: 'Sign in with Explore'})).toBeNull()
	})

	it('keeps the Explore offer off a rate-limited row', () => {
		seed([errorRow({kind: 'rateLimit', raw: 'HTTP Error 429'})], {cookiesMode: 'off'}, false)
		const panel = attention('failed')
		expect(within(panel).queryByRole('button', {name: 'Sign in with Explore'})).toBeNull()
		expect(within(panel).queryByTestId('bot-wall-notice')).toBeNull()
		expect(within(panel).getByTestId('rate-limit-notice')).toHaveAttribute('data-variant', 'failed')
	})

	it('offers "Try now" on a rate-limited row while its site cools down', async () => {
		seed([errorRow({kind: 'rateLimit', raw: 'HTTP Error 429'})], {cookiesMode: 'off'}, false)
		act(() => useAppStore.setState({siteCooldowns: [{site: 'youtube', until: new Date(Date.now() + 60_000).toISOString(), evidence: 'rateLimited'}]}))
		const panel = attention('failed')
		expect(within(panel).queryByTestId('quick-download-retry')).toBeNull()
		fireEvent.click(within(panel).getByTestId('rate-limit-try-now'))
		await waitFor(() => expect(actions.retryQuickDownloadRow).toHaveBeenCalledWith('failed'))
		expect(window.appApi.siteRequests.tryNow).toHaveBeenCalledWith('youtube')
	})

	it('keeps the file and browser modes as they were', () => {
		seed([errorRow()], {cookiesMode: 'file', cookiesPath: '/tmp/cookies.txt'}, false)
		const panel = attention('failed')
		expect(within(panel).queryByRole('button', {name: 'Sign in with Explore'})).toBeNull()
		expect(within(panel).getByRole('button', {name: 'Open cookies settings'})).toBeInTheDocument()
	})
})

// A download that fails for want of an account gets the same Explore guidance
// under `off` (the explore mode already escalates downloads). Its retry
// downloads again; it never probes.
describe('a download-error row under the off cookie mode with Explore enabled', () => {
	const LOGIN_REQUIRED: LocalizedError = {kind: 'loginRequired', raw: 'Sign in to view this video'}

	function downloadRow(error: LocalizedError = LOGIN_REQUIRED): QueueItem {
		return makeItem({id: 'download-failed', status: 'error', title: 'Members-only stream', error})
	}

	function echoSettingsWrites(): void {
		window.appApi.settings.update = vi.fn((patch: SettingsPatch) => {
			const current = useAppStore.getState().settings
			if (!current) throw new Error('no settings')
			return Promise.resolve(ok({...current, common: {...current.common, ...patch.common}}))
		})
	}

	it('offers Sign in with Explore in one alert, and downloads again once signed in', async () => {
		echoSettingsWrites()
		seed([downloadRow()], {cookiesMode: 'off'}, false)
		const panel = attention('download-failed')
		expect(within(panel).getAllByTestId('cookies-error-alert')).toHaveLength(1)
		expect(within(panel).queryByTestId('bot-wall-notice')).toBeNull()
		expect(within(panel).getAllByRole('button', {name: 'Sign in with Explore'})).toHaveLength(1)
		fireEvent.click(within(panel).getByRole('button', {name: 'Sign in with Explore'}))
		expect(window.location.hash).toBe('#explore')
		await waitFor(() => expect(useAppStore.getState().exploreRetryTargets).toEqual([{kind: 'download', itemId: 'download-failed'}]))

		act(() => useAppStore.setState({exploreView: {...VIEW, signedIn: true}}))
		await waitFor(() => expect(actions.retryQueueItem).toHaveBeenCalledTimes(1))
		expect(actions.retryQueueItem).toHaveBeenCalledWith('download-failed')
		expect(actions.retryQuickDownloadRow).not.toHaveBeenCalled()
	})

	it('Use my Explore sign-in and retry downloads again at once', async () => {
		echoSettingsWrites()
		seed([downloadRow()], {cookiesMode: 'off'}, true)
		fireEvent.click(within(attention('download-failed')).getByRole('button', {name: 'Use my Explore sign-in and retry'}))
		await waitFor(() => expect(actions.retryQueueItem).toHaveBeenCalledWith('download-failed'))
		expect(useAppStore.getState().settings?.common.cookiesMode).toBe('explore')
	})

	it('Enable cookies and retry turns the stored cookies on and downloads again', async () => {
		echoSettingsWrites()
		seed([downloadRow()], {cookiesMode: 'off', cookiesBrowser: 'firefox'}, false)
		fireEvent.click(within(attention('download-failed')).getByRole('button', {name: 'Enable cookies and retry'}))
		await waitFor(() => expect(actions.retryQueueItem).toHaveBeenCalledWith('download-failed'))
		expect(useAppStore.getState().settings?.common.cookiesMode).toBe('browser')
	})

	it.each([
		['the explore mode, which escalates downloads itself', {cookiesMode: 'explore'}, LOGIN_REQUIRED],
		['the file mode', {cookiesMode: 'file', cookiesPath: '/tmp/cookies.txt'}, LOGIN_REQUIRED],
		['a rate limit', {cookiesMode: 'off'}, {kind: 'rateLimit', raw: 'HTTP Error 429'}],
		['a failure no account can fix', {cookiesMode: 'off'}, {kind: 'network', raw: 'offline'}]
	] as const)('says nothing for %s', (_label, common, error) => {
		seed([downloadRow(error)], common, false)
		expect(screen.queryByTestId('queue-attention-download-failed')).not.toBeInTheDocument()
	})
})

describe('a needs-choice row', () => {
	function choiceRow(choice: QueueItem['choice']): QueueItem {
		return makeItem({id: 'choice', status: 'needs-choice', url: 'https://www.youtube.com/playlist?list=PLx', title: 'Road trip mix', choice, job: UNRESOLVED, probeMode: 'playlist'})
	}

	it('offers All, First N and Review for a list past the load limit', () => {
		seed([choiceRow({kind: 'list-size', loaded: 100, capped: true})])
		const panel = attention('choice')
		expect(panel).toHaveTextContent('More than 100 videos')
		expect(
			within(panel)
				.getAllByRole('button')
				.map(button => button.textContent)
		).toEqual(['All videos', 'First 100', 'Review'])
		for (const [name, answer] of [
			['All videos', 'all'],
			['First 100', 'first'],
			['Review', 'review']
		] as const) {
			fireEvent.click(within(panel).getByRole('button', {name}))
			expect(actions.chooseQuickDownloadRow).toHaveBeenLastCalledWith('choice', answer)
		}
	})

	it('offers All and Review for a list under the load limit', () => {
		seed([choiceRow({kind: 'list-size', loaded: 12, capped: false})])
		const panel = attention('choice')
		expect(panel).toHaveTextContent('12 videos')
		expect(panel).not.toHaveTextContent('More than')
		expect(
			within(panel)
				.getAllByRole('button')
				.map(button => button.textContent)
		).toEqual(['All videos', 'Review'])
		for (const [name, answer] of [
			['All videos', 'all'],
			['Review', 'review']
		] as const) {
			fireEvent.click(within(panel).getByRole('button', {name}))
			expect(actions.chooseQuickDownloadRow).toHaveBeenLastCalledWith('choice', answer)
		}
	})

	it('reads "Needs your choice" in the status column', () => {
		seed([choiceRow({kind: 'list-size', loaded: 12, capped: false})])
		expect(within(screen.getByTestId('queue-manager-row-choice')).getByText('Needs your choice')).toBeInTheDocument()
	})
})

// A video the hotkey took from a link that also names a list offers that list
// under its title: named by the kind, never counted as needing attention.
describe('a row with a list offer', () => {
	const offered = (id: string, listOffer: string, status: QueueItem['status'] = 'done'): QueueItem => makeItem({id, status, url: URL, title: `Video ${id}`, listOffer})

	it('names the list by its kind, and Get and Dismiss act on that row', () => {
		seed([offered('in-list', `${URL}&list=PLx`), offered('in-mix', `${URL}&list=RDdQw4w9WgXcQ`), offered('in-album', `${URL}&list=OLAK5uy_x`)])
		expect(screen.getByTestId('queue-list-offer-row-in-list')).toHaveTextContent('From a playlistGet the whole playlist')
		expect(screen.getByTestId('queue-list-offer-row-in-mix')).toHaveTextContent('From a MixGet the whole Mix')
		expect(screen.getByTestId('queue-list-offer-row-in-album')).toHaveTextContent('From an albumGet the whole album')

		fireEvent.click(screen.getByTestId('queue-list-offer-in-mix'))
		expect(actions.takeListOffer).toHaveBeenCalledWith('in-mix')
		fireEvent.click(screen.getByTestId('queue-list-offer-dismiss-in-album'))
		expect(actions.dismissListOffer).toHaveBeenCalledWith('in-album')
		expect(screen.queryByTestId('queue-attention-in-list')).not.toBeInTheDocument()
	})

	it('waits for the video to be prepared: a placeholder still holds the link itself', () => {
		seed([makeItem({id: 'probing', status: 'probing', url: URL, title: URL, job: UNRESOLVED, probeMode: 'video', listOffer: `${URL}&list=PLx`})])
		expect(screen.queryByTestId('queue-list-offer-row-probing')).not.toBeInTheDocument()
	})
})
