import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {TooltipProvider} from '@renderer/components/ui/tooltip.js'
import {DownloadProfilesHome} from '@renderer/components/wizard/DownloadProfilesHome.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {fail, ok} from '@shared/result.js'
import type {SettingsPatch} from '@shared/api.js'
import type {ExploreLinkAction} from '@shared/exploreSchemas.js'
import type {ExploreViewState} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// A pick in the Explore page's link menu (built and shown by main) runs here
// exactly like the bar's controls would for that link: Download with the
// active profile, a profile pick that becomes the active profile first, and
// Interactive. The link comes from a web page, so it is checked again.

const INITIAL_STORE = useAppStore.getState()
const HOME: ExploreViewState = {url: 'https://www.youtube.com/', title: 'YouTube', canGoBack: false, canGoForward: false, loading: false, signedIn: false, error: null, adBlock: 'off'}
const WATCH_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

let linkListener: ((action: ExploreLinkAction) => void) | null = null

function pick(action: ExploreLinkAction): void {
	act(() => linkListener?.(action))
}

function renderExplore(): ReturnType<typeof render> {
	window.history.replaceState(null, '', '#explore')
	return render(
		<TooltipProvider>
			<DownloadProfilesHome />
		</TooltipProvider>
	)
}

beforeEach(() => {
	window.appApi = buildMockAppApi()
	vi.mocked(window.appApi.settings.update).mockImplementation(async (patch: SettingsPatch) => {
		const current = useAppStore.getState().settings ?? defaultAppSettings('/tmp')
		return ok({...current, common: {...current.common, ...patch.common}, profiles: patch.profiles ? {...current.profiles, ...patch.profiles} : current.profiles})
	})
	vi.mocked(window.appApi.explore.getState).mockResolvedValue(ok(HOME))
	linkListener = null
	vi.mocked(window.appApi.explore.onLinkAction).mockImplementation(listener => {
		linkListener = listener
		return () => {
			linkListener = null
		}
	})
	useAppStore.getState().bindExploreView()
	const base = defaultAppSettings('/tmp')
	useAppStore.setState({queue: [], wizardUrl: '', settings: {...base, common: {...base.common, exploreNoticeSeen: true, exploreModeAutoSwitched: true, cookiesMode: 'explore', exploreLinkCalloutDismissed: true}}})
})

afterEach(() => {
	vi.restoreAllMocks()
	useAppStore.setState(INITIAL_STORE, true)
})

