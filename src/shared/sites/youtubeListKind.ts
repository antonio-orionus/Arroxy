// The kind of list a YouTube `list=` id names. The id prefix is the only tell
// (the same prefixes yt-dlp's extractor knows): a Mix is `RD…` except `RDCLAK…`
// (a curated playlist), an album is `OLAK5uy…`, an uploads list is `UU…` or a
// channel's popular uploads `PU…`, and Watch later / Liked are the exact ids
// `WL` / `LL`, with `LM` YouTube Music's liked songs.

import type {ListKind} from '../schemas.js'
import {isYouTubeHostname} from './youtubeHost.js'

export function youtubeListKind(listId: string): ListKind {
	if (listId.startsWith('RDCLAK')) return 'playlist'
	if (listId.startsWith('RD')) return 'mix'
	if (listId.startsWith('OLAK5uy')) return 'album'
	if (listId.startsWith('UU') || listId.startsWith('PU')) return 'uploads'
	if (listId === 'WL') return 'watch-later'
	if (listId === 'LL' || listId === 'LM') return 'liked'
	return 'playlist'
}

// Null for a non-YouTube host, an unparseable URL, or a URL with no `list=`.
// `start_radio` is ignored: yt-dlp never reads it, and a Mix always has an `RD` id.
export function listKindForUrl(url: string): ListKind | null {
	let parsed: URL
	try {
		parsed = new URL(url)
	} catch {
		return null
	}
	if (!isYouTubeHostname(parsed.hostname)) return null
	const listId = parsed.searchParams.get('list')
	if (!listId) return null
	return youtubeListKind(listId)
}
