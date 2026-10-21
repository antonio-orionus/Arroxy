import type {FormatOption} from '@shared/types.js'
import {languageLabel} from './languageName.js'

// The track a stream belongs to: its name or language; empty when it is not a
// named track. It is the track's key, whatever the UI shows for it.
export function trackOf(format: FormatOption): string {
	return format.audioTrackLabel ?? format.audioLanguage ?? ''
}

// What each named track shows: its language in the UI language. YouTube's note
// ("English original (default)") is English whatever the UI language, and other
// sites give a bare code ("ru"). The site's own text stays where Intl can't name
// the language, or where two tracks share one (a commentary in English).
export function audioTrackNames(formats: readonly FormatOption[], uiLanguage: string): Map<string, string> {
	const languages = new Map<string, string | undefined>()
	for (const format of formats) {
		const track = trackOf(format)
		if (format.isAudioOnly && track && !languages.has(track)) languages.set(track, format.audioLanguage)
	}
	const named = [...languages].map(([track, language]) => [track, language ? languageLabel(language, uiLanguage) : undefined] as const)
	const shared = new Set(named.flatMap(([, name], index) => (name && named.some(([, other], otherIndex) => other === name && otherIndex !== index) ? [name] : [])))
	return new Map(named.map(([track, name]) => [track, name && !shared.has(name) ? name : track]))
}
