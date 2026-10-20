import {useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode} from 'react'
import {useTable, type ColumnOrderState, type ColumnVisibilityState, type SortingState, type Updater} from '@tanstack/react-table'
import {useVirtualizer} from '@tanstack/react-virtual'
import {arrayMove} from '@dnd-kit/sortable'
import {useTranslation} from 'react-i18next'
import {CirclePause} from 'lucide-react'
import type {QueueItem, QueueSelectionAction} from '@shared/types.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Alert, AlertAction, AlertTitle} from '../ui/alert.js'
import {Button} from '../ui/button.js'
import type {ListSelectionAction} from '../shared/listSelection.js'
import {useRowSelectionInteractions} from '../shared/useRowSelectionInteractions.js'
import {useWidthBreakpoint} from '../shared/useWidthBreakpoint.js'
import {DEFAULT_QUEUE_TABLE_PREFERENCES, isQueueTableColumnId, saveQueueTablePreferences, sanitizeQueueTablePreferences, type QueueTableColumnId, type QueueTablePreferences} from './queueTablePreferences.js'
import type {QueueColumnWidths} from './queueColumnWidths.js'
import {createQueueManagerState, queueManagerReducer} from './queueManagerState.js'
import {actionButtonDisabled, type QueueSelectedAction} from './queueManagerActions.js'
import {QueueManagerToolbar} from './QueueManagerToolbar.js'
import {QueueManagerTable} from './QueueManagerTable.js'
import {useQueueManagerColumns} from './useQueueManagerColumns.js'
import {useQueueItemsWithIds} from './useQueueItemsWithIds.js'
import {queueTableFeatures} from './queueTableFeatures.js'
import {Card} from '../ui/card.js'

// How long a row shown by a View command stays highlighted.
const FOCUS_HIGHLIGHT_MS = 2_400

const RESPONSIVE_COLUMN_HIDE_MAX_WIDTH: Partial<Record<QueueTableColumnId, number>> = {formatLabel: 820, outputDir: 1040, fileSize: 960, addedAt: 900, finishedAt: 900}
const RESPONSIVE_COLUMN_BREAKPOINTS = Object.values(RESPONSIVE_COLUMN_HIDE_MAX_WIDTH).filter(width => width !== undefined)

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
	if (typeof updater !== 'function') return updater
	const updaterFn = updater as (previous: T) => T
	return updaterFn(previous)
}

