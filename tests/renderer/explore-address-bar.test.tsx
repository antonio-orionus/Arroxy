import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {DownloadProfilesHome} from '@renderer/components/wizard/DownloadProfilesHome.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {fail, ok} from '@shared/result.js'
import type {ExploreNavigateCommand, ExploreViewState} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// Explore's address bar is an omnibox that searches the chosen engine
// (DuckDuckGo unless another is picked). It shows the
// page's address until focused, routes Enter (a link on any site, a search,
// or the "can't open that address" hint), and never judges text mid-typing.

const PAGE: ExploreViewState = {url: 'https://www.youtube.com/watch?v=page0000001', title: 'A page', canGoBack: false, canGoForward: false, loading: false, signedIn: true, error: null, adBlock: 'off'}
const HINT = "Explore can't open that address."
// What main refuses in this harness: the renderer cannot tell it apart from any other link.
const MAIN_REFUSES = 'refused.example'

let stateListener: ((state: ExploreViewState) => void) | null = null

function navigateCalls(): ExploreNavigateCommand[] {
	return vi.mocked(window.appApi.explore.navigate).mock.calls.map(([command]) => command)
}

async function renderExplore(): Promise<HTMLInputElement> {
	window.history.replaceState(null, '', '#explore')
	render(<DownloadProfilesHome />)
	await waitFor(() => expect(stateListener).not.toBeNull())
	act(() => stateListener?.(PAGE))
	const input = screen.getByTestId('explore-address')
	if (!(input instanceof HTMLInputElement)) throw new Error('the address bar is not an input')
	return input
}

function typeAndEnter(input: HTMLInputElement, text: string): void {
	fireEvent.focus(input)
	fireEvent.change(input, {target: {value: text}})
	fireEvent.keyDown(input, {key: 'Enter'})
}

beforeEach(() => {
	window.appApi = buildMockAppApi()
	stateListener = null
	vi.mocked(window.appApi.explore.onStateChanged).mockImplementation(listener => {
		stateListener = listener
		return () => {
			stateListener = null
		}
	})
	vi.mocked(window.appApi.explore.getState).mockResolvedValue(ok(PAGE))
	vi.mocked(window.appApi.explore.navigate).mockImplementation(command => {
		if (command.kind !== 'address' || new URL(command.url).hostname !== MAIN_REFUSES) return Promise.resolve(ok(undefined))
		return Promise.resolve(fail({code: 'validation', message: 'Explore does not load that address'}))
	})
	useAppStore.setState({exploreView: null, exploreAddressHint: null, queue: []})
	useAppStore.getState().bindExploreView()
	const base = defaultAppSettings('/tmp')
	useAppStore.setState({settings: {...base, common: {...base.common, exploreNoticeSeen: true, exploreModeAutoSwitched: true, cookiesMode: 'explore'}}})
})

