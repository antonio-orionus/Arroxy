import {nextMonotonicPercent} from './progressFormat.js'

// 100% belongs to the terminal status: a running job can still merge, convert
// or fail after its last byte.
const RUNNING_MAX_PERCENT = 99.9

/**
 * A Part of video download is ffmpeg's, which prints no percent, only how much
 * of the output it has written (`time=00:00:32.87`). That time, against the
 * part's length, is the percent. Pre-roll lines carry a negative time.
 */
export function ffmpegPartPercent(line: string, partSeconds: number): number | undefined {
	const match = /\btime=(\d+):(\d{2}):(\d{2}(?:\.\d+)?)/.exec(line)
	if (!match || partSeconds <= 0) return undefined
	const written = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3])
	return (written / partSeconds) * 100
}

// The incoming percent already covers every stream of the download (see the
// bridge's progress tracker), so the bar only ever moves forward.
export function nextRunningPercent(current: number, incoming: number | undefined): number {
	if (incoming === undefined || !Number.isFinite(incoming)) return current
	return nextMonotonicPercent(Math.min(current, RUNNING_MAX_PERCENT), Math.min(RUNNING_MAX_PERCENT, Math.max(0, incoming)))
}
