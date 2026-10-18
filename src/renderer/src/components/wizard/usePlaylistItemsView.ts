import {useMemo} from 'react'
import type {PlaylistEntry, PlaylistSortMode} from '@shared/types.js'
import type {BulkMetadataStatus} from '../../store/types.js'
import {sortPlaylistEntries} from '../../store/wizard/playlistSort.js'

interface PlaylistItemsViewInput {
	playlistItems: PlaylistEntry[]
	removedPlaylistItemIds: string[]
	selectedPlaylistItemIds: string[]
	syncedDownloadedIds: string[]
	playlistSortMode: PlaylistSortMode
	bulkMetadataStatus: BulkMetadataStatus
	isBulk: boolean
}

export interface PlaylistItemsView {
	visibleItems: PlaylistEntry[]
	sortFetching: boolean
	canSortByUpload: boolean
	allRemoved: boolean
	nestedPlaylistCount: number
	selectedIdSet: ReadonlySet<string>
	syncedIdSet: ReadonlySet<string>
	hasAnyThumbnail: boolean
}

// Derived, render-only projections of the playlist step's store slice.
export function usePlaylistItemsView({playlistItems, removedPlaylistItemIds, selectedPlaylistItemIds, syncedDownloadedIds, playlistSortMode, bulkMetadataStatus, isBulk}: PlaylistItemsViewInput): PlaylistItemsView {
	// Removed rows (Task 11) drop out of the rendered list entirely — unlike an
	// unchecked row, which stays visible but excluded from the download.
	const removedSet = useMemo(() => new Set(removedPlaylistItemIds), [removedPlaylistItemIds])
	// Sort is a view concern: ids and playlistIndex stay immutable probe-order
	// identity so selection survives sort changes. Bulk mode keeps intake order.
	const visibleItems = useMemo(() => {
		const kept = playlistItems.filter(entry => !removedSet.has(entry.id))
		return isBulk ? kept : sortPlaylistEntries(kept, playlistSortMode)
	}, [playlistItems, removedSet, isBulk, playlistSortMode])
	const sortFetching = bulkMetadataStatus === 'resolving'
	// Upload-date sort must not unlock mid-hydration. "Some row has a timestamp"
	// would open it as soon as the first probe lands, and the rows still waiting
	// sort last — so the user sees a list labelled "Oldest first" that is mostly
	// intake order. Wait for hydration to settle, then require at least one
	// timestamp among the sortable (non-container) rows; rows whose probe failed
	// still sort last, which is the documented fallback rather than a lie.
	const canSortByUpload = useMemo(() => !sortFetching && playlistItems.some(entry => entry.isContainer !== true && entry.timestamp !== undefined), [playlistItems, sortFetching])
	const allRemoved = removedPlaylistItemIds.length > 0 && visibleItems.length === 0
	// Rows that are themselves playlists: visible but not downloadable, so the
	// list needs to say why rather than leaving three dead checkboxes unexplained.
	const nestedPlaylistCount = useMemo(() => visibleItems.filter(entry => entry.isContainer === true).length, [visibleItems])
	// Hoisted once per render instead of `.includes` inside the per-row render
	// loop / removalTargets — at the design's 1000-item target, an `.includes`
	// call per visible row against a selection that can itself be 1000 ids long
	// adds up fast; a Set lookup is O(1) regardless.
	const selectedIdSet = useMemo(() => new Set(selectedPlaylistItemIds), [selectedPlaylistItemIds])
	const syncedIdSet = useMemo(() => new Set(syncedDownloadedIds), [syncedDownloadedIds])
	// yt-dlp's --flat-playlist returns thumbnails for some extractors
	// (YouTube tab) but not others (PornHub paged list, generic). When no
	// entry has one, hide the thumbnail slot entirely so the list renders
	// compactly instead of showing 500 empty boxes.
	const hasAnyThumbnail = useMemo(() => playlistItems.some(e => !!e.thumbnail), [playlistItems])
	return {visibleItems, sortFetching, canSortByUpload, allRemoved, nestedPlaylistCount, selectedIdSet, syncedIdSet, hasAnyThumbnail}
}
