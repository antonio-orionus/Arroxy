import {describe, expect, it} from 'vite-plus/test'
import {BACKDROP_FRAME_BUDGET_MS, fitsFrameBudget, measureFrameCost} from '../../src/renderer/src/components/layout/background/frameBudget.js'

function fakeClock(frameMs: number[]) {
	let t = 0
	let frame = 0
	return {now: () => t, drawAndWait: () => (t += frameMs[frame++] ?? 0)}
}

describe('backdrop frame budget', () => {
	it('measures the median of the timed frames, after one untimed warm-up frame', () => {
		const clock = fakeClock([900, 10, 70, 30])

		const cost = measureFrameCost(clock.drawAndWait, 1_000, clock.now)

		expect(cost.medianMs).toBe(30)
		expect(cost.msPerPixel).toBeCloseTo(0.03)
	})

	it('fits a frame inside the budget and rejects one over it', () => {
		expect(fitsFrameBudget(BACKDROP_FRAME_BUDGET_MS / 1_000, 1_000)).toBe(true)
		expect(fitsFrameBudget(BACKDROP_FRAME_BUDGET_MS / 1_000, 1_001)).toBe(false)
	})

	it('predicts a larger canvas from the measured cost per pixel', () => {
		const clock = fakeClock([0, 20, 20, 20])
		const cost = measureFrameCost(clock.drawAndWait, 1_000_000, clock.now)
		expect(fitsFrameBudget(cost.msPerPixel, 2_000_000)).toBe(true)
		expect(fitsFrameBudget(cost.msPerPixel, 3_000_000)).toBe(false)
	})
})
