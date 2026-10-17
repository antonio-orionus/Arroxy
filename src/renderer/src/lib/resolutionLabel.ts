// A probe resolution ("3840x2160") as the name people know it ("2160p", "4K").
// A video's tier is the larger of its short side and the 16:9 height of its long
// side, rounded down to a standard tier: a cropped 3344x2160 is 2160p, a
// letterboxed 1920x818 and a portrait 1080x1920 are 1080p. Text that is not a
// size at all ("audio only", "1080p") stays as the probe reported it.

export interface ResolutionLabel {
	label: string
	// The short name people use for the tiers that have one (4K); null where the label already says it.
	alias: string | null
}

const TIERS: readonly {height: number; alias: string | null}[] = [
	{height: 4320, alias: '8K'},
	{height: 2160, alias: '4K'},
	{height: 1440, alias: '2K'},
	{height: 1080, alias: null},
	{height: 720, alias: null},
	{height: 480, alias: null},
	{height: 360, alias: null},
	{height: 240, alias: null},
	{height: 144, alias: null}
]

// A stream a few pixels short of a tier (1912x1076) still belongs to it.
const TIER_TOLERANCE = 0.03

const WIDTH_BY_HEIGHT = /^(\d+)x(\d+)$/

export function resolutionLabel(resolution: string): ResolutionLabel {
	const match = WIDTH_BY_HEIGHT.exec(resolution)
	if (!match) return {label: resolution, alias: null}
	const [width, height] = [Number(match[1]), Number(match[2])]
	const equivalentHeight = Math.max(Math.min(width, height), (Math.max(width, height) * 9) / 16)
	const tier = TIERS.find(candidate => equivalentHeight >= candidate.height * (1 - TIER_TOLERANCE))
	return tier ? {label: `${tier.height}p`, alias: tier.alias} : {label: resolution, alias: null}
}
