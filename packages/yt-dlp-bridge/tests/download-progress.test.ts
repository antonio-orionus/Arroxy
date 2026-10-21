import {readFileSync} from 'node:fs'
import {describe, expect, it} from 'vite-plus/test'
import {parseYtDlpOutputLine, YT_DLP_PROGRESS_TEMPLATE, YT_DLP_REQUESTED_FORMATS_TEMPLATE, YtDlpDownloadProgressTracker, type YtDlpDownloadProgress} from '../src/parsers.js'
import {planWorkflow} from '../src/workflow.js'

// Lines captured from a real `-f 395+250` run of yt-dlp 2026.08.19 with the
// templates below, trailing redraw padding included.
const REQUESTED_395_250 = '[yt-dlp-bridge:formats] {"format_id":"395+250","filesize":null,"filesize_approx":367572,"requested":[{"format_id": "395", "filesize": 223779, "filesize_approx": 223778}, {"format_id": "250", "filesize": 143795, "filesize_approx": 143794}]}'
const VIDEO_STARTED = '[yt-dlp-bridge:progress] {"progress":{"status": "downloading", "downloaded_bytes": 1024, "total_bytes": 223779, "speed": 8401.70284153818, "eta": 26, "elapsed": 0.7725710868835449},"format_id":"395"}   '
const VIDEO_FINISHED = '[yt-dlp-bridge:progress] {"progress":{"status": "finished", "downloaded_bytes": 223779, "total_bytes": 223779, "speed": 192425.18895919717, "elapsed": 1.162940263748169},"format_id":"395"}'

function progress(fields: Partial<YtDlpDownloadProgress>): YtDlpDownloadProgress {
	return {status: 'downloading', ...fields}
}

describe('parseYtDlpOutputLine — structured progress', () => {
	it('reads a progress template line as numbers', () => {
		expect(parseYtDlpOutputLine(VIDEO_STARTED)).toEqual({kind: 'download-progress', progress: {status: 'downloading', formatId: '395', downloadedBytes: 1024, totalBytes: 223779, speedBps: 8401.70284153818, etaSeconds: 26, elapsedSeconds: 0.7725710868835449}})
	})

	it('reads the finished record yt-dlp prints once a stream is complete', () => {
		expect(parseYtDlpOutputLine(VIDEO_FINISHED)).toEqual({kind: 'download-progress', progress: {status: 'finished', formatId: '395', downloadedBytes: 223779, totalBytes: 223779, speedBps: 192425.18895919717, elapsedSeconds: 1.162940263748169}})
	})

	it('reads fragment counters and the size estimate of a fragmented stream', () => {
		const line = '[yt-dlp-bridge:progress] {"progress":{"status": "downloading", "downloaded_bytes": 2048, "total_bytes_estimate": 262144.0, "speed": null, "eta": null, "elapsed": 0.5, "fragment_index": 1, "fragment_count": 128},"format_id":"hls-1080"}'
		expect(parseYtDlpOutputLine(line)).toEqual({kind: 'download-progress', progress: {status: 'downloading', formatId: 'hls-1080', downloadedBytes: 2048, totalBytesEstimate: 262144, elapsedSeconds: 0.5, fragmentIndex: 1, fragmentCount: 128}})
	})

	it('reads the requested formats of a merged download, in download order', () => {
		expect(parseYtDlpOutputLine(REQUESTED_395_250)).toEqual({
			kind: 'requested-formats',
			formats: [
				{formatId: '395', filesize: 223779, filesizeApprox: 223778},
				{formatId: '250', filesize: 143795, filesizeApprox: 143794}
			]
		})
	})

	// A fragmented (HLS/DASH manifest) stream has no size before it downloads:
	// yt-dlp fills `filesize_approx` from the bitrate only for other formats.
	it("sizes a requested format from its bitrate and the video's duration", () => {
		const line = '[yt-dlp-bridge:formats] {"format_id":"604+251","filesize":null,"filesize_approx":252182,"tbr":304.65,"duration":19,"requested":[{"format_id": "604", "tbr": 198.586}, {"format_id": "251", "filesize": 252182, "filesize_approx": 252180, "tbr": 106.064}]}'
		expect(parseYtDlpOutputLine(line)).toEqual({
			kind: 'requested-formats',
			formats: [
				{formatId: '604', filesizeFromBitrate: 471641},
				{formatId: '251', filesize: 252182, filesizeApprox: 252180, filesizeFromBitrate: 251902}
			]
		})
	})

	it('reads a single requested format from the top-level fields', () => {
		const line = '[yt-dlp-bridge:formats] {"format_id":"18","filesize":null,"filesize_approx":1048576,"requested":null}'
		expect(parseYtDlpOutputLine(line)).toEqual({kind: 'requested-formats', formats: [{formatId: '18', filesizeApprox: 1048576}]})
	})

	// yt-dlp's ETA is (estimate - downloaded) / speed, which goes negative when a
	// fragment estimate undercuts the bytes so far. That field alone is dropped.
	it('drops a negative field and keeps the rest of the record', () => {
		const line = '[yt-dlp-bridge:progress] {"progress":{"status": "downloading", "downloaded_bytes": 3000, "total_bytes_estimate": 2500.0, "speed": 1000.0, "eta": -1, "fragment_index": 3, "fragment_count": 10},"format_id":"hls-1"}'
		expect(parseYtDlpOutputLine(line)).toEqual({kind: 'download-progress', progress: {status: 'downloading', formatId: 'hls-1', downloadedBytes: 3000, totalBytesEstimate: 2500, speedBps: 1000, fragmentIndex: 3, fragmentCount: 10}})
	})

	// A stream already on disk reports one finished record with its size only.
	it('reads the finished record of a stream already on disk', () => {
		const line = '[yt-dlp-bridge:progress] {"progress":{"status": "finished", "total_bytes": 223779},"format_id":"395"}'
		expect(parseYtDlpOutputLine(line)).toEqual({kind: 'download-progress', progress: {status: 'finished', formatId: '395', totalBytes: 223779}})
	})

	it('leaves a prefixed line it cannot read as plain output', () => {
		const line = '[yt-dlp-bridge:progress] {"progress":NA,"format_id":"395"}'
		expect(parseYtDlpOutputLine(line)).toEqual({kind: 'progress', raw: line})
	})

	it('no longer scrapes a percent from the human-readable progress line', () => {
		const line = '[download]  42.0% of 10.00MiB at 1.00MiB/s ETA 00:05'
		expect(parseYtDlpOutputLine(line)).toEqual({kind: 'progress', raw: line})
	})
})

