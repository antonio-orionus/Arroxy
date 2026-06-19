import {Fragment, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode, type RefObject} from 'react'
import {flexRender, type Row, type Table as ReactTable} from '@tanstack/react-table'
import type {VirtualItem} from '@tanstack/react-virtual'
import {useTranslation} from 'react-i18next'
import type {TFunction} from 'i18next'
import type {QueueItem} from '@shared/types.js'
import {cn} from '@renderer/lib/utils.js'
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger} from '../ui/context-menu.js'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../ui/table.js'
import {QueueArtifactsRow} from './QueueArtifactsRow.js'
import {SELECTED_ACTIONS, actionButtonDisabled, actionDisabledTooltip, type QueueSelectedAction} from './queueManagerActions.js'

interface FragmentRowsProps {
	contextItems: QueueItem[]
	columnsLength: number
	expanded: boolean
	item: QueueItem
	onContextAction: (action: QueueSelectedAction, items: QueueItem[]) => void
	onContextMenu: (itemId: string) => void
	onKeyboardToggle: () => void
	onRowClick: (event: MouseEvent<HTMLTableRowElement>) => void
	onRowPointerDown: (event: PointerEvent<HTMLTableRowElement>) => void
	onRowPointerEnter: (event: PointerEvent<HTMLTableRowElement>) => void
	row: Row<QueueItem>
	selected: boolean
}

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
	onContextAction: (action: QueueSelectedAction, items: QueueItem[]) => void
	onContextMenu: (itemId: string) => void
	onKeyboardToggle: (itemId: string) => void
	onRowClick: (itemId: string, event: MouseEvent<HTMLTableRowElement>) => void
	onRowPointerDown: (itemId: string, event: PointerEvent<HTMLTableRowElement>) => void
	onRowPointerEnter: (itemId: string, event: PointerEvent<HTMLTableRowElement>) => void
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

function runRowKeyboardToggle(event: KeyboardEvent<HTMLTableRowElement>, action: () => void): void {
	if (event.target !== event.currentTarget) return
	if (event.key !== 'Enter' && event.key !== ' ') return
	event.preventDefault()
	action()
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

function FragmentRows({contextItems, columnsLength, expanded, item, onContextAction, onContextMenu, onKeyboardToggle, onRowClick, onRowPointerDown, onRowPointerEnter, row, selected}: FragmentRowsProps): ReactNode {
	return (
		<>
			<ContextMenu>
				<ContextMenuTrigger
					render={
						<TableRow
							aria-selected={selected}
							data-state={selected ? 'selected' : undefined}
							data-testid={`queue-manager-row-${item.id}`}
							data-status={item.status}
							tabIndex={0}
							onClick={onRowClick}
							onContextMenu={() => onContextMenu(item.id)}
							onKeyDown={event => runRowKeyboardToggle(event, onKeyboardToggle)}
							onPointerDown={onRowPointerDown}
							onPointerEnter={onRowPointerEnter}
							className={cn('cursor-pointer border-border/60 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', selected && 'queue-manager-row-selected')}
						>
							{row.getVisibleCells().map(cell => (
								<TableCell key={cell.id} className={cn('min-w-0 overflow-hidden px-3 py-2', columnClassName(cell.column.id))}>
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</TableCell>
							))}
						</TableRow>
					}
				/>
				<QueueContextMenuItems items={contextItems} onAction={onContextAction} />
			</ContextMenu>
			{expanded ? <QueueArtifactsRow columnsLength={columnsLength} item={item} /> : null}
		</>
	)
}

export function QueueManagerTable({t, table, rows, virtualRows, scrollRef, topVirtualPadding, bottomVirtualPadding, renderedColumnCount, contextItems, expandedIds, selectedIds, onContextAction, onContextMenu, onKeyboardToggle, onRowClick, onRowPointerDown, onRowPointerEnter}: QueueManagerTableProps): ReactNode {
	return (
		<div ref={scrollRef} className="h-[clamp(12rem,calc(100vh-16rem),34rem)] min-h-0 overflow-auto rounded-xl border border-[var(--border-strong)] bg-background/25" data-testid="queue-manager-scroll">
			<Table className="w-full table-fixed">
				<TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
					{table.getHeaderGroups().map(headerGroup => (
						<TableRow key={headerGroup.id} className="hover:bg-transparent">
							{headerGroup.headers.map(header => (
								<TableHead key={header.id} className={cn('px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]', columnClassName(header.column.id))}>
									{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{rows.length === 0 ? (
						<TableRow>
							<TableCell colSpan={renderedColumnCount} className="h-36 text-center text-sm text-muted-foreground">
								{t('queue.empty')}
							</TableCell>
						</TableRow>
					) : (
						<>
							{topVirtualPadding > 0 ? (
								<TableRow aria-hidden="true" className="border-0 hover:bg-transparent">
									<TableCell colSpan={renderedColumnCount} className="p-0" style={{height: topVirtualPadding}} />
								</TableRow>
							) : null}
							{virtualRows.map(virtualRow => {
								const row = rows[virtualRow.index]
								if (!row) return null
								const item = row.original
								return (
									<FragmentRows
										key={row.id}
										item={item}
										contextItems={contextItems}
										expanded={expandedIds.has(item.id)}
										selected={selectedIds.has(item.id)}
										columnsLength={renderedColumnCount}
										onContextAction={onContextAction}
										onContextMenu={onContextMenu}
										onKeyboardToggle={() => onKeyboardToggle(item.id)}
										onRowClick={event => onRowClick(item.id, event)}
										onRowPointerDown={event => onRowPointerDown(item.id, event)}
										onRowPointerEnter={event => onRowPointerEnter(item.id, event)}
										row={row}
									/>
								)
							})}
							{bottomVirtualPadding > 0 ? (
								<TableRow aria-hidden="true" className="border-0 hover:bg-transparent">
									<TableCell colSpan={renderedColumnCount} className="p-0" style={{height: bottomVirtualPadding}} />
								</TableRow>
							) : null}
						</>
					)}
				</TableBody>
			</Table>
		</div>
	)
}
