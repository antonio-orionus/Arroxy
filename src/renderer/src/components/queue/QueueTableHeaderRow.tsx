// The Downloads tab header row: drag a header (or pick it up with Space/Enter
// and the arrow keys) to move its column, drag a header's end edge (or focus
// it and press the arrow keys) to resize it against its right neighbour.
//
// Only the rendered columns get a header: the ones the window is too narrow
// for are left out, as their body cells are hidden.

import {useCallback, useRef, useState, type PointerEvent, type KeyboardEvent, type ReactNode, type RefObject} from 'react'
import {DndContext, PointerSensor, closestCenter, useSensor, useSensors, type Announcements, type ClientRect, type DragEndEvent, type KeyboardCoordinateGetter, type Modifier, type UniqueIdentifier} from '@dnd-kit/core'
import {SortableContext, horizontalListSortingStrategy, useSortable} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import {flexRender, type Header} from '@tanstack/react-table'
import type {TFunction} from 'i18next'
import type {QueueItem} from '@shared/types.js'
import {KeyboardSortSensor} from '@renderer/lib/keyboardSortSensor.js'
import {cn} from '@renderer/lib/utils.js'
import {TableHead, TableRow} from '../ui/table.js'
import {SectionLabel} from '../shared/SectionLabel.js'
import {COLUMN_LABEL_KEYS} from './queueManagerActions.js'
import {columnWidthPercents, resizeColumnPair, type QueueColumnWidths} from './queueColumnWidths.js'
import {isQueueTableColumnId, type QueueTableColumnId} from './queueTablePreferences.js'
import type {QueueTableFeatures} from './queueTableFeatures.js'

// One arrow press moves a column edge this far.
const KEYBOARD_RESIZE_STEP_PX = 16

const restrictToHorizontalAxis: Modifier = ({transform}) => ({...transform, y: 0})

const ARROW_CODES = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'])

const centerX = (rect: ClientRect): number => rect.left + rect.width / 2

// Moves a picked-up header one column the way the arrow points on screen, by
// centring it on that neighbour. dnd-kit's sortableKeyboardCoordinates aligns
// edges and assumes later columns sit to the right, so in a right-to-left
// table a wide column overshoots a narrow neighbour.
const horizontalKeyboardCoordinates: KeyboardCoordinateGetter = (event, {context: {collisionRect, droppableRects, droppableContainers}}) => {
	if (!ARROW_CODES.has(event.code)) return undefined
	event.preventDefault()
	if (!collisionRect || (event.code !== 'ArrowLeft' && event.code !== 'ArrowRight')) return undefined
	const step = event.code === 'ArrowRight' ? 1 : -1
	const distance = (rect: ClientRect): number => (centerX(rect) - centerX(collisionRect)) * step
	let target: ClientRect | undefined
	for (const container of droppableContainers.getEnabled()) {
		const rect = droppableRects.get(container.id)
		// Past a pixel, so the column it is already over does not count.
		if (rect && distance(rect) > 1 && (!target || distance(rect) < distance(target))) target = rect
	}
	return target ? {x: centerX(target) - collisionRect.width / 2, y: collisionRect.top} : undefined
}

interface QueueTableHeaderRowProps {
	t: TFunction
	headers: Header<QueueTableFeatures, QueueItem, unknown>[]
	// In display order.
	renderedColumnIds: readonly QueueTableColumnId[]
	columnWidths: QueueColumnWidths
	columnClassName: (columnId: string) => string
	onColumnWidthsChange: (widths: QueueColumnWidths) => void
	onMoveColumn: (columnId: QueueTableColumnId, targetId: QueueTableColumnId) => void
}

export function QueueTableHeaderRow({t, headers, renderedColumnIds, columnWidths, columnClassName, onColumnWidthsChange, onMoveColumn}: QueueTableHeaderRowProps): ReactNode {
	// A pointer resize previews here and is saved once, on release.
	const [draftWidths, setDraftWidths] = useState<QueueColumnWidths | null>(null)
	const percents = columnWidthPercents(renderedColumnIds, draftWidths ?? columnWidths)
	// A drop that ends over the header it started on would also click its sort button.
	const suppressClickRef = useRef(false)
	const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 6}}), useSensor(KeyboardSortSensor, {coordinateGetter: horizontalKeyboardCoordinates}))

	const columnLabel = (id: UniqueIdentifier): string => (isQueueTableColumnId(id) ? t(COLUMN_LABEL_KEYS[id]) : String(id))
	const announcements: Announcements = {
		onDragStart: ({active}) => t('queue.table.columnPickedUp', {column: columnLabel(active.id)}),
		onDragOver: ({active, over}) => (over ? t('queue.table.columnMovedOver', {column: columnLabel(active.id), target: columnLabel(over.id)}) : undefined),
		onDragEnd: ({active}) => t('queue.table.columnDropped', {column: columnLabel(active.id)}),
		onDragCancel: ({active}) => t('queue.table.columnMoveCancelled', {column: columnLabel(active.id)})
	}

	const endDrag = (): void => {
		suppressClickRef.current = true
		window.setTimeout(() => {
			suppressClickRef.current = false
		}, 0)
	}
	const onDragEnd = ({active, over}: DragEndEvent): void => {
		endDrag()
		if (over && active.id !== over.id && isQueueTableColumnId(active.id) && isQueueTableColumnId(over.id)) onMoveColumn(active.id, over.id)
	}

	const resized = (left: QueueTableColumnId, right: QueueTableColumnId, deltaPx: number, tableWidthPx: number): QueueColumnWidths => resizeColumnPair({widths: columnWidths, renderedIds: renderedColumnIds, left, right, deltaPx, tableWidthPx})

	// The screen-reader text is a pair of <div>s, which cannot sit inside <thead>.
	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToHorizontalAxis]} accessibility={{announcements, screenReaderInstructions: {draggable: t('queue.table.moveColumnInstructions')}, container: document.body}} onDragEnd={onDragEnd} onDragCancel={endDrag}>
			<TableRow className="hover:bg-transparent">
				<SortableContext items={[...renderedColumnIds]} strategy={horizontalListSortingStrategy}>
					{renderedColumnIds.map((columnId, index) => {
						const header = headers.find(candidate => candidate.column.id === columnId)
						if (!header) return null
						const right = renderedColumnIds[index + 1]
						return (
							<SortableHeaderCell key={header.id} t={t} columnId={columnId} label={columnLabel(columnId)} widthPercent={percents[columnId] ?? 0} className={columnClassName(columnId)} suppressClickRef={suppressClickRef}>
								{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
								{right ? (
									<ColumnResizeHandle
										label={t('queue.table.resizeColumn', {column: columnLabel(columnId)})}
										widthPercent={percents[columnId] ?? 0}
										onPreview={(deltaPx, tableWidthPx) => setDraftWidths(resized(columnId, right, deltaPx, tableWidthPx))}
										onCommit={(deltaPx, tableWidthPx) => {
											setDraftWidths(null)
											onColumnWidthsChange(resized(columnId, right, deltaPx, tableWidthPx))
										}}
										onCancel={() => setDraftWidths(null)}
									/>
								) : null}
							</SortableHeaderCell>
						)
					})}
				</SortableContext>
			</TableRow>
		</DndContext>
	)
}

