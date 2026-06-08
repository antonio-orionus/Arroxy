// Single seam for "is this a YouTube extractor". Used to gate YT-only quirks
// (PoT minting, rolling-cue dedupe, SponsorBlock, auto-caption -orig filter).
//
// Names mirror canonical IE_NAME values from
// refs/yt-dlp/yt_dlp/extractor/youtube/ — keep in lockstep when yt-dlp adds new
// YT-family extractors.

const YOUTUBE_IE_NAMES: ReadonlySet<string> = new Set([
	'youtube',
	'youtube:tab',
	'youtube:playlist',
	'youtube:search',
	'youtube:search_url',
	'youtube:music:search_url',
	'youtube:user',
	'youtube:favorites',
	'youtube:history',
	'youtube:recommended',
	'youtube:subscriptions',
	'youtube:watchlater',
	'youtube:notifications',
	'youtube:feed',
	'youtube:clip',
	'youtube:shorts:pivot:audio',
	'youtube:truncated_id',
	'youtube:truncated_url'
])

export function isYouTubeExtractor(extractor: string | undefined | null): boolean {
	if (!extractor) return false
	const canonicalName = extractor.toLowerCase().split('+', 1)[0] ?? ''
	return YOUTUBE_IE_NAMES.has(canonicalName)
}

// Sites whose extractors return audio-only content. Used to default the wizard
// to the audio-only preset, hide muted video columns, and auto-pick an
// audio-best playlist preset. List of curated extractor name prefixes (matched
// case-insensitively) covers the major music hosts. The `music`/`audio`/`radio`
// keyword fallback catches less common extractors with self-describing names.
//
// Excluded: `youtube:music:*` — YouTube Music returns mixed video+audio
// content; user might want either, so we don't force.
const KNOWN_AUDIO_ONLY_PREFIXES: readonly string[] = [
	'bandcamp',
	'soundcloud',
	'mixcloud',
	'jamendo',
	'audiomack',
	'audius',
	'qqmusic',
	'kuwo',
	'migu',
	'netease',
	'kugou',
	'ximalaya',
	'yandexmusic',
	'8tracks',
	'apple:music',
	'apple_music',
	'tiktok:music',
	'spotify',
	'deezer',
	'shemaroomemusic',
	'rbma:radio',
	'nytimes:music'
]

const AUDIO_KEYWORD_RE = /(?:^|[:_-])(music|radio|audio|song|songs|track|tracks|podcast)(?:[:_-]|$)/i

export function isAudioOnlySource(extractor: string | undefined | null): boolean {
	if (!extractor) return false
	const lower = extractor.toLowerCase()
	// YouTube Music returns mixed video + audio content. Don't force audio-only —
	// user might want the music video proper.
	if (lower.startsWith('youtube:music')) return false
	if (KNOWN_AUDIO_ONLY_PREFIXES.some(p => lower.startsWith(p))) return true
	return AUDIO_KEYWORD_RE.test(lower)
}