describe('Explore link menu picks', () => {
	it('Download queues the link with the active profile and stays in Explore', async () => {
		const quickDownload = vi.fn().mockResolvedValue(undefined)
		useAppStore.setState({quickDownload})
		renderExplore()
		await waitFor(() => expect(linkListener).not.toBeNull())

		pick({kind: 'download', url: WATCH_URL})

		await waitFor(() => expect(quickDownload).toHaveBeenCalledWith({url: WATCH_URL, entry: 'explore'}))
		expect(window.appApi.settings.update).not.toHaveBeenCalled()
		expect(useAppStore.getState().wizardUrl).toBe('')
		expect(window.location.hash).toBe('#explore')
	})

	it('Download queues a link on another site: yt-dlp decides what it holds', async () => {
		const quickDownload = vi.fn().mockResolvedValue(undefined)
		useAppStore.setState({quickDownload})
		renderExplore()
		await waitFor(() => expect(linkListener).not.toBeNull())

		pick({kind: 'download', url: 'https://vimeo.com/123'})

		await waitFor(() => expect(quickDownload).toHaveBeenCalledWith({url: 'https://vimeo.com/123', entry: 'explore'}))
	})

	it('a profile pick becomes the active profile, then the link is queued with it', async () => {
		const activeAtQueue: unknown[] = []
		const quickDownload = vi.fn(async () => {
			activeAtQueue.push(useAppStore.getState().settings?.profiles.active)
		})
		useAppStore.setState({quickDownload})
		renderExplore()
		await waitFor(() => expect(linkListener).not.toBeNull())

		pick({kind: 'download', url: WATCH_URL, profile: {kind: 'builtin', id: 'audio-only'}})

		await waitFor(() => expect(quickDownload).toHaveBeenCalledWith({url: WATCH_URL, entry: 'explore'}))
		expect(window.appApi.settings.update).toHaveBeenCalledWith(expect.objectContaining({profiles: expect.objectContaining({active: {kind: 'builtin', id: 'audio-only'}})}))
		expect(activeAtQueue).toEqual([{kind: 'builtin', id: 'audio-only'}])
		await waitFor(() => expect(screen.getByTestId('explore-download')).toHaveTextContent('Download · Audio only'))
	})

	// The pick named the profile to download with: queuing with the old one instead would be a silent wrong download.
	it('queues nothing when the picked profile could not be made active', async () => {
		const quickDownload = vi.fn().mockResolvedValue(undefined)
		useAppStore.setState({quickDownload})
		vi.mocked(window.appApi.settings.update).mockResolvedValue(fail({code: 'unknown', message: 'disk full'}))
		renderExplore()
		await waitFor(() => expect(linkListener).not.toBeNull())

		pick({kind: 'download', url: WATCH_URL, profile: {kind: 'builtin', id: 'audio-only'}})

		await waitFor(() => expect(window.appApi.settings.update).toHaveBeenCalled())
		await act(async () => {
			await Promise.resolve()
		})
		expect(quickDownload).not.toHaveBeenCalled()
	})

	it('Interactive opens the step-by-step flow for the link from Explore', async () => {
		const submitUrl = vi.fn().mockResolvedValue(undefined)
		useAppStore.setState({submitUrl})
		renderExplore()
		await waitFor(() => expect(linkListener).not.toBeNull())

		pick({kind: 'interactive', url: WATCH_URL})

		expect(useAppStore.getState().wizardUrl).toBe(WATCH_URL)
		expect(submitUrl).toHaveBeenCalledWith('explore')
	})

	it('ignores a link the download flow cannot take', async () => {
		const quickDownload = vi.fn().mockResolvedValue(undefined)
		const submitUrl = vi.fn().mockResolvedValue(undefined)
		useAppStore.setState({quickDownload, submitUrl})
		renderExplore()
		await waitFor(() => expect(linkListener).not.toBeNull())

		pick({kind: 'download', url: 'https://www.youtube.com/results?search_query=cats', profile: {kind: 'builtin', id: 'audio-only'}})
		pick({kind: 'interactive', url: 'javascript:alert(1)'})

		expect(quickDownload).not.toHaveBeenCalled()
		expect(submitUrl).not.toHaveBeenCalled()
		expect(window.appApi.settings.update).not.toHaveBeenCalled()
	})

	it('stops listening once the Explore tab is left', async () => {
		renderExplore()
		await waitFor(() => expect(linkListener).not.toBeNull())

		fireEvent.click(screen.getByRole('tab', {name: /^url/i}))

		expect(linkListener).toBeNull()
	})
})

describe('One-time right-click callout in Explore', () => {
	function seedTip(common: Record<string, unknown> = {}): void {
		const base = defaultAppSettings('/tmp')
		useAppStore.setState({settings: {...base, common: {...base.common, exploreNoticeSeen: true, exploreModeAutoSwitched: true, cookiesMode: 'explore', ...common}}})
	}

	it('points out the link menu until it is closed', async () => {
		seedTip()
		renderExplore()
		expect(await screen.findByTestId('explore-link-callout')).toBeInTheDocument()

		fireEvent.click(screen.getByTestId('explore-link-callout-dismiss'))

		await waitFor(() => expect(window.appApi.settings.update).toHaveBeenCalledWith({common: {exploreLinkCalloutDismissed: true}}))
		expect(screen.queryByTestId('explore-link-callout')).toBeNull()
	})

	it('never shows once dismissed', async () => {
		seedTip({exploreLinkCalloutDismissed: true})
		renderExplore()
		await screen.findByTestId('explore-tab')
		expect(screen.queryByTestId('explore-link-callout')).toBeNull()
	})

	it('counts using the link menu as having seen it', async () => {
		seedTip()
		useAppStore.setState({quickDownload: vi.fn().mockResolvedValue(undefined)})
		renderExplore()
		await screen.findByTestId('explore-link-callout')
		await waitFor(() => expect(linkListener).not.toBeNull())

		pick({kind: 'download', url: WATCH_URL})

		await waitFor(() => expect(window.appApi.settings.update).toHaveBeenCalledWith({common: {exploreLinkCalloutDismissed: true}}))
		expect(screen.queryByTestId('explore-link-callout')).toBeNull()
	})

	it('makes way for the cookies warning', async () => {
		seedTip({cookiesMode: 'file'})
		renderExplore()
		await screen.findByTestId('explore-mode-nudge')
		expect(screen.queryByTestId('explore-link-callout')).toBeNull()
	})
})
