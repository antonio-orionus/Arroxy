export function parsePercentFromLine(line: string): number | undefined {
	const match = /(\d+(?:\.\d+)?)%/.exec(line)
	if (!match) return undefined

	const parsed = Number.parseFloat(match[1])
	if (Number.isNaN(parsed)) return undefined
	return parsed
}
