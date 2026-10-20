import {describe, expect, it, vi, beforeEach, afterEach} from 'vite-plus/test'
import {formatEta, ProgressFormatter, nextMonotonicPercent} from '../../src/shared/progressFormat.js'
import {nextRunningPercent} from '../../src/shared/progressNormalizer.js'

describe('formatEta', () => {
	it('formats minutes and seconds', () => {
		expect(formatEta(27 * 60 + 19)).toBe('27:19')
	})

	it('formats hours with zero-padded minutes and seconds', () => {
		expect(formatEta(3600 + 5 * 60 + 3)).toBe('1:05:03')
	})

	it('pads single-digit seconds', () => {
		expect(formatEta(61)).toBe('1:01')
	})
})

describe('nextMonotonicPercent', () => {
	it('never goes backward', () => {
		expect(nextMonotonicPercent(50, 30)).toBe(50)
	})

	it('advances forward', () => {
		expect(nextMonotonicPercent(50, 60)).toBe(60)
	})

	it('clamps to 100', () => {
		expect(nextMonotonicPercent(0, 110)).toBe(100)
	})

	it('returns current on undefined', () => {
		expect(nextMonotonicPercent(42, undefined)).toBe(42)
	})
})

describe('nextRunningPercent', () => {
	it('ignores non-finite incoming progress', () => {
		expect(nextRunningPercent(42, Infinity)).toBe(42)
		expect(nextRunningPercent(42, -Infinity)).toBe(42)
	})

	it('caps running progress below 100 until a terminal status completes the job', () => {
		expect(nextRunningPercent(88, 100)).toBe(99.9)
	})
})

