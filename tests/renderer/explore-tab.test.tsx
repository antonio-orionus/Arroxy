import {useLayoutEffect} from 'react'
import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {hasBlockingOverlay} from '@renderer/components/explore/exploreLayout.js'
import {TooltipProvider} from '@renderer/components/ui/tooltip.js'
import {DownloadProfilesHome} from '@renderer/components/wizard/DownloadProfilesHome.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import {fail, ok} from '@shared/result.js'
import type {SettingsPatch} from '@shared/api.js'
import type {AppSettings, CookiesMode, ExploreViewState, ProbeError} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {makeItem} from '../shared/fixtures.js'

vi.mock('@tanstack/react-virtual', () => ({
	useVirtualizer: ({count, estimateSize}: {count: number; estimateSize: () => number}) => {
		const size = estimateSize()
		return {getTotalSize: () => count * size, getVirtualItems: () => Array.from({length: count}, (_, index) => ({index, key: index, size, start: index * size})), measureElement: () => undefined}
	}
}))

const INITIAL_STORE = useAppStore.getState()
const HOME: ExploreViewState = {url: 'https://www.youtube.com/', title: 'YouTube', canGoBack: false, canGoForward: false, loading: false, signedIn: false, error: null, adBlock: 'off'}
const WATCH_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const INTERACTIVE_HINT = 'Interactive Download: choose format, subtitles and more…'

function activeProfileName(): string {
	return resolveActiveDownloadProfile(useAppStore.getState().settings?.profiles).profile.name
}

type ExploreCommon = Pick<AppSettings['common'], 'exploreEnabled' | 'exploreNoticeSeen' | 'exploreModeAutoSwitched' | 'exploreModeNudgeDismissedFor' | 'cookiesMode' | 'exploreAdBlock' | 'exploreCompactChrome'>

let stateListener: ((state: ExploreViewState) => void) | null = null
let viewportRect = {x: 24, y: 180, width: 640, height: 360}

function seedSettings(common: ExploreCommon): void {
	const base = defaultAppSettings('/tmp')
	useAppStore.setState({settings: {...base, common: {...base.common, ...common}}})
}

// Main answers a settings write with the merged settings, like SettingsStore.
function echoSettingsWrites(): void {
	vi.mocked(window.appApi.settings.update).mockImplementation(async (patch: SettingsPatch) => {
		const current = useAppStore.getState().settings ?? defaultAppSettings('/tmp')
		return ok({...current, common: {...current.common, ...patch.common}, profiles: patch.profiles ? {...current.profiles, ...patch.profiles} : current.profiles})
	})
}

function settingsWrites(): SettingsPatch[] {
	return vi.mocked(window.appApi.settings.update).mock.calls.map(([patch]) => patch)
}

function visibilityCalls(): boolean[] {
	return vi.mocked(window.appApi.explore.setVisible).mock.calls.map(([visible]) => visible)
}

// Base UI's tooltip popup carries no ARIA role; the primitive marks it by slot.
function queryTip(): HTMLElement | null {
	return document.querySelector<HTMLElement>('[data-slot="tooltip-content"]')
}

async function findTip(): Promise<HTMLElement> {
	return waitFor(() => {
		const tip = queryTip()
		if (!tip) throw new Error('no tooltip is open')
		return tip
	})
}

function emitState(patch: Partial<ExploreViewState>): void {
	act(() => stateListener?.({...HOME, ...patch}))
}

function renderExplore(): ReturnType<typeof render> {
	window.history.replaceState(null, '', '#explore')
	// The app's provider owns the tooltip delay.
	return render(
		<TooltipProvider>
			<DownloadProfilesHome />
		</TooltipProvider>
	)
}

beforeEach(() => {
	window.appApi = buildMockAppApi()
	echoSettingsWrites()
	stateListener = null
	vi.mocked(window.appApi.explore.onStateChanged).mockImplementation(listener => {
		stateListener = listener
		return () => {
			stateListener = null
		}
	})
	vi.mocked(window.appApi.explore.getState).mockResolvedValue(ok(HOME))
	// The store holds the one subscription (bound by initialize() in the app).
	useAppStore.setState({exploreView: null})
	useAppStore.getState().bindExploreView()
	viewportRect = {x: 24, y: 180, width: 640, height: 360}
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
		const toastRect = this.dataset.testToastRect
		const {x, y, width, height} = this.dataset.testid === 'explore-viewport' ? viewportRect : toastRect ? (JSON.parse(toastRect) as typeof viewportRect) : {x: 0, y: 0, width: 1024, height: 768}
		return {x, y, width, height, top: y, left: x, right: x + width, bottom: y + height, toJSON: () => ({})}
	})
	window.history.replaceState(null, '', '#download')
	localStorage.clear()
	useAppStore.setState({queue: [], wizardUrl: '', quickDownloadStatus: 'idle', quickDownloadFailure: null, quickDownloadProgressFailed: 0, uiZoom: 1})
	seedSettings({exploreNoticeSeen: true, exploreModeAutoSwitched: true, cookiesMode: 'explore'})
})

afterEach(() => {
	vi.restoreAllMocks()
	document.querySelectorAll('[data-test-overlay]').forEach(node => node.remove())
	useAppStore.setState(INITIAL_STORE, true)
})

