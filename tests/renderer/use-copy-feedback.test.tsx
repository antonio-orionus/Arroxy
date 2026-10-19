import {act, renderHook} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {useCopyFeedback} from '@renderer/components/shared/useCopyFeedback.js'

describe('useCopyFeedback', () => {
	beforeEach(() => vi.useFakeTimers())
	afterEach(() => vi.useRealTimers())

	it('shows the copied key until the delay passes', () => {
		const {result} = renderHook(() => useCopyFeedback<'btc' | 'eth'>(1500))
		expect(result.current.copied).toBeNull()

		act(() => result.current.markCopied('btc'))
		expect(result.current.copied).toBe('btc')

		act(() => {
			vi.advanceTimersByTime(1499)
		})
		expect(result.current.copied).toBe('btc')
		act(() => {
			vi.advanceTimersByTime(1)
		})
		expect(result.current.copied).toBeNull()
	})

	it('restarts the delay when another copy lands first', () => {
		const {result} = renderHook(() => useCopyFeedback<'btc' | 'eth'>(1500))
		act(() => result.current.markCopied('btc'))
		act(() => {
			vi.advanceTimersByTime(1000)
		})
		act(() => result.current.markCopied('eth'))
		act(() => {
			vi.advanceTimersByTime(1000)
		})
		expect(result.current.copied).toBe('eth')
		act(() => {
			vi.advanceTimersByTime(500)
		})
		expect(result.current.copied).toBeNull()
	})

	it('clears at once on reset and leaves no timer behind', () => {
		const {result} = renderHook(() => useCopyFeedback(1500))
		act(() => result.current.markCopied(true))
		act(() => result.current.reset())
		expect(result.current.copied).toBeNull()
		expect(vi.getTimerCount()).toBe(0)
	})

	it('clears its timer on unmount', () => {
		const {result, unmount} = renderHook(() => useCopyFeedback(2000))
		act(() => result.current.markCopied(true))
		expect(vi.getTimerCount()).toBe(1)
		unmount()
		expect(vi.getTimerCount()).toBe(0)
	})
})
