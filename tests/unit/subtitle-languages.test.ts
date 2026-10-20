import {describe, expect, it} from 'vite-plus/test'
import {ytDlpSubtitleKey, ytDlpSubtitleLanguageSelector} from '@shared/subtitleLanguages.js'

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

describe('ytDlpSubtitleKey', () => {
	it('sends a track key as an exact, case-sensitive yt-dlp pattern', () => {
		expect(['en-orig', 'de-DE'].map(ytDlpSubtitleKey)).toEqual(['(?-i:en-orig)', '(?-i:de-DE)'])
	})

	it('escapes regex syntax in a track key', () => {
		expect(['en.x', 'a+b(c)'].map(ytDlpSubtitleKey)).toEqual(['(?-i:en\\.x)', '(?-i:a\\+b\\(c\\))'])
	})
})
