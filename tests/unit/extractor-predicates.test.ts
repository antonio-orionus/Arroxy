import {describe, expect, it} from 'vitest'
import {isYouTubeExtractor, isAudioOnlySource} from '@shared/ytdlp/extractorPredicates.js'

describe('isYouTubeExtractor', () => {
	it.each(['youtube', 'youtube:tab', 'youtube:playlist', 'youtube:search', 'youtube:user'])('accepts %s', name => {
		expect(isYouTubeExtractor(name)).toBe(true)
	})

	it('rejects synthetic youtube:music — not a real yt-dlp IE_NAME', () => {
		// yt-dlp emits 'youtube:music:search_url' (a YT-family extractor that
		// returns mixed content), never bare 'youtube:music'. Predicate's
		// canonical-IE-name set should not match it.
		expect(isYouTubeExtractor('youtube:music')).toBe(false)
	})

	it('is case-insensitive', () => {
		expect(isYouTubeExtractor('YouTube')).toBe(true)
		expect(isYouTubeExtractor('YOUTUBE:TAB')).toBe(true)
	})

	it('accepts yt-dlp plugin suffixes on canonical YouTube extractor names', () => {
		expect(isYouTubeExtractor('youtube+arroxyfixture')).toBe(true)
		expect(isYouTubeExtractor('YouTube:Tab+ArroxyFixture')).toBe(true)
	})

	it.each(['vimeo', 'pornhub', 'PornHubPagedVideoList', 'qqmusic', 'bandcamp', 'soundcloud'])('rejects %s', name => {
		expect(isYouTubeExtractor(name)).toBe(false)
	})

	it('rejects yt-dlp plugin suffixes on non-YouTube extractor names', () => {
		expect(isYouTubeExtractor('vimeo+arroxyfixture')).toBe(false)
	})

	it('rejects empty / nullish inputs', () => {
		expect(isYouTubeExtractor('')).toBe(false)
		expect(isYouTubeExtractor(undefined)).toBe(false)
		expect(isYouTubeExtractor(null)).toBe(false)
	})
})

describe('isAudioOnlySource', () => {
	it.each(['bandcamp', 'soundcloud', 'soundcloud:set', 'qqmusic', 'qqmusic:playlist', 'mixcloud', 'jamendo', 'audiomack', 'tiktok:music', 'apple:music', 'spotify', 'deezer'])('accepts curated music host: %s', name => {
		expect(isAudioOnlySource(name)).toBe(true)
	})

	it('keyword fallback: extractor names with music/radio/audio as a token match', () => {
		expect(isAudioOnlySource('podcast:feed')).toBe(true)
		expect(isAudioOnlySource('radio_canada')).toBe(true)
		expect(isAudioOnlySource('bbc:radio')).toBe(true)
		expect(isAudioOnlySource('cool:audio:thing')).toBe(true)
	})

	it("keyword fallback respects token boundaries (doesn't match infix)", () => {
		// 'someradio:show' has 'radio' as a tail of 'someradio', not a separate
		// token — predicate must NOT match, otherwise random extractor names
		// containing the substring would falsely classify as audio-only.
		expect(isAudioOnlySource('someradio:show')).toBe(false)
		expect(isAudioOnlySource('audiophile_corner')).toBe(false)
	})

	it('explicitly excludes youtube:music:* (mixed video+audio content)', () => {
		expect(isAudioOnlySource('youtube:music:search_url')).toBe(false)
		expect(isAudioOnlySource('youtube:music')).toBe(false)
	})

	it.each(['youtube', 'vimeo', 'twitch', 'PornHub', 'reddit'])('rejects video-only host: %s', name => {
		expect(isAudioOnlySource(name)).toBe(false)
	})

	it('rejects empty / nullish inputs', () => {
		expect(isAudioOnlySource('')).toBe(false)
		expect(isAudioOnlySource(undefined)).toBe(false)
		expect(isAudioOnlySource(null)).toBe(false)
	})
})
