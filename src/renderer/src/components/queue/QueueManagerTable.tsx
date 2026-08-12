import {Fragment, type ReactNode, type RefObject} from 'react'
import type {Row, Table as ReactTable} from '@tanstack/react-table'
import type {VirtualItem} from '@tanstack/react-virtual'
import {useTranslation} from 'react-i18next'
import type {TFunction} from 'i18next'
import type {QueueItem} from '@shared/types.js'
import {cn} from '@renderer/lib/utils.js'
import {ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut} from '../ui/context-menu.js'
import {SelectableVirtualTable} from '../shared/SelectableVirtualTable.js'
import type {RowSelectionInteractions} from '../shared/useRowSelectionInteractions.js'
import {QueueArtifactsRow} from './QueueArtifactsRow.js'
import {SELECTED_ACTIONS, actionButtonDisabled, actionDisabledTooltip, type QueueSelectedAction} from './queueManagerActions.js'

interface QueueManagerTableProps {
	t: TFunction
	table: ReactTable<QueueItem>
	rows: Row<QueueItem>[]
	virtualRows: VirtualItem[]
	scrollRef: RefObject<HTMLDivElement | null>
	topVirtualPadding: number
	bottomVirtualPadding: number
	renderedColumnCount: number
	contextItems: QueueItem[]
	expandedIds: ReadonlySet<string>
	selectedIds: ReadonlySet<string>
	interactions: RowSelectionInteractions
	onContextAction: (action: QueueSelectedAction, items: QueueItem[]) => void
}

function columnClassName(columnId: string): string {
	if (columnId === 'title') return 'w-[30%] min-w-0'
	if (columnId === 'status') return 'w-[14%]'
	if (columnId === 'progressPercent') return 'w-[10%]'
	if (columnId === 'formatLabel') return 'w-[14%] max-[820px]:hidden'
	if (columnId === 'outputDir') return 'w-[15%] max-[1040px]:hidden'
	if (columnId === 'artifacts') return 'w-[7%] text-center'
	if (columnId === 'addedAt') return 'w-[10%] max-[900px]:hidden'
	if (columnId === 'finishedAt') return 'w-[10%] max-[900px]:hidden'
	return ''
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
							title={disabledTooltip}
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

export function QueueManagerTable({t, table, rows, virtualRows, scrollRef, topVirtualPadding, bottomVirtualPadding, renderedColumnCount, contextItems, expandedIds, selectedIds, interactions, onContextAction}: QueueManagerTableProps): ReactNode {
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
			rowDataAttributes={row => ({'data-status': row.original.status})}
			columnClassName={columnClassName}
			renderContextMenu={() => <QueueContextMenuItems items={contextItems} onAction={onContextAction} />}
			renderExtraRows={row => (expandedIds.has(row.original.id) ? <QueueArtifactsRow columnsLength={renderedColumnCount} item={row.original} /> : null)}
		/>
	)
}
