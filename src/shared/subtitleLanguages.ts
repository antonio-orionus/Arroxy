import type {SubtitleOptions} from './preparedJob.js'
import type {DownloadProfileSubtitleSource} from './schemas.js'
import {planSubtitleTracks, type SubtitleMaps} from './subtitleTracks.js'

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

// A job's subtitle options with its language codes turned into this video's
// exact track keys. Options that already name tracks pass through.
export function withSubtitleTracks(subtitles: SubtitleOptions, maps: SubtitleMaps): SubtitleOptions {
	if (!subtitles.languagesAreCodes) return subtitles
	const {languagesAreCodes: _codes, ...rest} = subtitles
	const plan = planSubtitleTracks({kind: 'languages', languages: subtitles.languages, source: subtitleSourceOf(subtitles)}, maps)
	return {...rest, languages: plan.tracks.map(track => track.requestKey)}
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
