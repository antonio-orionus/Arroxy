// `--sub-langs` entries. yt-dlp fullmatches each one case-insensitively
// (`re.I`), so exact keys and region subtags re-enable case sensitivity with a
// scoped `(?-i:…)` group.

function escapePythonRegex(value: string): string {
	return value.replace(/[\\^$.|?*+()[\]{}]/g, '\\$&')
}

// A planned track's key, matched exactly.
export function ytDlpSubtitleKey(key: string): string {
	return `(?-i:${escapePythonRegex(key)})`
}

// A language code with no list of the video's tracks to plan from: a pattern
// that mirrors `matchesSubtitleLanguage`, which on YouTube also catches
// machine translations.
export function ytDlpSubtitleLanguageSelector(code: string): string {
	const escapedCode = escapePythonRegex(code)
	return /^[a-z]{2,3}$/i.test(code) ? `${escapedCode}(?:-(?-i:[A-Z]{2}|[A-Z][a-z]{3})|-\\d{3})?` : escapedCode
}
