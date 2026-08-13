// Wraps SelectableVirtualTable with the playlist-profiles column widths and
// the right-click menu — one of the three ways to assign a profile (action
// bar, context menu, number keys). Mirrors QueueManagerTable's split so the
// step component only wires state, never table markup.

import type {ReactNode, RefObject} from 'react'
import type {Row, Table as ReactTable} from '@tanstack/react-table'
import type {VirtualItem} from '@tanstack/react-virtual'
import {useTranslation} from 'react-i18next'
import {RotateCcw, Trash2} from 'lucide-react'
import type {DownloadProfileRef, PlaylistEntry} from '@shared/types.js'
import {ContextMenuContent, ContextMenuItem, ContextMenuSeparator} from '../ui/context-menu.js'
import {SelectableVirtualTable} from '../shared/SelectableVirtualTable.js'
import type {RowSelectionInteractions} from '../shared/useRowSelectionInteractions.js'
import type {DownloadProfileActionOption} from './downloadProfileActions.js'

interface PlaylistProfileTableProps {
	table: ReactTable<PlaylistEntry>
	rows: Row<PlaylistEntry>[]
	virtualRows: VirtualItem[]
	scrollRef: RefObject<HTMLDivElement | null>
	topVirtualPadding: number
	bottomVirtualPadding: number
	renderedColumnCount: number
	options: DownloadProfileActionOption[]
	contextItemIds: string[]
	selectedIds: ReadonlySet<string>
	interactions: RowSelectionInteractions
	onAssign: (itemIds: string[], ref: DownloadProfileRef) => void
	onReset: (itemIds: string[]) => void
	onRemove: (itemIds: string[]) => void
}

function columnClassName(columnId: string): string {
	if (columnId === 'title') return 'w-[55%] min-w-0'
	if (columnId === 'profile') return 'w-[30%]'
	return 'w-[15%]'
}

function PlaylistProfileContextMenuItems({itemIds, options, onAssign, onReset, onRemove}: {itemIds: string[]; options: DownloadProfileActionOption[]; onAssign: (itemIds: string[], ref: DownloadProfileRef) => void; onReset: (itemIds: string[]) => void; onRemove: (itemIds: string[]) => void}): ReactNode {
	const {t} = useTranslation()
	return (
		<ContextMenuContent className="min-w-56">
			{options.map(option => (
				<ContextMenuItem key={option.profile.id} onClick={() => onAssign(itemIds, option.ref)}>
					<option.Icon size={14} aria-hidden />
					{t('wizard.playlistProfiles.assignAria', {profileName: option.profile.name})}
				</ContextMenuItem>
			))}
			<ContextMenuSeparator />
			<ContextMenuItem onClick={() => onReset(itemIds)}>
				<RotateCcw size={14} aria-hidden />
				{t('wizard.url.profile.reset')}
			</ContextMenuItem>
			<ContextMenuSeparator />
			<ContextMenuItem variant="destructive" onClick={() => onRemove(itemIds)}>
				<Trash2 size={14} aria-hidden />
				{t('wizard.playlist.removeFromListCount', {count: itemIds.length})}
			</ContextMenuItem>
		</ContextMenuContent>
	)
}

export function PlaylistProfileTable({table, rows, virtualRows, scrollRef, topVirtualPadding, bottomVirtualPadding, renderedColumnCount, options, contextItemIds, selectedIds, interactions, onAssign, onReset, onRemove}: PlaylistProfileTableProps): ReactNode {
	const {t} = useTranslation()
	return (
		<SelectableVirtualTable
			table={table}
			rows={rows}
			virtualRows={virtualRows}
			scrollRef={scrollRef}
			topVirtualPadding={topVirtualPadding}
			bottomVirtualPadding={bottomVirtualPadding}
			renderedColumnCount={renderedColumnCount}
			selectedIds={selectedIds}
			interactions={interactions}
			getRowId={row => row.original.id}
			emptyLabel={t('wizard.playlistProfiles.empty')}
			scrollTestId="playlist-profile-scroll"
			rowTestId={rowId => `profile-row-${rowId}`}
			columnClassName={columnClassName}
			renderContextMenu={() => <PlaylistProfileContextMenuItems itemIds={contextItemIds} options={options} onAssign={onAssign} onReset={onReset} onRemove={onRemove} />}
		/>
	)
}
