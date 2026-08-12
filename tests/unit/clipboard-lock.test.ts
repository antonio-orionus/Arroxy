import {describe, expect, it} from 'vitest'
import {withClipboardLock} from '../e2e/clipboardLock.js'

describe('withClipboardLock', () => {
	it('never lets two holders overlap', async () => {
		// Models the real failure: one test writes the clipboard, yields, then
		// pastes. Without exclusion another holder writes in the gap and the paste
		// picks up the wrong text.
		let active = 0
		let maxActive = 0
		await Promise.all(
			Array.from({length: 6}, () =>
				withClipboardLock(async () => {
					active++
					maxActive = Math.max(maxActive, active)
					await new Promise(resolve => setTimeout(resolve, 15))
					active--
				})
			)
		)
		expect(maxActive).toBe(1)
	})

	it('releases the lock when the body throws', async () => {
		let raised: unknown
		try {
			await withClipboardLock(async () => {
				throw new Error('assertion failed inside the test')
			})
		} catch (error) {
			raised = error
		}
		expect((raised as Error | undefined)?.message).toBe('assertion failed inside the test')
		// A wedged lock would hang the whole suite, so the next acquire must work.
		await expect(withClipboardLock(async () => 'acquired')).resolves.toBe('acquired')
	})

	it('returns the body result', async () => {
		await expect(withClipboardLock(async () => 42)).resolves.toBe(42)
	})
})
