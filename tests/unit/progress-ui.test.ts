import {describe, expect, it} from 'vite-plus/test'
import {nextMonotonicPercent, ProgressFormatter} from '@shared/progressFormat.js'

describe('progress ui helpers', () => {
	it('keeps percent monotonic', () => {
		expect(nextMonotonicPercent(0, 12.4)).toBe(12.4)
		expect(nextMonotonicPercent(54, 41)).toBe(54)
		expect(nextMonotonicPercent(54, undefined)).toBe(54)
		expect(nextMonotonicPercent(97, 105)).toBe(100)
	})

	it('formats speed and eta details from structured progress', () => {
		const s = new ProgressFormatter()
		expect(s.update({line: '', speedBps: 3.49 * 1024 ** 2, etaSeconds: 2})).toBe('3.49MiB/s • ETA 0:02')

		// No speed or ETA yet and no prior detail: nothing to display.
		const s2 = new ProgressFormatter()
		expect(s2.update({line: ''})).toBeNull()

		// Post-processor banners carry no detail: the translated phase status owns them.
		const s3 = new ProgressFormatter()
		expect(s3.update({line: '[Merger] Merging formats into "/tmp/out.webm"'})).toBeNull()
		expect(s3.update({line: '[ffmpeg] Merging formats into "/tmp/out.mp4"'})).toBeNull()
		expect(s3.update({line: '[ExtractAudio] Destination: /tmp/out.m4a'})).toBeNull()
		expect(s3.update({line: 'Deleting original file /tmp/out.f140.m4a'})).toBeNull()
	})

	// The detail sits beside the translated status badge, so it carries numbers
	// only, never an English verb.
	it('extracts speed and time from ffmpeg frame-level progress lines', () => {
		const s = new ProgressFormatter()
		expect(s.update({line: 'frame=  297 fps=296 q=-1.0 Lsize=   3085kB time=00:00:09.90 bitrate=2551.7kbits/s speed=9.83x'})).toBe('9.83x • 00:00:09')
		expect(s.update({line: 'frame=   52 fps= 52 q=-1.0 Lsize=    768kB time=00:00:02.16 bitrate=2909.5kbits/s speed=2.16x'})).toBe('2.16x • 00:00:02')
	})
})
