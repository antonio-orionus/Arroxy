import en from '@shared/i18n/locales/en.json' with {type: 'json'}
import es from '@shared/i18n/locales/es.json' with {type: 'json'}
import fr from '@shared/i18n/locales/fr.json' with {type: 'json'}
import de from '@shared/i18n/locales/de.json' with {type: 'json'}
import ru from '@shared/i18n/locales/ru.json' with {type: 'json'}
import uk from '@shared/i18n/locales/uk.json' with {type: 'json'}
import ja from '@shared/i18n/locales/ja.json' with {type: 'json'}
import zh from '@shared/i18n/locales/zh.json' with {type: 'json'}
import hi from '@shared/i18n/locales/hi.json' with {type: 'json'}
import bn from '@shared/i18n/locales/bn.json' with {type: 'json'}
import ar from '@shared/i18n/locales/ar.json' with {type: 'json'}
import uz from '@shared/i18n/locales/uz.json' with {type: 'json'}
import my from '@shared/i18n/locales/my.json' with {type: 'json'}
import ps from '@shared/i18n/locales/ps.json' with {type: 'json'}
import sw from '@shared/i18n/locales/sw.json' with {type: 'json'}
import am from '@shared/i18n/locales/am.json' with {type: 'json'}
import om from '@shared/i18n/locales/om.json' with {type: 'json'}
import el from '@shared/i18n/locales/el.json' with {type: 'json'}
import sr from '@shared/i18n/locales/sr.json' with {type: 'json'}
import ur from '@shared/i18n/locales/ur.json' with {type: 'json'}
import vi from '@shared/i18n/locales/vi.json' with {type: 'json'}
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
