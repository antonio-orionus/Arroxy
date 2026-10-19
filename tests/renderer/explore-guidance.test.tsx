// @vitest-environment jsdom
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {StepError} from '@renderer/components/wizard/StepError.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {ok} from '@shared/result.js'
import type {SettingsPatch} from '@shared/api.js'
import type {AppSettings, ExploreViewState, ProbeError} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

const SINGLE_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const BOT_BLOCK: ProbeError = {kind: 'ytdlp', error: {kind: 'botBlock', raw: "Sign in to confirm you're not a bot"}}
const VIEW: ExploreViewState = {url: '', title: '', canGoBack: false, canGoForward: false, loading: false, signedIn: false, error: null, adBlock: 'off'}

function seed(common: Partial<AppSettings['common']>, signedIn: boolean | null): void {
	const base = defaultAppSettings('/tmp')
	useAppStore.setState({
		initialized: true,
		initializing: false,
		settings: {...base, common: {...base.common, clipboardWatchEnabled: false, exploreNoticeSeen: true, exploreModeAutoSwitched: true, ...common}},
		exploreView: signedIn === null ? null : {...VIEW, signedIn},
		wizardStep: 'url',
		wizardMode: 'single',
		wizardUrl: SINGLE_URL,
		wizardError: null,
		exploreRetryTargets: [],
		explorePendingAddress: null
	})
}

function signInButtons(): HTMLElement[] {
	return screen.queryAllByRole('button', {name: 'Sign in in Explore'})
}

beforeEach(() => {
	window.appApi = buildMockAppApi()
	window.history.replaceState(null, '', '#download')
})

// The same guidance on a quick download's probe-error row lives in queue-attention-rows.
describe('probe error step under the explore cookie mode', () => {
	it('leaves the error step for the Explore tab', () => {
		seed({cookiesMode: 'explore'}, false)
		useAppStore.setState({wizardStep: 'error', wizardError: BOT_BLOCK})
		render(<StepError />)

		expect(signInButtons()).toHaveLength(1)
		fireEvent.click(screen.getByRole('button', {name: 'Sign in in Explore'}))

		expect(window.location.hash).toBe('#explore')
		expect(useAppStore.getState().wizardStep).toBe('url')
		expect(useAppStore.getState().wizardError).toBeNull()
		expect(window.appApi.downloads.probeCancel).toHaveBeenCalled()
	})
})

// P2-R51: the same two actions as the row, with the same copy. Sign in with
// Explore leaves the wizard because the user asked to.
describe('probe error step under the off cookie mode with Explore enabled', () => {
	beforeEach(() => {
		window.appApi.settings.update = vi.fn((patch: SettingsPatch) => {
			const current = useAppStore.getState().settings
			if (!current) throw new Error('no settings')
			return Promise.resolve(ok({...current, common: {...current.common, ...patch.common}}))
		})
	})

	it('offers Sign in with Explore and cookie settings, and leaves for Explore waiting to retry the link', async () => {
		seed({cookiesMode: 'off', exploreModeAutoSwitched: false}, false)
		useAppStore.setState({wizardStep: 'error', wizardError: BOT_BLOCK, wizardErrorOrigin: 'formats'})
		render(<StepError />)

		expect(screen.getByTestId('cookies-error-alert')).toHaveTextContent('This video may need a YouTube account')
		expect(screen.getAllByRole('button', {name: 'Sign in with Explore'})).toHaveLength(1)
		expect(screen.getByRole('button', {name: 'Use a cookies file or browser instead…'})).toBeInTheDocument()
		expect(screen.queryByRole('button', {name: 'Enable cookies and retry'})).toBeNull()
		fireEvent.click(screen.getByRole('button', {name: 'Sign in with Explore'}))

		expect(window.location.hash).toBe('#explore')
		expect(useAppStore.getState()).toMatchObject({wizardStep: 'url', wizardError: null})
		// The wait is armed once the mode switch is saved.
		await waitFor(() => expect(useAppStore.getState().exploreRetryTargets).toEqual([{kind: 'wizard', url: SINGLE_URL}]))
		expect(useAppStore.getState().settings?.common).toMatchObject({cookiesMode: 'explore', exploreModeAutoSwitched: true})
	})

	it('offers Use my Explore sign-in and retry once signed in, and probes again in place', async () => {
		seed({cookiesMode: 'off'}, true)
		useAppStore.setState({wizardStep: 'error', wizardError: BOT_BLOCK, wizardErrorOrigin: 'formats'})
		render(<StepError />)

		expect(screen.queryByRole('button', {name: 'Sign in with Explore'})).toBeNull()
		fireEvent.click(screen.getByRole('button', {name: 'Use my Explore sign-in and retry'}))
		await waitFor(() => expect(window.appApi.downloads.probe).toHaveBeenCalledWith(expect.objectContaining({url: SINGLE_URL})))
		expect(useAppStore.getState().settings?.common.cookiesMode).toBe('explore')
		expect(window.location.hash).toBe('#download')
	})

	it('states the reason in the error line, without cookie instructions', () => {
		seed({cookiesMode: 'off'}, false)
		useAppStore.setState({wizardStep: 'error', wizardError: {kind: 'ytdlp', error: {kind: 'loginRequired', raw: 'Sign in'}}, wizardErrorOrigin: 'formats'})
		render(<StepError />)
		expect(screen.getByTestId('error-message')).toHaveTextContent('This video needs a signed-in account.')
		expect(screen.getByTestId('error-message').textContent).not.toMatch(/cookie/i)
	})

	it('keeps the old guidance while the Explore tab is turned off', () => {
		seed({cookiesMode: 'off', exploreEnabled: false}, false)
		useAppStore.setState({wizardStep: 'error', wizardError: BOT_BLOCK})
		render(<StepError />)
		expect(screen.queryByRole('button', {name: 'Sign in with Explore'})).toBeNull()
		expect(screen.getByRole('button', {name: 'Open cookies settings'})).toBeInTheDocument()
	})
})

