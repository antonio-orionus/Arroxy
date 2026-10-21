// Language codes named in the UI language. Sites name tracks in their own
// language (yt-dlp asks YouTube in English), so the UI names them itself.

const displayNamesByLanguage = new Map<string, Intl.DisplayNames>()

function displayNamesFor(uiLanguage: string): Intl.DisplayNames {
	const cached = displayNamesByLanguage.get(uiLanguage)
	if (cached) return cached
	// react-doctor-disable-next-line react-doctor/js-hoist-intl -- cached per UI language; locale is runtime data
	const next = new Intl.DisplayNames([uiLanguage, 'en'], {type: 'language', fallback: 'none'})
	displayNamesByLanguage.set(uiLanguage, next)
	return next
}

const graphemesByLanguage = new Map<string, Intl.Segmenter>()

// A label starts a list row, chip or summary, so it starts with a capital even
// where CLDR writes language names in lowercase (Russian "английский").
function capitalizeFirst(text: string, uiLanguage: string): string {
	let graphemes = graphemesByLanguage.get(uiLanguage)
	if (!graphemes) {
		// react-doctor-disable-next-line react-doctor/js-hoist-intl -- cached per UI language; locale is runtime data
		graphemes = new Intl.Segmenter(uiLanguage, {granularity: 'grapheme'})
		graphemesByLanguage.set(uiLanguage, graphemes)
	}
	const first = graphemes.segment(text)[Symbol.iterator]().next().value?.segment ?? ''
	return first.toLocaleUpperCase(uiLanguage) + text.slice(first.length)
}

// The name in CLDR's own casing, for running text; undefined when Intl has none.
export function intlLanguageName(code: string, uiLanguage: string): string | undefined {
	try {
		return displayNamesFor(uiLanguage).of(code.replaceAll('_', '-'))
	} catch {
		// Other sites' keys need not be BCP 47 tags (NRK's `nb-ttv`).
		return undefined
	}
}

// The name as a label, capitalized; undefined when Intl has none.
export function languageLabel(code: string, uiLanguage: string): string | undefined {
	const name = intlLanguageName(code, uiLanguage)
	return name ? capitalizeFirst(name, uiLanguage) : undefined
}
