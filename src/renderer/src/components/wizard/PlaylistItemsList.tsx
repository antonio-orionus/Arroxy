import {useRef, type ReactNode} from 'react'
import {useVirtualizer} from '@tanstack/react-virtual'
import type {PlaylistEntry} from '@shared/types.js'
import type {BulkMetadataItemStatus} from '../../store/types.js'
import {PlaylistItemRow} from './PlaylistItemRow.js'

interface PlaylistItemsListProps {
	visibleItems: PlaylistEntry[]
	selectedPlaylistItemIds: string[]
	selectedIdSet: ReadonlySet<string>
	syncedIdSet: ReadonlySet<string>
	bulkMetadataById: Record<string, BulkMetadataItemStatus>
	isBulk: boolean
	hasAnyThumbnail: boolean
	onSelectedChange: (id: string, selected: boolean) => void
	onRemove: (ids: string[]) => void
}

export function PlaylistItemsList({visibleItems, selectedPlaylistItemIds, selectedIdSet, syncedIdSet, bulkMetadataById, isBulk, hasAnyThumbnail, onSelectedChange, onRemove}: PlaylistItemsListProps): ReactNode {
	const parentRef = useRef<HTMLDivElement>(null)
	// oxlint-disable-next-line react-hooks-js/incompatible-library
	const virtualizer = useVirtualizer({count: visibleItems.length, getScrollElement: () => parentRef.current, estimateSize: () => 56, overscan: 5})

	function removalTargets(entryId: string): string[] {
		// A right-click on a checked row acts on the whole checked set — this
		// step has no separate highlight-selection, so "the selection" is
		// whatever is currently included for download. A right-click on an
		// unchecked row acts on just that row.
		return selectedIdSet.has(entryId) ? selectedPlaylistItemIds : [entryId]
	}

	return (
		<div ref={parentRef} className="min-h-[12rem] flex-1 overflow-y-auto rounded-md border border-border">
			<div style={{height: virtualizer.getTotalSize(), position: 'relative'}}>
				{virtualizer.getVirtualItems().map(virtualRow => {
					const entry = visibleItems[virtualRow.index]
					return (
						<PlaylistItemRow
							key={entry.id}
							entry={entry}
							virtualRow={virtualRow}
							measureElement={virtualizer.measureElement}
							checked={selectedIdSet.has(entry.id)}
							isAlreadyDownloaded={!!(entry.videoId && syncedIdSet.has(entry.videoId))}
							bulkRowStatus={bulkMetadataById[entry.id]}
							removalTargets={removalTargets(entry.id)}
							isBulk={isBulk}
							hasAnyThumbnail={hasAnyThumbnail}
							onSelectedChange={onSelectedChange}
							onRemove={onRemove}
						/>
					)
				})}
			</div>
		</div>
	)
}