describe('Explore tab trigger', () => {
	it('sits right after the URL tab and owns the #explore hash', () => {
		render(<DownloadProfilesHome />)

		const names = within(screen.getByTestId('profiles-tabs'))
			.getAllByRole('tab')
			.map(tab => tab.textContent)
		expect(names[0]).toMatch(/^URL/)
		expect(names[1]).toMatch(/^Explore/)
		expect(names[2]).toMatch(/^Downloads/)

		fireEvent.click(screen.getByRole('tab', {name: /^explore/i}))
		expect(window.location.hash).toBe('#explore')
		expect(screen.getByRole('tab', {name: /^explore/i})).toHaveAttribute('aria-selected', 'true')
	})

	it('opens on Explore when the hash says so', () => {
		renderExplore()
		expect(screen.getByRole('tab', {name: /^explore/i})).toHaveAttribute('aria-selected', 'true')
		expect(screen.getByTestId('explore-tab')).toBeInTheDocument()
	})

	it('shows the New badge until the notice is acknowledged', () => {
		seedSettings({exploreNoticeSeen: false})
		const {unmount} = render(<DownloadProfilesHome />)
		expect(within(screen.getByRole('tab', {name: /^explore/i})).getByText('New')).toBeInTheDocument()
		unmount()

		seedSettings({exploreNoticeSeen: true})
		render(<DownloadProfilesHome />)
		expect(within(screen.getByRole('tab', {name: /^explore/i})).queryByText('New')).not.toBeInTheDocument()
	})

	it('is absent when Explore is turned off, and #explore falls back to the URL tab', () => {
		seedSettings({exploreEnabled: false, exploreNoticeSeen: true})
		renderExplore()

		expect(screen.queryByRole('tab', {name: /^explore/i})).not.toBeInTheDocument()
		expect(screen.getByTestId('profiles-download-panel')).toBeInTheDocument()
		expect(window.appApi.explore.setVisible).not.toHaveBeenCalled()
	})
})

describe('Explore first-run notice', () => {
	it('blocks the browser view until Continue is pressed', async () => {
		seedSettings({exploreNoticeSeen: false, cookiesMode: 'explore', exploreModeAutoSwitched: true})
		renderExplore()

		expect(screen.getByTestId('explore-notice').textContent).toMatch(/secondary account/i)
		expect(screen.queryByTestId('explore-viewport')).not.toBeInTheDocument()
		expect(visibilityCalls()).not.toContain(true)

		fireEvent.click(screen.getByRole('button', {name: 'Continue'}))

		await waitFor(() => expect(settingsWrites()).toEqual([{common: {exploreNoticeSeen: true}}]))
		expect(await screen.findByTestId('explore-viewport')).toBeInTheDocument()
		await waitFor(() => expect(visibilityCalls()).toContain(true))
	})

	// A picture of what is coming: decorative, out of reach of the keyboard and
	// assistive technology, with the real Download split naming the active profile.
	it('shows a decorative preview of Explore above the text', () => {
		seedSettings({exploreNoticeSeen: false, cookiesMode: 'explore', exploreModeAutoSwitched: true})
		renderExplore()

		const preview = screen.getByTestId('explore-preview')
		expect(preview).toHaveAttribute('aria-hidden', 'true')
		expect(preview).toHaveAttribute('inert')
		expect(preview).toHaveTextContent(`Download · ${activeProfileName()}`)
		expect(preview.querySelectorAll('button, a, input')).toHaveLength(0)
		expect(screen.getAllByRole('button').some(button => preview.contains(button))).toBe(false)
	})
})

describe('Explore cookie mode', () => {
	it('switches an untouched off mode to explore once, in one settings write', async () => {
		seedSettings({exploreNoticeSeen: true, cookiesMode: 'off', exploreModeAutoSwitched: false})
		const {unmount} = renderExplore()

		await waitFor(() => expect(settingsWrites()).toEqual([{common: {cookiesMode: 'explore', exploreModeAutoSwitched: true}}]))
		expect(useAppStore.getState().settings?.common.cookiesMode).toBe('explore')
		expect(screen.queryByTestId('explore-mode-nudge')).not.toBeInTheDocument()
		unmount()

		renderExplore()
		expect(settingsWrites()).toHaveLength(1)
	})

	it.each<CookiesMode>(['file', 'browser'])('never switches %s automatically: marks the first open and nudges instead', async mode => {
		seedSettings({exploreNoticeSeen: true, cookiesMode: mode, exploreModeAutoSwitched: false})
		renderExplore()

		await waitFor(() => expect(settingsWrites()).toEqual([{common: {exploreModeAutoSwitched: true}}]))
		expect(useAppStore.getState().settings?.common.cookiesMode).toBe(mode)
		expect(screen.getByTestId('explore-mode-nudge')).toHaveAttribute('data-mode', mode)
	})

	it('does not switch a later off when the first open was in another mode', async () => {
		seedSettings({exploreNoticeSeen: true, cookiesMode: 'file', exploreModeAutoSwitched: false})
		const {unmount} = renderExplore()
		await waitFor(() => expect(settingsWrites()).toEqual([{common: {exploreModeAutoSwitched: true}}]))
		unmount()

		await act(async () => {
			await useAppStore.getState().setCookiesMode('off')
		})
		renderExplore()

		expect(settingsWrites()).toEqual([{common: {exploreModeAutoSwitched: true}}, {common: {cookiesMode: 'off'}}])
		expect(useAppStore.getState().settings?.common.cookiesMode).toBe('off')
		expect(screen.getByTestId('explore-mode-nudge')).toHaveAttribute('data-mode', 'off')
	})

	// The nudge says downloads ignore the sign-in the user made: a warning, in
	// the same amber as the first-run risk alert, not a passing info tip.
	it('is a warning, not an info tip', () => {
		seedSettings({exploreNoticeSeen: true, cookiesMode: 'browser', exploreModeAutoSwitched: true})
		renderExplore()
		const nudge = screen.getByTestId('explore-mode-nudge')
		expect(nudge.className).toMatch(/border-warning\/30/)
		expect(nudge.className).not.toMatch(/border-info/)
		expect(nudge.querySelector('svg.lucide-triangle-alert')).not.toBeNull()
		expect(nudge.querySelector('svg.lucide-info')).toBeNull()
	})

	it('names the current mode in the nudge', () => {
		seedSettings({exploreNoticeSeen: true, cookiesMode: 'file', exploreModeAutoSwitched: true})
		renderExplore()
		expect(screen.getByTestId('explore-mode-nudge').textContent).toMatch(/cookies file/i)
	})

	it('nudges a deliberate off', () => {
		seedSettings({exploreNoticeSeen: true, cookiesMode: 'off', exploreModeAutoSwitched: true})
		renderExplore()

		expect(settingsWrites()).toEqual([])
		expect(screen.getByTestId('explore-mode-nudge')).toHaveAttribute('data-mode', 'off')
	})

	it('switches to explore from the nudge', async () => {
		seedSettings({exploreNoticeSeen: true, cookiesMode: 'browser', exploreModeAutoSwitched: true})
		renderExplore()

		fireEvent.click(screen.getByRole('button', {name: 'Use Explore sign-in'}))

		await waitFor(() => expect(settingsWrites()).toEqual([{common: {cookiesMode: 'explore'}}]))
		expect(screen.queryByTestId('explore-mode-nudge')).not.toBeInTheDocument()
	})

	it('remembers Not now for that mode only', async () => {
		seedSettings({exploreNoticeSeen: true, cookiesMode: 'file', exploreModeAutoSwitched: true})
		const {unmount} = renderExplore()

		fireEvent.click(screen.getByRole('button', {name: 'Not now'}))
		await waitFor(() => expect(settingsWrites()).toEqual([{common: {exploreModeNudgeDismissedFor: 'file'}}]))
		expect(screen.queryByTestId('explore-mode-nudge')).not.toBeInTheDocument()
		unmount()

		const second = renderExplore()
		expect(screen.queryByTestId('explore-mode-nudge')).not.toBeInTheDocument()
		second.unmount()

		seedSettings({exploreNoticeSeen: true, cookiesMode: 'browser', exploreModeAutoSwitched: true, exploreModeNudgeDismissedFor: 'file'})
		renderExplore()
		expect(screen.getByTestId('explore-mode-nudge')).toHaveAttribute('data-mode', 'browser')
	})

	it('never stacks the nudge with the first-run notice', () => {
		seedSettings({exploreNoticeSeen: false, cookiesMode: 'file', exploreModeAutoSwitched: false})
		renderExplore()

		expect(screen.getByTestId('explore-notice')).toBeInTheDocument()
		expect(screen.queryByTestId('explore-mode-nudge')).not.toBeInTheDocument()
	})
})

