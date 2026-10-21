import type {FormatOption} from '@shared/types.js'
import {languageLabel} from './languageName.js'

// The track a stream belongs to: its name or language; empty when it is not a
// named track. It is the track's key, whatever the UI shows for it.
export function trackOf(format: FormatOption): string {
	return format.audioTrackLabel ?? format.audioLanguage ?? ''
}

// Everything a chip shows of a stream, and everything yt-dlp ranks it by:
// streams equal in all of it are copies of one stream (Vimeo lists each once per CDN).
function copyKey(format: FormatOption): string {
	return JSON.stringify([format.audioLanguage, format.audioTrackLabel, format.audioCodec, format.ext, format.abr, format.audioTrackQuality, format.quality, format.preference, format.isDrc === true, format.audioChannels, format.sampleRateHz, format.filesize, format.markers ?? []])
}

// YouTube lists an HLS copy of each audio track with no codec named. The audio
// column shows it only where its language has no track with a named codec, or
// when it is the pick: every stream stays pickable, but no track is listed twice.
// Of identical copies the list keeps the picked one, else the one yt-dlp would
// take: it lists formats worst first, and equals keep their order, so the last.
export function listedAudioFormats(formats: readonly FormatOption[], keepIds: readonly (string | null)[]): FormatOption[] {
	const audio = formats.filter(format => format.isAudioOnly)
	const namedLanguages = new Set(audio.filter(format => format.audioCodec !== undefined).map(format => format.audioLanguage))
	const listed = audio.filter(format => format.audioCodec !== undefined || !namedLanguages.has(format.audioLanguage) || keepIds.includes(format.formatId))
	const copies = new Map<string, FormatOption[]>()
	for (const format of listed) copies.set(copyKey(format), [...(copies.get(copyKey(format)) ?? []), format])
	const shown = new Set(
		[...copies.values()].flatMap(group => {
			const kept = group.filter(format => keepIds.includes(format.formatId))
			return kept.length > 0 ? kept : group.slice(-1)
		})
	)
	return listed.filter(format => shown.has(format))
}

// What each named track of the listed streams shows: its language in the UI
// language. YouTube's note ("English original (default)") is English whatever
// the UI language, and other sites give a bare code ("ru"). A track keeps the
// site's text where Intl can't name the language, or where its name would read
// the same as another track's (a commentary in English).
export function audioTrackNames(listed: readonly FormatOption[], uiLanguage: string): Map<string, string> {
	const languages = new Map<string, string | undefined>()
	for (const format of listed) {
		const track = trackOf(format)
		if (track && !languages.has(track)) languages.set(track, format.audioLanguage)
	}
	const shown = [...languages].map(([track, language]) => [track, (language ? languageLabel(language, uiLanguage) : undefined) ?? track] as const)
	const counts = new Map<string, number>()
	for (const [, name] of shown) counts.set(name, (counts.get(name) ?? 0) + 1)
	return new Map(shown.map(([track, name]) => [track, (counts.get(name) ?? 0) > 1 ? track : name]))
}
