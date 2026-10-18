// The longest GPU frame a backdrop may take. Beyond it the GPU cannot keep up
// with the scene, and the window's own compositing queues behind the backdrop:
// the whole app stops updating (Intel HD 620 on the light scene).
export const BACKDROP_FRAME_BUDGET_MS = 50
const TIMED_FRAMES = 3

export interface FrameCost {
	medianMs: number
	msPerPixel: number
}

// `drawAndWait` draws one frame and blocks until the GPU has finished it. The
// first frame is untimed: it carries the driver's deferred shader work.
export function measureFrameCost(drawAndWait: () => void, pixels: number, now: () => number = () => performance.now()): FrameCost {
	drawAndWait()
	const samples: number[] = []
	for (let i = 0; i < TIMED_FRAMES; i++) {
		const start = now()
		drawAndWait()
		samples.push(now() - start)
	}
	const medianMs = samples.sort((a, b) => a - b)[Math.floor(TIMED_FRAMES / 2)] ?? 0
	return {medianMs, msPerPixel: medianMs / Math.max(1, pixels)}
}

export function fitsFrameBudget(msPerPixel: number, pixels: number, budgetMs: number = BACKDROP_FRAME_BUDGET_MS): boolean {
	return msPerPixel * pixels <= budgetMs
}

// Below this the backdrop is too coarse to be worth drawing; the style falls
// back instead. The backdrop is a soft background, so far above it a lower
// resolution is hard to see.
export const MIN_RENDER_SCALE = 0.35
// A start that had to lower the resolution, or missed the budget even at the
// lowest, is measured again after this delay: a GPU still at idle clocks, or a
// busy moment, is not a slow GPU.
export const BACKDROP_CONFIRM_DELAY_MS = 2_000
// Aim below the budget when lowering the resolution, so the result does not sit on the edge.
const RESCALE_TARGET = 0.8

// The highest render scale, up to the scene's own, whose predicted frame fits
// the budget, or null when even the lowest does not. Cost grows with pixels,
// so with the square of the scale.
export function fitRenderScale(msPerPixel: number, cssPixels: number, maxScale: number, budgetMs: number = BACKDROP_FRAME_BUDGET_MS): number | null {
	if (fitsFrameBudget(msPerPixel, cssPixels * maxScale * maxScale, budgetMs)) return maxScale
	const scale = Math.floor(Math.sqrt((budgetMs * RESCALE_TARGET) / Math.max(Number.EPSILON, msPerPixel * cssPixels)) * 100) / 100
	return scale >= MIN_RENDER_SCALE ? Math.min(scale, maxScale) : null
}