describe('Explore compact layout', () => {
	function tabsRail(): HTMLElement {
		return screen.getByTestId('profiles-tabs')
	}

	it('shrinks the tab bar to icons from the toolbar toggle and remembers the choice', async () => {
		renderExplore()
		expect(tabsRail()).not.toHaveAttribute('data-compact')

		const toggle = screen.getByTestId('explore-compact-toggle')
		expect(toggle).toHaveAttribute('aria-pressed', 'false')
		fireEvent.click(toggle)

		await waitFor(() => expect(tabsRail()).toHaveAttribute('data-compact', 'true'))
		expect(settingsWrites()).toContainEqual({common: {exploreCompactChrome: true}})
		// The icons join Explore's toolbar; the row above goes away.
		expect(screen.getByTestId('explore-toolbar')).toContainElement(tabsRail())
		expect(screen.getAllByRole('tablist')).toHaveLength(1)
		expect(screen.getByTestId('explore-compact-toggle')).toHaveAttribute('aria-pressed', 'true')
		// Labels leave the screen, not the accessibility tree; the icon's hint names the tab.
		const exploreTab = screen.getByRole('tab', {name: /^explore/i})
		expect(exploreTab).not.toHaveAttribute('title')
		fireEvent.mouseEnter(exploreTab)
		expect(await findTip()).toHaveTextContent('Explore')
		expect(within(exploreTab).getByText('Explore')).toHaveClass('sr-only')
	})

	it('expands again from the same toggle', async () => {
		seedSettings({exploreNoticeSeen: true, exploreModeAutoSwitched: true, cookiesMode: 'explore', exploreCompactChrome: true})
		renderExplore()
		expect(tabsRail()).toHaveAttribute('data-compact', 'true')

		fireEvent.click(screen.getByTestId('explore-compact-toggle'))

		await waitFor(() => expect(tabsRail()).not.toHaveAttribute('data-compact'))
		expect(screen.getByTestId('explore-toolbar')).not.toContainElement(tabsRail())
		expect(settingsWrites()).toContainEqual({common: {exploreCompactChrome: false}})
		expect(screen.getByRole('tab', {name: /^explore/i})).not.toHaveAttribute('title')
	})

	it('applies only on the Explore tab', () => {
		seedSettings({exploreNoticeSeen: true, exploreModeAutoSwitched: true, cookiesMode: 'explore', exploreCompactChrome: true})
		render(<DownloadProfilesHome />)
		expect(tabsRail()).not.toHaveAttribute('data-compact')

		fireEvent.click(screen.getByRole('tab', {name: /^explore/i}))
		expect(tabsRail()).toHaveAttribute('data-compact', 'true')

		fireEvent.click(screen.getByRole('tab', {name: /^downloads/i}))
		expect(tabsRail()).not.toHaveAttribute('data-compact')
		expect(useAppStore.getState().exploreBrowsing).toBe(false)
	})

	it('keeps the full bar over the first-run notice', () => {
		seedSettings({exploreNoticeSeen: false, exploreModeAutoSwitched: true, cookiesMode: 'explore', exploreCompactChrome: true})
		renderExplore()
		expect(tabsRail()).not.toHaveAttribute('data-compact')
	})
})

