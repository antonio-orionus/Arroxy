// @vitest-environment node
import {describe, expect, it} from 'vitest'
import {PLAYLIST_SORT_MODES, playlistSortModeSchema} from '@shared/schemas.js'
import {sortPlaylistEntries} from '@renderer/store/wizard/playlistSort.js'
import type {PlaylistEntry} from '@shared/types.js'

function entry(overrides: Partial<PlaylistEntry> & {id: string}): PlaylistEntry {
	return {url: `https://example.com/${overrides.id}`, title: overrides.id, thumbnail: '', playlistIndex: 1, videoId: null, ...overrides}
}

describe('playlistSortModeSchema', () => {
	it('exposes exactly api / upload-asc / upload-desc — no update-time option', () => {
		expect([...PLAYLIST_SORT_MODES]).toEqual(['api', 'upload-asc', 'upload-desc'])
		expect(playlistSortModeSchema.parse('api')).toBe('api')
	})

	it('rejects an update-time mode', () => {
		expect(playlistSortModeSchema.safeParse('update-desc').success).toBe(false)
	})
})

describe('sortPlaylistEntries', () => {
	const items: PlaylistEntry[] = [entry({id: '1::a', playlistIndex: 1, title: 'A', timestamp: 300}), entry({id: '2::b', playlistIndex: 2, title: 'B', timestamp: 100}), entry({id: '3::c', playlistIndex: 3, title: 'C', timestamp: 200})]

	it('keeps api order untouched and never recomputes ids', () => {
		const out = sortPlaylistEntries(items, 'api')
		expect(out.map(e => e.id)).toEqual(['1::a', '2::b', '3::c'])
		expect(out.map(e => e.playlistIndex)).toEqual([1, 2, 3])
	})

	it('sorts upload-asc by timestamp', () => {
		const out = sortPlaylistEntries(items, 'upload-asc')
		expect(out.map(e => e.id)).toEqual(['2::b', '3::c', '1::a'])
	})

	it('sorts upload-desc by timestamp', () => {
		const out = sortPlaylistEntries(items, 'upload-desc')
		expect(out.map(e => e.id)).toEqual(['1::a', '3::c', '2::b'])
	})

	it('sorts rows with no timestamp last, stable in api order', () => {
		const mixed: PlaylistEntry[] = [entry({id: '1::a', playlistIndex: 1, timestamp: 200}), entry({id: '2::b', playlistIndex: 2}), entry({id: '3::c', playlistIndex: 3}), entry({id: '4::d', playlistIndex: 4, timestamp: 100})]
		const asc = sortPlaylistEntries(mixed, 'upload-asc')
		expect(asc.map(e => e.id)).toEqual(['4::d', '1::a', '2::b', '3::c'])
		const desc = sortPlaylistEntries(mixed, 'upload-desc')
		expect(desc.map(e => e.id)).toEqual(['1::a', '4::d', '2::b', '3::c'])
	})

	it('does not mutate the input array', () => {
		const before = items.map(e => e.id)
		sortPlaylistEntries(items, 'upload-asc')
		expect(items.map(e => e.id)).toEqual(before)
	})
})
