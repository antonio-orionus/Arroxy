export function nextMonotonicPercent(current: number, incoming?: number): number {
	if (incoming === undefined || Number.isNaN(incoming)) return current
	const boundedIncoming = Math.min(100, Math.max(0, incoming))
	return Math.max(current, boundedIncoming)
}

export function formatEta(seconds: number): string {
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = Math.floor(seconds % 60)
	if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
	return `${m}:${String(s).padStart(2, '0')}`
}

// yt-dlp's own spelling (`1.17MiB/s`), so a Part row reads like any other.
const RATE_UNITS = [
	['GiB', 1024 ** 3],
	['MiB', 1024 ** 2],
	['KiB', 1024]
] as const

function formatBps(bytesPerSecond: number): string {
	const [unit, size] = RATE_UNITS.find(([, size]) => bytesPerSecond >= size) ?? ['B', 1]
	return `${(bytesPerSecond / size).toFixed(2)}${unit}/s`
}

// One ffmpeg status line of a Part download, as transfer rate and time left.
// ffmpeg's `speed` is how many seconds of the part it writes per second, and
// `bitrate` (kbit/s) what one second of it weighs, so their product is the rate.
function ffmpegPartDetail(line: string, partSeconds: number): string | null {
	const match = /\btime=(\d+):(\d{2}):(\d{2}(?:\.\d+)?).*?\bbitrate=\s*([\d.]+)kbits\/s.*?\bspeed=\s*([\d.]+)x/.exec(line)
	if (!match) return null
	const written = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3])
	const speed = Number(match[5])
	if (!(speed > 0)) return null
	const bytesPerSecond = (Number(match[4]) * 1000 * speed) / 8
	return `${formatBps(bytesPerSecond)} • ETA ${formatEta(Math.max(0, partSeconds - written) / speed)}`
}

const THROTTLE_MS = 1000
// yt-dlp resets its averaging window at every fragment boundary, producing
// ~6 lines where speed plummets 50–200× and ETA spikes to hours. Suppress
// those, but cap the suppression so a genuine network slowdown still gets
// through within ~1.5s.
const SUPPRESSION_WINDOW_MS = 1500
const SPIKE_DROP_RATIO = 0.2

// One progress update: the line it came from, and yt-dlp's transfer rate
// (bytes/s) and time left (s) when the line was a structured progress record.
export interface TransferUpdate {
	line: string
	speedBps?: number
	etaSeconds?: number
}

export class ProgressFormatter {
	private lastEmittedSpeedBps: number | null = null
	private suppressedSinceMs: number | null = null
	private lastEmitTime = 0
	private lastDetail: string | null = null

	// `partSeconds`: the length of the Part of video this job downloads, if any.
	constructor(private readonly partSeconds: number | null = null) {}

	update({line, speedBps, etaSeconds}: TransferUpdate): string | null {
		if (this.partSeconds !== null && /\btime=-?\d/.test(line)) {
			this.lastDetail = ffmpegPartDetail(line, this.partSeconds) ?? this.lastDetail
			return this.lastDetail
		}
		const ffmpegRe = /time=(\d{2}:\d{2}:\d{2}).*?speed=\s*(\S+x)/
		const ffmpegMatch = ffmpegRe.exec(line)
		// The detail renders beside the translated status badge, so it holds
		// numbers only: an English word here would be the one untranslated part
		// of the row. Post-processor banners carry nothing, the phase status
		// event names them.
		if (ffmpegMatch) {
			this.lastDetail = `${ffmpegMatch[2]} • ${ffmpegMatch[1]}`
			return this.lastDetail
		}

		if (speedBps === undefined || etaSeconds === undefined) return this.lastDetail

		const now = Date.now()

		if (this.lastEmittedSpeedBps !== null && speedBps < this.lastEmittedSpeedBps * SPIKE_DROP_RATIO) {
			this.suppressedSinceMs ??= now
			if (now - this.suppressedSinceMs < SUPPRESSION_WINDOW_MS) {
				return this.lastDetail
			}
		} else {
			this.suppressedSinceMs = null
		}

		if (now - this.lastEmitTime < THROTTLE_MS) return this.lastDetail
		this.lastEmitTime = now
		this.lastEmittedSpeedBps = speedBps
		this.lastDetail = `${formatBps(speedBps)} • ETA ${formatEta(etaSeconds)}`
		return this.lastDetail
	}

	reset(): void {
		this.lastEmittedSpeedBps = null
		this.suppressedSinceMs = null
		this.lastEmitTime = 0
		this.lastDetail = null
	}
}
