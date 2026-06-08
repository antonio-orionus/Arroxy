import {nextMonotonicPercent} from './progressFormat.js'

const RUNNING_MAX_PERCENT = 99.9

interface FragmentProgress {
	index: number
	total: number
}

function parseFragmentProgress(line: string): FragmentProgress | null {
	const match = /\(frag\s+(\d+)\/(\d+)\)/.exec(line)
	if (!match) return null

	const index = Number.parseInt(match[1], 10)
	const total = Number.parseInt(match[2], 10)
	if (!Number.isFinite(index) || !Number.isFinite(total) || total <= 0) return null

	return {index, total}
}

function isHlsBootstrapComplete(line: string, percent: number): boolean {
	const fragment = parseFragmentProgress(line)
	return fragment !== null && fragment.index === 0 && percent >= RUNNING_MAX_PERCENT
}

export class ProgressNormalizer {
	nextRunningPercent(current: number, incoming: {line: string; percent?: number}): number {
		if (incoming.percent === undefined || !Number.isFinite(incoming.percent)) return current
		if (isHlsBootstrapComplete(incoming.line, incoming.percent)) return current

		const boundedCurrent = Math.min(current, RUNNING_MAX_PERCENT)
		const boundedIncoming = Math.min(RUNNING_MAX_PERCENT, Math.max(0, incoming.percent))
		return nextMonotonicPercent(boundedCurrent, boundedIncoming)
	}
}
