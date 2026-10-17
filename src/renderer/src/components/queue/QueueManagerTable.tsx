import {Fragment, type ReactNode, type RefObject} from 'react'
import type {Row, Table} from '@tanstack/react-table'
import type {VirtualItem} from '@tanstack/react-virtual'
import {useTranslation} from 'react-i18next'
import type {TFunction} from 'i18next'
import type {QueueItem} from '@shared/types.js'
import {cn} from '@renderer/lib/utils.js'
import {ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut} from '../ui/context-menu.js'
import {SelectableVirtualTable} from '../shared/SelectableVirtualTable.js'
import type {RowSelectionInteractions} from '../shared/useRowSelectionInteractions.js'
import {QueueArtifactsRow} from './QueueArtifactsRow.js'
import {DownloadErrorGuidanceRow, QueueAttentionRow} from './QueueAttentionRow.js'
import {isDownloadErrorRow, needsAttention} from './queueAttention.js'
import type {QueueTableFeatures} from './queueTableFeatures.js'
import type {QueueTableColumnId} from './queueTablePreferences.js'
import {SELECTED_ACTIONS, actionButtonDisabled, actionDisabledTooltip, type QueueSelectedAction} from './queueManagerActions.js'

interface QueueManagerTableProps {
	t: TFunction
	table: Table<QueueTableFeatures, QueueItem>
	rows: Row<QueueTableFeatures, QueueItem>[]
	virtualRows: VirtualItem[]
	scrollRef: RefObject<HTMLDivElement | null>
	topVirtualPadding: number
	bottomVirtualPadding: number
	renderedColumnCount: number
	contextItems: QueueItem[]
	expandedIds: ReadonlySet<string>
	selectedIds: ReadonlySet<string>
	interactions: RowSelectionInteractions
	// The row a View command pointed at, briefly highlighted.
	highlightedId: string | null
	onContextAction: (action: QueueSelectedAction, items: QueueItem[]) => void
}

// The table has a fixed layout, so every column needs a width share: one
// without collapses to nothing and its header spills over its neighbour.
// The default visible set (all but Finished) adds up to 100%.
const COLUMN_CLASS_NAMES: Record<QueueTableColumnId, string> = {
	title: 'w-[21%] min-w-0',
	status: 'w-[17%]',
	progressPercent: 'w-[9%]',
	formatLabel: 'w-[13%] max-[820px]:hidden',
	outputDir: 'w-[13%] max-[1040px]:hidden',
	artifacts: 'w-[8%] text-center',
	fileSize: 'w-[10%] max-[960px]:hidden',
	addedAt: 'w-[9%] max-[900px]:hidden',
	finishedAt: 'w-[9%] max-[900px]:hidden'
}

function columnClassName(columnId: string): string {
	return columnId in COLUMN_CLASS_NAMES ? COLUMN_CLASS_NAMES[columnId as QueueTableColumnId] : ''
}

function QueueContextMenuItems({items, onAction}: {items: QueueItem[]; onAction: (action: QueueSelectedAction, items: QueueItem[]) => void}): ReactNode {
	const {t} = useTranslation()
	return (
		<ContextMenuContent className="min-w-56">
			{SELECTED_ACTIONS.map(action => {
				const {Icon} = action
				const disabled = actionButtonDisabled(action.id, items)
				const disabledTooltip = actionDisabledTooltip(action.id, disabled, t)
				const softDisabled = action.id === 'change-output-target' && disabled
				return (
					<Fragment key={action.id}>
						{action.id === 'change-output-target' || action.id === 'remove' ? <ContextMenuSeparator /> : null}
						<ContextMenuItem
							aria-disabled={disabled ? 'true' : undefined}
							disabled={disabled && !softDisabled}
							aria-description={disabledTooltip}
							variant={action.destructive ? 'destructive' : 'default'}
							className={cn(softDisabled && 'opacity-50 focus:bg-transparent focus:text-muted-foreground')}
							onClick={() => (disabled ? undefined : onAction(action.id, items))}
						>
							<Icon size={14} aria-hidden />
							{t(action.labelKey)}
							{disabledTooltip ? <ContextMenuShortcut className="normal-case tracking-normal">{t('queue.item.pendingOnly')}</ContextMenuShortcut> : null}
						</ContextMenuItem>
					</Fragment>
				)
			})}
		</ContextMenuContent>
	)
}

export function QueueManagerTable({t, table, rows, virtualRows, scrollRef, topVirtualPadding, bottomVirtualPadding, renderedColumnCount, contextItems, expandedIds, selectedIds, interactions, highlightedId, onContextAction}: QueueManagerTableProps): ReactNode {
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
			emptyLabel={t('queue.empty')}
			scrollTestId="queue-manager-scroll"
			rowTestId={rowId => `queue-manager-row-${rowId}`}
			rowDataAttributes={row => ({'data-status': row.original.status, ...(row.original.id === highlightedId ? {'data-highlighted': 'true'} : {})})}
			columnClassName={columnClassName}
			renderContextMenu={() => <QueueContextMenuItems items={contextItems} onAction={onContextAction} />}
			renderExtraRows={row => (
				<>
					{needsAttention(row.original) ? <QueueAttentionRow columnsLength={renderedColumnCount} item={row.original} /> : isDownloadErrorRow(row.original) ? <DownloadErrorGuidanceRow columnsLength={renderedColumnCount} item={row.original} /> : null}
					{expandedIds.has(row.original.id) ? <QueueArtifactsRow columnsLength={renderedColumnCount} item={row.original} /> : null}
				</>
			)}
		/>
	)
}