describe('Explore viewport', () => {
	it('reports its bounds before showing the view, and hides it when the tab is left', async () => {
		renderExplore()

		await waitFor(() => expect(visibilityCalls()).toEqual([true]))
		expect(window.appApi.explore.setBounds).toHaveBeenCalledWith({x: 24, y: 180, width: 640, height: 360})
		const boundsOrder = vi.mocked(window.appApi.explore.setBounds).mock.invocationCallOrder[0] ?? Infinity
		const visibleOrder = vi.mocked(window.appApi.explore.setVisible).mock.invocationCallOrder[0] ?? -Infinity
		expect(boundsOrder).toBeLessThan(visibleOrder)

		fireEvent.click(screen.getByRole('tab', {name: /^url/i}))
		expect(visibilityCalls()).toEqual([true, false])
	})

	it('hides the view on unmount', async () => {
		const {unmount} = renderExplore()
		await waitFor(() => expect(visibilityCalls()).toEqual([true]))
		unmount()
		expect(visibilityCalls()).toEqual([true, false])
	})

	it('re-sends bounds when the UI zoom changes', async () => {
		renderExplore()
		await waitFor(() => expect(visibilityCalls()).toEqual([true]))

		viewportRect = {x: 36, y: 200, width: 960, height: 540}
		act(() => useAppStore.setState({uiZoom: 1.5}))

		await waitFor(() => expect(window.appApi.explore.setBounds).toHaveBeenLastCalledWith({x: 36, y: 200, width: 960, height: 540}))
	})

	it('re-sends bounds on window resize', async () => {
		renderExplore()
		await waitFor(() => expect(visibilityCalls()).toEqual([true]))

		viewportRect = {x: 24, y: 180, width: 500, height: 300}
		act(() => {
			window.dispatchEvent(new Event('resize'))
		})

		await waitFor(() => expect(window.appApi.explore.setBounds).toHaveBeenLastCalledWith({x: 24, y: 180, width: 500, height: 300}))
	})

	// Main scales the rect by the main window's zoom factor (P2-R29), so a
	// window zoom must re-send even a rect that reads the same in CSS px.
	it('re-sends the same rect when the window zoom changes', async () => {
		renderExplore()
		await waitFor(() => expect(visibilityCalls()).toEqual([true]))
		const sends = vi.mocked(window.appApi.explore.setBounds).mock.calls.length
		const ratio = vi.spyOn(window, 'devicePixelRatio', 'get').mockReturnValue(2.5)

		act(() => {
			window.dispatchEvent(new Event('resize'))
		})

		await waitFor(() => expect(vi.mocked(window.appApi.explore.setBounds).mock.calls.length).toBe(sends + 1))
		expect(window.appApi.explore.setBounds).toHaveBeenLastCalledWith({x: 24, y: 180, width: 640, height: 360})
		ratio.mockRestore()
	})

	it('hides the view while a dialog is open and shows it again when the dialog closes', async () => {
		renderExplore()
		await waitFor(() => expect(visibilityCalls()).toEqual([true]))

		const dialog = document.createElement('div')
		dialog.setAttribute('role', 'dialog')
		dialog.dataset.testOverlay = ''
		act(() => {
			document.body.appendChild(dialog)
		})
		await waitFor(() => expect(visibilityCalls()).toEqual([true, false]))

		act(() => {
			dialog.remove()
		})
		await waitFor(() => expect(visibilityCalls()).toEqual([true, false, true]))
	})

	it('treats an alertdialog as an overlay too', async () => {
		renderExplore()
		await waitFor(() => expect(visibilityCalls()).toEqual([true]))

		const alert = document.createElement('div')
		alert.setAttribute('role', 'alertdialog')
		alert.dataset.testOverlay = ''
		act(() => {
			document.body.appendChild(alert)
		})
		await waitFor(() => expect(visibilityCalls()).toEqual([true, false]))
	})

	it('catches a dialog that opens between render and the observer attaching', async () => {
		function OpensDialogBeforeObservers(): null {
			// Layout effects run before passive ones, where the observers attach.
			useLayoutEffect(() => {
				const dialog = document.createElement('div')
				dialog.setAttribute('role', 'dialog')
				dialog.dataset.testOverlay = ''
				document.body.appendChild(dialog)
			}, [])
			return null
		}
		window.history.replaceState(null, '', '#explore')
		render(
			<>
				<DownloadProfilesHome />
				<OpensDialogBeforeObservers />
			</>
		)

		expect(await screen.findByTestId('explore-viewport')).toBeInTheDocument()
		await new Promise(resolve => requestAnimationFrame(resolve))
		expect(visibilityCalls()).not.toContain(true)
	})

	it('never shows the view while a dialog is already open', async () => {
		const dialog = document.createElement('div')
		dialog.setAttribute('role', 'dialog')
		dialog.dataset.testOverlay = ''
		document.body.appendChild(dialog)

		renderExplore()
		expect(await screen.findByTestId('explore-viewport')).toBeInTheDocument()
		expect(visibilityCalls()).not.toContain(true)
	})

	it('ignores a closed popup kept mounted inside a hidden container', async () => {
		const holder = document.createElement('div')
		holder.hidden = true
		holder.dataset.testOverlay = ''
		const popup = document.createElement('div')
		popup.setAttribute('role', 'dialog')
		holder.appendChild(popup)
		document.body.appendChild(holder)

		renderExplore()
		await waitFor(() => expect(visibilityCalls()).toEqual([true]))
	})
})

