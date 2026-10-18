import {act, render, renderHook} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {useQueueTabTip} from '@renderer/components/wizard/homeTabRoute.js'
import {QueueTabFirstRunCue} from '@renderer/components/wizard/DownloadHomeTabs.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {makeItem} from '../shared/fixtures.js'

describe('queue tab first-run cue', () => {
	beforeEach(() => {
		localStorage.clear()
		useAppStore.setState({queue: [makeItem({id: 'queued-video', status: 'pending'})]})
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('hands out the same dismiss callback on every render', () => {
		const {result, rerender} = renderHook(() => useQueueTabTip({activeTab: 'download', initialBrowserMockScenario: null}))
		const first = result.current.dismissQueueTabTip

		rerender()
		act(() => useAppStore.setState({wizardUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}))

		expect(result.current.dismissQueueTabTip).toBe(first)
	})

	it('dismisses on schedule even while the home keeps re-rendering', () => {
		vi.useFakeTimers()
		const {result, rerender} = renderHook(() => useQueueTabTip({activeTab: 'download', initialBrowserMockScenario: null}))
		expect(result.current.queueTabTipVisible).toBe(true)
		const view = render(<QueueTabFirstRunCue onDismiss={result.current.dismissQueueTabTip} />)

		for (let elapsed = 0; elapsed < 4_000; elapsed += 1_000) {
			act(() => {
				vi.advanceTimersByTime(1_000)
			})
			rerender()
			view.rerender(<QueueTabFirstRunCue onDismiss={result.current.dismissQueueTabTip} />)
		}
		act(() => {
			vi.advanceTimersByTime(1_000)
		})

		expect(result.current.queueTabTipVisible).toBe(false)
	})
})
