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
	// toSorted is stable, so ties keep api order.
	return entries.toSorted((a, b) => {
		const ta = a.timestamp
		const tb = b.timestamp
		if (ta === undefined || tb === undefined) return Number(ta === undefined) - Number(tb === undefined)
		return mode === 'upload-asc' ? ta - tb : tb - ta
	})
}
