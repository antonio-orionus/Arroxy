// yt-dlp's EmbedThumbnailPP (yt_dlp/postprocessor/embedthumbnail.py) embeds
// into these containers only and fails postprocessing on any other: "Supported
// filetypes for thumbnail embedding are: mp3, mkv/mka, ogg/opus/flac,
// m4a/mp4/m4v/mov".
const THUMBNAIL_EMBED_CONTAINERS: ReadonlySet<string> = new Set(['mp3', 'mkv', 'mka', 'ogg', 'opus', 'flac', 'm4a', 'mp4', 'm4v', 'mov'])

// The container of audio extracted with `--audio-format best` from a stream
// that names no codec and isn't already a common audio file: yt-dlp
// (FFmpegExtractAudioPP) names the file at download from the codec ffprobe
// finds, .m4a, .opus, .mp3, .ogg or .flac, and every one of them holds a cover.
export const EXTRACTED_AUDIO_CONTAINER = 'extracted-audio'

export function canHoldEmbeddedThumbnail(container: string): boolean {
	return container === EXTRACTED_AUDIO_CONTAINER || THUMBNAIL_EMBED_CONTAINERS.has(container)
}
