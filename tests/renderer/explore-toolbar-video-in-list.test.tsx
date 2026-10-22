import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {TooltipProvider} from '@renderer/components/ui/tooltip.js'
import {DownloadProfilesHome} from '@renderer/components/wizard/DownloadProfilesHome.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import {ok} from '@shared/result.js'
import type {SettingsPatch} from '@shared/api.js'
import type {AppSettings, ExploreViewState} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// On a page whose address names a video and a list, Explore's Download group
// becomes [This video][Download <kind>…][▾], then the wand. This video is
// outlined and downloads at once; the filled segment keeps Download's place
// and test id, and opens the list dialog. No profile name on a button: the
// profile is in the hints.

const INITIAL_STORE = useAppStore.getState()
const HOME: ExploreViewState = {url: 'https://www.youtube.com/', title: 'YouTube', canGoBack: false, canGoForward: false, loading: false, signedIn: true, error: null, adBlock: 'off'}
const VIDEO = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

let stateListener: ((state: ExploreViewState) => void) | null = null

async function renderOn(url: string, common: Partial<AppSettings['common']> = {}): Promise<void> {
	const base = defaultAppSettings('/tmp')
	useAppStore.setState({settings: {...base, common: {...base.common, exploreNoticeSeen: true, exploreModeAutoSwitched: true, cookiesMode: 'explore', exploreLinkCalloutDismissed: true, ...common}}})
	window.history.replaceState(null, '', '#explore')
	render(
		<TooltipProvider>
			<DownloadProfilesHome />
		</TooltipProvider>
	)
	await waitFor(() => expect(stateListener).not.toBeNull())
	act(() => stateListener?.({...HOME, url, title: 'Sample video'}))
}

beforeEach(() => {
	window.appApi = buildMockAppApi()
	stateListener = null
	vi.mocked(window.appApi.settings.update).mockImplementation(async (patch: SettingsPatch) => {
		const current = useAppStore.getState().settings ?? defaultAppSettings('/tmp')
		return ok({...current, common: {...current.common, ...patch.common}, profiles: patch.profiles ? {...current.profiles, ...patch.profiles} : current.profiles})
	})
	vi.mocked(window.appApi.explore.onStateChanged).mockImplementation(listener => {
		stateListener = listener
		return () => {
			stateListener = null
		}
	})
	vi.mocked(window.appApi.explore.getState).mockResolvedValue(ok(HOME))
	useAppStore.setState({exploreView: null, queue: [], wizardUrl: ''})
	useAppStore.getState().bindExploreView()
})

afterEach(() => {
	vi.restoreAllMocks()
	window.history.replaceState(null, '', '#download')
	useAppStore.setState(INITIAL_STORE, true)
})

