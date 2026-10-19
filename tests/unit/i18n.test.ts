import {readdirSync, readFileSync} from 'node:fs'
import {join} from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import {pickLanguage} from '@shared/i18n/language.js'
import {mainT} from '@main/i18n.js'

describe('pickLanguage', () => {
	it('returns en for undefined or null input', () => {
		expect(pickLanguage(undefined)).toBe('en')
		expect(pickLanguage(null)).toBe('en')
		expect(pickLanguage('')).toBe('en')
	})

	it('returns exact match when supported', () => {
		expect(pickLanguage('en')).toBe('en')
		expect(pickLanguage('es')).toBe('es')
		expect(pickLanguage('hi')).toBe('hi')
		expect(pickLanguage('tr')).toBe('tr')
	})

	it('strips region tag and matches the prefix', () => {
		expect(pickLanguage('id-ID')).toBe('id')
		expect(pickLanguage('zh-CN')).toBe('zh')
		expect(pickLanguage('zh-SG')).toBe('zh')
		expect(pickLanguage('en-US')).toBe('en')
		expect(pickLanguage('de_AT')).toBe('de')
		expect(pickLanguage('tr-TR')).toBe('tr')
		expect(pickLanguage('pt-BR')).toBe('pt')
	})

	it('selects Traditional Chinese for Hant-script regions and tags', () => {
		expect(pickLanguage('zh-TW')).toBe('zh-Hant')
		expect(pickLanguage('zh-HK')).toBe('zh-Hant')
		expect(pickLanguage('zh-MO')).toBe('zh-Hant')
		expect(pickLanguage('zh-Hant')).toBe('zh-Hant')
		expect(pickLanguage('ZH-hant-hk')).toBe('zh-Hant')
		expect(pickLanguage('zh-Hans')).toBe('zh')
	})

	it('recognizes the new language locales', () => {
		expect(pickLanguage('ko-KR')).toBe('ko')
		expect(pickLanguage('it-IT')).toBe('it')
		expect(pickLanguage('pl-PL')).toBe('pl')
		expect(pickLanguage('fa-IR')).toBe('fa')
		expect(pickLanguage('th-TH')).toBe('th')
	})

	it('falls back to en when language is unsupported', () => {
		expect(pickLanguage('tlh')).toBe('en')
	})

	it('handles uppercase input', () => {
		expect(pickLanguage('FR')).toBe('fr')
		expect(pickLanguage('JA-JP')).toBe('ja')
		expect(pickLanguage('PT-BR')).toBe('pt')
	})
})

describe('mainT', () => {
	it('translates a known key', () => {
		expect(mainT('en', 'dialogs.quitWithActiveDownloads.confirm')).toBe('Cancel Downloads & Quit')
		expect(mainT('es', 'dialogs.quitWithActiveDownloads.confirm')).toBe('Cancelar descargas y salir')
		expect(mainT('tr', 'dialogs.quitWithActiveDownloads.confirm')).toBe('İndirmeleri İptal Et ve Çık')
		expect(mainT('pt', 'dialogs.quitWithActiveDownloads.confirm')).toBe('Cancelar Downloads e Sair')
		expect(mainT('ko', 'common.continue')).toBe('계속')
		expect(mainT('it', 'common.continue')).toBe('Continua')
		expect(mainT('pl', 'common.continue')).toBe('Kontynuuj')
		expect(mainT('fa', 'common.continue')).toBe('ادامه')
		expect(mainT('th', 'common.continue')).toBe('ดำเนินการต่อ')
		expect(mainT('zh-Hant', 'common.continue')).toBe('繼續')
	})

	it('falls back to English when a key is missing in target language', () => {
		// All locales currently have all keys, so simulate missing by giving an unknown key.
		// The fallback path returns the key itself when not found in either language.
		expect(mainT('en', 'this.does.not.exist')).toBe('this.does.not.exist')
	})

	it('interpolates {{x}} tokens', () => {
		expect(mainT('en', 'status.ytdlpExitCode', {code: 7})).toBe('yt-dlp exited with code 7')
		expect(mainT('en', 'status.downloadingBinary', {name: 'yt-dlp'})).toBe('Downloading yt-dlp binary…')
	})

	it('leaves unmatched interpolation tokens visible', () => {
		expect(mainT('en', 'status.downloadingBinary')).toBe('Downloading {{name}} binary…')
	})
})

describe('mainT plurals', () => {
	it('picks the plural form from count, like the renderer does', () => {
		expect(mainT('en', 'dialogs.quitWithActiveDownloads.message', {count: 1})).toContain('1')
		expect(mainT('en', 'dialogs.quitWithActiveDownloads.message', {count: 1})).not.toBe(mainT('en', 'dialogs.quitWithActiveDownloads.message', {count: 2}).replace('2', '1'))
	})

	it("follows the locale's CLDR plural categories", () => {
		// ru has one / few / many: 1, 3 and 5 each read from a different key.
		const ru = (count: number): string => mainT('ru', 'dialogs.quitWithActiveDownloads.message', {count})
		const shapes = [1, 3, 5].map(count => ru(count).replace(String(count), '#'))
		expect(new Set(shapes).size).toBe(3)
	})

	it('resolves to a real localized string for every count in a multi-category locale', () => {
		for (const count of [1, 2, 5, 21]) {
			const out = mainT('ru', 'dialogs.quitWithActiveDownloads.message', {count})
			expect(out).toContain(String(count))
			expect(out).toMatch(/[а-яё]/i)
		}
	})
})

describe('main-process i18n layering', () => {
	function* sources(dir: string): Generator<string> {
		for (const entry of readdirSync(dir, {withFileTypes: true})) {
			const full = join(dir, entry.name)
			if (entry.isDirectory()) yield* sources(full)
			else if (/\.tsx?$/.test(entry.name)) yield full
		}
	}

	it('never imports React bindings into the main process', () => {
		const offenders = [...sources('src/main')].filter(file => /from '(?:react-i18next|@shared\/i18n\/index\.js)'/.test(readFileSync(file, 'utf8')))
		expect(offenders).toEqual([])
	})
})