// The DOM sonner renders: a toaster section holding one <li data-sonner-toast> per toast.
function showToast(rect: typeof viewportRect, attributes: Record<string, string> = {}): HTMLElement {
	const toaster = document.createElement('section')
	toaster.setAttribute('data-sonner-toaster', '')
	toaster.dataset.testOverlay = ''
	const toast = document.createElement('li')
	toast.setAttribute('data-sonner-toast', '')
	toast.setAttribute('data-visible', 'true')
	toast.setAttribute('data-removed', 'false')
	for (const [name, value] of Object.entries(attributes)) toast.setAttribute(name, value)
	toast.dataset.testToastRect = JSON.stringify(rect)
	toaster.appendChild(toast)
	act(() => {
		document.body.appendChild(toaster)
	})
	return toaster
}

describe('Explore audio follows the tab (P2-R32)', () => {
	function activeCalls(): boolean[] {
		return vi.mocked(window.appApi.explore.setActive).mock.calls.map(([active]) => active)
	}

	it('says the tab is active while Explore is open and inactive once another tab is', async () => {
		renderExplore()
		await waitFor(() => expect(activeCalls()).toEqual([true]))

		fireEvent.click(screen.getByRole('tab', {name: /^url/i}))

		await waitFor(() => expect(activeCalls()).toEqual([true, false]))
	})

	it('keeps the tab active while a dialog hides the view', async () => {
		renderExplore()
		await waitFor(() => expect(visibilityCalls()).toEqual([true]))
		const dialog = document.createElement('div')
		dialog.setAttribute('role', 'dialog')
		dialog.dataset.testOverlay = ''
		act(() => {
			document.body.appendChild(dialog)
		})
		await waitFor(() => expect(visibilityCalls()).toEqual([true, false]))

		expect(activeCalls()).toEqual([true])
	})
})

describe('Explore viewport and toasts', () => {
	// Viewport spans y 180..540; a bottom-right toast sits over its lower edge.
	it('shortens the view so an overlapping toast stays above it', async () => {
		renderExplore()
		await waitFor(() => expect(visibilityCalls()).toEqual([true]))

		const toaster = showToast({x: 400, y: 480, width: 300, height: 60})
		await waitFor(() => expect(window.appApi.explore.setBounds).toHaveBeenLastCalledWith({x: 24, y: 180, width: 640, height: 292}))

		act(() => {
			toaster.remove()
		})
		await waitFor(() => expect(window.appApi.explore.setBounds).toHaveBeenLastCalledWith({x: 24, y: 180, width: 640, height: 360}))
		expect(visibilityCalls()).toEqual([true])
	})

	it('uses the highest of several overlapping toasts', async () => {
		renderExplore()
		await waitFor(() => expect(visibilityCalls()).toEqual([true]))

		showToast({x: 400, y: 480, width: 300, height: 60})
		showToast({x: 400, y: 410, width: 300, height: 60})
		await waitFor(() => expect(window.appApi.explore.setBounds).toHaveBeenLastCalledWith({x: 24, y: 180, width: 640, height: 222}))
	})

	it('sends height 0 when a toast covers the top of the view', async () => {
		renderExplore()
		await waitFor(() => expect(visibilityCalls()).toEqual([true]))

		showToast({x: 400, y: 150, width: 300, height: 400})
		await waitFor(() => expect(window.appApi.explore.setBounds).toHaveBeenLastCalledWith({x: 24, y: 180, width: 640, height: 0}))
		expect(visibilityCalls()).toEqual([true])
	})

	it('leaves the bounds alone for a toast outside the view', async () => {
		renderExplore()
		await waitFor(() => expect(visibilityCalls()).toEqual([true]))
		const sent = vi.mocked(window.appApi.explore.setBounds).mock.calls.length

		showToast({x: 700, y: 600, width: 300, height: 60})
		await new Promise(resolve => requestAnimationFrame(resolve))
		await new Promise(resolve => requestAnimationFrame(resolve))

		expect(vi.mocked(window.appApi.explore.setBounds).mock.calls.length).toBe(sent)
		expect(window.appApi.explore.setBounds).toHaveBeenLastCalledWith({x: 24, y: 180, width: 640, height: 360})
		expect(visibilityCalls()).toEqual([true])
	})

	it('ignores a toast that is fading out', async () => {
		renderExplore()
		await waitFor(() => expect(visibilityCalls()).toEqual([true]))
		const sent = vi.mocked(window.appApi.explore.setBounds).mock.calls.length

		showToast({x: 400, y: 480, width: 300, height: 60}, {'data-removed': 'true'})
		await new Promise(resolve => requestAnimationFrame(resolve))
		await new Promise(resolve => requestAnimationFrame(resolve))

		expect(vi.mocked(window.appApi.explore.setBounds).mock.calls.length).toBe(sent)
	})
})

