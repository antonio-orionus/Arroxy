// Pointer and keyboard gestures for a selectable list: click to replace,
// modifier-click to toggle, shift-click to extend, and drag across rows to
// sweep a range. Extracted from the queue tab so the playlist profile step
// gets the same behavior without a second implementation.

import {useCallback, useEffect, useRef, type MouseEvent, type PointerEvent} from 'react'
import {rangeIds, type ListSelectionAction, type ListSelectionState} from './listSelection.js'

export interface RowSelectionInteractions {
	onRowClick: (id: string, event: MouseEvent<HTMLElement>) => void
	onRowPointerDown: (id: string, event: PointerEvent<HTMLElement>) => void
	onRowPointerEnter: (id: string, event: PointerEvent<HTMLElement>) => void
	onKeyboardToggle: (id: string) => void
	openContextMenuForRow: (id: string) => void
}

export interface RowSelectionInteractionsParams {
	orderedIds: readonly string[]
	selection: ListSelectionState
	dispatch: (action: ListSelectionAction) => void
}

export function useRowSelectionInteractions({orderedIds, selection, dispatch}: RowSelectionInteractionsParams): RowSelectionInteractions {
	const dragAnchorIdRef = useRef<string | null>(null)
	const dragMovedRef = useRef(false)
	const dragSelectingRef = useRef(false)
	const suppressNextClickRef = useRef(false)

	useEffect(() => {
		const stopDragSelection = (): void => {
			dragSelectingRef.current = false
			dragAnchorIdRef.current = null
			if (!dragMovedRef.current) return
			// A drag ends with a click event on the row under the cursor. Swallow
			// exactly one so releasing the mouse does not collapse the sweep.
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

	const selectRange = useCallback(
		(anchorId: string, id: string): void => {
			dispatch({type: 'set', ids: rangeIds(orderedIds, anchorId, id), anchorId})
		},
		[dispatch, orderedIds]
	)

	const onRowClick = useCallback(
		(id: string, event: MouseEvent<HTMLElement>): void => {
			if (suppressNextClickRef.current) {
				suppressNextClickRef.current = false
				return
			}
			if (event.shiftKey) {
				selectRange(selection.anchorId ?? id, id)
				return
			}
			if (event.ctrlKey || event.metaKey) {
				dispatch({type: 'toggle', id})
				return
			}
			dispatch({type: 'replace', id})
		},
		[dispatch, selectRange, selection.anchorId]
	)

	const onRowPointerDown = useCallback((id: string, event: PointerEvent<HTMLElement>): void => {
		if (event.button !== 0) return
		dragSelectingRef.current = true
		dragMovedRef.current = false
		dragAnchorIdRef.current = id
	}, [])

	const onRowPointerEnter = useCallback(
		(id: string, event: PointerEvent<HTMLElement>): void => {
			if (!dragSelectingRef.current || (event.buttons & 1) !== 1) return
			const anchorId = dragAnchorIdRef.current
			if (!anchorId || (anchorId === id && !dragMovedRef.current)) return
			dragMovedRef.current = true
			selectRange(anchorId, id)
		},
		[selectRange]
	)

	const onKeyboardToggle = useCallback(
		(id: string): void => {
			dispatch({type: 'toggle', id})
		},
		[dispatch]
	)

	const openContextMenuForRow = useCallback(
		(id: string): void => {
			if (selection.selectedIds.has(id)) {
				dispatch({type: 'context', ids: [...selection.selectedIds]})
				return
			}
			dispatch({type: 'replace', id})
			dispatch({type: 'context', ids: [id]})
		},
		[dispatch, selection.selectedIds]
	)

	return {onRowClick, onRowPointerDown, onRowPointerEnter, onKeyboardToggle, openContextMenuForRow}
}
