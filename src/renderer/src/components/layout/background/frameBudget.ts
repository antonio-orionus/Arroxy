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
