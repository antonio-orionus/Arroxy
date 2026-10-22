// Subtitle lists no recorded probe has (src/renderer/src/dev/probeSources), so
// the subtitle parity check runs yt-dlp on them too. Each is a shape a site
// serves; a recorded probe of a real site replaces it when one turns up.

import type {YtDlpSubtitleTrack} from 'yt-dlp-bridge/info'

export interface ConstructedSubtitles {
	extractor: string
	extractorKey: string
	url: string
	subtitles: Record<string, YtDlpSubtitleTrack[]>
	automaticCaptions: Record<string, YtDlpSubtitleTrack[]>
}

const tracks = (name: string): YtDlpSubtitleTrack[] => [
	{ext: 'json3', name},
	{ext: 'vtt', name}
]
const youtube = {extractor: 'youtube', extractorKey: 'Youtube'}

export const CONSTRUCTED_SUBTITLES: Readonly<Record<string, ConstructedSubtitles>> = {
	// Japanese audio with uploaded Japanese and English (OEryZO2kVhI's shape):
	// the caption is `ja-orig` and its bare twin `ja`, every other automatic
	// key a machine translation, `de-en` one of the uploaded English track.
	'youtube-ja-captions': {...youtube, url: 'https://www.youtube.com/watch?v=parity-ja', subtitles: {ja: tracks('Japanese'), en: tracks('English')}, automaticCaptions: {'ja-orig': tracks('Japanese (Original)'), ja: tracks('Japanese'), en: tracks('English'), de: tracks('German'), 'de-en': tracks('German from English')}},
	// Regional and script variants, and Hebrew as YouTube spells it (`iw`).
	'youtube-regional': {
		...youtube,
		url: 'https://www.youtube.com/watch?v=parity-regional',
		subtitles: {'en-GB': tracks('English (United Kingdom)'), 'pt-BR': tracks('Portuguese (Brazil)'), 'es-419': tracks('Spanish (Latin America)'), 'zh-Hans': tracks('Chinese (Simplified)'), 'zh-Hant': tracks('Chinese (Traditional)'), iw: tracks('Hebrew'), 'sr-Latn': tracks('Serbian (Latin)')},
		automaticCaptions: {'iw-orig': tracks('Hebrew (Original)'), iw: tracks('Hebrew'), en: tracks('English'), 'zh-Hans': tracks('Chinese (Simplified)'), pt: tracks('Portuguese')}
	},
	// A caption language YouTube cannot translate into (Cantonese): no uploaded
	// track, the caption under `yue-orig` and `yue` alone.
	'youtube-untranslatable': {...youtube, url: 'https://www.youtube.com/watch?v=parity-yue', subtitles: {}, automaticCaptions: {'yue-orig': tracks('Cantonese (Original)'), yue: tracks('Cantonese')}},
	// A site that lists automatic captions under bare codes, one of them the
	// key of an uploaded track too.
	'generic-bare-captions': {
		extractor: 'generic',
		extractorKey: 'Generic',
		url: 'https://parity.invalid/bare-captions',
		subtitles: {en: [{ext: 'vtt', name: 'English'}], 'fr-CA': [{ext: 'vtt', name: 'French (Canada)'}]},
		automaticCaptions: {en: [{ext: 'vtt', name: 'English (auto)'}], fr: [{ext: 'vtt', name: 'French (auto)'}], de: [{ext: 'vtt', name: 'German (auto)'}]}
	}
}
