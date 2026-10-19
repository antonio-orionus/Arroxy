import {exploreSnapshotSchema} from '@shared/exploreSchemas.js'

// P2-R35: while an overlay hides the native view, a picture of the page stands
// in for it. The overlay never waits on the picture for longer than this.
const SNAPSHOT_WAIT_MS = 300

// A picture of the shown page from main, or null when there is none, the
// capture fails, or it takes longer than an overlay may wait. Lives only in
// component state: never stored, never logged.
export async function captureExploreView(): Promise<string | null> {
	let timer: ReturnType<typeof setTimeout> | undefined
	const timedOut = new Promise<null>(resolve => {
		timer = setTimeout(() => resolve(null), SNAPSHOT_WAIT_MS)
	})
	const captured = window.appApi.explore.capture().then(
		result => {
			if (!result.ok) return null
			const snapshot = exploreSnapshotSchema.safeParse(result.data)
			return snapshot.success ? snapshot.data : null
		},
		() => null
	)
	try {
		return await Promise.race([captured, timedOut])
	} finally {
		clearTimeout(timer)
	}
}

// Decoded before it is shown, so the first frame with it already has the pixels.
export async function decodeSnapshot(url: string): Promise<void> {
	const image = new Image()
	image.src = url
	if (typeof image.decode === 'function') await image.decode().catch(() => undefined)
}

// Resolves after the next frame has been painted.
export function afterNextPaint(): Promise<void> {
	return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
}
