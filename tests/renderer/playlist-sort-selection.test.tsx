// @vitest-environment jsdom
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {sortPlaylistEntries} from '@renderer/store/wizard/playlistSort.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

function resetStore() {
	useAppStore.setState({...RESET_WIZARD_STATE, initialized: false, initializing: false, settings: null, wizardOutputDir: '', queue: []})
}

beforeEach(() => {
	resetStore()
	vi.clearAllMocks()
	window.appApi = buildMockAppApi()
})

describe('playlist sort keeps selection', () => {
	it('selection survives a sort change and ids stay stable', () => {
		useAppStore.setState({
			wizardMode: 'playlist',
			playlistItems: [
				{id: '1::a', url: 'https://example.com/a', title: 'A', thumbnail: '', playlistIndex: 1, videoId: 'a', timestamp: 300},
				{id: '2::b', url: 'https://example.com/b', title: 'B', thumbnail: '', playlistIndex: 2, videoId: 'b', timestamp: 100},
				{id: '3::c', url: 'https://example.com/c', title: 'C', thumbnail: '', playlistIndex: 3, videoId: 'c', timestamp: 200}
			],
			selectedPlaylistItemIds: ['1::a', '3::c'],
			playlistSortMode: 'api'
		})

		const before = useAppStore.getState()
		expect(before.playlistItems.map(e => e.id)).toEqual(['1::a', '2::b', '3::c'])

		useAppStore.getState().setPlaylistSortMode('upload-asc')

		const after = useAppStore.getState()
		// Ids untouched — sort is a view concern, never recomputed.
		expect(after.playlistItems.map(e => e.id)).toEqual(['1::a', '2::b', '3::c'])
		expect(after.playlistItems.map(e => e.playlistIndex)).toEqual([1, 2, 3])
		expect(after.selectedPlaylistItemIds).toEqual(['1::a', '3::c'])

		// The derived view orders b, c, a while the store order is unchanged.
		const view = sortPlaylistEntries(after.playlistItems, after.playlistSortMode)
		expect(view.map(e => e.id)).toEqual(['2::b', '3::c', '1::a'])
	})
})
