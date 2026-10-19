import {createInstance} from 'i18next'
import {I18NEXT_OPTIONS} from '@shared/i18n/resources.js'
import type {SupportedLang} from '@shared/i18n/types.js'

// Own instance, never the renderer's global one: main translates per call for
// whichever language the window currently shows. Resources are inline, so a
// synchronous init leaves it ready before the first lookup.
const i18n = createInstance()
void i18n.init({...I18NEXT_OPTIONS, lng: 'en', initAsync: false})
// Main's callers build keys at runtime (menu templates, outcome tables), which
// the typed resource keys can't express. Widening is safe: i18next answers an
// unknown key with the key itself, never a throw.
const translate = i18n.t as (key: string, options: Record<string, unknown>) => string

// Same lookup the renderer does: missing keys fall back to English, then to the
// key itself, and a `count` param picks the locale's own plural form.
export function mainT(lang: SupportedLang, dottedKey: string, params?: Record<string, string | number>): string {
	return translate(dottedKey, {...params, lng: lang})
}
