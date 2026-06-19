import {useCallback, useEffect, useMemo, useReducer, useRef, type MouseEvent, type PointerEvent, type ReactNode} from 'react'
import {getCoreRowModel, getSortedRowModel, useReactTable, type ColumnOrderState, type Row, type SortingState, type Updater, type VisibilityState} from '@tanstack/react-table'
import {useVirtualizer} from '@tanstack/react-virtual'
import {useTranslation} from 'react-i18next'
import type {QueueItem, QueueSelectionAction} from '@shared/types.js'
import {useAppStore} from '../../store/useAppStore.js'
import {saveQueueTablePreferences, sanitizeQueueTablePreferences, type QueueTableColumnId, type QueueTablePreferences} from './queueTablePreferences.js'
import {createQueueManagerState, currentViewportWidth, queueManagerReducer} from './queueManagerState.js'
import {COLUMN_LABEL_KEYS, actionButtonDisabled, type QueueSelectedAction} from './queueManagerActions.js'
import {QueueManagerToolbar} from './QueueManagerToolbar.js'
import {QueueManagerTable} from './QueueManagerTable.js'
import {useQueueManagerColumns} from './useQueueManagerColumns.js'

const RESPONSIVE_COLUMN_HIDE_MAX_WIDTH: Partial<Record<QueueTableColumnId, number>> = {formatLabel: 820, outputDir: 1040, addedAt: 900, finishedAt: 900}

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
	if (typeof updater !== 'function') return updater
	const updaterFn = updater as (previous: T) => T
	return updaterFn(previous)
}
function visibleRangeIds(rows: ReadonlyArray<Row<QueueItem>>, anchorId: string, itemId: string): string[] {
	const anchorIndex = rows.findIndex(row => row.original.id === anchorId)
	const itemIndex = rows.findIndex(row => row.original.id === itemId)
	if (anchorIndex === -1 || itemIndex === -1) return [itemId]
	const start = Math.min(anchorIndex, itemIndex)
	const end = Math.max(anchorIndex, itemIndex)
	return rows.slice(start, end + 1).map(row => row.original.id)
}

function isQueueTableColumnId(columnId: string): columnId is QueueTableColumnId {
	return columnId in COLUMN_LABEL_KEYS
}

