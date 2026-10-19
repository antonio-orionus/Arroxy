import {useCallback, useSyncExternalStore} from 'react'

function maxWidthQuery(breakpoint: number): string {
	return `(max-width: ${breakpoint}px)`
}

/**
 * The smallest of `breakpoints` the viewport is at or below, or Infinity when
 * it is wider than all of them. For any listed breakpoint `b`,
 * `width > b` equals `result > b`, so callers compare as if against the real
 * width while React re-renders only when a breakpoint is crossed, not on every
 * resize. Pass a stable (module-level) array.
 */
export function useWidthBreakpoint(breakpoints: readonly number[]): number {
	const subscribe = useCallback(
		(onChange: () => void): (() => void) => {
			const lists = breakpoints.map(breakpoint => window.matchMedia(maxWidthQuery(breakpoint)))
			for (const list of lists) list.addEventListener('change', onChange)
			return () => {
				for (const list of lists) list.removeEventListener('change', onChange)
			}
		},
		[breakpoints]
	)
	const getSnapshot = useCallback((): number => Math.min(...breakpoints.filter(breakpoint => window.matchMedia(maxWidthQuery(breakpoint)).matches)), [breakpoints])
	return useSyncExternalStore(subscribe, getSnapshot, () => Number.POSITIVE_INFINITY)
}
