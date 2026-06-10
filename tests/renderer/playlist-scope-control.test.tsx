// @vitest-environment jsdom
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {PlaylistScopeControl} from '@renderer/components/wizard/PlaylistScopeControl.js'
import {StepPlaylistItems} from '@renderer/components/wizard/StepPlaylistItems.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {PlaylistEntry, ProbeResult} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {ok} from '../shared/fixtures.js'
import {fail} from '@shared/result.js'

function playlistEntry(index: number): PlaylistEntry {
	return {id: `e${index}`, url: `https://youtube.com/watch?v=e${index}`, title: `Video ${index}`, thumbnail: '', playlistIndex: index, videoId: `e${index}`}
}

function playlistProbe(): Extract<ProbeResult, {kind: 'playlist'}> {
	return {kind: 'playlist', extractor: 'youtube:playlist', extractorKey: 'YoutubePlaylist', webpageUrl: 'https://www.youtube.com/playlist?list=PLtest', isAudioOnlySource: false, playlistTitle: 'Playlist', playlistId: 'PLtest', isMultiVideo: false, entries: [playlistEntry(500), playlistEntry(501)]}
}

function resetStore(): void {
	const playlistItems = [playlistEntry(1), playlistEntry(2)]
	useAppStore.setState({
		...RESET_WIZARD_STATE,
		initialized: true,
		initializing: false,
		settings: {...defaultAppSettings('/downloads'), common: {...defaultAppSettings('/downloads').common, playlistProbeLimit: 100, shareInlineCardDismissed: true}},
		wizardOutputDir: '/downloads',
		wizardStep: 'playlistItems',
		wizardMode: 'playlist',
		wizardUrl: 'https://www.youtube.com/playlist?list=PLtest',
		wizardExtractor: 'youtube:playlist',
		playlistItems,
		selectedPlaylistItemIds: playlistItems.map(entry => entry.id),
		playlistTitle: 'Playlist',
		playlistSelection: {kind: 'video', tier: 'best', codec: 'best'},
		queue: [],
		drawerOpen: false
	} as never)
}

beforeEach(() => {
	vi.clearAllMocks()
	window.platform = 'linux'
	window.appApi = buildMockAppApi()
	resetStore()
})

describe('PlaylistScopeControl', () => {
	it('shows the app-limit summary on the playlist step', () => {
		render(<StepPlaylistItems />)

		expect(screen.getByTestId('playlist-scope-summary')).toHaveTextContent('Load first 100 items')
	})

	it('applies an item range from the playlist step and reloads the probe', async () => {
		vi.mocked(window.appApi.downloads.probe).mockResolvedValue(ok(playlistProbe()))
		render(<StepPlaylistItems />)

		fireEvent.click(screen.getByTestId('playlist-scope-change'))
		fireEvent.click(await screen.findByText('Range'))
		fireEvent.change(screen.getByTestId('playlist-scope-range-from'), {target: {value: '500'}})
		fireEvent.change(screen.getByTestId('playlist-scope-range-to'), {target: {value: '600'}})
		fireEvent.click(screen.getByTestId('playlist-scope-apply'))

		expect(screen.getByTestId('playlist-scope-summary')).toHaveTextContent('Load items 500-600')
		expect(useAppStore.getState().playlistScope).toEqual({items: {kind: 'range', from: 500, to: 600}})
		await waitFor(() => {
			expect(window.appApi.downloads.probe).toHaveBeenCalledWith({url: 'https://www.youtube.com/playlist?list=PLtest', playlistMode: 'playlist', playlistScope: {items: {kind: 'range', from: 500, to: 600}}})
		})
	})

	it('keeps the playlist screen visible and shows an inline error when the scoped reload has no entries', async () => {
		vi.mocked(window.appApi.downloads.probe).mockResolvedValue(fail({kind: 'other', code: 'playlist_empty', message: 'Playlist returned no entries'}))
		render(<StepPlaylistItems />)

		fireEvent.click(screen.getByTestId('playlist-scope-change'))
		fireEvent.click(await screen.findByText('Range'))
		fireEvent.change(screen.getByTestId('playlist-scope-range-from'), {target: {value: '900'}})
		fireEvent.change(screen.getByTestId('playlist-scope-range-to'), {target: {value: '950'}})
		fireEvent.click(screen.getByTestId('playlist-scope-apply'))

		await waitFor(() => {
			expect(screen.getByTestId('playlist-scope-error')).toHaveTextContent('No videos matched that playlist scope. Your previous list is still shown.')
		})
		expect(useAppStore.getState().wizardStep).toBe('playlistItems')
		expect(useAppStore.getState().playlistItems.map(entry => entry.title)).toEqual(['Video 1', 'Video 2'])
		expect(screen.getByTestId('playlist-scope-summary')).toHaveTextContent('Load first 100 items')
	})

	it('disables apply while a scoped reload is in flight', async () => {
		let resolveProbe: (value: Awaited<ReturnType<typeof window.appApi.downloads.probe>>) => void = () => {}
		vi.mocked(window.appApi.downloads.probe).mockReturnValue(
			new Promise(resolve => {
				resolveProbe = resolve
			})
		)
		render(<StepPlaylistItems />)

		fireEvent.click(screen.getByTestId('playlist-scope-change'))
		fireEvent.click(await screen.findByText('First'))
		fireEvent.change(screen.getByTestId('playlist-scope-first-input'), {target: {value: '50'}})
		fireEvent.click(screen.getByTestId('playlist-scope-apply'))

		expect(screen.getByTestId('playlist-scope-apply')).toBeDisabled()
		expect(screen.getByTestId('playlist-scope-apply')).toHaveTextContent('Reloading...')
		fireEvent.click(screen.getByTestId('playlist-scope-apply'))
		expect(window.appApi.downloads.probe).toHaveBeenCalledTimes(1)

		await act(async () => {
			resolveProbe(ok(playlistProbe()))
		})
	})

	it('shows an inline dialog error when the apply callback rejects unexpectedly', async () => {
		const onApplyScope = vi.fn().mockRejectedValue(new Error('IPC bridge crashed'))
		render(<PlaylistScopeControl onApplyScope={onApplyScope} applyLabel="Apply and reload" pendingLabel="Reloading..." />)

		fireEvent.click(screen.getByTestId('playlist-scope-change'))
		fireEvent.click(await screen.findByText('First'))
		fireEvent.change(screen.getByTestId('playlist-scope-first-input'), {target: {value: '50'}})
		fireEvent.click(screen.getByTestId('playlist-scope-apply'))

		await waitFor(() => {
			expect(screen.getByTestId('playlist-scope-apply-error')).toHaveTextContent('IPC bridge crashed')
		})
		expect(screen.getByTestId('playlist-scope-dialog')).toBeInTheDocument()
		expect(useAppStore.getState().playlistScope).toEqual({items: {kind: 'app-limit'}})
	})
})
