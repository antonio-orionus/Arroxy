import type {SubtitleOptions} from './preparedJob.js'
import type {DownloadProfileSubtitleSource} from './schemas.js'
import type {SubtitleMap} from './types.js'

// Which caption tracks a subtitle source asks yt-dlp for. One rule shared by
// download profiles and subtitles-only batches so both request the same tracks.
// `auto-only` must skip manual tracks, which yt-dlp otherwise prefers.
export function subtitleSourceOptions(source: DownloadProfileSubtitleSource): {writeAuto: boolean; autoOnly?: true; autoAlongsideManual?: true} {
	switch (source) {
		case 'manual-only':
			return {writeAuto: false}
		case 'auto-only':
			return {writeAuto: true, autoOnly: true}
		case 'manual-and-auto':
			return {writeAuto: true, autoAlongsideManual: true}
		case 'manual-first':
			return {writeAuto: true}
	}
}

function subtitleSourceOf(subtitles: Pick<SubtitleOptions, 'writeAuto' | 'autoOnly' | 'autoAlongsideManual'>): DownloadProfileSubtitleSource {
	if (!subtitles.writeAuto) return 'manual-only'
	if (subtitles.autoOnly) return 'auto-only'
	return subtitles.autoAlongsideManual ? 'manual-and-auto' : 'manual-first'
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
// tracks lack is still picked, as yt-dlp does. `manual-and-auto` keeps the
// automatic caption beside the manual track.
export function pickSubtitleTracks(languages: readonly string[], source: DownloadProfileSubtitleSource, maps: {subtitles: SubtitleMap; automaticCaptions: SubtitleMap}): {tracks: string[]; missing: string[]} {
	const tracks: string[] = []
	const missing: string[] = []
	for (const code of languages) {
		const manual = source === 'auto-only' ? [] : matchingKeys(code, maps.subtitles)
		const manualBases = new Set(manual.map(baseLanguage))
		const candidates = source === 'manual-only' ? [] : matchingKeys(code, maps.automaticCaptions)
		const auto = source === 'manual-and-auto' ? candidates : candidates.filter(key => !manualBases.has(baseLanguage(key)))
		const keys = [...manual, ...auto]
		if (keys.length === 0) missing.push(code)
		for (const key of keys) if (!tracks.includes(key)) tracks.push(key)
	}
	return {tracks, missing}
}

// The keys to ask yt-dlp for some picked tracks. An original-language caption
// (`ja-orig`) goes by its bare twin (`ja`): yt-dlp lists it under both keys
// with the same URL, and the bare one names the file `….ja.srt` and the
// embedded track `jpn`, as for any other track. It keeps `-orig` only when the
// job fetches manual tracks and the video has one under the bare key: yt-dlp
// fills a key with the manual track first, so the bare key would fetch that
// one instead of the caption.
export function subtitleRequestKeys(tracks: readonly string[], opts: {subtitles: SubtitleMap; autoOnly: boolean}): string[] {
	return tracks.map(key => {
		const bare = baseLanguage(key)
		return bare !== key && (opts.autoOnly || !(bare in opts.subtitles)) ? bare : key
	})
}

// A job's subtitle options with its language codes turned into this video's
// exact track keys. Options that already name tracks pass through.
export function withSubtitleTracks(subtitles: SubtitleOptions, maps: {subtitles: SubtitleMap; automaticCaptions: SubtitleMap}): SubtitleOptions {
	if (!subtitles.languagesAreCodes) return subtitles
	const {languagesAreCodes: _codes, ...rest} = subtitles
	const tracks = pickSubtitleTracks(subtitles.languages, subtitleSourceOf(subtitles), maps).tracks
	return {...rest, languages: subtitleRequestKeys(tracks, {subtitles: maps.subtitles, autoOnly: subtitles.autoOnly === true})}
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
