// @vitest-environment jsdom
import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {DownloadProfilesSettingsTab} from '@renderer/components/wizard/DownloadProfilesSettingsTab.js'
import {TooltipProvider} from '@renderer/components/ui/tooltip.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {fail, ok} from '@shared/result.js'
import {setNotificationSink} from '@renderer/lib/notify.js'
import type {SettingsPatch} from '@shared/api.js'
import type {AppSettings, ExploreViewState} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

const SIGNED_OUT: ExploreViewState = {url: '', title: '', canGoBack: false, canGoForward: false, loading: false, signedIn: false, error: null, adBlock: 'off'}
const SIGNED_IN: ExploreViewState = {...SIGNED_OUT, signedIn: true}

let stateListener: ((state: ExploreViewState) => void) | null = null

function seed(common: Partial<AppSettings['common']>, exploreView: ExploreViewState | null = SIGNED_OUT): void {
	const base = defaultAppSettings('/tmp')
	useAppStore.setState({initialized: true, initializing: false, settings: {...base, common: {...base.common, ...common}}, exploreView})
}

function mount(common: Partial<AppSettings['common']> = {}, exploreView: ExploreViewState | null = SIGNED_OUT): void {
	seed(common, exploreView)
	render(
		<TooltipProvider>
			<DownloadProfilesSettingsTab />
		</TooltipProvider>
	)
}

function settingsWrites(): SettingsPatch[] {
	return vi.mocked(window.appApi.settings.update).mock.calls.map(([patch]) => patch)
}

function cookiesSource(): HTMLElement {
	return screen.getByTestId('cookies-source')
}

beforeEach(() => {
	window.appApi = buildMockAppApi()
	vi.mocked(window.appApi.settings.update).mockImplementation(async (patch: SettingsPatch) => {
		const current = useAppStore.getState().settings ?? defaultAppSettings('/tmp')
		return ok({...current, common: {...current.common, ...patch.common}})
	})
	stateListener = null
	vi.mocked(window.appApi.explore.onStateChanged).mockImplementation(listener => {
		stateListener = listener
		return () => {
			stateListener = null
		}
	})
	window.history.replaceState(null, '', '#settings')
})

afterEach(() => {
	useAppStore.setState({exploreView: null})
})

describe('cookie source: Explore sign-in', () => {
	it('lists Explore sign-in first, marked Recommended, and selects it', async () => {
		mount({cookiesMode: 'off'})
		const group = within(cookiesSource())
		const sources = group.getAllByRole('button').filter(button => button.hasAttribute('aria-pressed'))
		expect(sources.map(button => button.textContent)).toEqual(['Explore sign-in Recommended', 'Off', 'File', 'Browser'])
		expect(within(sources[0]).getByText('Recommended')).toHaveAttribute('data-slot', 'badge')
		expect(group.getAllByText('Recommended')).toHaveLength(1)

		fireEvent.click(group.getByRole('button', {name: /^Explore sign-in/}))

		await waitFor(() => expect(settingsWrites()).toContainEqual({common: {cookiesMode: 'explore'}}))
	})

	it('shows a stored explore mode as selected, with the ban warning and how it works', () => {
		mount({cookiesMode: 'explore'})
		const group = within(cookiesSource())
		expect(group.getByRole('button', {name: /^Explore sign-in/})).toHaveAttribute('aria-pressed', 'true')
		expect(group.getByRole('button', {name: 'Off'})).toHaveAttribute('aria-pressed', 'false')
		expect(group.getByText(/may flag — and sometimes ban/)).toBeInTheDocument()
		expect(group.getByText('Uses your Explore sign-in only when a download needs it.')).toBeInTheDocument()
	})

	it('opens the Explore tab from the explore description', () => {
		mount({cookiesMode: 'explore'})
		fireEvent.click(within(cookiesSource()).getByRole('button', {name: 'Open Explore'}))
		expect(window.location.hash).toBe('#explore')
	})

	it('never links to the Explore tab while it is turned off', () => {
		mount({cookiesMode: 'explore', exploreEnabled: false})
		expect(within(cookiesSource()).queryByRole('button', {name: 'Open Explore'})).toBeNull()
		expect(within(cookiesSource()).getByText(/The Explore tab is off/)).toBeInTheDocument()
	})

	it('shows neither the ban warning nor the Explore description while cookies are off', () => {
		mount({cookiesMode: 'off'})
		expect(within(cookiesSource()).queryByText(/may flag — and sometimes ban/)).toBeNull()
		expect(within(cookiesSource()).queryByText('Uses your Explore sign-in only when a download needs it.')).toBeNull()
	})
})

