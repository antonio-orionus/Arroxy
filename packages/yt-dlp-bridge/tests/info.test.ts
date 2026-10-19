import {describe, expect, it} from 'vite-plus/test'
import {infoDictSchema, isPlaylistLike, isUrlRedirect} from '../src/info.js'
import {sanitizeMetadataItem, sanitizeMetadataItems} from '../src/parsers.js'

const VIDEO = {
	id: 'abc',
	title: 'A video',
	fulltitle: 'A video (full)',
	description: null,
	duration: 61,
	duration_string: '1:01',
	uploader: 'Someone',
	uploader_id: '@someone',
	channel: 'Someone',
	channel_id: 'UC123',
	channel_url: 'https://www.youtube.com/channel/UC123',
	webpage_url: 'https://www.youtube.com/watch?v=abc',
	extractor: 'youtube',
	extractor_key: 'Youtube',
	upload_date: '20260101',
	timestamp: 1767225600,
	availability: 'public',
	live_status: 'not_live',
	age_limit: 0,
	categories: ['Music', 7],
	tags: ['a', null, 'b'],
	chapters: [{start_time: 0, title: 'Intro'}],
	subtitles: {fr: [{ext: 'vtt'}], en: [{ext: 'vtt'}]},
	automatic_captions: {'en-orig': [{ext: 'vtt'}]},
	thumbnails: [{url: 'https://i.ytimg.com/a.jpg'}, {url: null}],
	formats: [
		{format_id: '18', ext: 'mp4', width: 640, height: 360, vcodec: 'avc1', acodec: 'mp4a', protocol: 'https'},
		{format_id: '251', ext: 'webm', vcodec: 'none', acodec: 'opus', abr: 130}
	],
	format_id: '18',
	ext: 'mp4',
	height: 360,
	unknown_extra_field: {nested: true}
}

describe('infoDictSchema', () => {
	it('reads a plain video (no _type) as the video arm and keeps unknown fields', () => {
		const info = infoDictSchema.parse(VIDEO)
		expect(info._type).toBe('video')
		expect(isPlaylistLike(info) || isUrlRedirect(info)).toBe(false)
		expect(info).toMatchObject({unknown_extra_field: {nested: true}})
	})

	it('reads a playlist with nested entries', () => {
		const info = infoDictSchema.parse({_type: 'playlist', id: 'PL1', title: 'List', entries: [{id: 'a'}, {_type: 'url', url: 'https://example.com/b'}]})
		expect(isPlaylistLike(info)).toBe(true)
		if (!isPlaylistLike(info)) return
		expect(info.entries).toHaveLength(2)
		expect(isUrlRedirect(info.entries[1])).toBe(true)
	})
})

describe('infoDictSchema — null normalization + _type discrimination', () => {
	it('treats null filesize/fps/duration as undefined (not validation errors)', () => {
		const raw = {title: 'x', thumbnail: null, duration: null, formats: [{format_id: '22', filesize: null, fps: null, abr: null, ext: 'mp4'}], subtitles: null, automatic_captions: null}
		const result = infoDictSchema.safeParse(raw)
		expect(result.success).toBe(true)
		if (result.success) {
			const data = result.data
			expect(data._type).toBe('video')
			if (data._type === 'video' || data._type === undefined) {
				expect(data.duration).toBeUndefined()
				expect(data.thumbnail).toBeUndefined()
				expect(data.formats?.[0].filesize).toBeUndefined()
				expect(data.formats?.[0].fps).toBeUndefined()
				expect(data.subtitles).toBeUndefined()
			}
		}
	})

	it('passes through unknown fields without rejecting', () => {
		const raw = {title: 'x', _unknown_field_yt_dlp_added_in_2030: 'whatever', formats: [{format_id: '22', _new_codec_field: 'av2'}]}
		expect(infoDictSchema.safeParse(raw).success).toBe(true)
	})

	it('discriminates on _type: playlist', () => {
		const raw = {
			_type: 'playlist',
			id: 'PLabc',
			title: 'My playlist',
			entries: [
				{id: 'v1', title: 'Video 1', url: 'https://www.youtube.com/watch?v=v1'},
				{id: 'v2', title: 'Video 2', url: 'https://www.youtube.com/watch?v=v2'}
			]
		}
		const result = infoDictSchema.safeParse(raw)
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data._type).toBe('playlist')
		}
	})

	it('discriminates on _type: multi_video', () => {
		const raw = {_type: 'multi_video', id: 'episode-1', title: 'Multi-act episode', entries: [{id: 'a', title: 'Act 1', url: 'https://x.com/a'}]}
		expect(infoDictSchema.safeParse(raw).success).toBe(true)
	})

	it('discriminates on _type: url (redirect entry)', () => {
		const raw = {_type: 'url', url: 'https://example.com/video', ie_key: 'Generic'}
		const result = infoDictSchema.safeParse(raw)
		expect(result.success).toBe(true)
		if (result.success) expect(result.data._type).toBe('url')
	})
})

describe('sanitizeMetadataItem', () => {
	it('maps a video dict to the sanitized summary', () => {
		expect(sanitizeMetadataItem(VIDEO, 1)).toEqual({
			id: 'abc',
			title: 'A video',
			webpageUrl: 'https://www.youtube.com/watch?v=abc',
			extractor: 'youtube',
			extractorKey: 'Youtube',
			thumbnailCount: 2,
			fulltitle: 'A video (full)',
			duration: 61,
			durationString: '1:01',
			uploader: 'Someone',
			uploaderId: '@someone',
			channel: 'Someone',
			channelId: 'UC123',
			channelUrl: 'https://www.youtube.com/channel/UC123',
			uploadDate: '20260101',
			timestamp: 1767225600,
			availability: 'public',
			liveStatus: 'not_live',
			ageLimit: 0,
			categories: ['Music'],
			tags: ['a', 'b'],
			chapters: [{start_time: 0, title: 'Intro'}],
			subtitleLanguages: ['en', 'fr'],
			subtitleCount: 2,
			automaticCaptionLanguages: ['en-orig'],
			automaticCaptionCount: 1,
			formatCount: 2,
			formats: [{formatId: '18', extension: 'mp4', protocol: 'https', width: 640, height: 360, audioCodec: 'mp4a', videoCodec: 'avc1'}],
			selectedFormat: {formatId: '18', extension: 'mp4', height: 360}
		})
	})

	it('keeps only the shared fields of a playlist', () => {
		expect(sanitizeMetadataItem({_type: 'playlist', id: 'PL1', title: 'List', webpage_url: 'https://example.com/list', entries: [], description: 'ignored'})).toEqual({id: 'PL1', title: 'List', webpageUrl: 'https://example.com/list'})
	})

	it('sanitizes a dict the schema rejects to an empty summary', () => {
		expect(sanitizeMetadataItem(null)).toEqual({})
		expect(sanitizeMetadataItem('not a dict')).toEqual({})
		expect(sanitizeMetadataItem({id: 'abc', duration: 'long'})).toEqual({})
	})

	it('sanitizes each item of a list', () => {
		expect(sanitizeMetadataItems([{id: 'a'}, {id: 'b', title: 'B'}])).toEqual([{id: 'a'}, {id: 'b', title: 'B'}])
	})
})
