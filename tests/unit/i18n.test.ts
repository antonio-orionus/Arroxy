import {readdirSync, readFileSync} from 'node:fs'
import {join} from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import {pickLanguage, pickSystemLanguage} from '@shared/i18n/language.js'
import {mainT} from '@main/i18n.js'
import ru from '@shared/i18n/locales/ru.json' with {type: 'json'}
import {flattenStringLeaves} from '../../scripts/i18n-catalog-core.js'

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

	it('reads Norwegian as Bokmål, whichever code the OS reports', () => {
		expect(pickLanguage('nb-NO')).toBe('nb')
		expect(pickLanguage('no')).toBe('nb')
		expect(pickLanguage('no-NO')).toBe('nb')
		expect(pickLanguage('nn-NO')).toBe('nb')
		expect(pickLanguage('nb_NO.UTF-8')).toBe('nb')
	})

	it('reads the legacy iw code as Hebrew', () => {
		expect(pickLanguage('he-IL')).toBe('he')
		expect(pickLanguage('iw')).toBe('he')
		expect(pickLanguage('iw-IL')).toBe('he')
		expect(pickLanguage('iw_IL.UTF-8')).toBe('he')
	})

	it('reads Valencian as Catalan', () => {
		expect(pickLanguage('ca-ES-valencia')).toBe('ca')
		expect(pickLanguage('ca_ES@valencia')).toBe('ca')
	})

	it('falls back to en when language is unsupported', () => {
		expect(pickLanguage('tlh')).toBe('en')
		expect(pickLanguage('is-IS')).toBe('en')
	})

	it('handles uppercase input', () => {
		expect(pickLanguage('FR')).toBe('fr')
		expect(pickLanguage('JA-JP')).toBe('ja')
		expect(pickLanguage('PT-BR')).toBe('pt')
	})
})

describe('pickSystemLanguage', () => {
	it('takes a language Chromium ships no locale for when the OS prefers it', () => {
		expect(pickSystemLanguage(['km-KH', 'en-US'])).toBe('km')
		expect(pickSystemLanguage(['my-MM'])).toBe('my')
		expect(pickSystemLanguage(['uz-Latn-UZ'])).toBe('uz')
		expect(pickSystemLanguage(['ps-AF'])).toBe('ps')
		expect(pickSystemLanguage(['om-ET'])).toBe('om')
	})

	it('skips unsupported languages and takes the next preferred one', () => {
		expect(pickSystemLanguage(['is-IS', 'de-DE'])).toBe('de')
		expect(pickSystemLanguage(['is-IS', 'ga-IE', 'zh-TW'])).toBe('zh-Hant')
	})

	it('treats English as a real preference, not the fallback', () => {
		expect(pickSystemLanguage(['en-US', 'ru-UA', 'uk-UA'])).toBe('en')
		expect(pickSystemLanguage(['is-IS', 'en-GB', 'de-DE'])).toBe('en')
	})

	it('takes the languages that used to fall back to English', () => {
		expect(pickSystemLanguage(['hu-HU', 'en-US'])).toBe('hu')
		expect(pickSystemLanguage(['nl-NL', 'en-GB'])).toBe('nl')
		expect(pickSystemLanguage(['cs-CZ'])).toBe('cs')
		expect(pickSystemLanguage(['nn-NO', 'en-US'])).toBe('nb')
		expect(pickSystemLanguage(['iw-IL', 'en-US'])).toBe('he')
	})

	it('reads POSIX locale names', () => {
		expect(pickSystemLanguage(['C', 'km_KH.UTF-8'])).toBe('km')
		expect(pickSystemLanguage(['zh_TW.UTF-8'])).toBe('zh-Hant')
		expect(pickSystemLanguage(['sr_RS@latin'])).toBe('sr')
	})

	it('falls back to en when nothing is supported', () => {
		expect(pickSystemLanguage(['is-IS'])).toBe('en')
		expect(pickSystemLanguage([])).toBe('en')
	})
})

describe('mainT', () => {
	it('translates a known key', () => {
		expect(mainT('en', 'dialogs.quitWithActiveDownloads.confirm')).toBe('Cancel Downloads & Quit')
	})

	it('falls back to English when a key is missing in target language', () => {
		// All locales currently have all keys, so simulate missing by giving an unknown key.
		// The fallback path returns the key itself when not found in either language.
		expect(mainT('en', 'this.does.not.exist')).toBe('this.does.not.exist')
	})

	it('interpolates {{x}} tokens', () => {
		expect(mainT('en', 'status.ytdlpExitCode', {code: 7})).toBe('The download engine exited with code 7')
		expect(mainT('en', 'status.downloadingBinary', {name: 'yt-dlp'})).toBe('Downloading yt-dlp binary…')
	})

	it('leaves unmatched interpolation tokens visible', () => {
		expect(mainT('en', 'status.downloadingBinary')).toBe('Downloading {{name}} binary…')
	})
})

// Russian has the one / few / many forms these tests read. Until the release
// translation sync, a new or changed message may not be in it yet.
const ruHasQuitMessage = flattenStringLeaves(ru).some(leaf => leaf.path.startsWith('dialogs.quitWithActiveDownloads.message_'))

describe('mainT plurals', () => {
	it('picks the plural form from count, like the renderer does', () => {
		expect(mainT('en', 'dialogs.quitWithActiveDownloads.message', {count: 1})).toContain('1')
		expect(mainT('en', 'dialogs.quitWithActiveDownloads.message', {count: 1})).not.toBe(mainT('en', 'dialogs.quitWithActiveDownloads.message', {count: 2}).replace('2', '1'))
	})

	it.runIf(ruHasQuitMessage)("follows the locale's CLDR plural categories", () => {
		// ru has one / few / many: 1, 3 and 5 each read from a different key.
		const ru = (count: number): string => mainT('ru', 'dialogs.quitWithActiveDownloads.message', {count})
		const shapes = [1, 3, 5].map(count => ru(count).replace(String(count), '#'))
		expect(new Set(shapes).size).toBe(3)
	})

	it.runIf(ruHasQuitMessage)('resolves to a real localized string for every count in a multi-category locale', () => {
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
