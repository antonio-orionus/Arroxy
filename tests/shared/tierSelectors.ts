// What a tiered profile sends yt-dlp: `res:` capped at the tier's ceiling, and
// the selector tried first on streams the Format screen's rows put at or under
// the tier, then on any stream of known size, then as it is. The ceilings are
// written out (the largest short and long side under the next tier's 3%
// tolerance) so a test checks the arithmetic rather than repeating it.
const TIER_CEILINGS: Readonly<Record<string, {shortSide: number; longSide: number}>> = {
	'144': {shortSide: 232, longSide: 413},
	'240': {shortSide: 349, longSide: 620},
	'360': {shortSide: 465, longSide: 827},
	'480': {shortSide: 698, longSide: 1241},
	'720': {shortSide: 1047, longSide: 1862},
	'1080': {shortSide: 1396, longSide: 2483},
	'1440': {shortSide: 2095, longSide: 3724},
	'2160': {shortSide: 4190, longSide: 7449}
}

function ceilingOf(tier: string): {shortSide: number; longSide: number} {
	const ceiling = TIER_CEILINGS[tier]
	if (!ceiling) throw new Error(`no ceiling for tier ${tier}`)
	return ceiling
}

export function tierRes(tier: string): string {
	return `res:${ceilingOf(tier).shortSide}`
}

export function tierBounded(selector: string, tier: string): string {
	const {longSide} = ceilingOf(tier)
	const layer = (filter: string): string =>
		selector
			.split('/')
			.map(alternative => alternative.replace(/^best(?:video)?\*?/, atom => `${atom}${filter}`))
			.join('/')
	return [layer(`[width<=${longSide}][height<=${longSide}]`), layer('[height>0]'), selector].join('/')
}
