import type {PlaylistEntry, PlaylistSortMode} from '@shared/types.js'

/**
 * View-order for the playlist picker. Never mutates the input and never
 * recomputes `id` / `playlistIndex` — those are immutable probe-order identity
 * (mixes repeat the same video, so selection keys on per-row ids). Sorting only
 * changes render/submission order.
 *
 * Rows without a `timestamp` (hydration pending or failed) sort last, stable
 * among themselves in api order, in both upload modes.
 */
export function sortPlaylistEntries(entries: readonly PlaylistEntry[], mode: PlaylistSortMode): PlaylistEntry[] {
	if (mode === 'api') return [...entries]
	const decorated = entries.map((entry, index) => ({entry, index}))
	decorated.sort((a, b) => {
		const ta = a.entry.timestamp
		const tb = b.entry.timestamp
		const aMissing = ta === undefined
		const bMissing = tb === undefined
		if (aMissing && bMissing) return a.index - b.index
		if (aMissing) return 1
		if (bMissing) return -1
		if (ta !== tb) return mode === 'upload-asc' ? ta - tb : tb - ta
		return a.index - b.index
	})
	return decorated.map(d => d.entry)
}