describe('Explore settings panel', () => {
	it('shows the Explore tab by default and turns it off', async () => {
		mount({})
		const panel = within(screen.getByTestId('explore-settings'))
		const toggle = panel.getByRole('switch', {name: 'Show the Explore tab'})
		expect(toggle).toHaveAttribute('aria-checked', 'true')

		fireEvent.click(toggle)

		await waitFor(() => expect(settingsWrites()).toContainEqual({common: {exploreEnabled: false}}))
	})

	it('searches DuckDuckGo until another engine is picked, and saves the pick', async () => {
		mount({})
		const engine = within(screen.getByTestId('explore-settings')).getByRole('combobox', {name: 'Search engine'})
		expect(engine).toHaveTextContent('DuckDuckGo')

		fireEvent.click(engine)
		const options = await screen.findAllByRole('option')
		expect(options.map(option => option.textContent)).toEqual(['DuckDuckGo', 'Brave', 'Google', 'Bing', 'YouTube'])
		const brave = await screen.findByRole('option', {name: 'Brave'})
		// Keyboard selection: Base UI commits an option on Enter (plain jsdom clicks carry no pointer type).
		brave.focus()
		fireEvent.keyDown(brave, {key: 'Enter'})

		await waitFor(() => expect(settingsWrites()).toContainEqual({common: {exploreSearchEngine: 'brave'}}))
		expect(engine).toHaveTextContent('Brave')
	})

	it('shows a stored search engine', () => {
		mount({exploreSearchEngine: 'youtube'})
		expect(within(screen.getByTestId('explore-settings')).getByRole('combobox', {name: 'Search engine'})).toHaveTextContent('YouTube')
	})

	it('reflects a stored opt-out', () => {
		mount({exploreEnabled: false})
		expect(within(screen.getByTestId('explore-settings')).getByRole('switch', {name: 'Show the Explore tab'})).toHaveAttribute('aria-checked', 'false')
	})

	it.each<[string, ExploreViewState | null]>([
		['signed out', SIGNED_OUT],
		['not known yet', null]
	])('disables Sign out of Explore while Explore was never opened and the sign-in is %s', (_label, view) => {
		mount({exploreNoticeSeen: false}, view)
		expect(screen.getByRole('button', {name: 'Sign out of Explore'})).toBeDisabled()
	})

	// P2-R31: once Explore has been used, its partition may hold data even
	// without a sign-in (a verified sign-out leaves cookies behind); sign-out
	// clears it and is harmless when there is nothing to clear.
	it.each<[string, ExploreViewState | null]>([
		['signed out', SIGNED_OUT],
		['not known yet', null],
		['signed in', SIGNED_IN]
	])('enables Sign out of Explore once Explore has been used, %s', (_label, view) => {
		mount({exploreNoticeSeen: true}, view)
		expect(screen.getByRole('button', {name: 'Sign out of Explore'})).toBeEnabled()
	})

	it('signs out only after confirming', async () => {
		mount({}, SIGNED_IN)
		fireEvent.click(screen.getByRole('button', {name: 'Sign out of Explore'}))
		const dialog = await screen.findByRole('dialog')
		expect(within(dialog).getByText('Sign out of Explore?')).toBeInTheDocument()

		fireEvent.click(within(dialog).getByRole('button', {name: 'Sign out'}))

		await waitFor(() => expect(window.appApi.explore.signOut).toHaveBeenCalledTimes(1))
		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
	})

	it('shows an error toast when sign-out fails', async () => {
		const notices: string[] = []
		setNotificationSink((level, message) => notices.push(`${level}:${message}`))
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
		vi.mocked(window.appApi.explore.signOut).mockResolvedValue(fail({code: 'unknown', message: 'clear failed'}))
		mount({}, SIGNED_IN)
		fireEvent.click(screen.getByRole('button', {name: 'Sign out of Explore'}))
		fireEvent.click(within(await screen.findByRole('dialog')).getByRole('button', {name: 'Sign out'}))

		await waitFor(() => expect(notices).toEqual(['error:Could not sign out of Explore. Try again.']))
		setNotificationSink(null)
	})

	it('keeps the sign-in when the confirmation is cancelled', async () => {
		mount({}, SIGNED_IN)
		fireEvent.click(screen.getByRole('button', {name: 'Sign out of Explore'}))
		const dialog = await screen.findByRole('dialog')

		fireEvent.click(within(dialog).getByRole('button', {name: 'Cancel'}))

		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
		expect(window.appApi.explore.signOut).not.toHaveBeenCalled()
	})

	it('follows the sign-in state main pushes', () => {
		seed({}, null)
		vi.mocked(window.appApi.explore.getState).mockReturnValue(new Promise(() => undefined))
		useAppStore.getState().bindExploreView()
		render(
			<TooltipProvider>
				<DownloadProfilesSettingsTab />
			</TooltipProvider>
		)
		expect(screen.getByRole('button', {name: 'Sign out of Explore'})).toBeDisabled()

		act(() => stateListener?.(SIGNED_IN))

		expect(screen.getByRole('button', {name: 'Sign out of Explore'})).toBeEnabled()
	})
})

