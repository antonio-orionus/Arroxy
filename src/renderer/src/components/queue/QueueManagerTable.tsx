import {Fragment, memo, type ReactNode, type RefObject} from 'react'
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
import {QueueListOfferRow} from './QueueListOffer.js'
import {hasListOffer, isDownloadErrorRow, needsAttention} from './queueAttention.js'
import type {QueueTableFeatures} from './queueTableFeatures.js'
import {isQueueTableColumnId, type QueueTableColumnId} from './queueTablePreferences.js'
import type {QueueColumnWidths} from './queueColumnWidths.js'
import {QueueTableHeaderRow} from './QueueTableHeaderRow.js'
import {SELECTED_ACTIONS, actionButtonDisabled, actionDisabledTooltip, type QueueSelectedAction} from './queueManagerActions.js'

interface QueueManagerTableProps {
	t: TFunction
	table: Table<QueueTableFeatures, QueueItem>
	rows: Row<QueueTableFeatures, QueueItem>[]
	virtualRows: VirtualItem[]
	scrollRef: RefObject<HTMLDivElement | null>
	measureElement: (element: Element | null) => void
	topVirtualPadding: number
	bottomVirtualPadding: number
	renderedColumnCount: number
	// Rendered columns in display order.
	renderedColumnIds: readonly QueueTableColumnId[]
	columnWidths: QueueColumnWidths
	onColumnWidthsChange: (widths: QueueColumnWidths) => void
	onMoveColumn: (columnId: QueueTableColumnId, targetId: QueueTableColumnId) => void
	contextItems: QueueItem[]
	expandedIds: ReadonlySet<string>
	selectedIds: ReadonlySet<string>
	interactions: RowSelectionInteractions
	// The row a View command pointed at, briefly highlighted.
	highlightedId: string | null
	onContextAction: (action: QueueSelectedAction, items: QueueItem[]) => void
}

// Widths come from the header row (see QueueTableHeaderRow): the table has a
// fixed layout, so its first row sizes every column. These hide the columns a
// narrow window has no room for, in step with RESPONSIVE_COLUMN_HIDE_MAX_WIDTH.
const COLUMN_CLASS_NAMES: Record<QueueTableColumnId, string> = {title: 'min-w-0', status: '', progressPercent: '', formatLabel: 'max-[820px]:hidden', outputDir: 'max-[1040px]:hidden', artifacts: 'text-center', fileSize: 'max-[960px]:hidden', addedAt: 'max-[900px]:hidden', finishedAt: 'max-[900px]:hidden'}

function columnClassName(columnId: string): string {
	return isQueueTableColumnId(columnId) ? COLUMN_CLASS_NAMES[columnId] : ''
}

const QueueContextMenuItems = memo(function QueueContextMenuItems({items, onAction}: {items: QueueItem[]; onAction: (action: QueueSelectedAction, items: QueueItem[]) => void}): ReactNode {
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
})

export function QueueManagerTable({
	t,
	table,
	rows,
	virtualRows,
	scrollRef,
	measureElement,
	topVirtualPadding,
	bottomVirtualPadding,
	renderedColumnCount,
	renderedColumnIds,
	columnWidths,
	onColumnWidthsChange,
	onMoveColumn,
	contextItems,
	expandedIds,
	selectedIds,
	interactions,
	highlightedId,
	onContextAction
}: QueueManagerTableProps): ReactNode {
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
			emptyLabel={t('queue.empty')}
			scrollTestId="queue-manager-scroll"
			// Size containment keeps the rows out of the page height, so the table takes
			// the height the card has left: it grows with the window and scrolls inside
			// itself, however many rows there are.
			scrollClassName="min-h-48 flex-1 contain-size"
			rowTestId={rowId => `queue-manager-row-${rowId}`}
			rowDataAttributes={row => ({'data-status': row.original.status, ...(row.original.id === highlightedId ? {'data-highlighted': 'true'} : {})})}
			columnClassName={columnClassName}
			renderHeaderRow={headers => <QueueTableHeaderRow t={t} headers={headers} renderedColumnIds={renderedColumnIds} columnWidths={columnWidths} columnClassName={columnClassName} onColumnWidthsChange={onColumnWidthsChange} onMoveColumn={onMoveColumn} />}
			renderContextMenu={() => <QueueContextMenuItems items={contextItems} onAction={onContextAction} />}
			renderExtraRows={row => (
				<>
					{needsAttention(row.original) ? <QueueAttentionRow columnsLength={renderedColumnCount} item={row.original} /> : isDownloadErrorRow(row.original) ? <DownloadErrorGuidanceRow columnsLength={renderedColumnCount} item={row.original} /> : null}
					{hasListOffer(row.original) ? <QueueListOfferRow columnsLength={renderedColumnCount} item={row.original} /> : null}
					{expandedIds.has(row.original.id) ? <QueueArtifactsRow columnsLength={renderedColumnCount} item={row.original} /> : null}
				</>
			)}
		/>
	)
}
