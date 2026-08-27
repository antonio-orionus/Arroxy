// @vitest-environment jsdom

// A probe result made only of playlists/channels/albums keeps those rows so the
// picker isn't empty. They are not downloadable — the URL addresses a whole set
// while a queue item carries one pre-bound filename — so the list has to say so
// rather than leave dead checkboxes unexplained.

import {cleanup, render, screen, within} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import type {PlaylistEntry} from '@shared/types.js'
import type {AppState} from '@renderer/store/types.js'
import {defaultAppSettings} from '@shared/constants.js'
import {StepPlaylistItems} from '@renderer/components/wizard/StepPlaylistItems.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// jsdom gives the scroll container zero height, so the real virtualizer renders
// no rows at all. Same stub the other row-level renderer tests use.
vi.mock('@tanstack/react-virtual', () => ({useVirtualizer: ({count}: {count: number}) => ({getTotalSize: () => count * 56, getVirtualItems: () => Array.from({length: count}, (_, index) => ({index, key: index, size: 56, start: index * 56})), measureElement: () => undefined})}))

const VIDEO_ROW: PlaylistEntry = {id: 'v1', title: 'Real Video', url: 'https://youtu.be/v1', thumbnail: '', playlistIndex: 1, videoId: 'v1'}
const NESTED_ROW: PlaylistEntry = {id: 'c1', title: 'Greatest Hits', url: 'https://www.youtube.com/playlist?list=PLx', thumbnail: '', playlistIndex: 2, videoId: 'VLPLx', isContainer: true}

function renderItems(items: PlaylistEntry[]): void {
	useAppStore.setState({
		...RESET_WIZARD_STATE,
		initialized: true,
		initializing: false,
		settings: defaultAppSettings('/downloads'),
		wizardOutputDir: '/downloads',
		wizardStep: 'playlistItems',
		wizardMode: 'playlist',
		wizardExtractor: 'youtube:playlist',
		playlistItems: items,
		selectedPlaylistItemIds: items.filter(entry => entry.isContainer !== true).map(entry => entry.id),
		playlistTitle: 'Playlist',
		playlistSelection: {kind: 'video', tier: 'best', codec: 'best'},
		queue: []
	} satisfies Partial<AppState>)
	render(<StepPlaylistItems />)
}

beforeEach(() => {
	vi.clearAllMocks()
	window.platform = 'linux'
	window.appApi = buildMockAppApi()
})

afterEach(cleanup)

describe('StepPlaylistItems — rows that are themselves playlists', () => {
	it('badges the row and disables its checkbox', () => {
		renderItems([VIDEO_ROW, NESTED_ROW])

		const nested = screen.getByTestId(`playlist-item-row-${NESTED_ROW.id}`)
		expect(within(nested).getByText('Playlist')).toBeTruthy()
		// The shadcn checkbox renders a span, not a native input — disabled state
		// surfaces as a data attribute rather than a DOM property.
		expect(within(nested).getByRole('checkbox').hasAttribute('data-disabled')).toBe(true)
		expect(nested.getAttribute('aria-checked')).toBe('false')
	})

	it('leaves ordinary video rows selectable and unbadged', () => {
		renderItems([VIDEO_ROW, NESTED_ROW])

		const video = screen.getByTestId(`playlist-item-row-${VIDEO_ROW.id}`)
		expect(within(video).queryByText('Playlist')).toBeNull()
		expect(within(video).getByRole('checkbox').hasAttribute('data-disabled')).toBe(false)
	})

	it('explains why, in the singular', () => {
		renderItems([VIDEO_ROW, NESTED_ROW])

		expect(screen.getByTestId('nested-playlist-hint').textContent).toContain('1 of these is a playlist, not a video')
	})

	it('explains why, in the plural', () => {
		renderItems([VIDEO_ROW, NESTED_ROW, {...NESTED_ROW, id: 'c2', title: 'Some Album', url: 'https://music.youtube.com/browse/MPREb', playlistIndex: 3}])

		expect(screen.getByTestId('nested-playlist-hint').textContent).toContain('2 of these are playlists, not videos')
	})

	it('shows no hint when every row is a real video', () => {
		renderItems([VIDEO_ROW])

		expect(screen.queryByTestId('nested-playlist-hint')).toBeNull()
	})
})
