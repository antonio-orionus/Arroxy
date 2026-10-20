// The Explore page's zoom, as a factor (1 = 100%). Unset means 100%. Chrome's
// own presets and range, so the steps feel the same as in a browser.
export const EXPLORE_ZOOM_MIN = 0.25
export const EXPLORE_ZOOM_MAX = 5
export const EXPLORE_ZOOM_DEFAULT = 1
const EXPLORE_ZOOM_PRESETS = [0.25, 0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5] as const

// Whole percents, so a factor never carries float noise into the settings file.
function clampZoom(factor: number): number {
	return Math.min(EXPLORE_ZOOM_MAX, Math.max(EXPLORE_ZOOM_MIN, Math.round(factor * 100) / 100))
}

export function exploreZoomOf(common: {readonly exploreZoom?: number | undefined}): number {
	const stored = common.exploreZoom
	return stored === undefined || !Number.isFinite(stored) ? EXPLORE_ZOOM_DEFAULT : clampZoom(stored)
}

// The next preset beyond `current` in `direction` (a typed 113% steps to 125% or 110%).
export function stepExploreZoom(current: number, direction: 1 | -1): number {
	const next = direction === 1 ? EXPLORE_ZOOM_PRESETS.find(preset => preset > current + 1e-9) : EXPLORE_ZOOM_PRESETS.findLast(preset => preset < current - 1e-9)
	return next ?? clampZoom(current)
}

// A percent typed by the user ("150", "80%") as a factor in range, or null when it is no number.
export function parseExploreZoomPercent(text: string): number | null {
	const match = /^(\d{1,4})\s*%?$/.exec(text.trim())
	return match?.[1] === undefined ? null : clampZoom(Number(match[1]) / 100)
}