describe('Explore address bar', () => {
	it('shows the page address, and the placeholder only when there is none', async () => {
		const input = await renderExplore()
		expect(input).toHaveValue(PAGE.url)
		expect(input).not.toHaveAttribute('readonly')
		expect(input).toHaveAttribute('placeholder', 'Search DuckDuckGo or open any site (Vimeo, Instagram…)')
		act(() => stateListener?.({...PAGE, url: ''}))
		expect(input).toHaveValue('')
	})

	it('selects the whole address on focus, so a paste replaces it', async () => {
		const input = await renderExplore()
		fireEvent.focus(input)
		expect([input.selectionStart, input.selectionEnd]).toEqual([0, PAGE.url.length])
	})

	it.each([
		['Esc', (input: HTMLInputElement) => fireEvent.keyDown(input, {key: 'Escape'})],
		['blur', (input: HTMLInputElement) => fireEvent.blur(input)]
	])('%s restores the page address and discards the edit', async (_how, leave) => {
		const input = await renderExplore()
		fireEvent.focus(input)
		fireEvent.change(input, {target: {value: 'half-typed'}})
		expect(input).toHaveValue('half-typed')
		leave(input)
		expect(input).toHaveValue(PAGE.url)
		expect(navigateCalls()).toEqual([])
	})

	it('loads a YouTube link in the view, in its watch-page form', async () => {
		const input = await renderExplore()
		typeAndEnter(input, 'youtu.be/abc123?t=42&si=share')
		await waitFor(() => expect(navigateCalls()).toEqual([{kind: 'address', url: 'https://www.youtube.com/watch?v=abc123&t=42'}]))
		await waitFor(() => expect(input).toHaveValue(PAGE.url))
		expect(screen.queryByTestId('explore-address-hint')).toBeNull()
	})

	it('ignores Enter that confirms an input-method candidate', async () => {
		const input = await renderExplore()
		fireEvent.focus(input)
		fireEvent.change(input, {target: {value: 'にほんご'}})
		fireEvent.keyDown(input, {key: 'Enter', isComposing: true})
		fireEvent.keyDown(input, {key: 'Enter'})
		await waitFor(() => expect(navigateCalls()).toEqual([{kind: 'address', url: 'https://duckduckgo.com/?q=%E3%81%AB%E3%81%BB%E3%82%93%E3%81%94'}]))
	})

	it('searches DuckDuckGo for plain text', async () => {
		const input = await renderExplore()
		typeAndEnter(input, 'lofi beats')
		await waitFor(() => expect(navigateCalls()).toEqual([{kind: 'address', url: 'https://duckduckgo.com/?q=lofi+beats'}]))
	})

	it.each([
		['youtube', 'YouTube', 'https://www.youtube.com/results?search_query=cats'],
		['brave', 'Brave', 'https://search.brave.com/search?q=cats'],
		['google', 'Google', 'https://www.google.com/search?q=cats'],
		['bing', 'Bing', 'https://www.bing.com/search?q=cats']
	] as const)('searches %s once it is the chosen engine, and says so', async (engine, name, url) => {
		const input = await renderExplore()
		act(() => {
			const settings = useAppStore.getState().settings
			if (settings) useAppStore.setState({settings: {...settings, common: {...settings.common, exploreSearchEngine: engine}}})
		})
		expect(input).toHaveAttribute('placeholder', `Search ${name} or open any site (Vimeo, Instagram…)`)
		typeAndEnter(input, 'cats')
		await waitFor(() => expect(navigateCalls()).toEqual([{kind: 'address', url}]))
	})

	it.each([
		['node.js', 'https://duckduckgo.com/?q=node.js'],
		['e.g.', 'https://duckduckgo.com/?q=e.g.']
	])('searches DuckDuckGo for the dotted word %s', async (text, url) => {
		const input = await renderExplore()
		typeAndEnter(input, text)
		await waitFor(() => expect(navigateCalls()).toEqual([{kind: 'address', url}]))
		expect(screen.queryByTestId('explore-address-hint')).toBeNull()
	})

	// Leaving the tab drops what Enter last said and any edit in progress.
	it('forgets the hint when the user leaves the Explore tab', async () => {
		const input = await renderExplore()
		typeAndEnter(input, 'javascript:alert(1)')
		await screen.findByTestId('explore-address-hint')

		fireEvent.click(screen.getByRole('tab', {name: 'Settings'}))
		expect(useAppStore.getState().exploreAddressHint).toBeNull()
		fireEvent.click(screen.getByRole('tab', {name: /Explore/}))
		expect(await screen.findByTestId('explore-address')).toHaveValue(PAGE.url)
		expect(screen.queryByTestId('explore-address-hint')).toBeNull()
	})

	it('forgets a pending edit when the user leaves the Explore tab', async () => {
		const input = await renderExplore()
		fireEvent.focus(input)
		fireEvent.change(input, {target: {value: 'half-typed'}})

		fireEvent.click(screen.getByRole('tab', {name: 'Settings'}))
		fireEvent.click(screen.getByRole('tab', {name: /Explore/}))
		expect(await screen.findByTestId('explore-address')).toHaveValue(PAGE.url)
	})

	it('judges nothing while the user types', async () => {
		const input = await renderExplore()
		fireEvent.focus(input)
		for (const value of ['e', 'example', 'example.com', 'javascript:']) fireEvent.change(input, {target: {value}})
		expect(screen.queryByTestId('explore-address-hint')).toBeNull()
		expect(input).not.toHaveAttribute('aria-invalid')
		expect(navigateCalls()).toEqual([])
	})

	it.each([
		['vimeo.com/123', 'https://vimeo.com/123'],
		['https://example.com/page?a=1', 'https://example.com/page?a=1'],
		['http://example.com/', 'http://example.com/']
	])('loads the link %s on another site in the view', async (text, url) => {
		const input = await renderExplore()
		typeAndEnter(input, text)
		await waitFor(() => expect(navigateCalls()).toEqual([{kind: 'address', url}]))
		await waitFor(() => expect(input).toHaveValue(PAGE.url))
		expect(screen.queryByTestId('explore-address-hint')).toBeNull()
		expect(window.appApi.shell.openExternal).not.toHaveBeenCalled()
	})

	it('shows the hint when main refuses the address', async () => {
		const input = await renderExplore()
		typeAndEnter(input, `https://${MAIN_REFUSES}/x`)
		expect(await screen.findByTestId('explore-address-hint')).toHaveTextContent(HINT)
		expect(input).toHaveValue(`https://${MAIN_REFUSES}/x`)
	})

	it.each([
		['Esc', (input: HTMLInputElement) => fireEvent.keyDown(input, {key: 'Escape'})],
		['an edit', (input: HTMLInputElement) => fireEvent.change(input, {target: {value: 'javascript:alert(2)'}})]
	])('the hint closes on %s', async (_how, act_) => {
		const input = await renderExplore()
		typeAndEnter(input, 'javascript:alert(1)')
		await screen.findByTestId('explore-address-hint')
		act_(input)
		expect(screen.queryByTestId('explore-address-hint')).toBeNull()
	})

	it.each(['javascript:alert(1)', 'https://user:pass@www.youtube.com/', 'https://accounts.google.com/ServiceLogin', 'myaccount.google.com/security'])('refuses %s without sending it', async text => {
		const input = await renderExplore()
		typeAndEnter(input, text)
		expect(await screen.findByTestId('explore-address-hint')).toHaveTextContent(HINT)
		expect(navigateCalls()).toEqual([])
	})

	it('Enter on an empty bar goes nowhere', async () => {
		const input = await renderExplore()
		typeAndEnter(input, '   ')
		expect(navigateCalls()).toEqual([])
		expect(screen.queryByTestId('explore-address-hint')).toBeNull()
	})

	// Only main's refusal of the address is about the address; any other
	// failure (IPC, an error in main) says nothing about the link.
	it('shows no hint when navigation fails for another reason', async () => {
		vi.mocked(window.appApi.explore.navigate).mockResolvedValue(fail({code: 'ipc', message: 'no handler'}))
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const input = await renderExplore()
		typeAndEnter(input, 'vimeo.com/123')
		await waitFor(() => expect(warn).toHaveBeenCalled())
		expect(screen.queryByTestId('explore-address-hint')).toBeNull()
		warn.mockRestore()
	})

	it('says a search over the cap is too long, and sends nothing', async () => {
		const input = await renderExplore()
		typeAndEnter(input, 'word '.repeat(500))
		const hint = await screen.findByTestId('explore-address-hint')
		expect(hint).toHaveTextContent('That search is too long')
		expect(hint).not.toHaveTextContent(HINT)
		expect(navigateCalls()).toEqual([])
	})

	// A refusal that lands after the user left the tab must not bring the hint back.
	it('ignores a navigation result that lands after the tab was left', async () => {
		let answer: (result: Awaited<ReturnType<typeof window.appApi.explore.navigate>>) => void = () => undefined
		vi.mocked(window.appApi.explore.navigate).mockImplementation(() => new Promise(resolve => (answer = resolve)))
		const input = await renderExplore()
		typeAndEnter(input, 'vimeo.com/123')
		await waitFor(() => expect(navigateCalls()).toHaveLength(1))

		fireEvent.click(screen.getByRole('tab', {name: 'Settings'}))
		await act(async () => answer(fail({code: 'validation', message: 'Explore does not load that address'})))
		expect(useAppStore.getState().exploreAddressHint).toBeNull()
	})

	// Screen readers announce the hint: the live region is there before it, and empty.
	it('announces the hint through a polite live region that is always mounted', async () => {
		const input = await renderExplore()
		const region = screen.getByTestId('explore-address-hint-live')
		expect(region).toHaveAttribute('role', 'status')
		expect(region).toHaveAttribute('aria-live', 'polite')
		expect(region).toBeEmptyDOMElement()
		typeAndEnter(input, 'javascript:alert(1)')
		await waitFor(() => expect(region).toHaveTextContent(HINT))
		fireEvent.keyDown(input, {key: 'Escape'})
		expect(region).toBeEmptyDOMElement()
	})
})