describe('YtDlpDownloadProgressTracker', () => {
	const VIDEO = {formatId: '395', filesize: 223779}
	const AUDIO = {formatId: '250', filesize: 143795}
	const TOTAL = VIDEO.filesize + AUDIO.filesize

	// The bug this exists for: the video stream reaching 100% used to fill the
	// bar, and the separate audio download then moved nothing.
	it('keeps counting through the audio stream of a video+audio download', () => {
		const tracker = new YtDlpDownloadProgressTracker()
		tracker.setRequestedFormats([VIDEO, AUDIO])

		const videoDone = tracker.update(progress({status: 'finished', formatId: '395', downloadedBytes: VIDEO.filesize, totalBytes: VIDEO.filesize}))
		const audioHalf = tracker.update(progress({formatId: '250', downloadedBytes: 71897, totalBytes: AUDIO.filesize}))
		const audioDone = tracker.update(progress({status: 'finished', formatId: '250', downloadedBytes: AUDIO.filesize, totalBytes: AUDIO.filesize}))

		expect(videoDone.percent).toBeCloseTo((VIDEO.filesize / TOTAL) * 100, 5)
		expect(audioHalf.percent).toBeCloseTo(((VIDEO.filesize + 71897) / TOTAL) * 100, 5)
		expect(audioDone.percent).toBe(100)
	})

	it('weighs a stream by its planned size before its first progress record', () => {
		const tracker = new YtDlpDownloadProgressTracker()
		tracker.setRequestedFormats([VIDEO, AUDIO])

		expect(tracker.update(progress({formatId: '395', downloadedBytes: 111889, totalBytes: VIDEO.filesize})).percent).toBeCloseTo((111889 / TOTAL) * 100, 5)
	})

	it('falls back to the approximate size when yt-dlp knows no exact one', () => {
		const tracker = new YtDlpDownloadProgressTracker()
		tracker.setRequestedFormats([
			{formatId: '137', filesizeApprox: 3000},
			{formatId: '140', filesizeApprox: 1000}
		])

		expect(tracker.update(progress({formatId: '137', downloadedBytes: 1500})).percent).toBeCloseTo(37.5, 5)
	})

	// A fragmented stream reports an exact size only once finished. Its live
	// estimate tracks the real stream; an approximate size from the format list
	// can be far off, and an underestimate would read as complete early.
	it("prefers a fragmented stream's live estimate over its approximate size", () => {
		const tracker = new YtDlpDownloadProgressTracker()
		tracker.setRequestedFormats([{formatId: 'hls-720', filesizeApprox: 1000}])

		expect(tracker.update(progress({formatId: 'hls-720', downloadedBytes: 1200, totalBytesEstimate: 2000, fragmentIndex: 6, fragmentCount: 10})).percent).toBeCloseTo(60, 5)
	})

	it("keeps a stream's exact planned size over its live estimate", () => {
		const tracker = new YtDlpDownloadProgressTracker()
		tracker.setRequestedFormats([{formatId: 'dash-1080', filesize: 4000}])

		expect(tracker.update(progress({formatId: 'dash-1080', downloadedBytes: 1000, totalBytesEstimate: 2000, fragmentIndex: 3, fragmentCount: 12})).percent).toBeCloseTo(25, 5)
	})

	it('weighs a stream by its bitrate size when yt-dlp knows no other', () => {
		const tracker = new YtDlpDownloadProgressTracker()
		tracker.setRequestedFormats([
			{formatId: '160', filesize: 1000},
			{formatId: '234', filesizeFromBitrate: 9000}
		])

		expect(tracker.update(progress({status: 'finished', formatId: '160', downloadedBytes: 1000, totalBytes: 1000})).percent).toBeCloseTo(10, 5)
	})

	it('gives every stream an equal share when no size is known', () => {
		const tracker = new YtDlpDownloadProgressTracker()
		tracker.setRequestedFormats([{formatId: '160'}, {formatId: '234'}])

		expect(tracker.update(progress({status: 'finished', formatId: '160', downloadedBytes: 1000})).percent).toBe(50)
	})

	it('gives a stream of unknown size the mean share of the known ones', () => {
		const tracker = new YtDlpDownloadProgressTracker()
		tracker.setRequestedFormats([VIDEO, {formatId: '250'}])

		expect(tracker.update(progress({status: 'finished', formatId: '395', downloadedBytes: VIDEO.filesize, totalBytes: VIDEO.filesize})).percent).toBe(50)
		// The audio's first record brings its size, and with it byte weights.
		expect(tracker.update(progress({formatId: '250', downloadedBytes: 500, totalBytes: 1000})).percent).toBeCloseTo(((VIDEO.filesize + 500) / (VIDEO.filesize + 1000)) * 100, 5)
	})

	// A stream of unknown size used to add nothing until its size was known.
	it('moves through a stream of unknown size by its fragments', () => {
		const tracker = new YtDlpDownloadProgressTracker()
		tracker.setRequestedFormats([{formatId: 'hls-audio'}])

		expect(tracker.update(progress({formatId: 'hls-audio', downloadedBytes: 512, fragmentIndex: 0, fragmentCount: 4})).percent).toBe(0)
		// Two fragments of 1000 bytes each put the stream at about 4000 bytes.
		expect(tracker.update(progress({formatId: 'hls-audio', downloadedBytes: 2000, fragmentIndex: 2, fragmentCount: 4})).percent).toBeCloseTo(50, 5)
		expect(tracker.update(progress({formatId: 'hls-audio', downloadedBytes: 2600, fragmentIndex: 2, fragmentCount: 4})).percent).toBeCloseTo(65, 5)
	})

	it('never moves the bar back when a size turns out larger', () => {
		const tracker = new YtDlpDownloadProgressTracker()
		tracker.setRequestedFormats([{formatId: '160', filesize: 1000}, {formatId: 'hls-audio'}])

		expect(tracker.update(progress({status: 'finished', formatId: '160', downloadedBytes: 1000, totalBytes: 1000})).percent).toBe(50)
		// One of three fragments is 10000 bytes: by bytes the whole is a third done.
		expect(tracker.update(progress({formatId: 'hls-audio', downloadedBytes: 10_000, fragmentIndex: 1, fragmentCount: 3})).percent).toBe(50)
		expect(tracker.update(progress({formatId: 'hls-audio', downloadedBytes: 20_000, fragmentIndex: 2, fragmentCount: 3})).percent).toBeCloseTo((21_000 / 31_000) * 100, 5)
	})

	// Captured from `-f 160+234` of jNQXAC9IVRw with yt-dlp 2026.08.19: a 191 KiB
	// DASH video, then a 302 KiB HLS audio whose size yt-dlp does not know.
	it('replays a video with an audio of unknown size without going back', () => {
		const lines = readFileSync(new URL('./fixtures/progress-dash-video-hls-audio.log', import.meta.url), 'utf8')
			.split('\n')
			.filter(Boolean)
		const tracker = new YtDlpDownloadProgressTracker()
		const percents: number[] = []
		for (const line of lines) {
			const event = parseYtDlpOutputLine(line)
			if (event?.kind === 'requested-formats') tracker.setRequestedFormats(event.formats)
			if (event?.kind === 'download-progress') percents.push(tracker.update(event.progress).percent ?? Number.NaN)
		}

		percents.forEach((percent, i) => expect(percent, `record ${i}`).toBeGreaterThanOrEqual(percents[i - 1] ?? 0))
		expect(percents.at(-1)).toBe(100)
		// The bar moves on through the audio's fragments.
		const videoDone = percents[8] ?? 0
		expect(new Set(percents.slice(9, -1).filter(percent => percent > videoDone)).size).toBeGreaterThan(5)
	})

	// yt-dlp downloads requested formats one after another, in order, and prints
	// no progress for a stream already on disk.
	it('counts the streams before the current one as done', () => {
		const tracker = new YtDlpDownloadProgressTracker()
		tracker.setRequestedFormats([VIDEO, AUDIO])

		expect(tracker.update(progress({formatId: '250', downloadedBytes: 0, totalBytes: AUDIO.filesize})).percent).toBeCloseTo((VIDEO.filesize / TOTAL) * 100, 5)
	})

	// A fragmented stream estimates its size from the fragments so far; on the
	// first (index 0) that estimate is a few KiB and reads as complete.
	it('ignores the size estimate of the first fragment', () => {
		const tracker = new YtDlpDownloadProgressTracker()

		expect(tracker.update(progress({formatId: 'hls-1', downloadedBytes: 1024, totalBytesEstimate: 1024, fragmentIndex: 0, fragmentCount: 128})).percent).toBeUndefined()
		expect(tracker.update(progress({formatId: 'hls-1', downloadedBytes: 2_097_152, totalBytesEstimate: 134_217_728, fragmentIndex: 2, fragmentCount: 128})).percent).toBeCloseTo(1.5625, 5)
	})

	// A Part of video download hands the whole merged format to ffmpeg, whose one
	// finished record names the merged id (`395+250`), not a requested stream.
	it('reports a record for a format outside the requested ones on its own', () => {
		const tracker = new YtDlpDownloadProgressTracker()
		tracker.setRequestedFormats([VIDEO, AUDIO])

		expect(tracker.update(progress({status: 'finished', formatId: '395+250', totalBytes: TOTAL})).percent).toBe(100)
	})

	it('counts a stream already on disk as done from its finished record', () => {
		const tracker = new YtDlpDownloadProgressTracker()
		tracker.setRequestedFormats([VIDEO, AUDIO])

		expect(tracker.update(progress({status: 'finished', formatId: '395', totalBytes: VIDEO.filesize})).percent).toBeCloseTo((VIDEO.filesize / TOTAL) * 100, 5)
	})

	it('reports one stream on its own when no requested formats were printed', () => {
		const tracker = new YtDlpDownloadProgressTracker()

		expect(tracker.update(progress({downloadedBytes: 250, totalBytes: 1000})).percent).toBe(25)
	})

	it('estimates the time left over every remaining stream', () => {
		const tracker = new YtDlpDownloadProgressTracker()
		tracker.setRequestedFormats([
			{formatId: '137', filesize: 3000},
			{formatId: '140', filesize: 1000}
		])

		const combined = tracker.update(progress({formatId: '137', downloadedBytes: 2000, totalBytes: 3000, speedBps: 100, etaSeconds: 10}))
		expect(combined).toEqual({percent: 50, speedBps: 100, etaSeconds: 20})
	})

	it('starts over when the next video prints its requested formats', () => {
		const tracker = new YtDlpDownloadProgressTracker()
		tracker.setRequestedFormats([VIDEO, AUDIO])
		tracker.update(progress({status: 'finished', formatId: '395', downloadedBytes: VIDEO.filesize, totalBytes: VIDEO.filesize}))
		tracker.setRequestedFormats([{formatId: '18', filesize: 1000}])

		expect(tracker.update(progress({formatId: '18', downloadedBytes: 100, totalBytes: 1000})).percent).toBe(10)
	})
})

