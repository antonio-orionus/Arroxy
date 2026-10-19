// A video size ("3840x2160") as the tier people know it (2160p). A video's tier
// is the larger of its short side and the 16:9 height of its long side, rounded
// down to a standard tier: a cropped 3344x2160 is 2160p, a letterboxed 1920x818
// is 1080p, a widescreen 1280x640 is 720p, a portrait 1080x1920 is 1080p. The Format
// screen names rows by it and download profiles pick by it, so "up to 720p"
// takes a widescreen 1280x640 trailer as 720p, not as a 640p fallback.

export const TIER_HEIGHTS: readonly number[] = [4320, 2160, 1440, 1080, 720, 480, 360, 240, 144]

// A stream a few pixels short of a tier (1912x1076) still belongs to it.
const TIER_TOLERANCE = 0.03

export function tierHeightOf(width: number, height: number): number | null {
	const equivalentHeight = Math.max(Math.min(width, height), (Math.max(width, height) * 9) / 16)
	return TIER_HEIGHTS.find(tier => equivalentHeight >= tier * (1 - TIER_TOLERANCE)) ?? null
}
