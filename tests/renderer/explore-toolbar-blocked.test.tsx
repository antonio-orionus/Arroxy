import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {TooltipProvider} from '@renderer/components/ui/tooltip.js'
import {DownloadProfilesHome} from '@renderer/components/wizard/DownloadProfilesHome.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {ok} from '@shared/result.js'
import type {ExploreViewState} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// The Explore toolbar's blocked buttons and its tooltips over the native view:
// a blocked Download, wand or profile chevron does nothing from the keyboard
// either and tells a screen reader why; a tooltip closes when the pointer goes
// straight from its button onto the view (the renderer gets no mouseleave then).

const INITIAL_STORE = useAppStore.getState()
const HOME: ExploreViewState = {url: 'https://www.youtube.com/', title: 'YouTube', canGoBack: false, canGoForward: false, loading: false, signedIn: false, error: null, adBlock: 'off'}
const WATCH_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const GRAB_HINT = 'Open a video, playlist, or channel to download it'
const BLOCKABLE = ['explore-download', 'explore-profile-trigger', 'explore-interactive'] as const

let stateListener: ((state: ExploreViewState) => void) | null = null
let pointerListener: (() => void) | null = null

function queryTip(): HTMLElement | null {
	return document.querySelector<HTMLElement>('[data-slot="tooltip-content"]')
}

async function renderOn(url: string): Promise<void> {
	window.history.replaceState(null, '', '#explore')
	render(
		<TooltipProvider>
			<DownloadProfilesHome />
		</TooltipProvider>
	)
	await waitFor(() => expect(stateListener).not.toBeNull())
	act(() => stateListener?.({...HOME, url}))
}

beforeEach(() => {
	window.appApi = buildMockAppApi()
	stateListener = null
	pointerListener = null
	vi.mocked(window.appApi.explore.onStateChanged).mockImplementation(listener => {
		stateListener = listener
		return () => {
			stateListener = null
		}
	})
	vi.mocked(window.appApi.explore.onPointerInView).mockImplementation(listener => {
		pointerListener = listener
		return () => {
			pointerListener = null
		}
	})
	vi.mocked(window.appApi.explore.getState).mockResolvedValue(ok(HOME))
	useAppStore.setState({exploreView: null})
	useAppStore.getState().bindExploreView()
	const base = defaultAppSettings('/tmp')
	useAppStore.setState({queue: [], wizardUrl: '', settings: {...base, common: {...base.common, exploreNoticeSeen: true, exploreModeAutoSwitched: true, cookiesMode: 'explore'}}})
})

afterEach(() => {
	vi.restoreAllMocks()
	window.history.replaceState(null, '', '#download')
	useAppStore.setState(INITIAL_STORE, true)
})

describe('a blocked toolbar button', () => {
	it.each(BLOCKABLE)('%s tells a screen reader why it is blocked', async id => {
		await renderOn('https://www.youtube.com/')
		expect(screen.getByTestId(id)).toHaveAttribute('aria-description', GRAB_HINT)
	})

	it.each(BLOCKABLE)('%s carries no blocked reason once it can act', async id => {
		await renderOn(WATCH_URL)
		expect(screen.getByTestId(id)).not.toHaveAttribute('aria-description', GRAB_HINT)
	})

	// Download's label names no profile: once it can act, its description does, as its hint does.
	it('describes Download with the profile once it can act', async () => {
		await renderOn(WATCH_URL)
		expect(screen.getByTestId('explore-download')).toHaveAttribute('aria-description', expect.stringMatching(/^Download · With .+/))
		expect(screen.getByTestId('explore-profile-trigger')).not.toHaveAttribute('aria-description')
		expect(screen.getByTestId('explore-interactive')).not.toHaveAttribute('aria-description')
	})

	// jsdom never turns Enter/Space on a button into a click, so the press is the
	// click a real key (or a pointer) would produce, with the key events around it.
	const PRESSES = ['pointer', 'Enter', ' '] as const
	const CASES = BLOCKABLE.flatMap(id => PRESSES.map(press => [id, press] as const))

	it.each(CASES)('a blocked %s ignores a %j press', async (id, press) => {
		const quickDownload = vi.fn().mockResolvedValue(undefined)
		const submitUrl = vi.fn().mockResolvedValue(undefined)
		useAppStore.setState({quickDownload, submitUrl})
		await renderOn('https://www.youtube.com/')

		const button = screen.getByTestId(id)
		expect(button).toHaveAttribute('aria-disabled', 'true')
		act(() => button.focus())
		const key = {key: press, code: press === ' ' ? 'Space' : press}
		if (press !== 'pointer') fireEvent.keyDown(button, key)
		fireEvent.click(button)
		if (press !== 'pointer') fireEvent.keyUp(button, key)

		expect(quickDownload).not.toHaveBeenCalled()
		expect(submitUrl).not.toHaveBeenCalled()
		expect(window.appApi.downloads.probe).not.toHaveBeenCalled()
		expect(screen.getByTestId('explore-profile-trigger')).not.toHaveAttribute('aria-expanded', 'true')
		expect(screen.queryByTestId('explore-profile-menu-grid')).not.toBeVisible()
	})
})

describe('a toolbar tooltip over the native view', () => {
	it('closes when the pointer enters the view, and opens again on the next hover', async () => {
		await renderOn(WATCH_URL)
		const button = screen.getByTestId('explore-interactive')
		fireEvent.mouseEnter(button)
		await waitFor(() => expect(queryTip()).toBeInTheDocument())

		act(() => pointerListener?.())
		await waitFor(() => expect(queryTip()).not.toBeInTheDocument())

		fireEvent.mouseLeave(button)
		fireEvent.mouseEnter(button)
		await waitFor(() => expect(queryTip()).toBeInTheDocument())
	})
})
