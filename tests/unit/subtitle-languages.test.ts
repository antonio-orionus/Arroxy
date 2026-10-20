import {describe, expect, it} from 'vite-plus/test'
import {matchesSubtitleLanguage, pickSubtitleTracks, withSubtitleTracks, ytDlpSubtitleLanguages, ytDlpSubtitleLanguageSelector} from '@shared/subtitleLanguages.js'

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

describe('pickSubtitleTracks', () => {
	// A Japanese video as the Format screen sees it: YouTube's auto captions cut to `-orig`.
	const maps = {subtitles: {'en-US': [{ext: 'vtt'}]}, automaticCaptions: {'ja-orig': [{ext: 'vtt'}]}}

	it('picks manual tracks and real automatic captions, reporting codes the video lacks', () => {
		expect(pickSubtitleTracks(['ja', 'en', 'de'], 'manual-first', maps)).toEqual({tracks: ['ja-orig', 'en-US'], missing: ['de']})
	})

	it('honours the source', () => {
		expect(pickSubtitleTracks(['ja', 'en'], 'manual-only', maps)).toEqual({tracks: ['en-US'], missing: ['ja']})
		expect(pickSubtitleTracks(['ja', 'en'], 'auto-only', maps)).toEqual({tracks: ['ja-orig'], missing: ['en']})
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

	it('leaves track keys alone', () => {
		expect(withSubtitleTracks(options, maps)).toBe(options)
	})
})
