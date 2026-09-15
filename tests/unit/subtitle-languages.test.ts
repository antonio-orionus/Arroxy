import {describe, expect, it} from 'vitest'
import {matchesSubtitleLanguage, ytDlpSubtitleLanguages, ytDlpSubtitleLanguageSelector} from '@shared/subtitleLanguages.js'

// Track keys observed on a real YouTube video (`yt-dlp --list-subs`), plus
// regional variants uploaders commonly set. `de-en` is German auto-translated
// from English — a translation, not a regional variant.
const TRACK_KEYS = ['de', 'de-DE', 'de-AT', 'de-en', 'de-ja', 'de-es-419', 'en', 'en-US', 'en-GB', 'en-de-DE', 'es', 'es-419', 'pt', 'pt-BR', 'pt-PT', 'zh-Hans', 'zh-Hant', 'uk', 'iw', 'en-orig']

describe('matchesSubtitleLanguage', () => {
	it.each([
		['de', ['de', 'de-DE', 'de-AT']],
		['en', ['en', 'en-US', 'en-GB']],
		['es', ['es', 'es-419']],
		['pt', ['pt', 'pt-BR', 'pt-PT']],
		['zh', ['zh-Hans', 'zh-Hant']],
		['zh-Hans', ['zh-Hans']],
		['uk', ['uk']]
	])('matches %s to its regional variants only', (code, expected) => {
		expect(TRACK_KEYS.filter(key => matchesSubtitleLanguage(code, key))).toEqual(expected)
	})

	it('compares the language part case-insensitively', () => {
		expect(matchesSubtitleLanguage('pt-br', 'pt-BR')).toBe(true)
		expect(matchesSubtitleLanguage('DE', 'de-DE')).toBe(true)
	})
})

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
	it('passes exact codes through when regional variants are not requested', () => {
		expect(ytDlpSubtitleLanguages({languages: ['en-orig', 'de-DE']})).toEqual(['en-orig', 'de-DE'])
		expect(ytDlpSubtitleLanguages({languages: ['en'], includeRegionalVariants: false})).toEqual(['en'])
	})

	it('expands every code into a selector when regional variants are requested', () => {
		expect(ytDlpSubtitleLanguages({languages: ['en', 'uk'], includeRegionalVariants: true})).toEqual([ytDlpSubtitleLanguageSelector('en'), ytDlpSubtitleLanguageSelector('uk')])
	})
})
