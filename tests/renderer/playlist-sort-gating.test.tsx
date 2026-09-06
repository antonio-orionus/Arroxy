// @vitest-environment jsdom

// Upload-date sort is only honest once every row that can carry a timestamp has
// one. Gating on "some row has a timestamp" unlocks the control after the first
// probe resolves, so the user picks "Oldest first" and gets a list where the
// still-unhydrated majority silently sinks to the bottom — presented as sorted.

import {cleanup, render, screen} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import type {PlaylistEntry} from '@shared/types.js'
import type {AppState} from '@renderer/store/types.js'
import {defaultAppSettings} from '@shared/constants.js'
import {StepPlaylistItems} from '@renderer/components/wizard/StepPlaylistItems.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

vi.mock('@tanstack/react-virtual', () => ({useVirtualizer: ({count}: {count: number}) => ({getTotalSize: () => count * 56, getVirtualItems: () => Array.from({length: count}, (_, index) => ({index, key: index, size: 56, start: index * 56})), measureElement: () => undefined})}))

const HYDRATED: PlaylistEntry = {id: '1::a', title: 'A', url: 'https://example.com/a', thumbnail: '', playlistIndex: 1, videoId: 'a', timestamp: 100}
const PENDING: PlaylistEntry = {id: '2::b', title: 'Untitled · #2', url: 'https://example.com/b', thumbnail: '', playlistIndex: 2, videoId: null, titleIsPlaceholder: true}
const CONTAINER: PlaylistEntry = {id: '3::c', title: 'Nested list', url: 'https://example.com/c', thumbnail: '', playlistIndex: 3, videoId: null, isContainer: true}

function renderStep(overrides: Partial<AppState>): void {
	useAppStore.setState({
		...RESET_WIZARD_STATE,
		initialized: true,
		initializing: false,
		settings: defaultAppSettings('/downloads'),
		wizardOutputDir: '/downloads',
		wizardStep: 'playlistItems',
		wizardMode: 'playlist',
		playlistTitle: 'List',
		playlistSelection: {kind: 'video', tier: 'best', codec: 'best'},
		queue: [],
		...overrides
	} satisfies Partial<AppState>)
	render(<StepPlaylistItems />)
}

function uploadToggles(): HTMLButtonElement[] {
	return [screen.getByTestId('playlist-sort-upload-asc'), screen.getByTestId('playlist-sort-upload-desc')] as HTMLButtonElement[]
}

beforeEach(() => {
	vi.clearAllMocks()
	window.appApi = buildMockAppApi()
})
afterEach(cleanup)

describe('playlist upload-date sort gating', () => {
	it('keeps upload modes disabled while hydration is still filling timestamps in', () => {
		renderStep({playlistItems: [HYDRATED, PENDING], selectedPlaylistItemIds: [HYDRATED.id, PENDING.id], bulkMetadataStatus: 'resolving', bulkMetadataCompleted: 1, bulkMetadataTotal: 2, bulkMetadataById: {[PENDING.id]: 'resolving'}})
		for (const toggle of uploadToggles()) expect(toggle.disabled).toBe(true)
	})

	it('enables upload modes once hydration settles with timestamps present', () => {
		renderStep({playlistItems: [HYDRATED, {...PENDING, title: 'B', videoId: 'b', timestamp: 200, titleIsPlaceholder: undefined}], selectedPlaylistItemIds: [HYDRATED.id, PENDING.id], bulkMetadataStatus: 'done', bulkMetadataCompleted: 2, bulkMetadataTotal: 2})
		for (const toggle of uploadToggles()) expect(toggle.disabled).toBe(false)
	})

	it('ignores container rows, which never carry a timestamp of their own', () => {
		renderStep({playlistItems: [HYDRATED, CONTAINER], selectedPlaylistItemIds: [HYDRATED.id], bulkMetadataStatus: 'idle'})
		for (const toggle of uploadToggles()) expect(toggle.disabled).toBe(false)
	})
})