function isResponsiveRenderedColumn(columnId: string, viewportWidth: number): boolean {
	if (!isQueueTableColumnId(columnId)) return true
	const hiddenMaxWidth = RESPONSIVE_COLUMN_HIDE_MAX_WIDTH[columnId]
	return hiddenMaxWidth === undefined || viewportWidth > hiddenMaxWidth
}
export function QueueManagerTab(): ReactNode {
	const {t} = useTranslation()
	const queue = useAppStore(state => state.queue)
	const applyQueueSelectionAction = useAppStore(state => state.applyQueueSelectionAction)
	const changeQueueOutputTarget = useAppStore(state => state.changeQueueOutputTarget)
	const openItemFolder = useAppStore(state => state.openItemFolder)
	const pauseAll = useAppStore(state => state.pauseAll)
	const resumeAll = useAppStore(state => state.resumeAll)
	const cancelAll = useAppStore(state => state.cancelAll)
	const clearCompleted = useAppStore(state => state.clearCompleted)
	const [state, dispatch] = useReducer(queueManagerReducer, undefined, createQueueManagerState)
	const {filter, selectedIds, expandedIds, contextIds, tablePreferences, viewportWidth} = state
	const selectionAnchorIdRef = useRef<string | null>(null)
	const dragAnchorIdRef = useRef<string | null>(null)
	const dragMovedRef = useRef(false)
	const dragSelectingRef = useRef(false)
	const suppressNextClickRef = useRef(false)
	const scrollRef = useRef<HTMLDivElement>(null)

	const filteredQueue = useMemo(() => (filter === 'all' ? queue : queue.filter(item => item.status === filter)), [filter, queue])
	const selectedItems = useMemo(() => queue.filter(item => selectedIds.has(item.id)), [queue, selectedIds])
	const selectedIdList = useMemo(() => selectedItems.map(item => item.id), [selectedItems])
	const contextItems = useMemo(() => queue.filter(item => contextIds.includes(item.id)), [contextIds, queue])
	useEffect(() => {
		const liveIds = new Set(queue.map(item => item.id))
		dispatch({type: 'prune-ids', liveIds})
		if (selectionAnchorIdRef.current && !liveIds.has(selectionAnchorIdRef.current)) selectionAnchorIdRef.current = null
	}, [queue])

	useEffect(() => {
		const updateViewportWidth = (): void => {
			dispatch({type: 'set-viewport-width', viewportWidth: currentViewportWidth()})
		}
		window.addEventListener('resize', updateViewportWidth)
		return () => {
			window.removeEventListener('resize', updateViewportWidth)
		}
	}, [])

	useEffect(() => {
		const stopDragSelection = (): void => {
			dragSelectingRef.current = false
			dragAnchorIdRef.current = null
			if (!dragMovedRef.current) return
			suppressNextClickRef.current = true
			dragMovedRef.current = false
			window.setTimeout(() => {
				suppressNextClickRef.current = false
			}, 0)
		}
		window.addEventListener('pointerup', stopDragSelection)
		window.addEventListener('blur', stopDragSelection)
		return () => {
			window.removeEventListener('pointerup', stopDragSelection)
			window.removeEventListener('blur', stopDragSelection)
		}
	}, [])

	const runSelectionAction = useCallback(
		(action: QueueSelectionAction, ids = selectedIdList): void => {
			if (ids.length === 0) return
			void applyQueueSelectionAction(action, ids)
		},
		[applyQueueSelectionAction, selectedIdList]
	)

	const changeOutputTargetForItems = useCallback(
		async (items: QueueItem[]): Promise<void> => {
			if (items.length === 0) return
			const result = await window.appApi.dialog.chooseFolder(items[0]?.outputDir)
			if (!result.ok || !result.data.path) return
			await changeQueueOutputTarget(
				items.map(item => item.id),
				result.data.path
			)
		},
		[changeQueueOutputTarget]
	)

	const openDestinationFolderForItems = useCallback(
		(items: QueueItem[]): void => {
			const item = items[0]
			if (!item) return
			void openItemFolder(item.id)
		},
		[openItemFolder]
	)

	const runSelectedAction = useCallback(
		(action: QueueSelectedAction, items = selectedItems): void => {
			if (actionButtonDisabled(action, items)) return
			if (action === 'copy-link') {
				const links = items.flatMap(item => {
					const link = item.url.trim()
					return link ? [link] : []
				})
				if (links.length > 0) void navigator.clipboard.writeText(links.join('\n'))
				return
			}
			if (action === 'open-destination-folder') {
				openDestinationFolderForItems(items)
				return
			}
			if (action === 'change-output-target') {
				void changeOutputTargetForItems(items)
				return
			}
			runSelectionAction(
				action,
				items.map(item => item.id)
			)
		},
		[changeOutputTargetForItems, openDestinationFolderForItems, runSelectionAction, selectedItems]
	)

	const replaceSelection = useCallback((itemId: string): void => {
		dispatch({type: 'replace-selection', itemId})
		selectionAnchorIdRef.current = itemId
	}, [])

	const toggleSelected = useCallback((itemId: string): void => {
		dispatch({type: 'toggle-selection', itemId})
		selectionAnchorIdRef.current = itemId
	}, [])

	const toggleExpanded = useCallback((itemId: string): void => {
		dispatch({type: 'toggle-expanded', itemId})
	}, [])

	const openContextMenuForRow = useCallback(
		(itemId: string): void => {
			if (selectedIds.has(itemId)) {
				dispatch({type: 'set-context-ids', ids: selectedIdList})
				return
			}
			replaceSelection(itemId)
			dispatch({type: 'set-context-ids', ids: [itemId]})
		},
		[replaceSelection, selectedIdList, selectedIds]
	)

	const updateTablePreferences = useCallback(
		(updater: (previous: QueueTablePreferences) => unknown): void => {
			const next = sanitizeQueueTablePreferences(updater(tablePreferences))
			saveQueueTablePreferences(next)
			dispatch({type: 'set-table-preferences', preferences: next})
		},
		[tablePreferences]
	)

	const setSorting = useCallback(
		(updater: Updater<SortingState>): void => {
			updateTablePreferences(previous => ({...previous, sorting: resolveUpdater(updater, previous.sorting)}))
		},
		[updateTablePreferences]
	)

	const setColumnOrder = useCallback(
		(updater: Updater<ColumnOrderState>): void => {
			updateTablePreferences(previous => ({...previous, columnOrder: resolveUpdater(updater, previous.columnOrder)}))
		},
		[updateTablePreferences]
	)

	const setColumnVisibility = useCallback(
		(updater: Updater<VisibilityState>): void => {
			updateTablePreferences(previous => ({...previous, columnVisibility: resolveUpdater(updater, previous.columnVisibility)}))
		},
		[updateTablePreferences]
	)

	const columns = useQueueManagerColumns({expandedIds, onToggleExpanded: toggleExpanded, t})

	// TanStack Table returns function-bearing objects that React Compiler cannot safely memoize.
	// oxlint-disable-next-line react-hooks-js/incompatible-library
	const table = useReactTable<QueueItem>({
		data: filteredQueue,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getRowId: item => item.id,
		onColumnOrderChange: setColumnOrder,
		onColumnVisibilityChange: setColumnVisibility,
		onSortingChange: setSorting,
		state: {columnOrder: tablePreferences.columnOrder, columnVisibility: tablePreferences.columnVisibility, sorting: tablePreferences.sorting}
	})
	const rows = table.getRowModel().rows
	const rowVirtualizer = useVirtualizer({count: rows.length, getScrollElement: () => scrollRef.current, estimateSize: () => 62, overscan: 8})
	const virtualRows = rowVirtualizer.getVirtualItems()
	const firstVirtualRow = virtualRows[0]
	const lastVirtualRow = virtualRows.at(-1)
	const topVirtualPadding = firstVirtualRow?.start ?? 0
	const bottomVirtualPadding = Math.max(0, rowVirtualizer.getTotalSize() - (lastVirtualRow?.start ?? 0) - (lastVirtualRow?.size ?? 0))
	const selectedCount = selectedItems.length
	const visibleColumns = table.getVisibleLeafColumns()
	const renderedColumnCount = Math.max(1, visibleColumns.filter(column => isResponsiveRenderedColumn(column.id, viewportWidth)).length)

	const selectRange = useCallback(
		(anchorId: string, itemId: string): void => {
			dispatch({type: 'set-selection', ids: visibleRangeIds(rows, anchorId, itemId)})
		},
		[rows]
	)

	const selectRowFromClick = useCallback(
		(itemId: string, event: MouseEvent<HTMLTableRowElement>): void => {
			if (suppressNextClickRef.current) {
				suppressNextClickRef.current = false
				return
			}
			if (event.shiftKey) {
				const anchorId = selectionAnchorIdRef.current ?? itemId
				selectRange(anchorId, itemId)
				selectionAnchorIdRef.current = anchorId
				return
			}
			if (event.ctrlKey || event.metaKey) {
				toggleSelected(itemId)
				return
			}
			replaceSelection(itemId)
		},
		[replaceSelection, selectRange, toggleSelected]
	)

	const selectRowFromKeyboard = useCallback(
		(itemId: string): void => {
			toggleSelected(itemId)
		},
		[toggleSelected]
	)

	const startRowDragSelection = useCallback((itemId: string, event: PointerEvent<HTMLTableRowElement>): void => {
		if (event.button !== 0) return
		dragSelectingRef.current = true
		dragMovedRef.current = false
		dragAnchorIdRef.current = itemId
	}, [])

	const extendRowDragSelection = useCallback(
		(itemId: string, event: PointerEvent<HTMLTableRowElement>): void => {
			if (!dragSelectingRef.current || (event.buttons & 1) !== 1) return
			const anchorId = dragAnchorIdRef.current
			if (!anchorId || (anchorId === itemId && !dragMovedRef.current)) return
			dragMovedRef.current = true
			selectRange(anchorId, itemId)
			selectionAnchorIdRef.current = anchorId
		},
		[selectRange]
	)

	return (
		<section className="glow-panel mx-auto flex min-h-[28rem] w-full max-w-[92rem] flex-col overflow-hidden rounded-[1.25rem] border-transparent p-3" data-testid="queue-manager-tab">
			<QueueManagerToolbar
				t={t}
				queue={queue}
				selectedItems={selectedItems}
				selectedCount={selectedCount}
				filter={filter}
				columns={table.getAllLeafColumns()}
				onFilterChange={filter => dispatch({type: 'set-filter', filter})}
				onSelectedAction={action => runSelectedAction(action)}
				onPauseAll={() => void pauseAll()}
				onResumeAll={() => void resumeAll()}
				onCancelAll={() => void cancelAll()}
				onClearCompleted={() => void clearCompleted()}
			/>

			<QueueManagerTable
				t={t}
				table={table}
				rows={rows}
				virtualRows={virtualRows}
				scrollRef={scrollRef}
				topVirtualPadding={topVirtualPadding}
				bottomVirtualPadding={bottomVirtualPadding}
				renderedColumnCount={renderedColumnCount}
				contextItems={contextItems}
				expandedIds={expandedIds}
				selectedIds={selectedIds}
				onContextAction={runSelectedAction}
				onContextMenu={openContextMenuForRow}
				onKeyboardToggle={selectRowFromKeyboard}
				onRowClick={selectRowFromClick}
				onRowPointerDown={startRowDragSelection}
				onRowPointerEnter={extendRowDragSelection}
			/>
		</section>
	)
}
