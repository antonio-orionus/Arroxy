// The i18next setup both processes share: the same catalogs, fallback and
// interpolation rules. React-free so the main process can load it without
// pulling in react-i18next.
import om from './locales/om.json' with {type: 'json'}
import id from './locales/id.json' with {type: 'json'}
import de from './locales/de.json' with {type: 'json'}
import en from './locales/en.json' with {type: 'json'}
import es from './locales/es.json' with {type: 'json'}
import fr from './locales/fr.json' with {type: 'json'}
import it from './locales/it.json' with {type: 'json'}
import ko from './locales/ko.json' with {type: 'json'}
import fa from './locales/fa.json' with {type: 'json'}
import pl from './locales/pl.json' with {type: 'json'}
import th from './locales/th.json' with {type: 'json'}
import sw from './locales/sw.json' with {type: 'json'}
import uz from './locales/uz.json' with {type: 'json'}
import am from './locales/am.json' with {type: 'json'}
import ar from './locales/ar.json' with {type: 'json'}
import ur from './locales/ur.json' with {type: 'json'}
import ps from './locales/ps.json' with {type: 'json'}
import bn from './locales/bn.json' with {type: 'json'}
import hi from './locales/hi.json' with {type: 'json'}
import my from './locales/my.json' with {type: 'json'}
import km from './locales/km.json' with {type: 'json'}
import el from './locales/el.json' with {type: 'json'}
import ru from './locales/ru.json' with {type: 'json'}
import sr from './locales/sr.json' with {type: 'json'}
import uk from './locales/uk.json' with {type: 'json'}
import zh from './locales/zh.json' with {type: 'json'}
import zhHant from './locales/zh-Hant.json' with {type: 'json'}
import ja from './locales/ja.json' with {type: 'json'}
import vi from './locales/vi.json' with {type: 'json'}
import tr from './locales/tr.json' with {type: 'json'}
import pt from './locales/pt.json' with {type: 'json'}
import type {InitOptions} from 'i18next'
import {SUPPORTED_LANGS, type LocaleResource, type SupportedLang} from './types.js'

const RESOURCES: Record<SupportedLang, LocaleResource> = {om, id, de, en, es, fr, it, sw, uz, pl, pt, vi, tr, am, ar, ur, ps, fa, bn, hi, th, my, km, el, ru, sr, uk, zh, ja, ko, 'zh-Hant': zhHant}

export const I18NEXT_OPTIONS = {fallbackLng: 'en', supportedLngs: SUPPORTED_LANGS, defaultNS: 'translation', ns: ['translation'], resources: Object.fromEntries(Object.entries(RESOURCES).map(([lang, translation]) => [lang, {translation}])), interpolation: {escapeValue: false}, returnNull: false} satisfies InitOptions
