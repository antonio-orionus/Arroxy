import {useLayoutEffect, useRef, useState, type RefObject} from 'react'

/**
 * Whether a row should drop to its compact form because its `clipped` part
 * (an `overflow-hidden` flex child) cannot show all of its content beside the
 * rest. It measures rather than using a breakpoint, since the width the full
 * form needs differs per locale.
 *
 * On collapsing it records the row width the full form needs, and expands
 * again once the row is that wide. If that record turns out short, the
 * expanded row overflows and collapses again with a fresh one. A change of
 * `resetKey` (language, an outside compact mode) measures from scratch.
 */
export function useOverflowCollapse(row: RefObject<HTMLElement | null>, clipped: RefObject<HTMLElement | null>, resetKey: string): boolean {
	const [collapsed, setCollapsed] = useState(false)
	const collapsedRef = useRef(false)
	const neededWidth = useRef(0)

	useLayoutEffect(() => {
		const rowElement = row.current
		const clippedElement = clipped.current
		if (!rowElement || !clippedElement || typeof ResizeObserver === 'undefined') return
		const apply = (next: boolean): void => {
			collapsedRef.current = next
			setCollapsed(next)
		}
		const check = (): void => {
			if (!collapsedRef.current) {
				const overflow = clippedElement.scrollWidth - clippedElement.clientWidth
				if (overflow <= 1) return
				neededWidth.current = rowElement.clientWidth + overflow
				apply(true)
			} else if (rowElement.clientWidth >= neededWidth.current) {
				apply(false)
			}
		}
		apply(false)
		const observer = new ResizeObserver(check)
		// The row resizes with the window; its children with
		// their labels; the clipped part's own children with theirs.
		for (const element of [rowElement, ...rowElement.children, ...clippedElement.querySelectorAll('*')]) observer.observe(element)
		check()
		return () => observer.disconnect()
	}, [row, clipped, resetKey])

	return collapsed
}
