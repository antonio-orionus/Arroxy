import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {subscribeMenuActions} from '@renderer/lib/menuAction.js'

const unsubscribe = vi.fn()
let deliver: (payload: unknown) => void = () => undefined

beforeEach(() => {
	unsubscribe.mockClear()
	window.appApi = {
		events: {
			onMenuAction: vi.fn((listener: (payload: unknown) => void) => {
				deliver = listener
				return unsubscribe
			})
		}
	} as unknown as typeof window.appApi
})

describe('subscribeMenuActions', () => {
	it('forwards a well-formed action', () => {
		const onAction = vi.fn()
		subscribeMenuActions(onAction)
		deliver({kind: 'speedLimit', limitRate: '500K'})
		expect(onAction).toHaveBeenCalledWith({kind: 'speedLimit', limitRate: '500K'})
	})

	it.each([[null], ['about'], [{kind: 'unknown'}], [{kind: 'style', style: 'neon'}], [{kind: 'speedLimit', limitRate: 'fast'}]])('drops a malformed payload: %j', payload => {
		const onAction = vi.fn()
		subscribeMenuActions(onAction)
		deliver(payload)
		expect(onAction).not.toHaveBeenCalled()
	})

	it('returns the unsubscribe from the bridge', () => {
		subscribeMenuActions(vi.fn())()
		expect(unsubscribe).toHaveBeenCalledTimes(1)
	})
})
