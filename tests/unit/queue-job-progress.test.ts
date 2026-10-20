import {describe, expect, it} from 'vite-plus/test'
import {QueueJobProgress} from '../../src/main/services/download/QueueJobProgress.js'
import type {PreparedJob} from '../../src/shared/preparedJob.js'
import type {ProgressEvent} from '../../src/shared/types.js'
import {makeItem} from '../shared/fixtures.js'

// A Part of video download is ffmpeg's: it prints no percent, only how much of
// the output it has written (`time=`). Lines from a 74-229 s part (155 s).
const PART_JOB: PreparedJob = {
	kind: 'single-format',
	extractor: 'youtube',
	extractorKey: 'Youtube',
	formatId: '625+251',
	sponsorBlock: {mode: 'off'},
	embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false},
	videoPart: {startSeconds: 74, endSeconds: 229, exactCut: false}
}

function event(line: string): ProgressEvent {
	return {jobId: 'job-1', line, at: '2026-10-19T15:51:00.000Z'}
}

describe('QueueJobProgress', () => {
	it("shows yt-dlp's speed and time left beside the percent", () => {
		const progress = new QueueJobProgress()
		const item = makeItem({id: 'a', status: 'running', progressPercent: 30})
		const update = progress.read(item, {...event('[yt-dlp-bridge:progress] {}'), percent: 40, speedBps: 1024 ** 2, etaSeconds: 65})
		expect(update).toEqual({percent: 40, detail: '1.00MiB/s • ETA 1:05'})
	})

	it('never moves the percent backward', () => {
		const progress = new QueueJobProgress()
		const item = makeItem({id: 'a', status: 'running', progressPercent: 60})
		expect(progress.read(item, {...event('[yt-dlp-bridge:progress] {}'), percent: 55})?.percent).toBe(60)
	})

	it('derives a Part download percent from ffmpeg time= against the part length', () => {
		const progress = new QueueJobProgress()
		const item = makeItem({id: 'a', status: 'running', job: PART_JOB})
		const update = progress.read(item, event('frame=  843 fps= 16 q=-1.0 size=   73216KiB time=00:00:32.87 bitrate=18245.0kbits/s speed=0.641x elapsed=0:00:51.32'))
		expect(update?.percent).toBeCloseTo((32.87 / 155) * 100, 1)
		// 18245.0 kbit/s × 0.641 = 1.39 MiB/s; (155 − 32.87) s / 0.641 = 3:10.
		expect(update?.detail).toBe('1.39MiB/s • ETA 3:10')
	})

	it('ignores ffmpeg pre-roll lines with a negative time', () => {
		const progress = new QueueJobProgress()
		const item = makeItem({id: 'a', status: 'running', job: PART_JOB, progressPercent: 0})
		const update = progress.read(item, event('frame=    0 fps=0.0 q=-1.0 size=       1KiB time=-00:00:03.96 bitrate=N/A speed=N/A elapsed=0:00:00.50'))
		expect(update?.percent).toBe(0)
	})

	it('stays below 100% while running, even past the part end', () => {
		const progress = new QueueJobProgress()
		const item = makeItem({id: 'a', status: 'running', job: PART_JOB})
		const update = progress.read(item, event('frame= 3700 fps= 50 q=-1.0 size=  300000KiB time=00:02:36.10 bitrate=8696.3kbits/s speed=2.08x elapsed=0:01:15.00'))
		expect(update?.percent).toBe(99.9)
	})

	it('takes no percent from ffmpeg time= for a whole-video download', () => {
		const progress = new QueueJobProgress()
		const item = makeItem({id: 'a', status: 'running', progressPercent: 12})
		const update = progress.read(item, event('frame=  297 fps=296 q=-1.0 size=    1234kB time=00:00:09.90 bitrate=1020.8kbits/s speed=9.83x'))
		expect(update?.percent).toBe(12)
	})
})
