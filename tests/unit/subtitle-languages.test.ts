import {describe, expect, it} from 'vite-plus/test'
import {subtitleSourceOptions, withSubtitleTracks, ytDlpSubtitleLanguages, ytDlpSubtitleLanguageSelector} from '@shared/subtitleLanguages.js'

describe('ytDlpSubtitleLanguageSelector', () => {
	it('builds a yt-dlp fullmatch pattern that keeps the region subtag case-sensitive', () => {
		expect(ytDlpSubtitleLanguageSelector('de')).toBe('de(?:-(?-i:[A-Z]{2}|[A-Z][a-z]{3})|-\\d{3})?')
	})

	it('keeps already-qualified and extractor-specific codes exact', () => {
		expect(ytDlpSubtitleLanguageSelector('zh-Hant')).toBe('zh-Hant')
		expect(ytDlpSubtitleLanguageSelector('nb-nor')).toBe('nb-nor')
	})

	it('never emits commas, which yt-dlp uses to split --sub-langs', () => {
		expect(ytDlpSubtitleLanguageSelector('zh-Hans')).not.toContain(',')
	})
})

describe('ytDlpSubtitleLanguages', () => {
	it('sends track keys as exact, case-sensitive yt-dlp patterns', () => {
		expect(ytDlpSubtitleLanguages({languages: ['en-orig', 'de-DE']})).toEqual(['(?-i:en-orig)', '(?-i:de-DE)'])
	})

	it('escapes regex syntax in a track key', () => {
		expect(ytDlpSubtitleLanguages({languages: ['en.x', 'a+b(c)']})).toEqual(['(?-i:en\\.x)', '(?-i:a\\+b\\(c\\))'])
	})

	it('falls back to a selector per code when the codes were never resolved to tracks', () => {
		expect(ytDlpSubtitleLanguages({languages: ['en', 'uk'], languagesAreCodes: true})).toEqual([ytDlpSubtitleLanguageSelector('en'), ytDlpSubtitleLanguageSelector('uk')])
	})
})

describe('subtitleSourceOptions', () => {
	it('asks for manual and automatic tracks side by side for manual-and-auto', () => {
		expect(subtitleSourceOptions('manual-and-auto')).toEqual({writeAuto: true, autoAlongsideManual: true})
		expect(subtitleSourceOptions('manual-first')).toEqual({writeAuto: true})
	})
})

describe('withSubtitleTracks', () => {
	const maps = {subtitles: {}, automaticCaptions: {'ja-orig': [{ext: 'vtt'}]}}
	const options = {languages: ['ja', 'en'], mode: 'sidecar' as const, format: 'srt' as const, writeAuto: true}

	it('turns language codes into the exact tracks', () => {
		expect(withSubtitleTracks({...options, languages: ['de'], languagesAreCodes: true}, {subtitles: {'de-DE': [{ext: 'vtt'}]}, automaticCaptions: {}})).toEqual({...options, languages: ['de-DE']})
	})

	// yt-dlp lists YouTube's original-language captions as `ja` too, same URL:
	// that key keeps the file name `….ja.srt` and the embedded track's language `ja`.
	it("asks for an original-language caption by its bare twin's key", () => {
		expect(withSubtitleTracks({...options, languagesAreCodes: true}, maps)).toEqual({...options, languages: ['ja']})
	})

	it('keeps manual and automatic English apart for manual-and-auto', () => {
		const both = {subtitles: {en: [{ext: 'vtt'}]}, automaticCaptions: {'en-orig': [{ext: 'vtt'}]}}
		expect(withSubtitleTracks({...options, languages: ['en'], languagesAreCodes: true, autoAlongsideManual: true}, both)).toEqual({...options, languages: ['en', 'en-orig'], autoAlongsideManual: true})
	})

	it('leaves track keys alone', () => {
		expect(withSubtitleTracks(options, maps)).toBe(options)
	})
})
