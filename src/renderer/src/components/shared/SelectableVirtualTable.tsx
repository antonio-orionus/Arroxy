// Virtualized, selectable table body shared by the Downloads tab and the
// playlist profile step. Owns the scroll container, the sticky header, the
// virtual padding rows and the per-row context menu wrapper. It knows nothing
// about what a row means — columns, menu contents and any expansion row come
// from the caller.
//
// Generic over the table's TanStack features because each caller registers a
// different set. Only core APIs are called on the instances; visible cells go
// through the feature-agnostic `row_getVisibleCells`, which honours column
// visibility when the caller registers it and returns every cell otherwise.
//
// Each virtual item (a row plus any extra rows the caller renders under it)
// is its own row group, handed to the virtualizer's `measureElement`: an item
// taller than the estimate would otherwise leave the padding rows sized for
// rows that are not there, and the visible rows jump as the item scrolls out.
//
// The row carries a named `group/row` class so a caller's cell markup can
// reveal a hover/focus-only control with `group-hover/row:` without this
// component knowing anything about that control.

import {flexRender, type Header, type Row, type RowData, type Table as TanstackTable, type TableFeatures} from '@tanstack/react-table'
import {row_getVisibleCells} from '@tanstack/react-table/static-functions'
import type {VirtualItem} from '@tanstack/react-virtual'
import {Fragment, type KeyboardEvent, type ReactNode, type RefObject} from 'react'
import {cn} from '@renderer/lib/utils.js'
import {ContextMenu, ContextMenuTrigger} from '../ui/context-menu.js'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../ui/table.js'
import type {RowSelectionInteractions} from './useRowSelectionInteractions.js'
import {SectionLabel} from './SectionLabel.js'

const DEFAULT_SCROLL_HEIGHT = 'h-[clamp(12rem,calc(100vh-16rem),34rem)]'

export interface SelectableVirtualTableProps<TFeatures extends TableFeatures, T extends RowData> {
	table: TanstackTable<TFeatures, T>
	rows: Row<TFeatures, T>[]
	virtualRows: VirtualItem[]
	scrollRef: RefObject<HTMLDivElement | null>
	// The virtualizer's `measureElement`, given each item's row group.
	measureElement: (element: Element | null) => void
	topVirtualPadding: number
	bottomVirtualPadding: number
	renderedColumnCount: number
	selectedIds: ReadonlySet<string>
	interactions: RowSelectionInteractions
	getRowId: (row: Row<TFeatures, T>) => string
	emptyLabel: string
	renderContextMenu: (rowId: string) => ReactNode
	renderExtraRows?: (row: Row<TFeatures, T>) => ReactNode
	rowTestId: (rowId: string) => string
	rowDataAttributes?: (row: Row<TFeatures, T>) => Record<string, string>
	columnClassName?: (columnId: string) => string | undefined
	// Replaces the default header row, e.g. with movable, resizable headers.
	renderHeaderRow?: (headers: Header<TFeatures, T, unknown>[]) => ReactNode
	scrollTestId: string
	// Height of the scroll box. The wizard panel sizes to its content, so a flex-fill has nothing to fill: callers size it from the viewport instead.
	scrollClassName?: string
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

export function SelectableVirtualTable<TFeatures extends TableFeatures, T extends RowData>({
	table,
	rows,
	virtualRows,
	scrollRef,
	measureElement,
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
	renderHeaderRow,
	scrollTestId,
	scrollClassName = DEFAULT_SCROLL_HEIGHT
}: SelectableVirtualTableProps<TFeatures, T>): ReactNode {
	const columnClass = columnClassName ?? ((): undefined => undefined)
	return (
		<div ref={scrollRef} className={cn('min-h-0 overflow-auto rounded-xl border border-border-strong bg-background/25', scrollClassName)} data-testid={scrollTestId}>
			{/* The default container scrolls on x, which makes it the nearest scrollport of the sticky header; letting it overflow pins the header to the scroll box above. */}
			<Table className="w-full table-fixed" containerClassName="overflow-visible">
				<TableHeader className="sticky top-0 z-10 bg-card/95">
					{table.getHeaderGroups().map(headerGroup =>
						renderHeaderRow ? (
							<Fragment key={headerGroup.id}>{renderHeaderRow(headerGroup.headers)}</Fragment>
						) : (
							<TableRow key={headerGroup.id} className="hover:bg-transparent">
								{headerGroup.headers.map(header => (
									<SectionLabel key={header.id} render={<TableHead />} className={cn('px-3', columnClass(header.column.id))}>
										{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
									</SectionLabel>
								))}
							</TableRow>
						)
					)}
				</TableHeader>
				{rows.length === 0 ? (
					<TableBody>
						<TableRow>
							<TableCell colSpan={renderedColumnCount} className="h-36 text-center text-sm text-muted-foreground">
								{emptyLabel}
							</TableCell>
						</TableRow>
					</TableBody>
				) : (
					<>
						{topVirtualPadding > 0 ? (
							<TableBody>
								<TableRow aria-hidden="true" className="border-0 hover:bg-transparent">
									<TableCell colSpan={renderedColumnCount} className="p-0" style={{height: topVirtualPadding}} />
								</TableRow>
							</TableBody>
						) : null}
						{virtualRows.map(virtualRow => {
							const row = rows[virtualRow.index]
							if (!row) return null
							const rowId = getRowId(row)
							const selected = selectedIds.has(rowId)
							return (
								// A plain row group: TableBody drops the border of its last row, which here
								// is only right for the table's last row.
								<tbody key={row.id} ref={measureElement} data-index={virtualRow.index} data-slot="table-body" className="last:[&_tr:last-child]:border-0">
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
													className={cn('group/row cursor-pointer border-border/60 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', selected && 'queue-manager-row-selected')}
												>
													{row_getVisibleCells(row).map(cell => (
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
								</tbody>
							)
						})}
						{bottomVirtualPadding > 0 ? (
							<TableBody>
								<TableRow aria-hidden="true" className="border-0 hover:bg-transparent">
									<TableCell colSpan={renderedColumnCount} className="p-0" style={{height: bottomVirtualPadding}} />
								</TableRow>
							</TableBody>
						) : null}
					</>
				)}
			</Table>
		</div>
	)
}
