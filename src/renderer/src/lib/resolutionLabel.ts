// A probe resolution ("3840x2160") as the name people know it ("2160p", "4K").
// A video's tier is the larger of its short side and the 16:9 height of its long
// side, rounded down to a standard tier: a cropped 3344x2160 is 2160p, a
// letterboxed 1920x818 and a portrait 1080x1920 are 1080p. Text that is not a
// size at all ("audio only", "1080p") stays as the probe reported it.

import {tierHeightOf} from '@shared/videoTier.js'

export interface ResolutionLabel {
	label: string
	// The short name people use for the tiers that have one (4K); null where the label already says it.
	alias: string | null
}

const ALIASES: Readonly<Record<number, string>> = {4320: '8K', 2160: '4K', 1440: '2K'}

const WIDTH_BY_HEIGHT = /^(\d+)x(\d+)$/

export function resolutionLabel(resolution: string): ResolutionLabel {
	const match = WIDTH_BY_HEIGHT.exec(resolution)
	if (!match) return {label: resolution, alias: null}
	const tier = tierHeightOf(Number(match[1]), Number(match[2]))
	return tier === null ? {label: resolution, alias: null} : {label: `${tier}p`, alias: ALIASES[tier] ?? null}
}
