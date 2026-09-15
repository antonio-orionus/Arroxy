// Download profiles store base language codes (`de`), but the tracks a URL
// offers are often regional variants (`de-DE`, `pt-BR`, `es-419`, `zh-Hans`).
// A profile asking for `de` should get those too — but not `de-en`, which is
// German auto-translated from English. Region and script subtags are
// capitalised or numeric, while a translation source is a lowercase language
// code, so letter case is what tells them apart.
const REGIONAL_SUFFIX = /^-(?:[A-Z]{2}|[A-Z][a-z]{3}|\d{3})$/

export function matchesSubtitleLanguage(code: string, trackKey: string): boolean {
	if (trackKey.slice(0, code.length).toLowerCase() !== code.toLowerCase()) return false
	const suffix = trackKey.slice(code.length)
	return suffix === '' || REGIONAL_SUFFIX.test(suffix)
}

function escapePythonRegex(value: string): string {
	return value.replace(/[\\^$.|?*+()[\]{}]/g, '\\$&')
}

// yt-dlp fullmatches each `--sub-langs` entry case-insensitively (`re.I`), so
// the region part re-enables case sensitivity with a scoped `(?-i:…)` group.
// Mirrors `matchesSubtitleLanguage`.
export function ytDlpSubtitleLanguageSelector(code: string): string {
	const escapedCode = escapePythonRegex(code)
	return /^[a-z]{2,3}$/i.test(code) ? `${escapedCode}(?:-(?-i:[A-Z]{2}|[A-Z][a-z]{3})|-\\d{3})?` : escapedCode
}

export function ytDlpSubtitleLanguages(subtitles: {languages: readonly string[]; includeRegionalVariants?: boolean}): string[] {
	return subtitles.includeRegionalVariants ? subtitles.languages.map(ytDlpSubtitleLanguageSelector) : [...subtitles.languages]
}
