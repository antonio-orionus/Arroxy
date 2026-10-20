// @vitest-environment jsdom
import {act, renderHook} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {useOverflowCollapse} from '@renderer/components/shared/useOverflowCollapse.js'

// jsdom lays nothing out: the row's width and the clipped part's natural width
// are set by hand, and the ResizeObserver is fired by hand.
let notify: () => void = () => undefined

class FakeResizeObserver {
	observe = vi.fn()
	disconnect = vi.fn()
	constructor(callback: () => void) {
		notify = callback
	}
}

function sized(clientWidth: number, scrollWidth = clientWidth): HTMLElement {
	const element = document.createElement('div')
	Object.defineProperty(element, 'clientWidth', {configurable: true, value: clientWidth})
	Object.defineProperty(element, 'scrollWidth', {configurable: true, value: scrollWidth})
	return element
}

// Stable refs, as a component's useRef gives.
function refs(row: HTMLElement, clipped: HTMLElement): [{current: HTMLElement}, {current: HTMLElement}] {
	return [{current: row}, {current: clipped}]
}

function resize(element: HTMLElement, clientWidth: number, scrollWidth = clientWidth): void {
	Object.defineProperty(element, 'clientWidth', {configurable: true, value: clientWidth})
	Object.defineProperty(element, 'scrollWidth', {configurable: true, value: scrollWidth})
}

describe('useOverflowCollapse', () => {
	beforeEach(() => vi.stubGlobal('ResizeObserver', FakeResizeObserver))
	afterEach(() => vi.unstubAllGlobals())

	it('stays full while the clipped part shows all of its content', () => {
		const [row, clipped] = refs(sized(1000), sized(300))
		const {result} = renderHook(() => useOverflowCollapse(row, clipped, 'en'))
		expect(result.current).toBe(false)
	})

	it('collapses when the clipped part overflows, and expands once the row is as wide as the full form needs', () => {
		const row = sized(700)
		const clipped = sized(150, 380)
		const [rowRef, clippedRef] = refs(row, clipped)
		const {result} = renderHook(() => useOverflowCollapse(rowRef, clippedRef, 'fr'))
		expect(result.current).toBe(true)

		// Collapsed, the clipped part fits; a little wider is still short of the 930px the full form needed.
		resize(clipped, 380)
		resize(row, 900)
		act(() => notify())
		expect(result.current).toBe(true)

		resize(row, 930)
		act(() => notify())
		expect(result.current).toBe(false)
	})

	it('collapses again if the recorded width turns out short', () => {
		const row = sized(700)
		const clipped = sized(150, 380)
		const [rowRef, clippedRef] = refs(row, clipped)
		const {result} = renderHook(() => useOverflowCollapse(rowRef, clippedRef, 'fr'))
		resize(row, 930)
		act(() => notify())
		expect(result.current).toBe(false)

		resize(clipped, 200, 240)
		act(() => notify())
		expect(result.current).toBe(true)
	})

	it('measures from scratch when the reset key changes', () => {
		const row = sized(700)
		const clipped = sized(150, 380)
		const [rowRef, clippedRef] = refs(row, clipped)
		const {result, rerender} = renderHook(({key}) => useOverflowCollapse(rowRef, clippedRef, key), {initialProps: {key: 'fr'}})
		expect(result.current).toBe(true)

		resize(clipped, 300)
		rerender({key: 'en'})
		expect(result.current).toBe(false)
	})
})