describe('Explore sign-in state in the store', () => {
	it('starts unknown, then takes the initial read', async () => {
		vi.mocked(window.appApi.explore.getState).mockResolvedValue(ok(SIGNED_IN))
		useAppStore.setState({exploreView: null})
		useAppStore.getState().bindExploreView()
		await waitFor(() => expect(useAppStore.getState().exploreView).toEqual(SIGNED_IN))
	})

	it('keeps a pushed state over a late initial read', async () => {
		let answer: (value: Awaited<ReturnType<typeof window.appApi.explore.getState>>) => void = () => undefined
		vi.mocked(window.appApi.explore.getState).mockReturnValue(new Promise(resolve => (answer = resolve)))
		useAppStore.setState({exploreView: null})
		useAppStore.getState().bindExploreView()

		stateListener?.(SIGNED_IN)
		answer(ok(SIGNED_OUT))
		await Promise.resolve()

		expect(useAppStore.getState().exploreView).toEqual(SIGNED_IN)
	})

	it('drops an initial read that answers after a rebind', async () => {
		const answers: Array<(value: Awaited<ReturnType<typeof window.appApi.explore.getState>>) => void> = []
		vi.mocked(window.appApi.explore.getState).mockImplementation(() => new Promise(resolve => answers.push(resolve)))
		useAppStore.setState({exploreView: null})
		useAppStore.getState().bindExploreView()
		useAppStore.getState().bindExploreView()

		answers[1]?.(ok(SIGNED_OUT))
		await Promise.resolve()
		answers[0]?.(ok(SIGNED_IN))
		await Promise.resolve()

		expect(useAppStore.getState().exploreView).toEqual(SIGNED_OUT)
	})

	it('logs a failed initial read and stays unknown', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		vi.mocked(window.appApi.explore.getState).mockResolvedValue(fail({code: 'unknown', message: 'no state'}))
		useAppStore.setState({exploreView: null})
		useAppStore.getState().bindExploreView()

		await waitFor(() => expect(warn).toHaveBeenCalledWith('[explore] initial state read failed', expect.objectContaining({message: 'no state'})))
		expect(useAppStore.getState().exploreView).toBeNull()
		warn.mockRestore()
	})

	it('holds one subscription however often it is bound', () => {
		const unsubscribe = vi.fn()
		vi.mocked(window.appApi.explore.onStateChanged).mockReturnValue(unsubscribe)
		useAppStore.getState().bindExploreView()
		useAppStore.getState().bindExploreView()
		expect(window.appApi.explore.onStateChanged).toHaveBeenCalledTimes(2)
		expect(unsubscribe).toHaveBeenCalledTimes(1)
	})
})
