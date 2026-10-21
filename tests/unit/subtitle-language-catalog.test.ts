import {describe, expect, it} from 'vite-plus/test'
import {buildSubtitleLanguageOptions, normalizeSubtitleLanguageCode, searchSubtitleLanguages, subtitleCodeForLanguage, subtitleLanguageChoices} from '@renderer/lib/subtitleLanguageCatalog.js'

const EN_OPTIONS = buildSubtitleLanguageOptions('en')

function topCodes(query: string, count = 1): string[] {
	return searchSubtitleLanguages(EN_OPTIONS, query)
		.slice(0, count)
		.map(option => option.code)
}

describe('buildSubtitleLanguageOptions', () => {
	it('labels YouTube codes in the UI language and keeps the native name', () => {
		const ru = buildSubtitleLanguageOptions('uk').find(option => option.code === 'ru')
		expect(ru).toMatchObject({code: 'ru', label: 'Російська', nativeName: 'Русский', englishName: 'Russian'})
	})

	it('capitalizes names CLDR writes in lowercase, in the UI language and natively', () => {
		const options = buildSubtitleLanguageOptions('ru')
		expect(options.find(option => option.code === 'en')).toMatchObject({label: 'Английский', nativeName: 'English'})
		expect(options.find(option => option.code === 'ru')).toMatchObject({label: 'Русский', nativeName: 'Русский'})
		expect(EN_OPTIONS.find(option => option.code === 'uk')).toMatchObject({label: 'Ukrainian', nativeName: 'Українська'})
	})

	it('still finds a language by its lowercase name', () => {
		const options = buildSubtitleLanguageOptions('ru')
		expect(searchSubtitleLanguages(options, 'английский')[0]?.code).toBe('en')
		expect(searchSubtitleLanguages(options, 'украинский')[0]?.code).toBe('uk')
	})

	it('uses YouTube codes, including legacy Hebrew and script-tagged Chinese', () => {
		const codes = EN_OPTIONS.map(option => option.code)
		expect(codes).toEqual(expect.arrayContaining(['iw', 'zh-Hans', 'zh-Hant', 'es-419', 'pt-BR', 'fil']))
		expect(codes).not.toContain('he')
	})
})

describe('searchSubtitleLanguages', () => {
	it.each([
		['ru', 'ru'],
		['russian', 'ru'],
		['Russ', 'ru'],
		['русский', 'ru'],
		['uk', 'uk'],
		['ukrainian', 'uk'],
		['english', 'en'],
		['en', 'en'],
		['he', 'iw'],
		['hebrew', 'iw'],
		['ua', 'uk'],
		['jp', 'ja'],
		['espanol', 'es']
	])('ranks %s → %s first', (query, code) => {
		expect(topCodes(query)).toEqual([code])
	})

	it('surfaces both Chinese scripts for zh', () => {
		expect(topCodes('zh', 2).sort()).toEqual(['zh-Hans', 'zh-Hant'])
	})

	it('returns every option for an empty query', () => {
		expect(searchSubtitleLanguages(EN_OPTIONS, '  ')).toHaveLength(EN_OPTIONS.length)
	})
})

describe('subtitleLanguageChoices', () => {
	it('offers both a YouTube alias and the exact code for other extractors', () => {
		const choices = subtitleLanguageChoices(EN_OPTIONS, 'he')
		expect(choices[0]).toBe('iw')
		expect(choices).toContain('he')
	})

	it('offers safe extractor-specific codes that are not valid BCP 47 tags', () => {
		expect(subtitleLanguageChoices(EN_OPTIONS, 'nb-nor')).toContain('nb-nor')
		expect(subtitleLanguageChoices(EN_OPTIONS, 'nb-ttv')).toContain('nb-ttv')
	})

	it('offers a well-formed unknown code after the catalog matches', () => {
		const choices = subtitleLanguageChoices(EN_OPTIONS, 'en-au')
		expect(choices.at(-1)).toBe('en-AU')
		expect(choices.slice(0, -1)).not.toContain('en-AU')
	})

	it('does not duplicate a known code typed in another case', () => {
		expect(subtitleLanguageChoices(EN_OPTIONS, 'ZH-hans').filter(code => code === 'zh-Hans')).toHaveLength(1)
	})
})

describe('normalizeSubtitleLanguageCode', () => {
	it('returns catalog casing for known codes', () => {
		expect(normalizeSubtitleLanguageCode('ZH-hans')).toBe('zh-Hans')
		expect(normalizeSubtitleLanguageCode('iw')).toBe('iw')
	})

	it('canonicalizes unknown but well-formed codes for other sites', () => {
		expect(normalizeSubtitleLanguageCode('en-au')).toBe('en-AU')
	})

	it('preserves safe extractor-specific codes when BCP 47 canonicalization fails', () => {
		expect(normalizeSubtitleLanguageCode('nb-nor')).toBe('nb-nor')
		expect(normalizeSubtitleLanguageCode('NB-TTV')).toBe('nb-ttv')
	})

	it('rejects values that are not language codes', () => {
		expect(normalizeSubtitleLanguageCode('russian')).toBeNull()
		expect(normalizeSubtitleLanguageCode('bad_value')).toBeNull()
		expect(normalizeSubtitleLanguageCode('')).toBeNull()
	})
})

describe('subtitleCodeForLanguage', () => {
	// An app language as the code YouTube serves its subtitles under.
	it('maps app languages to the subtitle codes YouTube uses', () => {
		expect(subtitleCodeForLanguage('he')).toBe('iw')
		expect(subtitleCodeForLanguage('nb')).toBe('no')
		expect(subtitleCodeForLanguage('zh')).toBe('zh-Hans')
		expect(subtitleCodeForLanguage('zh-Hant')).toBe('zh-Hant')
		expect(subtitleCodeForLanguage('de')).toBe('de')
		expect(subtitleCodeForLanguage('pt')).toBe('pt')
	})
})