describe('Explore toolbar', () => {
	it('drives the view history', async () => {
		renderExplore()
		await waitFor(() => expect(stateListener).not.toBeNull())
		emitState({canGoBack: true, canGoForward: true})

		fireEvent.click(screen.getByRole('button', {name: 'Back'}))
		fireEvent.click(screen.getByRole('button', {name: 'Forward'}))
		fireEvent.click(screen.getByRole('button', {name: 'Reload'}))
		fireEvent.click(screen.getByRole('button', {name: 'YouTube home'}))

		expect(vi.mocked(window.appApi.explore.navigate).mock.calls.map(([command]) => command)).toEqual([{kind: 'back'}, {kind: 'forward'}, {kind: 'reload'}, {kind: 'home'}])
	})

	// P2-R36: the shield's state is in its pressed state, its icon and its
	// tooltip (which opens above the toolbar, clear of the view).
	it.each([
		['off', 'false', 'Ad blocker: off — click to turn on'],
		['starting', 'true', 'Ad blocker: starting — click to turn off'],
		['on', 'true', 'Ad blocker: on — click to turn off'],
		['unavailable', 'true', "Ad blocker: unavailable, its filter lists couldn't be downloaded — click to turn off"]
	] as const)('shows the ad blocker %s', async (adBlock, pressed, hint) => {
		renderExplore()
		await waitFor(() => expect(stateListener).not.toBeNull())
		emitState({adBlock})

		const shield = screen.getByTestId('explore-adblock')
		expect(shield).toHaveAttribute('aria-pressed', pressed)
		expect(shield).toHaveAttribute('data-adblock', adBlock)
		expect(shield).toHaveAccessibleName('Ad blocker')
		expect(shield).not.toHaveAttribute('title')
		fireEvent.mouseEnter(shield)
		const tip = await findTip()
		expect(within(tip).getByText(hint)).toBeInTheDocument()
		expect(within(tip).getByText('YouTube may push back on ad blockers for signed-in accounts.')).toBeInTheDocument()
	})

	// Off until turned on. Before main reports the view, an unset setting
	// shows the shield off; an explicit true shows it pressed.
	it('leaves the shield off by default, before the view reports', async () => {
		useAppStore.setState({exploreView: null})
		vi.mocked(window.appApi.explore.getState).mockReturnValue(new Promise(() => undefined))
		renderExplore()

		const shield = screen.getByTestId('explore-adblock')
		expect(useAppStore.getState().settings?.common.exploreAdBlock).toBeUndefined()
		expect(shield).toHaveAttribute('aria-pressed', 'false')
		expect(shield).toHaveAttribute('data-adblock', 'off')
	})

	it('presses the shield when the user turned the ad blocker on', async () => {
		seedSettings({exploreNoticeSeen: true, exploreModeAutoSwitched: true, cookiesMode: 'explore', exploreAdBlock: true})
		useAppStore.setState({exploreView: null})
		vi.mocked(window.appApi.explore.getState).mockReturnValue(new Promise(() => undefined))
		renderExplore()

		const shield = screen.getByTestId('explore-adblock')
		expect(shield).toHaveAttribute('aria-pressed', 'true')
		expect(shield).toHaveAttribute('data-adblock', 'starting')
	})

	it.each([
		['off', true],
		['on', false],
		['unavailable', false]
	] as const)('the shield turns the ad blocker setting from %s', async (adBlock, next) => {
		renderExplore()
		await waitFor(() => expect(stateListener).not.toBeNull())
		emitState({adBlock})

		fireEvent.click(screen.getByTestId('explore-adblock'))

		await waitFor(() => expect(settingsWrites()).toContainEqual({common: {exploreAdBlock: next}}))
	})

	it('disables Back and Forward when there is no history', async () => {
		renderExplore()
		await waitFor(() => expect(stateListener).not.toBeNull())
		emitState({canGoBack: false, canGoForward: false})

		expect(screen.getByRole('button', {name: 'Back'})).toHaveAttribute('aria-disabled', 'true')
		expect(screen.getByRole('button', {name: 'Forward'})).toHaveAttribute('aria-disabled', 'true')
	})

	it('shows the current address', async () => {
		renderExplore()
		await waitFor(() => expect(stateListener).not.toBeNull())
		emitState({url: WATCH_URL})

		expect(screen.getByTestId('explore-address')).toHaveValue(WATCH_URL)
	})

	it('enables the Download split and the interactive button only on a video, playlist or channel', async () => {
		renderExplore()
		await waitFor(() => expect(stateListener).not.toBeNull())
		const parts = ['explore-download', 'explore-profile-trigger', 'explore-interactive']

		emitState({url: 'https://www.youtube.com/'})
		for (const id of parts) expect(screen.getByTestId(id)).toHaveAttribute('aria-disabled', 'true')

		emitState({url: 'https://www.youtube.com/results?search_query=cats'})
		for (const id of parts) expect(screen.getByTestId(id)).toHaveAttribute('aria-disabled', 'true')

		for (const url of [WATCH_URL, 'https://www.youtube.com/playlist?list=PL1234567890', 'https://www.youtube.com/@arroxy', 'https://www.youtube.com/shorts/abcdefghijk']) {
			emitState({url})
			for (const id of parts) expect(screen.getByTestId(id)).not.toHaveAttribute('aria-disabled', 'true')
		}
	})

	// Downloads prepare in the background, several at once: an earlier one
	// still fetching details never blocks the next.
	it('keeps the Download split and the interactive button available while a Download prepares', async () => {
		renderExplore()
		await waitFor(() => expect(stateListener).not.toBeNull())
		emitState({url: WATCH_URL})

		act(() => useAppStore.setState({queue: [makeItem({id: 'earlier', status: 'probing', url: 'https://www.youtube.com/watch?v=earlier12345', job: {kind: 'unresolved', extractor: '', extractorKey: ''}, probeMode: 'video'})]}))

		for (const id of ['explore-download', 'explore-profile-trigger', 'explore-interactive']) expect(screen.getByTestId(id)).not.toHaveAttribute('aria-disabled', 'true')
	})

	it('names the active profile on Download and keeps the full label in its tooltip', async () => {
		renderExplore()
		await waitFor(() => expect(stateListener).not.toBeNull())
		emitState({url: WATCH_URL})

		const label = `Download · ${activeProfileName()}`
		const download = screen.getByTestId('explore-download')
		expect(download).toHaveTextContent(label)
		expect(download).not.toHaveAttribute('title')
		fireEvent.mouseEnter(download)
		expect(await findTip()).toHaveTextContent(label)
	})

	it('Download queues the current page with the active profile and stays in Explore', async () => {
		const quickDownload = vi.fn().mockResolvedValue(undefined)
		useAppStore.setState({quickDownload})
		renderExplore()
		await waitFor(() => expect(stateListener).not.toBeNull())
		emitState({url: WATCH_URL})

		fireEvent.click(screen.getByTestId('explore-download'))

		expect(quickDownload).toHaveBeenCalledWith(expect.objectContaining({url: WATCH_URL, entry: 'explore'}))
		// The URL tab's field is not Explore's to fill.
		expect(useAppStore.getState().wizardUrl).toBe('')
		expect(window.location.hash).toBe('#explore')
	})

	it('the interactive button is icon-only with a tooltip hint, and opens the step-by-step flow from Explore', async () => {
		const submitUrl = vi.fn().mockResolvedValue(undefined)
		useAppStore.setState({submitUrl})
		renderExplore()
		await waitFor(() => expect(stateListener).not.toBeNull())
		emitState({url: WATCH_URL})

		const interactive = screen.getByRole('button', {name: INTERACTIVE_HINT})
		expect(interactive).not.toHaveAttribute('title')
		expect(interactive.textContent).toBe('')
		fireEvent.click(interactive)

		expect(useAppStore.getState().wizardUrl).toBe(WATCH_URL)
		expect(submitUrl).toHaveBeenCalledWith('explore')
		expect(window.location.hash).toBe('#explore')
	})
})