describe('Explore toolbar on a video in a list', () => {
	it('keeps a plain video page as it was: Download alone, no This video', async () => {
		await renderOn(VIDEO)
		expect(screen.queryByTestId('explore-download-video')).toBeNull()
		expect(screen.getByTestId('explore-download').textContent).toBe('Download')
		expect(screen.getByTestId('explore-download')).not.toHaveAttribute('data-list-kind')
	})

	it.each([
		['list=PLx&index=3', 'playlist', 'Download playlist…', 'Download from this playlist'],
		['list=RDdQw4w9WgXcQ&start_radio=1', 'mix', 'Download Mix…', 'Download from this Mix'],
		['list=RDCLAK5uy_x', 'playlist', 'Download playlist…', 'Download from this playlist'],
		['list=OLAK5uy_x', 'album', 'Download album…', 'Download from this album'],
		['list=WL', 'watch-later', 'Download Watch later…', 'Download from Watch later'],
		['list=FLx', 'playlist', 'Download playlist…', 'Download from this playlist']
	])("on %s shows This video then the %s segment, in the bar's order", async (query, kind, label, title) => {
		await renderOn(`${VIDEO}&${query}`)
		const video = screen.getByTestId('explore-download-video')
		const list = screen.getByTestId('explore-download')
		expect(video).toHaveTextContent('This video')
		expect(list).toHaveTextContent(label)
		expect(list).toHaveAttribute('data-list-kind', kind)
		expect(list).toHaveAttribute('aria-description', `${title} · With Balanced 720p`)
		expect(video).toHaveAttribute('aria-description', 'Download just this video with Balanced 720p')
		// This video, then the filled segment, then ▾, then the wand.
		const order = ['explore-download-video', 'explore-download', 'explore-profile-trigger', 'explore-interactive'].map(id => screen.getByTestId(id))
		for (let index = 1; index < order.length; index++) expect(order[index - 1]?.compareDocumentPosition(order[index] as Node) ?? 0).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
		expect(video.textContent).not.toContain('Balanced')
		expect(list.textContent).not.toContain('Balanced')
	})

	it("This video queues the page's video with no question", async () => {
		const quickDownload = vi.fn().mockResolvedValue(undefined)
		useAppStore.setState({quickDownload})
		const url = `${VIDEO}&list=RDdQw4w9WgXcQ&start_radio=1`
		await renderOn(url)

		fireEvent.click(screen.getByTestId('explore-download-video'))

		expect(quickDownload).toHaveBeenCalledWith({url, entry: 'explore', title: 'Sample video', playlistMode: 'video'})
		expect(useAppStore.getState().mixedUrlPromptOpen).toBe(false)
	})

	it('the list segment opens the list dialog', async () => {
		const url = `${VIDEO}&list=PLx`
		await renderOn(url)

		fireEvent.click(screen.getByTestId('explore-download'))

		await waitFor(() => expect(useAppStore.getState()).toMatchObject({mixedUrlPromptOpen: true, mixedUrlPending: url, mixedUrlPromptSource: 'explore'}))
		expect(window.appApi.intake.add).not.toHaveBeenCalled()
	})

	it('the wand opens the dialog in its Interactive form', async () => {
		const url = `${VIDEO}&list=PLx`
		await renderOn(url)

		fireEvent.click(screen.getByTestId('explore-interactive'))

		await waitFor(() => expect(useAppStore.getState()).toMatchObject({mixedUrlPromptOpen: true, mixedUrlPending: url, mixedUrlPromptSource: 'wizard'}))
		expect(window.appApi.downloads.probe).not.toHaveBeenCalled()
	})

	it('a profile picked from ▾ is the one both segments use', async () => {
		await renderOn(`${VIDEO}&list=PLx`)

		fireEvent.click(screen.getByTestId('explore-profile-trigger'))
		fireEvent.click(await screen.findByTestId('explore-profile-option-audio-only'))

		await waitFor(() => expect(screen.getByTestId('explore-download-video')).toHaveAttribute('aria-description', 'Download just this video with Audio only'))
		expect(screen.getByTestId('explore-download')).toHaveAttribute('aria-description', 'Download from this playlist · With Audio only')
	})

	it('shrinks both segments to icons in the compact toolbar, named for screen readers', async () => {
		await renderOn(`${VIDEO}&list=RDx`, {exploreCompactChrome: true})
		const video = screen.getByTestId('explore-download-video')
		const list = screen.getByTestId('explore-download')
		expect(video).toHaveAccessibleName('This video')
		expect(list).toHaveAccessibleName('Download Mix…')
		expect(video.textContent).toBe('')
		expect(list.textContent).toBe('')
	})

	it('falls back to the blocked Download alone on a page it cannot take', async () => {
		await renderOn(`${VIDEO}&list=PLx`)
		act(() => stateListener?.({...HOME, url: 'https://www.youtube.com/results?search_query=x'}))
		expect(screen.queryByTestId('explore-download-video')).toBeNull()
		expect(screen.getByTestId('explore-download')).toHaveAttribute('aria-description', 'Open a video, playlist, or channel to download it')
	})
})
