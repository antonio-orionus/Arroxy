import {describe, expect, it} from 'vite-plus/test'
import {BACKDROP_FRAME_BUDGET_MS, MIN_RENDER_SCALE, fitRenderScale, fitsFrameBudget, measureFrameCost} from '../../src/renderer/src/components/layout/background/frameBudget.js'

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

describe('backdrop render scale', () => {
	// 1 Mpx at scale 1 drawing at 0.1 µs per pixel: 100 ms at full scale.
	const msPerPixel = 0.0001
	const cssPixels = 1_000_000

	it('keeps the scene scale when it already fits', () => {
		expect(fitRenderScale(msPerPixel / 10, cssPixels, 0.75)).toBe(0.75)
	})

	it('picks the highest lower scale that lands inside the budget with headroom', () => {
		const scale = fitRenderScale(msPerPixel, cssPixels, 0.75)
		expect(scale).not.toBeNull()
		expect(scale).toBeLessThan(0.75)
		expect(scale).toBeGreaterThanOrEqual(MIN_RENDER_SCALE)
		const predictedMs = msPerPixel * cssPixels * (scale ?? 0) ** 2
		expect(predictedMs).toBeLessThanOrEqual(BACKDROP_FRAME_BUDGET_MS)
	})

	it('gives up below the lowest scale', () => {
		expect(fitRenderScale(msPerPixel * 100, cssPixels, 0.75)).toBeNull()
	})
})