// The tooltips open above the toolbar, on renderer DOM; the native view sits
// below and would paint over a tooltip that opened downward. A disabled button
// is the moment its reason matters, and the browser fires no hover on it, so
// the buttons stay focusable instead of disabled.
describe('Explore toolbar tooltips', () => {
	const GRAB_HINT = 'Open a video, playlist, or channel to download it'

	async function renderOn(url: string): Promise<void> {
		renderExplore()
		await waitFor(() => expect(visibilityCalls()).toEqual([true]))
		emitState({url})
	}

	it.each([
		['Back', 'Back'],
		['Forward', 'Forward'],
		['Reload', 'Reload'],
		['YouTube home', 'YouTube home']
	] as const)('shows %s on hover', async (name, text) => {
		await renderOn(WATCH_URL)
		emitState({url: WATCH_URL, canGoBack: true, canGoForward: true})

		const button = screen.getByRole('button', {name})
		expect(button).not.toHaveAttribute('title')
		fireEvent.mouseEnter(button)

		expect(await findTip()).toHaveTextContent(text)
	})

	it('shows the Download label, the profile switch and the interactive hint on a video', async () => {
		await renderOn(WATCH_URL)
		const label = `Download · ${activeProfileName()}`

		for (const [id, text] of [
			['explore-download', label],
			['explore-profile-trigger', 'Switch download profile'],
			['explore-interactive', INTERACTIVE_HINT]
		] as const) {
			const button = screen.getByTestId(id)
			expect(button).not.toHaveAttribute('title')
			fireEvent.mouseEnter(button)
			expect(await findTip()).toHaveTextContent(text)
			fireEvent.mouseLeave(button)
			await waitFor(() => expect(queryTip()).not.toBeInTheDocument())
		}
	})

	it('shows the tooltip on keyboard focus too', async () => {
		await renderOn(WATCH_URL)

		act(() => screen.getByTestId('explore-interactive').focus())

		expect(await findTip()).toHaveTextContent(INTERACTIVE_HINT)
	})

	it.each(['explore-download', 'explore-profile-trigger', 'explore-interactive'] as const)('a blocked %s is focusable and still says why', async id => {
		await renderOn('https://www.youtube.com/')

		const button = screen.getByTestId(id)
		expect(button).toHaveAttribute('aria-disabled', 'true')
		expect(button).not.toBeDisabled()
		fireEvent.mouseEnter(button)

		expect(await findTip()).toHaveTextContent(GRAB_HINT)
	})

	it('a blocked Download ignores clicks', async () => {
		const quickDownload = vi.fn().mockResolvedValue(undefined)
		const submitUrl = vi.fn().mockResolvedValue(undefined)
		useAppStore.setState({quickDownload, submitUrl})
		await renderOn('https://www.youtube.com/')

		fireEvent.click(screen.getByTestId('explore-download'))
		fireEvent.click(screen.getByTestId('explore-interactive'))
		fireEvent.click(screen.getByTestId('explore-profile-trigger'))

		expect(quickDownload).not.toHaveBeenCalled()
		expect(submitUrl).not.toHaveBeenCalled()
		expect(screen.queryByTestId('explore-profile-menu-grid')).not.toBeVisible()
	})

	it('a blocked Back says what it is', async () => {
		await renderOn(WATCH_URL)
		const back = screen.getByRole('button', {name: 'Back'})

		fireEvent.mouseEnter(back)

		expect(back).toHaveAttribute('aria-disabled', 'true')
		expect(await findTip()).toHaveTextContent('Back')
	})

	it('is no overlay: the view stays shown and no picture is taken', async () => {
		await renderOn(WATCH_URL)
		fireEvent.mouseEnter(screen.getByTestId('explore-adblock'))
		const tip = await findTip()

		expect(tip).toBeVisible()
		expect(hasBlockingOverlay()).toBe(false)
		// Give the overlay observer the frame it would need to react.
		await act(async () => {
			await new Promise(resolve => requestAnimationFrame(() => resolve(null)))
		})
		expect(visibilityCalls()).toEqual([true])
		expect(window.appApi.explore.capture).not.toHaveBeenCalled()
	})

	it('opens above the toolbar and never flips below into the view', async () => {
		await renderOn(WATCH_URL)
		fireEvent.mouseEnter(screen.getByTestId('explore-adblock'))
		const tip = await findTip()

		expect(tip).toHaveAttribute('data-side', 'top')
	})
})

