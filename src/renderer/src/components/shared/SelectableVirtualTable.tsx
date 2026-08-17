// Virtualized, selectable table body shared by the Downloads tab and the
// playlist profile step. Owns the scroll container, the sticky header, the
// virtual padding rows and the per-row context menu wrapper. It knows nothing
// about what a row means — columns, menu contents and any expansion row come
// from the caller.

import {flexRender, type Row, type Table as TanstackTable} from '@tanstack/react-table'
import type {VirtualItem} from '@tanstack/react-virtual'
import {Fragment, type KeyboardEvent, type ReactNode, type RefObject} from 'react'
import {cn} from '@renderer/lib/utils.js'
import {ContextMenu, ContextMenuTrigger} from '../ui/context-menu.js'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../ui/table.js'
import type {RowSelectionInteractions} from './useRowSelectionInteractions.js'

export interface SelectableVirtualTableProps<T> {
	table: TanstackTable<T>
	rows: Row<T>[]
	virtualRows: VirtualItem[]
	scrollRef: RefObject<HTMLDivElement | null>
	topVirtualPadding: number
	bottomVirtualPadding: number
	renderedColumnCount: number
	selectedIds: ReadonlySet<string>
	interactions: RowSelectionInteractions
	getRowId: (row: Row<T>) => string
	emptyLabel: string
	renderContextMenu: (rowId: string) => ReactNode
	renderExtraRows?: (row: Row<T>) => ReactNode
	rowTestId: (rowId: string) => string
	rowDataAttributes?: (row: Row<T>) => Record<string, string>
	columnClassName?: (columnId: string) => string | undefined
	scrollTestId: string
}

// Keydown listeners on a row also see keydowns that bubble up from an
// interactive control nested inside a cell (e.g. an artifacts toggle
// button). Only react when the row itself is the event target, otherwise
// pressing Enter/Space inside a nested control would also toggle the row.
function runRowKeyboardToggle(event: KeyboardEvent<HTMLTableRowElement>, toggle: () => void): void {
	if (event.target !== event.currentTarget) return
	if (event.key !== ' ' && event.key !== 'Enter') return
	event.preventDefault()
	toggle()
}

export function SelectableVirtualTable<T>({
	table,
	rows,
	virtualRows,
	scrollRef,
	topVirtualPadding,
	bottomVirtualPadding,
	renderedColumnCount,
	selectedIds,
	interactions,
	getRowId,
	emptyLabel,
	renderContextMenu,
	renderExtraRows,
	rowTestId,
	rowDataAttributes,
	columnClassName,
	scrollTestId
}: SelectableVirtualTableProps<T>): ReactNode {
	const columnClass = columnClassName ?? ((): undefined => undefined)
	return (
		<div ref={scrollRef} className="h-[clamp(12rem,calc(100vh-16rem),34rem)] min-h-0 overflow-auto rounded-xl border border-[var(--border-strong)] bg-background/25" data-testid={scrollTestId}>
			<Table className="w-full table-fixed">
				<TableHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur">
					{table.getHeaderGroups().map(headerGroup => (
						<TableRow key={headerGroup.id} className="hover:bg-transparent">
							{headerGroup.headers.map(header => (
								<TableHead key={header.id} className={cn('px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]', columnClass(header.column.id))}>
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
								{emptyLabel}
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
								const rowId = getRowId(row)
								const selected = selectedIds.has(rowId)
								return (
									<Fragment key={row.id}>
										<ContextMenu>
											<ContextMenuTrigger
												render={
													<TableRow
														aria-selected={selected}
														data-state={selected ? 'selected' : undefined}
														data-testid={rowTestId(rowId)}
														{...(rowDataAttributes?.(row) ?? {})}
														tabIndex={0}
														onClick={event => interactions.onRowClick(rowId, event)}
														onContextMenu={() => interactions.openContextMenuForRow(rowId)}
														onKeyDown={event => runRowKeyboardToggle(event, () => interactions.onKeyboardToggle(rowId))}
														onPointerDown={event => interactions.onRowPointerDown(rowId, event)}
														onPointerEnter={event => interactions.onRowPointerEnter(rowId, event)}
														className={cn('cursor-pointer border-border/60 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', selected && 'queue-manager-row-selected')}
													>
														{row.getVisibleCells().map(cell => (
															<TableCell key={cell.id} className={cn('min-w-0 overflow-hidden px-3 py-2', columnClass(cell.column.id))}>
																{flexRender(cell.column.columnDef.cell, cell.getContext())}
															</TableCell>
														))}
													</TableRow>
												}
											/>
											{renderContextMenu(rowId)}
										</ContextMenu>
										{renderExtraRows?.(row)}
									</Fragment>
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
