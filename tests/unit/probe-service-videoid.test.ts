// @vitest-environment node
import {describe, expect, it} from 'vitest'
import {mapPlaylistEntries} from '@main/services/ProbeService.js'
import type {InfoDict} from '@shared/schemas.js'

/** Minimal yt-dlp row — only fields read by mapPlaylistEntries. */
function playlistEntryFixture(row: {id?: string; title: string; url: string; playlist_index: number}) {
	return row
}

describe('mapPlaylistEntries — videoId', () => {
	it('exposes the raw yt-dlp id as videoId', () => {
		const entry = playlistEntryFixture({id: 'dQw4w9WgXcQ', title: 'Rick', url: 'https://youtu.be/dQw4w9WgXcQ', playlist_index: 1}) as InfoDict
		const out = mapPlaylistEntries([entry], 'https://youtube.com/playlist?list=x', 'youtube')
		expect(out[0].videoId).toBe('dQw4w9WgXcQ')
	})

	it('sets videoId null when the entry has no id', () => {
		const entry = playlistEntryFixture({title: 'No id', url: 'https://example.com/v/1', playlist_index: 1}) as InfoDict
		const out = mapPlaylistEntries([entry], 'https://example.com/list', 'generic')
		expect(out[0].videoId).toBeNull()
	})
})

describe('mapPlaylistEntries — placeholder titles', () => {
	it('marks a flat Bilibili entry with no title as a placeholder', () => {
		const entry = {ie_key: 'BiliBili', _type: 'url', url: 'https://www.bilibili.com/video/BV1bK411W797?p=1'} as unknown as InfoDict
		const out = mapPlaylistEntries([entry], 'https://www.bilibili.com/video/BV1bK411W797', 'generic')
		expect(out).toHaveLength(1)
		expect(out[0].title).toBe('Untitled · #1')
		expect(out[0].titleIsPlaceholder).toBe(true)
	})

	it('does not mark a real title as a placeholder', () => {
		const entry = playlistEntryFixture({id: 'dQw4w9WgXcQ', title: 'Rick', url: 'https://youtu.be/dQw4w9WgXcQ', playlist_index: 1}) as InfoDict
		const out = mapPlaylistEntries([entry], 'https://youtube.com/playlist?list=x', 'youtube')
		expect(out[0].titleIsPlaceholder).toBeUndefined()
	})

	it('does not mark a site-provided id hint as a placeholder', () => {
		const entry = {_type: 'url', id: 'UCBR8-60-B28hp2BmDPdntcQ', url: 'https://www.youtube.com/channel/UCBR8-60-B28hp2BmDPdntcQ'} as unknown as InfoDict
		const out = mapPlaylistEntries([entry], 'https://www.youtube.com/playlist?list=x', 'youtube')
		expect(out[0].title).toMatch(/^Channel · /)
		expect(out[0].titleIsPlaceholder).toBeUndefined()
	})
})
