// yt-dlp's EmbedThumbnailPP (yt_dlp/postprocessor/embedthumbnail.py) embeds
// into these containers only and fails postprocessing on any other: "Supported
// filetypes for thumbnail embedding are: mp3, mkv/mka, ogg/opus/flac,
// m4a/mp4/m4v/mov".
const THUMBNAIL_EMBED_CONTAINERS: ReadonlySet<string> = new Set(['mp3', 'mkv', 'mka', 'ogg', 'opus', 'flac', 'm4a', 'mp4', 'm4v', 'mov'])

export function canHoldEmbeddedThumbnail(container: string): boolean {
	return THUMBNAIL_EMBED_CONTAINERS.has(container)
}