describe('ProgressFormatter', () => {
	let formatter: ProgressFormatter

	beforeEach(() => {
		formatter = new ProgressFormatter()
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	const MiB = 1024 ** 2
	const KiB = 1024
	// One structured progress record: yt-dlp's speed (bytes/s) and time left (s).
	const transfer = (speedBps?: number, etaSeconds?: number) => ({line: '[yt-dlp-bridge:progress] {}', ...(speedBps === undefined ? {} : {speedBps}), ...(etaSeconds === undefined ? {} : {etaSeconds})})

	it('returns null on a first record without speed or time left (nothing to display yet)', () => {
		expect(formatter.update(transfer())).toBeNull()
	})

	it('emits the speed in binary units and the ETA as a clock on the first full record', () => {
		const result = formatter.update(transfer(10.0 * MiB, 1639))
		expect(result).toBe('10.00MiB/s • ETA 27:19')
	})

	it('throttles within 1000ms — second call returns same string', () => {
		const first = formatter.update(transfer(10.0 * MiB, 1639))
		vi.advanceTimersByTime(500)
		const second = formatter.update(transfer(11.0 * MiB, 1440))
		expect(second).toBe(first)
	})

	it('emits updated string after 1000ms', () => {
		const first = formatter.update(transfer(10.0 * MiB, 1639))
		vi.advanceTimersByTime(1001)
		const second = formatter.update(transfer(11.0 * MiB, 1440))
		expect(second).not.toBe(first)
		expect(second).toBe('11.00MiB/s • ETA 24:00')
	})

	it('suppresses chunk-boundary spike (speed dropping below 20% of last emit)', () => {
		const baseline = formatter.update(transfer(14.0 * MiB, 75))
		vi.advanceTimersByTime(1001)
		// Spike: speed plummets ~180× — typical of yt-dlp's fragment-boundary reset.
		const spike = formatter.update(transfer(78.49 * KiB, 14105))
		expect(spike).toBe(baseline)
	})

	it('continues suppressing throughout a multi-line ramp within the window', () => {
		formatter.update(transfer(14.0 * MiB, 75))
		vi.advanceTimersByTime(1001)
		const baseline = formatter.update(transfer(14.0 * MiB, 74))
		vi.advanceTimersByTime(1001)
		formatter.update(transfer(78.49 * KiB, 14105))
		vi.advanceTimersByTime(20)
		formatter.update(transfer(230.16 * KiB, 4809))
		vi.advanceTimersByTime(20)
		const ramp = formatter.update(transfer(1.09 * MiB, 987))
		expect(ramp).toBe(baseline)
	})

	it('accepts a sustained low speed once suppression window expires', () => {
		formatter.update(transfer(14.0 * MiB, 75))
		vi.advanceTimersByTime(1001)
		formatter.update(transfer(14.0 * MiB, 74))
		// Network genuinely drops to ~1MiB/s and stays there.
		vi.advanceTimersByTime(1001)
		formatter.update(transfer(1.0 * MiB, 900))
		vi.advanceTimersByTime(1600) // past 1500ms suppression window
		const accepted = formatter.update(transfer(1.0 * MiB, 930))
		expect(accepted).toBe('1.00MiB/s • ETA 15:30')
	})

	it('does not suppress when speed stays within the normal range', () => {
		formatter.update(transfer(14.0 * MiB, 75))
		vi.advanceTimersByTime(1001)
		// 50% drop is plausible network jitter, not a fragment-boundary artifact.
		const result = formatter.update(transfer(7.0 * MiB, 120))
		expect(result).toBe('7.00MiB/s • ETA 2:00')
	})

	it('keeps the last detail through a record without speed or time left', () => {
		const first = formatter.update(transfer(10.0 * MiB, 1639))
		vi.advanceTimersByTime(1001)
		const result = formatter.update(transfer())
		expect(result).toBe(first)
	})

	it('leaves merger banners to the phase status', () => {
		expect(formatter.update({line: '[Merger] Merging formats into output.mkv'})).toBeNull()
	})

	it('returns ffmpeg detail for ffmpeg progress lines without throttling', () => {
		const line = 'frame= 297 fps=296 q=-1.0 size=   1234kB time=00:00:09.90 bitrate=1020.8kbits/s speed=9.83x'
		const result = formatter.update({line})
		expect(result).toBe('9.83x • 00:00:09')
	})

	it('writes small speeds in KiB/s', () => {
		expect(formatter.update(transfer(890.12 * KiB, 605))).toBe('890.12KiB/s • ETA 10:05')
	})

	it('reset clears state so next update starts fresh', () => {
		formatter.update(transfer(10.0 * MiB, 1639))
		formatter.reset()
		expect(formatter.update(transfer())).toBeNull()
	})
})

// A Part of video download is ffmpeg's. Its `speed=0.44x` and `time=` say how
// fast and how far it writes the part, which means nothing to the user; the row
// shows what a whole download shows instead: transfer rate and time left.
describe('ProgressFormatter — Part of video', () => {
	const PART_SECONDS = 154

	it('shows the transfer rate and the time left of the part', () => {
		const formatter = new ProgressFormatter(PART_SECONDS)
		const line = 'frame=  418 fps= 14 q=-1.0 size=   34816KiB time=00:00:12.89 bitrate=22119.8kbits/s speed=0.442x elapsed=0:00:29.17'
		// 22119.8 kbit/s × 0.442 = 1.17 MiB/s; (154 − 12.89) s / 0.442 = 5:19.
		expect(formatter.update({line})).toBe('1.17MiB/s • ETA 5:19')
	})

	it('shows nothing during the pre-roll, before ffmpeg knows its speed', () => {
		const formatter = new ProgressFormatter(PART_SECONDS)
		expect(formatter.update({line: 'frame=    0 fps=0.0 q=-1.0 size=       1KiB time=-00:00:06.96 bitrate=N/A speed=N/A elapsed=0:00:00.50'})).toBeNull()
	})

	it('keeps the last detail when a line lacks the rate', () => {
		const formatter = new ProgressFormatter(PART_SECONDS)
		const first = formatter.update({line: 'frame=  418 fps= 14 q=-1.0 size=   34816KiB time=00:00:12.89 bitrate=22119.8kbits/s speed=0.442x elapsed=0:00:29.17'})
		expect(formatter.update({line: 'frame=  419 fps= 14 q=-1.0 size=   34816KiB time=00:00:12.93 bitrate=N/A speed=0.44x elapsed=0:00:29.67'})).toBe(first)
	})
})