function isResponsiveRenderedColumn(columnId: QueueTableColumnId, viewportWidth: number): boolean {
	const hiddenMaxWidth = RESPONSIVE_COLUMN_HIDE_MAX_WIDTH[columnId]
	return hiddenMaxWidth === undefined || viewportWidth > hiddenMaxWidth
}
export function QueueManagerTab(): ReactNode {
	const {t} = useTranslation()
	const queue = useAppStore(state => state.queue)
	const schedulerPaused = useAppStore(state => state.schedulerPaused)
	const applyQueueSelectionAction = useAppStore(state => state.applyQueueSelectionAction)
	const changeQueueOutputTarget = useAppStore(state => state.changeQueueOutputTarget)
	const openItemFolder = useAppStore(state => state.openItemFolder)
	const pauseAll = useAppStore(state => state.pauseAll)
	const resumeAll = useAppStore(state => state.resumeAll)
	const cancelAll = useAppStore(state => state.cancelAll)
	const clearCompleted = useAppStore(state => state.clearCompleted)
	const autoRemoveCompleted = useAppStore(state => state.settings?.common.autoRemoveCompleted ?? false)
	const setAutoRemoveCompleted = useAppStore(state => state.setAutoRemoveCompleted)
	const cancelItemDownload = useAppStore(state => state.cancelItemDownload)
	const queueFocus = useAppStore(state => state.queueFocus)
	const clearQueueFocus = useAppStore(state => state.clearQueueFocus)
	const [highlightedId, setHighlightedId] = useState<string | null>(null)
	const [state, dispatch] = useReducer(queueManagerReducer, undefined, createQueueManagerState)
	const {filter, selection, expandedIds, tablePreferences} = state
	const widthBreakpoint = useWidthBreakpoint(RESPONSIVE_COLUMN_BREAKPOINTS)
	const {selectedIds, contextIds} = selection
	const dispatchSelection = useCallback((action: ListSelectionAction): void => {
		dispatch({type: 'selection', action})
	}, [])
	const scrollRef = useRef<HTMLDivElement>(null)

	const filteredQueue = useMemo(() => (filter === 'all' ? queue : queue.filter(item => item.status === filter)), [filter, queue])
	// The scheduler-pause flag has no per-item symptom (pending rows simply stay
	// "Waiting"), so the banner is the only feedback surface — show it while the
	// queue is globally paused and anything is actually waiting for it.
	const hasWaitingItems = useMemo(() => queue.some(item => item.status === QUEUE_STATUS.pending), [queue])
	const selectedItems = useQueueItemsWithIds(queue, selectedIds)
	const selectedIdList = useMemo(() => selectedItems.map(item => item.id), [selectedItems])
	// Set lookup instead of `.includes` — contextIds can be the whole
	// selection, and queue can be large, so this scans per rendered item
	// otherwise (same concern as the playlist-profiles table's contextIdSet).
	const contextIdSet = useMemo(() => new Set(contextIds), [contextIds])
	const contextItems = useQueueItemsWithIds(queue, contextIdSet)
	useEffect(() => {
		dispatch({type: 'prune-ids', liveIds: new Set(queue.map(item => item.id))})
	}, [queue])

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

	const toggleExpanded = useCallback((itemId: string): void => {
		dispatch({type: 'toggle-expanded', itemId})
	}, [])

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
		(updater: Updater<ColumnVisibilityState>): void => {
			updateTablePreferences(previous => ({...previous, columnVisibility: resolveUpdater(updater, previous.columnVisibility)}))
		},
		[updateTablePreferences]
	)

	const setColumnWidths = useCallback(
		(columnWidths: QueueColumnWidths): void => {
			updateTablePreferences(previous => ({...previous, columnWidths}))
		},
		[updateTablePreferences]
	)

	const moveColumn = useCallback(
		(columnId: QueueTableColumnId, targetId: QueueTableColumnId): void => {
			updateTablePreferences(previous => ({...previous, columnOrder: arrayMove(previous.columnOrder, previous.columnOrder.indexOf(columnId), previous.columnOrder.indexOf(targetId))}))
		},
		[updateTablePreferences]
	)

	// Sorting is a view choice, not layout, so a reset keeps it.
	const resetColumns = useCallback((): void => {
		updateTablePreferences(previous => ({...DEFAULT_QUEUE_TABLE_PREFERENCES, sorting: previous.sorting}))
	}, [updateTablePreferences])

	const cancelProbing = useCallback((itemId: string): void => void cancelItemDownload(itemId), [cancelItemDownload])
	const columns = useQueueManagerColumns({expandedIds, onToggleExpanded: toggleExpanded, onCancelProbing: cancelProbing, t})

	const table = useTable({
		features: queueTableFeatures,
		data: filteredQueue,
		columns,
		getRowId: item => item.id,
		onColumnOrderChange: setColumnOrder,
		onColumnVisibilityChange: setColumnVisibility,
		onSortingChange: setSorting,
		state: {columnOrder: tablePreferences.columnOrder, columnVisibility: tablePreferences.columnVisibility, sorting: tablePreferences.sorting}
	})
	const rows = table.getRowModel().rows
	const orderedRowIds = useMemo(() => rows.map(row => row.original.id), [rows])
	const interactions = useRowSelectionInteractions({orderedIds: orderedRowIds, selection, dispatch: dispatchSelection})
	// TanStack Virtual returns function-bearing objects that React Compiler cannot safely memoize.
	// oxlint-disable-next-line react-hooks-js/incompatible-library
	const rowVirtualizer = useVirtualizer({count: rows.length, getScrollElement: () => scrollRef.current, estimateSize: () => 62, overscan: 8})
	const virtualRows = rowVirtualizer.getVirtualItems()
	const firstVirtualRow = virtualRows[0]
	const lastVirtualRow = virtualRows.at(-1)
	const topVirtualPadding = firstVirtualRow?.start ?? 0
	const bottomVirtualPadding = Math.max(0, rowVirtualizer.getTotalSize() - (lastVirtualRow?.start ?? 0) - (lastVirtualRow?.size ?? 0))
	// A View command: clear a filter that hides its row, scroll to it,
	// highlight it, and consume the command. A row gone from the queue
	// (cancelled meanwhile) spends the command instead.
	useEffect(() => {
		if (!queueFocus) return
		const index = rows.findIndex(row => row.original.id === queueFocus.itemId)
		if (index < 0) {
			if (!queue.some(item => item.id === queueFocus.itemId)) clearQueueFocus(queueFocus.seq)
			else if (filter !== 'all') dispatch({type: 'set-filter', filter: 'all'})
			return
		}
		rowVirtualizer.scrollToIndex(index, {align: 'center'})
		setHighlightedId(queueFocus.itemId)
		clearQueueFocus(queueFocus.seq)
	}, [clearQueueFocus, filter, queue, queueFocus, rowVirtualizer, rows])

	useEffect(() => {
		if (!highlightedId) return undefined
		const timeout = window.setTimeout(() => setHighlightedId(null), FOCUS_HIGHLIGHT_MS)
		return () => window.clearTimeout(timeout)
	}, [highlightedId])

	const selectedCount = selectedItems.length
	const visibleColumns = table.getVisibleLeafColumns()
	const renderedColumnIds = visibleColumns
		.map(column => column.id)
		.filter(isQueueTableColumnId)
		.filter(columnId => isResponsiveRenderedColumn(columnId, widthBreakpoint))
	const renderedColumnCount = Math.max(1, renderedColumnIds.length)

	return (
		<Card variant="glass" render={<section />} className="min-h-[28rem] w-full flex-1 gap-0 p-3" data-testid="queue-manager-tab">
			<QueueManagerToolbar
				t={t}
				queue={queue}
				selectedItems={selectedItems}
				selectedCount={selectedCount}
				filter={filter}
				columns={table.getAllLeafColumns()}
				onFilterChange={filter => dispatch({type: 'set-filter', filter})}
				onSelectedAction={action => runSelectedAction(action)}
				schedulerPaused={schedulerPaused}
				onPauseAll={() => void pauseAll()}
				onResumeAll={() => void resumeAll()}
				onCancelAll={() => void cancelAll()}
				onClearCompleted={() => void clearCompleted()}
				autoRemoveCompleted={autoRemoveCompleted}
				onAutoRemoveCompletedChange={enabled => void setAutoRemoveCompleted(enabled)}
				onResetColumns={resetColumns}
			/>

			{schedulerPaused && hasWaitingItems && (
				<Alert variant="warning" className="mb-2" data-testid="queue-paused-banner">
					<CirclePause aria-hidden />
					<AlertTitle>{t('queue.pausedBanner')}</AlertTitle>
					<AlertAction>
						<Button type="button" variant="outline" size="xs" data-testid="queue-resume-from-banner" onClick={() => void resumeAll()}>
							{t('queue.resumeQueueAction')}
						</Button>
					</AlertAction>
				</Alert>
			)}

			<QueueManagerTable
				t={t}
				table={table}
				rows={rows}
				virtualRows={virtualRows}
				scrollRef={scrollRef}
				topVirtualPadding={topVirtualPadding}
				bottomVirtualPadding={bottomVirtualPadding}
				renderedColumnCount={renderedColumnCount}
				renderedColumnIds={renderedColumnIds}
				columnWidths={tablePreferences.columnWidths}
				onColumnWidthsChange={setColumnWidths}
				onMoveColumn={moveColumn}
				contextItems={contextItems}
				expandedIds={expandedIds}
				selectedIds={selectedIds}
				interactions={interactions}
				highlightedId={highlightedId}
				onContextAction={runSelectedAction}
			/>
		</Card>
	)
}
