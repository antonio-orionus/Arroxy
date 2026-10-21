import {languageLabel} from './languageName.js'

// Language codes YouTube offers for uploaded subtitles and auto-translated
// captions, as reported by `yt-dlp --list-subs`. YouTube keeps legacy codes
// (`iw` for Hebrew) and script subtags for Chinese, so this is not plain ISO 639-1.
const YOUTUBE_SUBTITLE_LANGUAGE_CODES: readonly string[] =
	'aa ab af ak am ar as ay az ba be bg bho bn bo br bs ca ceb co crs cs cy da de de-DE dv dz ee el en eo es es-419 et eu fa fi fil fj fo fr fy ga gaa gd gl gn gu gv ha haw hi hmn hr ht hu hy id ig is it iu iw ja jv ka kha kk kl km kn ko kri ku ky la lb lg ln lo lt lua luo lv mfe mg mi mk ml mn mr ms mt my ne new nl no nso ny oc om or os pa pam pl ps pt pt-BR pt-PT qu rn ro ru rw sa sd sg si sk sl sm sn so sq sr ss st su sv sw ta te tg th ti tk tn to tr ts tt tum ug uk ur uz ve vi war wo xh yi yo zh-Hans zh-Hant zu'.split(
		' '
	)

// Codes people type that YouTube spells differently, including country codes
// commonly mistaken for language codes.
const SEARCH_ALIASES: Readonly<Record<string, readonly string[]>> = {iw: ['he'], uk: ['ua'], ja: ['jp'], ko: ['kr'], cs: ['cz'], da: ['dk'], el: ['gr'], 'zh-Hans': ['zh', 'cn'], 'zh-Hant': ['zh', 'tw'], fil: ['tl'], no: ['nb'], yi: ['ji']}

// An app language as the code YouTube serves its subtitles under: its own when
// the catalog lists it, else the catalog code it is an alias of (he → iw).
export function subtitleCodeForLanguage(language: string): string {
	if (YOUTUBE_SUBTITLE_LANGUAGE_CODES.includes(language)) return language
	return Object.entries(SEARCH_ALIASES).find(([, aliases]) => aliases.includes(language))?.[0] ?? language
}

const LANGUAGE_CODE_SHAPE = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i

export interface SubtitleLanguageOption {
	code: string
	label: string
	englishName: string
	nativeName: string
}

export function buildSubtitleLanguageOptions(uiLanguage: string): SubtitleLanguageOption[] {
	const options = YOUTUBE_SUBTITLE_LANGUAGE_CODES.map(code => ({code, label: languageLabel(code, uiLanguage) ?? code, englishName: languageLabel(code, 'en') ?? code, nativeName: languageLabel(code, code) ?? code}))
	const collator = new Intl.Collator(uiLanguage)
	return options.sort((a, b) => collator.compare(a.label, b.label))
}

function searchable(value: string): string {
	return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()
}

// Lower is better. Exact codes and aliases beat names so `uk` means Ukrainian,
// not a name that happens to start with "uk".
function matchRank(option: SubtitleLanguageOption, query: string): number | null {
	const codes = [option.code, ...(SEARCH_ALIASES[option.code] ?? [])].map(searchable)
	const names = [option.label, option.englishName, option.nativeName].map(searchable)
	if (codes.includes(query)) return 0
	if (names.includes(query)) return 1
	if (names.some(name => name.startsWith(query))) return 2
	if (codes.some(code => code.startsWith(query))) return 3
	if (names.some(name => name.split(/[\s()-]+/).some(word => word.startsWith(query)))) return 4
	if (names.some(name => name.includes(query))) return 5
	return null
}

export function searchSubtitleLanguages(options: readonly SubtitleLanguageOption[], rawQuery: string): SubtitleLanguageOption[] {
	const query = searchable(rawQuery)
	if (!query) return [...options]
	return options
		.flatMap(option => {
			const rank = matchRank(option, query)
			return rank === null ? [] : [{option, rank}]
		})
		.sort((a, b) => a.rank - b.rank)
		.map(({option}) => option)
}

// The codes the picker lists: ranked catalog matches, then the typed value as
// a raw code when it is well-formed and not already a catalog code or alias —
// so `he` offers Hebrew (`iw`) rather than a `he` that YouTube never serves.
export function subtitleLanguageChoices(options: readonly SubtitleLanguageOption[], rawQuery: string): string[] {
	const query = searchable(rawQuery)
	const matches = searchSubtitleLanguages(options, rawQuery)
	const codes = matches.map(option => option.code)
	if (!query) return codes
	const customCode = normalizeSubtitleLanguageCode(rawQuery)
	return customCode && !codes.includes(customCode) ? [...codes, customCode] : codes
}

// Known codes take the catalog's casing; other well-formed codes (for sites
// other than YouTube) are canonicalized, e.g. `en-au` → `en-AU`.
export function normalizeSubtitleLanguageCode(input: string): string | null {
	const value = input.trim()
	if (!LANGUAGE_CODE_SHAPE.test(value)) return null
	const known = YOUTUBE_SUBTITLE_LANGUAGE_CODES.find(code => code.toLowerCase() === value.toLowerCase())
	if (known) return known
	try {
		return Intl.getCanonicalLocales(value)[0] ?? null
	} catch {
		// yt-dlp extractors may expose safe track keys that are not BCP 47 tags,
		// such as NRK's `nb-nor` and `nb-ttv`. Preserve the input shape the old
		// profile editor accepted so users can request those tracks exactly.
		return value.toLowerCase()
	}
}