describe('Explore profile menu', () => {
	async function openMenu(): Promise<HTMLElement> {
		renderExplore()
		await waitFor(() => expect(visibilityCalls()).toEqual([true]))
		emitState({url: WATCH_URL})
		fireEvent.click(screen.getByTestId('explore-profile-trigger'))
		return screen.findByTestId('explore-profile-menu')
	}

	it('is the URL tab menu: the profile grid with Edit, New and Manage underneath', async () => {
		const menu = await openMenu()

		expect(within(menu).getByTestId('explore-profile-menu-grid')).toBeInTheDocument()
		expect(within(menu).getByTestId('explore-profile-option-balanced')).toHaveAttribute('aria-pressed', 'true')
		const actions = within(within(menu).getByTestId('explore-profile-menu-actions')).getAllByRole('button')
		expect(actions.map(button => button.textContent)).toEqual(['Edit active profile', 'New profile', 'Manage profiles'])
	})

	it('picking a profile makes it the active profile and closes the menu', async () => {
		const menu = await openMenu()

		fireEvent.click(within(menu).getByTestId('explore-profile-option-audio-only'))

		await waitFor(() => expect(settingsWrites()).toContainEqual(expect.objectContaining({profiles: expect.objectContaining({active: {kind: 'builtin', id: 'audio-only'}})})))
		await waitFor(() => expect(screen.getByTestId('explore-download')).toHaveTextContent(`Download · ${activeProfileName()}`))
		expect(activeProfileName()).not.toBe('')
		await waitFor(() => expect(screen.queryByTestId('explore-profile-menu-grid')).not.toBeVisible())
	})

	it('hides the view while the menu is open and shows it again once the menu has closed', async () => {
		const menu = await openMenu()
		await waitFor(() => expect(visibilityCalls().at(-1)).toBe(false))

		fireEvent.click(within(menu).getByTestId('explore-profile-option-balanced'))

		// The closed menu stays mounted (keepMounted) inside a hidden positioner, which is no overlay.
		await waitFor(() => expect(visibilityCalls().at(-1)).toBe(true))
		expect(screen.getByTestId('explore-profile-menu').closest('[hidden]')).not.toBeNull()
	})

	it('Manage profiles opens the Profiles tab', async () => {
		const menu = await openMenu()

		fireEvent.click(within(menu).getByRole('button', {name: 'Manage profiles'}))

		expect(window.location.hash).toBe('#profiles')
	})
})

// A failed Download is a row in Downloads plus a toast (P2-R38); the page
// keeps its whole height, with no alert above it.
describe('Explore download failures', () => {
	const botBlock: ProbeError = {kind: 'ytdlp', error: {kind: 'botBlock', raw: "Sign in to confirm you're not a bot"}}

	it('leaves the page alone and hands the failure to the Downloads row', async () => {
		vi.mocked(window.appApi.downloads.probe).mockResolvedValue(fail(botBlock))
		renderExplore()
		await waitFor(() => expect(visibilityCalls()).toEqual([true]))
		emitState({url: WATCH_URL})
		fireEvent.click(screen.getByTestId('explore-download'))

		await waitFor(() => expect(window.appApi.queue.cmd.probeFailed).toHaveBeenCalledWith({itemId: expect.any(String), error: botBlock.error}))
		expect(within(screen.getByTestId('explore-tab')).queryByTestId('quick-download-feedback')).not.toBeInTheDocument()
		expect(screen.getByTestId('explore-viewport')).toBeInTheDocument()
		expect(visibilityCalls()).toEqual([true])
		expect(window.location.hash).toBe('#explore')
	})
})

describe('Explore and the Downloads tab cue', () => {
	it('holds the first-run Downloads cue while Explore is open and shows it on another tab', () => {
		renderExplore()

		act(() => useAppStore.setState({queue: [makeItem({id: 'first', title: 'First', status: 'pending'})]}))
		expect(screen.queryByTestId('queue-tab-first-run-cue')).not.toBeInTheDocument()
		expect(localStorage.getItem('arroxy_seen_queue_tab_tip')).toBeNull()

		fireEvent.click(screen.getByRole('tab', {name: /^url/i}))
		expect(screen.getByTestId('queue-tab-first-run-cue')).toBeInTheDocument()
		expect(localStorage.getItem('arroxy_seen_queue_tab_tip')).toBe('1')
	})
})

describe('Explore error states', () => {
	it('explains a proxy failure, hides the view, and retries', async () => {
		renderExplore()
		await waitFor(() => expect(visibilityCalls()).toEqual([true]))
		emitState({url: '', error: 'proxy'})

		const error = screen.getByTestId('explore-error')
		expect(error).toHaveAttribute('data-error', 'proxy')
		expect(error.textContent).toMatch(/proxy/i)
		expect(error.textContent).toMatch(/settings/i)
		await waitFor(() => expect(visibilityCalls()).toEqual([true, false]))

		fireEvent.click(within(error).getByRole('button', {name: 'Retry'}))
		expect(window.appApi.explore.navigate).toHaveBeenLastCalledWith({kind: 'reload'})

		emitState({error: null})
		expect(screen.queryByTestId('explore-error')).not.toBeInTheDocument()
		await waitFor(() => expect(visibilityCalls()).toEqual([true, false, true]))
	})

	it('opens Settings from the proxy error', async () => {
		renderExplore()
		await waitFor(() => expect(stateListener).not.toBeNull())
		emitState({url: '', error: 'proxy'})

		fireEvent.click(within(screen.getByTestId('explore-error')).getByRole('button', {name: 'Open Settings'}))
		expect(window.location.hash).toBe('#settings')
	})

	it('offers Retry when a page fails to load', async () => {
		renderExplore()
		await waitFor(() => expect(stateListener).not.toBeNull())
		emitState({error: 'load'})

		const error = screen.getByTestId('explore-error')
		expect(error).toHaveAttribute('data-error', 'load')
		fireEvent.click(within(error).getByRole('button', {name: 'Retry'}))
		expect(window.appApi.explore.navigate).toHaveBeenLastCalledWith({kind: 'reload'})
	})
})
