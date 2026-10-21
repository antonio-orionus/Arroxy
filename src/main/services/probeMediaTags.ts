import type {MediaTags} from '@shared/types.js'

// The fields behind `{categories}`, `{artist}`, `{album}` and `{track}`.
// yt-dlp-bridge types `categories` but not the music fields, which reach here
// through its loose passthrough as `unknown`; each one is narrowed below.
interface MediaTagSource {
	categories?: string[]
	artist?: unknown
	artists?: unknown
	album?: unknown
	track?: unknown
}

function presentString(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined
}

// yt-dlp fills `artist` from `artists` joined with ", ", but an info dict an
// extractor built by hand may carry only the list.
function resolveArtist(source: MediaTagSource): string | undefined {
	const single = presentString(source.artist)
	if (single !== undefined || !Array.isArray(source.artists)) return single
	const names = source.artists.map(presentString).filter(name => name !== undefined)
	return names.length > 0 ? names.join(', ') : undefined
}

/** The media tags an info dict carries, or undefined when it carries none. */
export function resolveMediaTags(source: MediaTagSource): MediaTags | undefined {
	const tags: MediaTags = {}
	const category = presentString(source.categories?.[0])
	const artist = resolveArtist(source)
	const album = presentString(source.album)
	const track = presentString(source.track)
	if (category !== undefined) tags.category = category
	if (artist !== undefined) tags.artist = artist
	if (album !== undefined) tags.album = album
	if (track !== undefined) tags.track = track
	return Object.keys(tags).length > 0 ? tags : undefined
}