// ADR 0011: another site's sign-in is on that site. The guidance names it,
// never reads YouTube's signed-in flag, and leaves the retry to the user.
describe('probe error step for a link on another site', () => {
	const VIMEO = 'https://vimeo.com/123456'
	const LOGIN: ProbeError = {kind: 'ytdlp', error: {kind: 'loginRequired', raw: 'This video requires login'}}

	it('under the explore mode, signed in to YouTube, sends the user to the site and keeps Retry', () => {
		seed({cookiesMode: 'explore'}, true)
		useAppStore.setState({wizardStep: 'error', wizardUrl: VIMEO, wizardError: LOGIN})
		render(<StepError />)

		const alert = screen.getByTestId('cookies-error-alert')
		expect(alert).toHaveTextContent('This link may need an account on vimeo.com')
		expect(alert).toHaveTextContent('Sign in to vimeo.com in Explore, then try again.')
		expect(screen.getByTestId('btn-retry')).toBeInTheDocument()
		fireEvent.click(screen.getByRole('button', {name: 'Sign in in Explore'}))

		expect(window.location.hash).toBe('#explore')
		expect(useAppStore.getState()).toMatchObject({explorePendingAddress: VIMEO, exploreRetryTargets: []})
	})

	it('under the off mode offers Sign in with Explore, never the YouTube sign-in Explore holds', async () => {
		window.appApi.settings.update = vi.fn((patch: SettingsPatch) => {
			const current = useAppStore.getState().settings
			if (!current) throw new Error('no settings')
			return Promise.resolve(ok({...current, common: {...current.common, ...patch.common}}))
		})
		seed({cookiesMode: 'off', exploreModeAutoSwitched: false}, true)
		useAppStore.setState({wizardStep: 'error', wizardUrl: VIMEO, wizardError: LOGIN, wizardErrorOrigin: 'formats'})
		render(<StepError />)

		expect(screen.getByTestId('cookies-error-alert')).toHaveTextContent('Sign in to vimeo.com with Explore, then try again.')
		expect(screen.queryByRole('button', {name: 'Use my Explore sign-in and retry'})).toBeNull()
		fireEvent.click(screen.getByRole('button', {name: 'Sign in with Explore'}))

		await waitFor(() => expect(useAppStore.getState().settings?.common.cookiesMode).toBe('explore'))
		expect(useAppStore.getState()).toMatchObject({explorePendingAddress: VIMEO, exploreRetryTargets: []})
		expect(window.location.hash).toBe('#explore')
	})
})

describe('probe error step after a signed-in probe failed', () => {
	it('says the site refused it even signed in, keeps Retry, and asks for no sign-in', () => {
		seed({cookiesMode: 'explore'}, true)
		const url = 'https://www.instagram.com/stories/highlights/1/'
		useAppStore.setState({wizardStep: 'error', wizardUrl: url, wizardError: {kind: 'ytdlp', error: {kind: 'loginRequired', raw: 'You need to log in to access this content.'}, auth: 'exploreSession'}})
		render(<StepError />)

		expect(screen.getByTestId('cookies-error-alert')).toHaveTextContent('The site refused this even with your Explore sign-in')
		expect(screen.queryByRole('button', {name: /sign in/i})).toBeNull()
		expect(screen.getByTestId('btn-retry')).toBeInTheDocument()
	})
})
