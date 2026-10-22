import {describe, expect, it} from 'vite-plus/test'
import {youtubeSite} from '@shared/sites/youtube.js'
import {listKindForUrl, youtubeListKind} from '@shared/sites/youtubeListKind.js'

describe('youtubeListKind', () => {
	it.each([
		['PLx9abc', 'playlist'],
		['RDdQw4w9WgXcQ', 'mix'],
		['RDCLAK5uy_abc', 'playlist'],
		['OLAK5uy_abc', 'album'],
		['UUabc', 'uploads'],
		['WL', 'watch-later'],
		['LL', 'liked'],
		['LM', 'liked'], // YouTube Music liked songs
		['PUabc', 'uploads'], // a channel's popular uploads
		['UUSHabc', 'uploads'],
		['RDMM', 'mix'],
		['RDAMVMabc', 'mix']
	])('%s is a %s', (id, kind) => expect(youtubeListKind(id)).toBe(kind))

	it('falls back to playlist for an unknown prefix', () => {
		expect(youtubeListKind('FLabc')).toBe('playlist')
		expect(youtubeListKind('WLX')).toBe('playlist') // WL and LL match exactly, not as prefixes
	})
})

describe('listKindForUrl', () => {
	it('reads the list of a video link', () => expect(listKindForUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=OLAK5uy_x')).toBe('album'))
	// yt-dlp never reads start_radio: the list id alone says what the list is.
	it('ignores start_radio', () => {
		expect(listKindForUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLx&start_radio=1')).toBe('playlist')
		expect(listKindForUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1')).toBe('mix')
	})
	it('is null without a list, off YouTube, or for a bad URL', () => {
		expect(listKindForUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull()
		expect(listKindForUrl('https://vimeo.com/123?list=PLx')).toBeNull()
		expect(listKindForUrl('not a url')).toBeNull()
	})
})

describe('youtubeSite.hintForPlaylistId', () => {
	it('labels picker fallbacks by list kind', () => {
		expect(youtubeSite.hintForPlaylistId?.('VLRDCLAK5uy_abc')).toBe('Playlist · RDCLAK5uy_abc')
		expect(youtubeSite.hintForPlaylistId?.('VLOLAK5uy_abc')).toBe('Album · OLAK5uy_abc')
		expect(youtubeSite.hintForPlaylistId?.('VLRDabc')).toBe('Mix · RDabc')
		expect(youtubeSite.hintForPlaylistId?.('VLWL')).toBe('Watch later · WL')
	})
})
