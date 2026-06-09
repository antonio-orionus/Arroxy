import {describe, expect, it} from 'vitest'
import en from '@shared/i18n/locales/en.json' with {type: 'json'}
import es from '@shared/i18n/locales/es.json' with {type: 'json'}
import fr from '@shared/i18n/locales/fr.json' with {type: 'json'}
import de from '@shared/i18n/locales/de.json' with {type: 'json'}
import ru from '@shared/i18n/locales/ru.json' with {type: 'json'}
import uk from '@shared/i18n/locales/uk.json' with {type: 'json'}
import ja from '@shared/i18n/locales/ja.json' with {type: 'json'}
import zh from '@shared/i18n/locales/zh.json' with {type: 'json'}
import hi from '@shared/i18n/locales/hi.json' with {type: 'json'}
import {STATUS_KEY} from '@shared/schemas.js'
import {YT_DLP_ERROR_KINDS} from 'ytdlp-errors'
import type {LocaleResource} from '@shared/i18n/types.js'

const LOCALES: Record<string, LocaleResource> = {en, es, fr, de, ru, uk, ja, zh, hi}

describe('i18n contract', () => {
	it('every locale has a string for every YtDlpErrorKind', () => {
		for (const [name, resource] of Object.entries(LOCALES)) {
			const ytdlp = (resource as LocaleResource & {errors?: {ytdlp?: Record<string, string>}}).errors?.ytdlp ?? {}
			for (const kind of YT_DLP_ERROR_KINDS) {
				const value = ytdlp[kind]
				expect(value, `${name} locale missing errors.ytdlp.${kind}`).toBeDefined()
				expect(typeof value, `${name}.errors.ytdlp.${kind} not string`).toBe('string')
				expect((value ?? '').length, `${name}.errors.ytdlp.${kind} is empty`).toBeGreaterThan(0)
			}
		}
	})

	it('every locale has a string for every StatusKey', () => {
		for (const [name, resource] of Object.entries(LOCALES)) {
			const status = (resource as LocaleResource & {status: Record<string, string>}).status
			for (const key of Object.values(STATUS_KEY)) {
				expect(status[key], `${name} locale missing status.${key}`).toBeDefined()
			}
		}
	})

	it('non-en saveMode strings are translated (not English copies)', () => {
		const enSaveMode = (en as LocaleResource & {wizard: {subtitles: {saveMode: {heading: string; sidecar: string; embed: string; subfolder: string}}}}).wizard.subtitles.saveMode

		for (const [name, resource] of Object.entries(LOCALES)) {
			if (name === 'en') continue
			const sm = (resource as LocaleResource & {wizard: {subtitles: {saveMode: {heading: string; sidecar: string; embed: string; subfolder: string}}}}).wizard.subtitles.saveMode
			// Heading and sidecar must differ from English. Embed/subfolder may
			// legitimately keep an English keyword in non-Latin scripts (e.g. zh
			// keeps "subtitles/" as the literal folder path), so we don't enforce
			// those — but heading and sidecar are pure UI strings.
			expect(sm.heading, `${name}.wizard.subtitles.saveMode.heading not translated`).not.toBe(enSaveMode.heading)
			expect(sm.sidecar, `${name}.wizard.subtitles.saveMode.sidecar not translated`).not.toBe(enSaveMode.sidecar)
		}
	})
})
