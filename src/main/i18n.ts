import en from '@shared/i18n/locales/en.js'
import es from '@shared/i18n/locales/es.js'
import fr from '@shared/i18n/locales/fr.js'
import de from '@shared/i18n/locales/de.js'
import ru from '@shared/i18n/locales/ru.js'
import uk from '@shared/i18n/locales/uk.js'
import ja from '@shared/i18n/locales/ja.js'
import zh from '@shared/i18n/locales/zh.js'
import hi from '@shared/i18n/locales/hi.js'
import bn from '@shared/i18n/locales/bn.js'
import ar from '@shared/i18n/locales/ar.js'
import uz from '@shared/i18n/locales/uz.js'
import my from '@shared/i18n/locales/my.js'
import ps from '@shared/i18n/locales/ps.js'
import sw from '@shared/i18n/locales/sw.js'
import am from '@shared/i18n/locales/am.js'
import om from '@shared/i18n/locales/om.js'
import el from '@shared/i18n/locales/el.js'
import sr from '@shared/i18n/locales/sr.js'
import ur from '@shared/i18n/locales/ur.js'
import vi from '@shared/i18n/locales/vi.js'
import type {SupportedLang} from '@shared/i18n/types.js'

const RESOURCES: Record<SupportedLang, unknown> = {en, es, fr, de, ru, uk, ja, zh, hi, bn, ar, uz, my, ps, sw, am, om, el, sr, ur, vi}

function lookup(tree: unknown, dottedKey: string): string | undefined {
	const parts = dottedKey.split('.')
	let cursor: unknown = tree
	for (const part of parts) {
		if (cursor && typeof cursor === 'object' && part in (cursor as Record<string, unknown>)) {
			cursor = (cursor as Record<string, unknown>)[part]
		} else {
			return undefined
		}
	}
	return typeof cursor === 'string' ? cursor : undefined
}

function interpolate(template: string, params?: Record<string, string | number>): string {
	if (!params) return template
	return template.replace(/\{\{\s*([^}\s]+)\s*\}\}/g, (_, name: string) => {
		const v = params[name]
		return v === undefined ? `{{${name}}}` : String(v)
	})
}

export function mainT(lang: SupportedLang, dottedKey: string, params?: Record<string, string | number>): string {
	const fromLang = lookup(RESOURCES[lang], dottedKey)
	if (fromLang) return interpolate(fromLang, params)
	const fromEn = lookup(RESOURCES.en, dottedKey)
	if (fromEn) return interpolate(fromEn, params)
	return dottedKey
}

export function pluralKey(base: string, count: number): string {
	return count === 1 ? `${base}_one` : `${base}_other`
}