function SortableHeaderCell({t, columnId, label, widthPercent, className, suppressClickRef, children}: {t: TFunction; columnId: QueueTableColumnId; label: string; widthPercent: number; className: string; suppressClickRef: RefObject<boolean>; children: ReactNode}): ReactNode {
	const {attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging} = useSortable({id: columnId, attributes: {role: 'columnheader', roleDescription: t('queue.table.movableColumn')}})
	// The header is also the keyboard activator: without one, Space or Enter on
	// its sort button would pick the column up instead of sorting.
	const setHeaderRef = useCallback(
		(node: HTMLTableCellElement | null): void => {
			setNodeRef(node)
			setActivatorNodeRef(node)
		},
		[setNodeRef, setActivatorNodeRef]
	)
	return (
		<SectionLabel
			render={<TableHead ref={setHeaderRef} />}
			{...attributes}
			{...listeners}
			style={{width: `${widthPercent}%`, transform: CSS.Translate.toString(transform), transition}}
			onClickCapture={event => {
				if (!suppressClickRef.current) return
				event.preventDefault()
				event.stopPropagation()
			}}
			className={cn('group/head relative cursor-grab px-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset', isDragging && 'z-20 cursor-grabbing bg-card shadow-md', className)}
			// Named explicitly: from content, the name would also take in the resize handle's label.
			aria-label={label}
			data-column-id={columnId}
		>
			{children}
		</SectionLabel>
	)
}

interface PointerResize {
	pointerId: number
	startX: number
	direction: 1 | -1
	tableWidthPx: number
}

// Width deltas run in reading direction, so in a right-to-left table a
// column's end edge is its left one.
function measure(handle: HTMLElement): Pick<PointerResize, 'direction' | 'tableWidthPx'> {
	return {direction: getComputedStyle(handle).direction === 'rtl' ? -1 : 1, tableWidthPx: handle.closest('table')?.getBoundingClientRect().width ?? 0}
}

function ColumnResizeHandle({label, widthPercent, onPreview, onCommit, onCancel}: {label: string; widthPercent: number; onPreview: (deltaPx: number, tableWidthPx: number) => void; onCommit: (deltaPx: number, tableWidthPx: number) => void; onCancel: () => void}): ReactNode {
	const resizeRef = useRef<PointerResize | null>(null)
	const delta = (event: PointerEvent<HTMLDivElement>, resize: PointerResize): number => (event.clientX - resize.startX) * resize.direction

	const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
		event.preventDefault()
		event.stopPropagation()
		const {direction, tableWidthPx} = measure(event.currentTarget)
		onCommit((event.key === 'ArrowRight' ? 1 : -1) * direction * KEYBOARD_RESIZE_STEP_PX, tableWidthPx)
	}

	return (
		<div
			role="separator"
			aria-orientation="vertical"
			aria-label={label}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(widthPercent)}
			tabIndex={0}
			className="absolute inset-y-0 -end-1 z-10 flex w-2 cursor-col-resize touch-none justify-center select-none after:h-full after:w-px after:bg-transparent after:transition-colors group-hover/head:after:bg-border hover:after:bg-primary focus-visible:outline-none focus-visible:after:bg-primary"
			onPointerDown={event => {
				if (event.button !== 0) return
				// Keeps the header from starting a column move.
				event.stopPropagation()
				event.preventDefault()
				event.currentTarget.setPointerCapture?.(event.pointerId)
				resizeRef.current = {pointerId: event.pointerId, startX: event.clientX, ...measure(event.currentTarget)}
			}}
			onPointerMove={event => {
				const resize = resizeRef.current
				if (resize?.pointerId === event.pointerId) onPreview(delta(event, resize), resize.tableWidthPx)
			}}
			onPointerUp={event => {
				const resize = resizeRef.current
				if (resize?.pointerId !== event.pointerId) return
				resizeRef.current = null
				onCommit(delta(event, resize), resize.tableWidthPx)
			}}
			onPointerCancel={() => {
				resizeRef.current = null
				onCancel()
			}}
			onKeyDown={onKeyDown}
			onClick={event => event.stopPropagation()}
		/>
	)
}
