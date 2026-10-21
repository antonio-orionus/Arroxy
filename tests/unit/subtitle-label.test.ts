import {describe, expect, it} from 'vite-plus/test'
import {buildSubtitleList, formatLanguageList, languageName} from '@renderer/lib/subtitleLabel.js'
import {resolveSubtitleLabel} from '@shared/subtitleTrackLabel.js'

// yt-dlp asks YouTube for English track names, whatever the UI language.
const MANUAL = {en: [{ext: 'vtt', name: 'English'}], ar: [{ext: 'vtt', name: 'Arabic'}]}
const AUTO = {'en-orig': [{ext: 'vtt', name: 'English (Original)'}]}

describe('buildSubtitleList', () => {
	it('names uploaded tracks and auto captions alike in the UI language, capitalized', () => {
		expect(buildSubtitleList(MANUAL, AUTO, 'ru')).toEqual([
			{code: 'en', displayName: 'Английский', isAuto: false},
			{code: 'ar', displayName: 'Арабский', isAuto: false},
			{code: 'en-orig', displayName: 'Английский', isAuto: true}
		])
	})

	it('keeps English names in an English UI', () => {
		expect(buildSubtitleList(MANUAL, AUTO, 'en').map(item => item.displayName)).toEqual(['English', 'Arabic', 'English'])
	})
})

describe('resolveSubtitleLabel', () => {
	it('reads every underscore in a key as a subtag separator', () => {
		expect(resolveSubtitleLabel('zh_Hans_CN', {zh_Hans_CN: [{ext: 'vtt', name: 'Chinese'}]}, {}, 'en')).toBe('Chinese (Simplified, China)')
	})

	it('falls back to the yt-dlp name for a key Intl cannot parse', () => {
		expect(resolveSubtitleLabel('nb-ttv', {'nb-ttv': [{ext: 'vtt', name: 'Norsk - tekstet'}]}, {}, 'ru')).toBe('Norsk - tekstet')
	})

	it('falls back to the yt-dlp name for a code Intl has no name for', () => {
		expect(resolveSubtitleLabel('qaa', {qaa: [{ext: 'vtt', name: 'Custom track'}]}, {}, 'ru')).toBe('Custom track')
	})

	it('falls back to the raw code when there is no name either', () => {
		expect(resolveSubtitleLabel('nb-ttv', {}, {}, 'ru')).toBe('nb-ttv')
	})

	it('never shows yt-dlp\'s "(Original)" name for an -orig caption Intl cannot name', () => {
		expect(resolveSubtitleLabel('qaa-orig', {}, {'qaa-orig': [{ext: 'vtt', name: 'Custom (Original)'}]}, 'ru')).toBe('qaa')
	})

	it('names a requested code with no probe data in the UI language', () => {
		expect(resolveSubtitleLabel('de', {}, {}, 'ru')).toBe('Немецкий')
	})
})

describe('names for running text', () => {
	it('stay lowercase, since they fill sentences', () => {
		expect(languageName('de', 'ru')).toBe('немецкий')
		expect(formatLanguageList(['de'], 'ru', 'disjunction')).toBe('немецкий')
	})

	it('name an -orig caption code by its language', () => {
		expect(languageName('en-orig', 'ru')).toBe('английский')
		expect(formatLanguageList(['en-orig'], 'en', 'disjunction')).toBe('English')
	})

	it('fall back to the code Intl cannot name', () => {
		expect(languageName('nb-ttv', 'ru')).toBe('nb-ttv')
	})

	// "Your profile asks for subtitles in German and French".
	it.each([
		['en', 'German, French, and Spanish'],
		['ru', 'немецкий, французский и испанский'],
		['ja', 'ドイツ語、フランス語、スペイン語'],
		['zh-CN', '德语、法语和西班牙语']
	])('join names with the %s conjunction', (uiLanguage, expected) => {
		expect(formatLanguageList(['de', 'fr', 'es'], uiLanguage, 'conjunction')).toBe(expected)
	})

	// "No subtitles in German or French".
	it.each([
		['en', 'German, French, or Spanish'],
		['ru', 'немецкий, французский или испанский'],
		['ja', 'ドイツ語、フランス語、またはスペイン語'],
		['zh-CN', '德语、法语或西班牙语']
	])('join names with the %s disjunction', (uiLanguage, expected) => {
		expect(formatLanguageList(['de', 'fr', 'es'], uiLanguage, 'disjunction')).toBe(expected)
	})
})
