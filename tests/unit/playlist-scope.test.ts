import {describe, expect, it} from 'vitest'
import {describePlaylistScopeForLog, playlistScopeSentinelFields} from '@shared/playlistScope.js'

describe('describePlaylistScopeForLog', () => {
	it('describes the app limit with a sentinel playlist-end value', () => {
		expect(describePlaylistScopeForLog(undefined, 100)).toEqual({kind: 'app-limit', appLimit: 100, requestedCount: 100, sentinel: true, ytDlpFlag: '--playlist-end', ytDlpValue: '101'})
	})

	it('describes first-count scopes with a sentinel playlist-items value', () => {
		expect(describePlaylistScopeForLog({items: {kind: 'first', count: 50}}, 100)).toEqual({kind: 'first', requestedCount: 50, sentinel: true, ytDlpFlag: '--playlist-items', ytDlpValue: '1:51'})
	})

	it('describes range scopes with an inclusive requested count and exclusive sentinel end', () => {
		expect(describePlaylistScopeForLog({items: {kind: 'range', from: 500, to: 600}}, 100)).toEqual({kind: 'range', from: 500, to: 600, requestedCount: 101, sentinel: true, ytDlpFlag: '--playlist-items', ytDlpValue: '500:601'})
	})

	it('exposes the same sentinel fields used by yt-dlp args', () => {
		expect(playlistScopeSentinelFields({items: {kind: 'range', from: 20, to: 40}}, 100)).toEqual({requestedCount: 21, sentinel: true, ytDlpFlag: '--playlist-items', ytDlpValue: '20:41'})
	})
})
