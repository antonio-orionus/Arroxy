import {describe, expect, it} from 'vite-plus/test'
import {matchesSubtitleLanguage, pickSubtitleTracks, subtitleRequestKeys, subtitleSourceOptions, withSubtitleTracks, ytDlpSubtitleLanguages, ytDlpSubtitleLanguageSelector} from '@shared/subtitleLanguages.js'

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

	it('picks the automatic caption next to the manual track for manual-and-auto', () => {
		const both = {subtitles: {en: [{ext: 'vtt'}]}, automaticCaptions: {'en-orig': [{ext: 'vtt'}]}}
		expect(pickSubtitleTracks(['en'], 'manual-first', both)).toEqual({tracks: ['en'], missing: []})
		expect(pickSubtitleTracks(['en', 'ja'], 'manual-and-auto', both)).toEqual({tracks: ['en', 'en-orig'], missing: ['ja']})
	})
})

describe('subtitleSourceOptions', () => {
	it('asks for manual and automatic tracks side by side for manual-and-auto', () => {
		expect(subtitleSourceOptions('manual-and-auto')).toEqual({writeAuto: true, autoAlongsideManual: true})
		expect(subtitleSourceOptions('manual-first')).toEqual({writeAuto: true})
	})
})

// yt-dlp lists YouTube's original-language caption under its bare key too (`en`,
// same URL), and that key names the file `….en.srt` and the embedded track `eng`.
describe('subtitleRequestKeys', () => {
	const manualEn = {en: [{ext: 'vtt'}]}

	it('asks for an original-language caption by its bare key', () => {
		expect(subtitleRequestKeys(['ja-orig', 'en'], {subtitles: manualEn, autoOnly: false})).toEqual(['ja', 'en'])
	})

	// yt-dlp fills a key with the manual track first, so the bare key would bring the manual one back.
	it('keeps the -orig key when the job fetches a manual track under the bare key', () => {
		expect(subtitleRequestKeys(['en', 'en-orig'], {subtitles: manualEn, autoOnly: false})).toEqual(['en', 'en-orig'])
		expect(subtitleRequestKeys(['en-orig'], {subtitles: manualEn, autoOnly: false})).toEqual(['en-orig'])
	})

	it('uses the bare key when the job never fetches manual tracks', () => {
		expect(subtitleRequestKeys(['en-orig'], {subtitles: manualEn, autoOnly: true})).toEqual(['en'])
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
