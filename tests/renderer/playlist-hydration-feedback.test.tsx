// @vitest-environment jsdom

// A placeholder row in the playlist picker is hydrated in the background. Without
// a per-row tell the user sees "Untitled · #3" with no indication that anything is
// still coming, so they advance and ship the placeholder into the queue. Bulk mode
// already had this feedback; the playlist picker did not.

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

const RESOLVED: PlaylistEntry = {id: '1::p1', title: 'Real p01 Title', url: 'https://www.bilibili.com/video/BV1?p=1', thumbnail: 'https://i0.hdslb.com/a.png', playlistIndex: 1, videoId: 'BV1_p1'}
const PENDING: PlaylistEntry = {id: '3::p3', title: 'Untitled · #3', url: 'https://www.bilibili.com/video/BV1?p=3', thumbnail: '', playlistIndex: 3, videoId: null, titleIsPlaceholder: true}

beforeEach(() => {
	vi.clearAllMocks()
	window.appApi = buildMockAppApi()
})
afterEach(cleanup)

describe('playlist picker hydration feedback', () => {
	it('shows per-row status and overall progress while placeholder rows hydrate', () => {
		useAppStore.setState({
			...RESET_WIZARD_STATE,
			initialized: true,
			initializing: false,
			settings: defaultAppSettings('/downloads'),
			wizardOutputDir: '/downloads',
			wizardStep: 'playlistItems',
			wizardMode: 'playlist',
			wizardExtractor: 'BiliBili',
			playlistItems: [RESOLVED, PENDING],
			selectedPlaylistItemIds: [RESOLVED.id, PENDING.id],
			playlistTitle: 'Anthology',
			playlistSelection: {kind: 'video', tier: 'best', codec: 'best'},
			bulkMetadataStatus: 'resolving',
			bulkMetadataCompleted: 1,
			bulkMetadataTotal: 2,
			bulkMetadataById: {[PENDING.id]: 'resolving'},
			queue: []
		} satisfies Partial<AppState>)
		render(<StepPlaylistItems />)

		// Overall progress, previously bulk-only.
		expect(screen.getByTestId('bulk-metadata-status')).toBeTruthy()
		// Waiting-is-optional hint: queueing now still yields real file names.
		expect(screen.getByTestId('bulk-metadata-optional').textContent).toContain('No need to wait')
		// Per-row tell on the row that is still resolving, and none on the resolved one.
		expect(screen.getByTestId(`playlist-row-status-${PENDING.id}`).textContent).toContain('Fetching details')
		expect(screen.queryByTestId(`playlist-row-status-${RESOLVED.id}`)).toBeNull()
	})
})
