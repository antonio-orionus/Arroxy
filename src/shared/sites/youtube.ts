// YouTube-specific Site adapter. Owns every quirk that previously lived as a
// scattered `isYouTubeExtractor()` / hostname check throughout the codebase:
// PoT token, SponsorBlock, auto-caption rolling-cue dedupe, `-orig` filter,
// browse-id playlist hints, nested container detection.
//
// Browse-id prefixes (UC, VL*, MPRE, MPSPPL, …) are stable YouTube/InnerTube
// identifiers; see refs/yt-dlp/yt_dlp/extractor/youtube/_video.py for the
// full taxonomy. When yt-dlp adds new id types, update both predicates below.

import type {PlaylistEntryHint, Site} from './types.js'

// Returns a category-prefixed display label for an entry whose title is
// missing. Mirrors the pre-seam `youtubeIdHint` logic exactly so the playlist
// picker shows the same fallback strings it did before.
function youtubeHintForId(id: string): string | null {
	if (!id) return null
	if (id.startsWith('UC') && id.length === 24) return `Channel · ${id}`
	if (id.startsWith('VLPL') || id.startsWith('VLOLAK')) return `Playlist · ${id.slice(2)}`
	if (id.startsWith('VLRD')) return `Mix · ${id.slice(2)}`
	if (id.startsWith('VL')) return `Playlist · ${id.slice(2)}`
	if (id.startsWith('MPRE')) return `Album · ${id}`
	if (id.startsWith('MPSPPL')) return `Search playlist · ${id}`
	if (id.startsWith('MPLAUC') || id.startsWith('MPSP')) return `Section · ${id}`
	return null
}

// True if this entry is a YouTube container (channel/playlist/album/mix)
// rather than an actual video. Used to filter heterogeneous flat-playlist
// results so the wizard's "pick videos" model isn't broken by nested entries.
function youtubeIsNested(entry: PlaylistEntryHint): boolean {
	const id = entry.id ?? ''
	if (!id) return false
	if (id.startsWith('UC') && id.length === 24) return true // channel
	if (id.startsWith('VL')) return true // playlist / mix / radio
	if (id.startsWith('MPRE')) return true // album / release
	if (id.startsWith('MPSPPL') || id.startsWith('MPSP') || id.startsWith('MPLAUC')) return true // sections
	return false
}

export const youtubeSite: Site = {id: 'youtube', needsPotToken: true, supportsSponsorBlock: true, needsAutoCaptionDedupe: true, autoCaptionRequiresOrigSuffix: true, hintForPlaylistId: youtubeHintForId, isNestedContainer: youtubeIsNested}
