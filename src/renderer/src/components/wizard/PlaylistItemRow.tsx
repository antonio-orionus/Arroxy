import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import type {VirtualItem} from '@tanstack/react-virtual'
import {Trash2} from 'lucide-react'
import type {PlaylistEntry} from '@shared/types.js'
import type {BulkMetadataItemStatus} from '../../store/types.js'
import {Badge} from '../ui/badge.js'
import {cn} from '@renderer/lib/utils.js'
import {Checkbox} from '../ui/checkbox.js'
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger} from '../ui/context-menu.js'
import {formatEntryDuration} from '@renderer/lib/formatDuration.js'

// A settled ('done') or untracked row shows no status line.
const BULK_ROW_STATUS_KEYS = {pending: 'wizard.playlist.bulkRowWaiting', resolving: 'wizard.playlist.bulkRowResolving', failed: 'wizard.playlist.bulkRowFailed'} as const satisfies Record<Exclude<BulkMetadataItemStatus, 'done'>, string>

type BulkRowStatusKey = (typeof BULK_ROW_STATUS_KEYS)[keyof typeof BULK_ROW_STATUS_KEYS]

function bulkRowStatusKeyFor(status: BulkMetadataItemStatus | undefined): BulkRowStatusKey | null {
	if (status === undefined || status === 'done') return null
	return BULK_ROW_STATUS_KEYS[status]
}

interface PlaylistItemRowProps {
	entry: PlaylistEntry
	virtualRow: VirtualItem
	measureElement: (node: Element | null) => void
	checked: boolean
	isAlreadyDownloaded: boolean
	bulkRowStatus: BulkMetadataItemStatus | undefined
	// Ids a "Remove from list" on this row acts on — bound once per row so the
	// click handler and the count label agree on exactly the same set.
	removalTargets: string[]
	isBulk: boolean
	hasAnyThumbnail: boolean
	onSelectedChange: (id: string, selected: boolean) => void
	onRemove: (ids: string[]) => void
}

function PlaylistItemThumbnail({thumbnail}: {thumbnail: string | undefined}): ReactNode {
	const {t} = useTranslation()
	if (!thumbnail) return <div className="h-8 w-[56px] shrink-0 rounded-sm bg-muted" />
	return <img src={thumbnail} alt={t('wizard.playlist.thumbnailAlt')} referrerPolicy="no-referrer" className="h-8 w-[56px] shrink-0 rounded-sm object-cover" loading="lazy" />
}

function PlaylistItemSubline({entry, isBulk, bulkRowStatus}: {entry: PlaylistEntry; isBulk: boolean; bulkRowStatus: BulkMetadataItemStatus | undefined}): ReactNode {
	const {t} = useTranslation()
	const bulkRowStatusKey = bulkRowStatusKeyFor(bulkRowStatus)
	if (isBulk) {
		return (
			<span className="block truncate font-mono text-caption text-muted-foreground" data-testid={`bulk-row-url-${entry.id}`}>
				{bulkRowStatusKey ? <span className="font-sans">{t(bulkRowStatusKey)} · </span> : null}
				{entry.url}
			</span>
		)
	}
	if (!bulkRowStatusKey) return null
	return (
		<span className="flex items-center gap-1.5 truncate text-caption text-muted-foreground" data-testid={`playlist-row-status-${entry.id}`}>
			{bulkRowStatus === 'resolving' ? <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-current/20 border-t-current animate-spin" aria-hidden /> : null}
			{t(bulkRowStatusKey)}
		</span>
	)
}

export function PlaylistItemRow({entry, virtualRow, measureElement, checked, isAlreadyDownloaded, bulkRowStatus, removalTargets, isBulk, hasAnyThumbnail, onSelectedChange, onRemove}: PlaylistItemRowProps): ReactNode {
	const {t} = useTranslation()
	// A row that is itself a playlist/channel/album: shown so the list
	// isn't empty, but not downloadable — its URL addresses a whole set.
	const isPlaylistRow = entry.isContainer === true
	return (
		<ContextMenu>
			<ContextMenuTrigger
				render={
					// react-doctor-disable-next-line react-doctor/prefer-tag-over-role
					<div
						role="checkbox"
						aria-checked={checked}
						tabIndex={0}
						data-index={virtualRow.index}
						data-testid={`playlist-item-row-${entry.id}`}
						ref={measureElement}
						style={{position: 'absolute', top: virtualRow.start, left: 0, right: 0}}
						aria-disabled={isPlaylistRow}
						className={cn('flex items-center gap-2 px-3 py-2', isPlaylistRow ? 'cursor-default opacity-70' : 'cursor-pointer hover:bg-muted/50')}
						onClick={() => onSelectedChange(entry.id, !checked)}
						onKeyDown={e => {
							if (e.key === ' ' || e.key === 'Enter') {
								e.preventDefault()
								onSelectedChange(entry.id, !checked)
							}
						}}
					>
						<Checkbox checked={checked} disabled={isPlaylistRow} onCheckedChange={v => onSelectedChange(entry.id, !!v)} onClick={e => e.stopPropagation()} />
						{hasAnyThumbnail ? <PlaylistItemThumbnail thumbnail={entry.thumbnail} /> : null}
						<span className="min-w-0 flex-1">
							<span className="block truncate text-sm">{entry.title}</span>
							<PlaylistItemSubline entry={entry} isBulk={isBulk} bulkRowStatus={bulkRowStatus} />
						</span>
						{isPlaylistRow && (
							<Badge variant="secondary" size="sm" className="shrink-0 text-muted-foreground">
								{t('wizard.playlist.nestedPlaylistBadge')}
							</Badge>
						)}
						{isAlreadyDownloaded && (
							<Badge variant="secondary" size="sm" className="shrink-0 text-muted-foreground">
								{t('wizard.playlist.alreadyDownloaded')}
							</Badge>
						)}
						<span className="shrink-0 text-xs text-muted-foreground">{formatEntryDuration(entry.duration, t('wizard.playlist.durationUnknown'))}</span>
					</div>
				}
			/>
			<ContextMenuContent className="min-w-48">
				<ContextMenuItem variant="destructive" onClick={() => onRemove(removalTargets)}>
					<Trash2 size={14} aria-hidden />
					{t('wizard.playlist.removeFromListCount', {count: removalTargets.length})}
				</ContextMenuItem>
			</ContextMenuContent>
		</ContextMenu>
	)
}
