// Wraps SelectableVirtualTable with the playlist-profiles column widths and
// the right-click menu — one of the three ways to assign a profile (toolbar,
// a row's profile button, context menu). Mirrors QueueManagerTable's split so the step component only
// wires state, never table markup.

import type {ReactNode, RefObject} from 'react'
import type {Row, Table} from '@tanstack/react-table'
import type {VirtualItem} from '@tanstack/react-virtual'
import {useTranslation} from 'react-i18next'
import {RotateCcw, Trash2} from 'lucide-react'
import type {DownloadProfileRef, PlaylistEntry} from '@shared/types.js'
import {ContextMenuContent, ContextMenuItem, ContextMenuSeparator} from '../ui/context-menu.js'
import {SelectableVirtualTable} from '../shared/SelectableVirtualTable.js'
import type {RowSelectionInteractions} from '../shared/useRowSelectionInteractions.js'
import type {PlaylistProfileMenuModel} from './playlistProfileMenu.js'
import {ProfilePickerContextItems} from './ProfilePicker.js'
import type {PlaylistProfileTableFeatures} from './playlistProfileTableFeatures.js'

interface PlaylistProfileTableProps {
	table: Table<PlaylistProfileTableFeatures, PlaylistEntry>
	rows: Row<PlaylistProfileTableFeatures, PlaylistEntry>[]
	virtualRows: VirtualItem[]
	scrollRef: RefObject<HTMLDivElement | null>
	measureElement: (element: Element | null) => void
	topVirtualPadding: number
	bottomVirtualPadding: number
	renderedColumnCount: number
	// The right-click menu's rows and its model for them.
	contextItemIds: string[]
	contextMenu: PlaylistProfileMenuModel
	selectedIds: ReadonlySet<string>
	interactions: RowSelectionInteractions
	onAssign: (itemIds: string[], ref: DownloadProfileRef) => void
	onReset: (itemIds: string[]) => void
	onRemove: (itemIds: string[]) => void
}

// Title takes whatever the fixed columns leave. The profile column is wide
// enough that a builtin name still reads at the window's minimum width, and
// the duration column fits its header in most languages (the rest truncate it).
function columnClassName(columnId: string): string {
	if (columnId === 'select') return 'w-10'
	if (columnId === 'title') return 'min-w-0'
	if (columnId === 'profile') return 'w-[34%]'
	return 'w-32'
}

function PlaylistProfileContextMenuItems({itemIds, menu, onAssign, onReset, onRemove}: {itemIds: string[]; menu: PlaylistProfileMenuModel; onAssign: (itemIds: string[], ref: DownloadProfileRef) => void; onReset: (itemIds: string[]) => void; onRemove: (itemIds: string[]) => void}): ReactNode {
	const {t} = useTranslation()
	return (
		<ContextMenuContent className="min-w-64">
			<ProfilePickerContextItems options={menu.options} label={t('wizard.playlistProfiles.assignTriggerEmpty')} onPick={ref => onAssign(itemIds, ref)} />
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

export function PlaylistProfileTable({table, rows, virtualRows, scrollRef, measureElement, topVirtualPadding, bottomVirtualPadding, renderedColumnCount, contextItemIds, contextMenu, selectedIds, interactions, onAssign, onReset, onRemove}: PlaylistProfileTableProps): ReactNode {
	const {t} = useTranslation()
	return (
		<SelectableVirtualTable
			table={table}
			rows={rows}
			virtualRows={virtualRows}
			scrollRef={scrollRef}
			measureElement={measureElement}
			topVirtualPadding={topVirtualPadding}
			bottomVirtualPadding={bottomVirtualPadding}
			renderedColumnCount={renderedColumnCount}
			selectedIds={selectedIds}
			interactions={interactions}
			getRowId={row => row.original.id}
			emptyLabel={t('wizard.playlistProfiles.empty')}
			scrollTestId="playlist-profile-scroll"
			scrollClassName="h-[max(12rem,calc(100vh-24rem))]"
			rowTestId={rowId => `profile-row-${rowId}`}
			columnClassName={columnClassName}
			renderContextMenu={() => <PlaylistProfileContextMenuItems itemIds={contextItemIds} menu={contextMenu} onAssign={onAssign} onReset={onReset} onRemove={onRemove} />}
		/>
	)
}