describe('planWorkflow — structured progress', () => {
	const URL = 'https://www.youtube.com/watch?v=jNQXAC9IVRw'

	function valueAfter(args: readonly string[], flag: string, prefix: string): string | undefined {
		return args.flatMap((arg, index) => (arg === flag && args[index + 1]?.startsWith(prefix) ? [args[index + 1]] : []))[0]
	}

	it('asks a caller media download for JSON progress and its requested formats', () => {
		const plan = planWorkflow({kind: 'media', url: URL, output: {directory: '/out'}, selection: {formatId: '395+250'}})

		expect(valueAfter(plan.args, '--progress-template', 'download:')).toBe(`download:${YT_DLP_PROGRESS_TEMPLATE}`)
		expect(valueAfter(plan.args, '--print', 'before_dl:')).toBe(`before_dl:${YT_DLP_REQUESTED_FORMATS_TEMPLATE}`)
		// --print implies --quiet, which would hide the lines callers read paths from.
		expect(plan.args).toContain('--no-quiet')
	})

	it('asks a caller subtitles download for JSON progress', () => {
		const plan = planWorkflow({kind: 'subtitles', url: URL, output: {directory: '/out'}, subtitles: {languages: ['en'], format: 'srt'}})

		expect(valueAfter(plan.args, '--progress-template', 'download:')).toBe(`download:${YT_DLP_PROGRESS_TEMPLATE}`)
	})
})
