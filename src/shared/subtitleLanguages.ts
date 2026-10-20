import type {SubtitleOptions} from './preparedJob.js'
import type {DownloadProfileSubtitleSource} from './schemas.js'
import type {SubtitleMap} from './types.js'

// Which caption tracks a subtitle source asks yt-dlp for. One rule shared by
// download profiles and subtitles-only batches so both request the same tracks.
// `auto-only` must skip manual tracks, which yt-dlp otherwise prefers.
export function subtitleSourceOptions(source: DownloadProfileSubtitleSource): {writeAuto: boolean; autoOnly?: true} {
	if (source === 'manual-only') return {writeAuto: false}
	return source === 'auto-only' ? {writeAuto: true, autoOnly: true} : {writeAuto: true}
}

function subtitleSourceOf(subtitles: Pick<SubtitleOptions, 'writeAuto' | 'autoOnly'>): DownloadProfileSubtitleSource {
	if (!subtitles.writeAuto) return 'manual-only'
	return subtitles.autoOnly ? 'auto-only' : 'manual-first'
}

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

// YouTube's real automatic captions carry this suffix once the subtitle map is
// sanitized (see `sanitizeSubtitleMap`); the language is the part before it.
const AUTO_CAPTION_SUFFIX = '-orig'

function baseLanguage(trackKey: string): string {
	return trackKey.endsWith(AUTO_CAPTION_SUFFIX) ? trackKey.slice(0, -AUTO_CAPTION_SUFFIX.length) : trackKey
}

function matchingKeys(code: string, map: SubtitleMap): string[] {
	return Object.keys(map).filter(key => matchesSubtitleLanguage(code, baseLanguage(key)))
}

// The track keys a video offers for some language codes: the one rule both the
// Format screen and a queued profile download use. Takes sanitized maps, so
// YouTube's machine translations are never candidates. Manual tracks win per
// track, not per language: an auto-generated regional variant the manual
// tracks lack is still picked, as yt-dlp does.
export function pickSubtitleTracks(languages: readonly string[], source: DownloadProfileSubtitleSource, maps: {subtitles: SubtitleMap; automaticCaptions: SubtitleMap}): {tracks: string[]; missing: string[]} {
	const tracks: string[] = []
	const missing: string[] = []
	for (const code of languages) {
		const manual = source === 'auto-only' ? [] : matchingKeys(code, maps.subtitles)
		const manualBases = new Set(manual.map(baseLanguage))
		const auto = source === 'manual-only' ? [] : matchingKeys(code, maps.automaticCaptions).filter(key => !manualBases.has(baseLanguage(key)))
		const keys = [...manual, ...auto]
		if (keys.length === 0) missing.push(code)
		for (const key of keys) if (!tracks.includes(key)) tracks.push(key)
	}
	return {tracks, missing}
}

// A job's subtitle options with its language codes turned into this video's
// exact track keys. Options that already name tracks pass through.
//
// An original-language caption (`ja-orig`) is asked for by its bare twin
// (`ja`): yt-dlp lists it under both keys with the same URL, and the bare one
// names the file `….ja.srt` and the embedded track `ja`. No manual track can
// take that key instead: one in the same language would have been picked over
// the caption, and an auto-only job never fetches manual tracks.
export function withSubtitleTracks(subtitles: SubtitleOptions, maps: {subtitles: SubtitleMap; automaticCaptions: SubtitleMap}): SubtitleOptions {
	if (!subtitles.languagesAreCodes) return subtitles
	const {languagesAreCodes: _codes, ...rest} = subtitles
	return {...rest, languages: pickSubtitleTracks(subtitles.languages, subtitleSourceOf(subtitles), maps).tracks.map(baseLanguage)}
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

// `--sub-langs` entries. Track keys go through as exact, case-sensitive
// matches. Language codes only reach here when no info-json was at hand to
// resolve them: they fall back to a pattern, which on YouTube also catches
// machine translations.
export function ytDlpSubtitleLanguages(subtitles: Pick<SubtitleOptions, 'languages' | 'languagesAreCodes'>): string[] {
	return subtitles.languagesAreCodes ? subtitles.languages.map(ytDlpSubtitleLanguageSelector) : subtitles.languages.map(key => `(?-i:${escapePythonRegex(key)})`)
}
