// The kind of list a YouTube `list=` id names. The id prefix is the only tell:
// a Mix is `RD…` except `RDCLAK…` (a curated playlist), an album is `OLAK5uy…`,
// an uploads list is `UU…`, and Watch later / Liked are the exact ids `WL` / `LL`.

import type {ListKind} from '../schemas.js'
import {isYouTubeHostname} from './youtubeHost.js'

export function youtubeListKind(listId: string): ListKind {
	if (listId.startsWith('RDCLAK')) return 'playlist'
	if (listId.startsWith('RD')) return 'mix'
	if (listId.startsWith('OLAK5uy')) return 'album'
	if (listId.startsWith('UU')) return 'uploads'
	if (listId === 'WL') return 'watch-later'
	if (listId === 'LL') return 'liked'
	return 'playlist'
}

// Null for a non-YouTube host, an unparseable URL, or a URL with no `list=`.
// `start_radio` makes the link a Mix whatever its list id says.
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
	if (parsed.searchParams.has('start_radio')) return 'mix'
	return youtubeListKind(listId)
}
