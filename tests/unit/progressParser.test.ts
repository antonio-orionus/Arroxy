import {describe, expect, it, vi} from 'vite-plus/test'
import log from 'electron-log/main.js'
import {ProgressParser} from '@main/services/download/progressParser.js'
import {AsyncStack} from '@main/services/phases/types.js'
import {STATUS_KEY} from '@shared/schemas.js'
import type {ActiveDownload} from '@main/services/phases/types.js'
import type {DownloadJob, ResolvedStartDownloadInput} from '@shared/types.js'
import type {PreparedJob} from '@shared/preparedJob.js'

vi.mock('@main/utils/clock', () => ({nowIso: () => '2024-01-01T00:00:00.000Z'}))

const BASE_INPUT_SUBTITLE_ONLY: ResolvedStartDownloadInput = {url: 'https://www.youtube.com/watch?v=test', outputDir: '/tmp', job: {kind: 'subtitle-only', extractor: 'youtube', extractorKey: 'Youtube', subtitles: {languages: ['en-orig'], mode: 'sidecar', format: 'srt', writeAuto: false}} satisfies PreparedJob}

const BASE_INPUT_SINGLE_FORMAT: ResolvedStartDownloadInput = {
	url: 'https://www.youtube.com/watch?v=test',
	outputDir: '/tmp',
	job: {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '248+251', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}} satisfies PreparedJob
}

function makeJob(): DownloadJob {
	return {id: 'job-1', url: 'https://www.youtube.com/watch?v=test', outputDir: '/tmp', status: 'running', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z'}
}

function makeActive(input: ResolvedStartDownloadInput): ActiveDownload {
	return {
		job: makeJob(),
		input,
		controller: new AbortController(),
		get signal(): AbortSignal {
			return this.controller.signal
		},
		cancelRequested: false,
		pauseRequested: false,
		subtitlePaths: [],
		disposables: new AsyncStack()
	}
}

// Lines yt-dlp prints with the bridge's progress templates, from a real
// `-f 395+250` run: the video stream, then the audio stream.
const REQUESTED_395_250 = '[yt-dlp-bridge:formats] {"format_id":"395+250","filesize":null,"filesize_approx":367572,"requested":[{"format_id": "395", "filesize": 223779, "filesize_approx": 223778}, {"format_id": "250", "filesize": 143795, "filesize_approx": 143794}]}'
const BOTH_STREAMS = 223779 + 143795

function progressLine(formatId: string, fields: Record<string, number | string>): string {
	return `[yt-dlp-bridge:progress] ${JSON.stringify({progress: {status: 'downloading', ...fields}, format_id: formatId})}`
}

// yt-dlp redraws its progress line several times a second. Logging every redraw
// made progress a third of a user's log and rotated away the lines that explain
// a failure (issue #222), so the log keeps one line per 10% step.
describe('ProgressParser — progress logging', () => {
	function loggedProgressLines(): unknown[] {
		return vi
			.mocked(log.debug)
			.mock.calls.map(call => call[0])
			.filter(line => typeof line === 'string' && line.startsWith('[yt-dlp-bridge:progress]'))
	}

	it('logs one progress line per 10% step instead of every redraw', () => {
		vi.mocked(log.debug).mockClear()
		const parser = new ProgressParser(vi.fn(), vi.fn())
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)
		const lines = [100, 500, 1200, 1500].map(downloaded => progressLine('18', {downloaded_bytes: downloaded, total_bytes: 10_000}))
		const finished = `[yt-dlp-bridge:progress] ${JSON.stringify({progress: {status: 'finished', downloaded_bytes: 10_000, total_bytes: 10_000}, format_id: '18'})}`

		parser.consume(active, `${[...lines, finished].join('\r')}\n`)

		expect(loggedProgressLines()).toEqual([lines[0], lines[2], finished])
	})

	it('starts counting again when the next file begins', () => {
		vi.mocked(log.debug).mockClear()
		const parser = new ProgressParser(vi.fn(), vi.fn())
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)
		const video = progressLine('395', {downloaded_bytes: 5500, total_bytes: 10_000})
		const audio = progressLine('251', {downloaded_bytes: 5700, total_bytes: 10_000})

		parser.consume(active, `${video}\n[download] Destination: /tmp/video.f251.webm\n${audio}\n`)

		expect(loggedProgressLines()).toEqual([video, audio])
	})
})

// A Part of video download is ffmpeg's: it redraws a status line every half
// second and opens every HLS segment with a line carrying the full signed URL.
// Start-up is where most failures show, so the log keeps every status line for
// the first 30 s of ffmpeg's `elapsed=`, then one per 10 s, and the summary.
// A segment open is kept as a short line: segment number and host, no URL.
describe('ProgressParser — ffmpeg logging', () => {
	// The electron-log mock backs every level with one spy, so this is all levels.
	function loggedLines(): unknown[] {
		return vi.mocked(log.info).mock.calls.map(call => call[0])
	}

	it('logs every ffmpeg status line for 30 s, then one per 10 s, and the summary', () => {
		vi.mocked(log.info).mockClear()
		const parser = new ProgressParser(vi.fn(), vi.fn())
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)
		const status = (elapsed: string): string => `frame=  815 fps= 48 q=-1.0 size=    5632KiB time=00:00:31.13 bitrate=1481.8kbits/s speed=1.82x elapsed=${elapsed}`
		const summary = 'frame= 2817 fps= 51 q=-1.0 Lsize=  122116KiB time=00:01:55.03 bitrate=8696.3kbits/s speed=2.08x elapsed=0:00:55.29'
		const elapsed = ['0:00:00.50', '0:00:01.00', '0:00:10.04', '0:00:18.11', '0:00:29.90', '0:00:31.70', '0:00:35.20', '0:00:41.20', '0:00:49.90']

		parser.consume(active, [...elapsed.map(status), summary].join('\n') + '\n')

		const kept = ['0:00:00.50', '0:00:01.00', '0:00:10.04', '0:00:18.11', '0:00:29.90', '0:00:31.70', '0:00:41.20']
		expect(loggedLines().filter(line => typeof line === 'string' && line.startsWith('frame='))).toEqual([...kept.map(status), summary])
	})

	it('logs a segment open as its number and host, without the signed URL', () => {
		vi.mocked(log.info).mockClear()
		const parser = new ProgressParser(vi.fn(), vi.fn())
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(
			active,
			[
				"[https @ 0x13200a600] Opening 'https://rr3---sn-u15hn5-c5.googlevideo.com/videoplayback/id/02185adc2a9efdf9/itag/625/ip/203.0.113.7/sig/AE0s2JYw%3D%3D/playlist/index.m3u8/govp/slices%3D0-220/gosq/16/file/seg.ts' for reading",
				"[in#0/hls @ 0x1414055e0] Opening 'https://rr3---sn-u15hn5-c5.googlevideo.com/videoplayback/id/02185adc2a9efdf9/ip/203.0.113.7/gosq/0?is=1&file=seg.ts' for reading",
				"[hls @ 0x1414055e0] Opening 'https://cdn.example.com/stream/chunk-7.ts?token=secret' for reading"
			].join('\n') + '\n'
		)

		expect(loggedLines()).toEqual(['[https @ 0x13200a600] Opening segment 16 on rr3---sn-u15hn5-c5.googlevideo.com', '[in#0/hls @ 0x1414055e0] Opening segment 0 on rr3---sn-u15hn5-c5.googlevideo.com', '[hls @ 0x1414055e0] Opening cdn.example.com'])
	})
})

describe('ProgressParser — stream framing', () => {
	// yt-dlp redraws progress with a bare '\r' and only terminates real lines with
	// '\n'. When a Destination line is flushed behind a burst of redraws, splitting
	// on /\r?\n/ glued them into one unparseable blob: the sidecar path was never
	// recorded, so post-processing had nothing to fix and auto-captions kept their
	// overlaps. Reported as "playlists break subtitles" — really just a busy pipe.
	it('records a subtitle destination flushed behind progress redraws', () => {
		const parser = new ProgressParser(vi.fn(), vi.fn())
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(active, '[download]  50.0% of 10.00MiB at 1.00MiB/s ETA 00:05\r[download]  99.9% of 10.00MiB at 1.00MiB/s ETA 00:00\r[download] Destination: /tmp/video.en.srt\n')

		expect(active.subtitlePaths).toEqual(['/tmp/video.en.srt'])
	})

	it('keeps every character of a non-ASCII destination path', () => {
		const parser = new ProgressParser(vi.fn(), vi.fn())
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)
		const path = '/tmp/NzGuL - ین بازی‌ها رابطه‌مونو 😂.en.srt'

		parser.consume(active, `[download] Destination: ${path}\n`)

		expect(active.subtitlePaths).toEqual([path])
	})
})

describe('ProgressParser — subtitle-only progress', () => {
	it('records destination kind and emits matching status while switching files', () => {
		const emitStatus = vi.fn()
		const parser = new ProgressParser(emitStatus, vi.fn())
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(active, '[download] Destination: /tmp/video.en.srt')
		expect(active.currentFileKind).toBe('subtitle')
		expect(active.subtitlePaths).toEqual(['/tmp/video.en.srt'])

		parser.consume(active, '[download] Destination: /tmp/video.mp4')
		expect(active.currentFileKind).toBe('media')
		expect(active.mediaPath).toBe('/tmp/video.mp4')
		expect(emitStatus).toHaveBeenNthCalledWith(1, 'job-1', 'download', STATUS_KEY.fetchingSubtitles)
		expect(emitStatus).toHaveBeenNthCalledWith(2, 'job-1', 'download', STATUS_KEY.downloadingMedia)
	})

	it('tracks every non-subtitle destination as a media component', () => {
		const parser = new ProgressParser(vi.fn(), vi.fn())
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(active, '[download] Destination: /tmp/video.f137.webm')
		parser.consume(active, '[download] Destination: /tmp/video.f251.m4a')
		parser.consume(active, '[download] Destination: /tmp/video.en.srt')

		expect(active.mediaDownloadStarted).toBe(true)
		expect(active.mediaComponentPaths).toEqual(['/tmp/video.f137.webm', '/tmp/video.f251.m4a'])
		expect(active.mediaPath).toBe('/tmp/video.f251.m4a')
		expect(active.subtitlePaths).toEqual(['/tmp/video.en.srt'])
	})

	it('records already-downloaded media as a resumable media component', () => {
		const parser = new ProgressParser(vi.fn(), vi.fn())
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(active, '[download] /tmp/video.f137.webm has already been downloaded')

		expect(active.mediaDownloadStarted).toBe(true)
		expect(active.mediaComponentPaths).toEqual(['/tmp/video.f137.webm'])
		expect(active.mediaPath).toBe('/tmp/video.f137.webm')
	})

	it('records already-downloaded subtitles as final subtitle paths', () => {
		const parser = new ProgressParser(vi.fn(), vi.fn())
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(active, '[download] /tmp/video.en.srt has already been downloaded')

		expect(active.mediaDownloadStarted).toBeUndefined()
		expect(active.mediaPath).toBeUndefined()
		expect(active.subtitlePaths).toEqual(['/tmp/video.en.srt'])
	})

	it('emits percent for subtitle file when job is subtitle-only', () => {
		const emitProgress = vi.fn()
		const parser = new ProgressParser(vi.fn(), emitProgress)
		const active = makeActive(BASE_INPUT_SUBTITLE_ONLY)

		// Destination line sets currentFileKind = 'subtitle'
		parser.consume(active, '[download] Destination: /tmp/video.en-orig.srt')
		expect(active.currentFileKind).toBe('subtitle')

		emitProgress.mockClear()
		parser.consume(active, `[yt-dlp-bridge:progress] ${JSON.stringify({progress: {status: 'finished', downloaded_bytes: 35113, total_bytes: 35113}, format_id: null})}`)

		expect(emitProgress).toHaveBeenCalledOnce()
		expect(emitProgress.mock.calls[0][0].percent).toBe(100)
	})

	it('suppresses percent for subtitle file when job is NOT subtitle-only (sidecar subs)', () => {
		const emitProgress = vi.fn()
		const parser = new ProgressParser(vi.fn(), emitProgress)
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(active, '[download] Destination: /tmp/video.en.srt')
		expect(active.currentFileKind).toBe('subtitle')

		emitProgress.mockClear()
		parser.consume(active, `[yt-dlp-bridge:progress] ${JSON.stringify({progress: {status: 'downloading', downloaded_bytes: 723, total_bytes: 1000}, format_id: null})}`)

		expect(emitProgress).toHaveBeenCalledOnce()
		expect(emitProgress.mock.calls[0][0].percent).toBeUndefined()
	})

	it("forwards percent and yt-dlp's speed and time left for media files", () => {
		const emitProgress = vi.fn()
		const parser = new ProgressParser(vi.fn(), emitProgress)
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(active, '[download] Destination: /tmp/video.mp4')
		emitProgress.mockClear()
		const line = progressLine('18', {downloaded_bytes: 723, total_bytes: 1000, speed: 1_048_576, eta: 5})
		parser.consume(active, line)

		expect(emitProgress).toHaveBeenCalledOnce()
		expect(emitProgress.mock.calls[0][0]).toEqual({jobId: 'job-1', line, at: '2024-01-01T00:00:00.000Z', percent: 72.3, speedBps: 1_048_576, etaSeconds: 5})
	})

	// yt-dlp downloads a video+audio format as two streams, each reporting from
	// 0% again. Taken one at a time, the video filled the bar and the audio
	// download after it moved nothing.
	it('keeps the percent moving through the audio stream of a video+audio download', () => {
		const emitProgress = vi.fn()
		const parser = new ProgressParser(vi.fn(), emitProgress)
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(
			active,
			[
				REQUESTED_395_250,
				'[download] Destination: /tmp/video.f395.mp4',
				progressLine('395', {downloaded_bytes: 111_889, total_bytes: 223_779}),
				`[yt-dlp-bridge:progress] ${JSON.stringify({progress: {status: 'finished', downloaded_bytes: 223_779, total_bytes: 223_779}, format_id: '395'})}`,
				'[download] Destination: /tmp/video.f250.webm',
				progressLine('250', {downloaded_bytes: 71_897, total_bytes: 143_795}),
				progressLine('250', {downloaded_bytes: 130_048, total_bytes: 143_795})
			].join('\n')
		)

		const percents = emitProgress.mock.calls.map(([event]) => event.percent)
		expect(percents).toEqual([expect.closeTo((111_889 / BOTH_STREAMS) * 100, 5), expect.closeTo((223_779 / BOTH_STREAMS) * 100, 5), expect.closeTo(((223_779 + 71_897) / BOTH_STREAMS) * 100, 5), expect.closeTo(((223_779 + 130_048) / BOTH_STREAMS) * 100, 5)])
	})

	it('starts each yt-dlp run over from its own requested formats', () => {
		const emitProgress = vi.fn()
		const parser = new ProgressParser(vi.fn(), emitProgress)
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(active, `${REQUESTED_395_250}\n${progressLine('250', {downloaded_bytes: 0, total_bytes: 143_795})}\n`)
		parser.consume(active, `[yt-dlp-bridge:formats] {"format_id":"18","filesize":1000,"filesize_approx":null,"requested":null}\n${progressLine('18', {downloaded_bytes: 100, total_bytes: 1000})}\n`)

		expect(emitProgress.mock.calls.at(-1)?.[0].percent).toBe(10)
	})

	it('emits rounded sleep status from yt-dlp sleep lines', () => {
		const emitStatus = vi.fn()
		const parser = new ProgressParser(emitStatus, vi.fn())
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(active, '[download] Sleeping 2.6 seconds ...')

		expect(emitStatus).toHaveBeenCalledWith('job-1', 'download', STATUS_KEY.sleepingBetweenRequests, {seconds: 3})
	})

	it('emits merging status and records the merged media path', () => {
		const emitStatus = vi.fn()
		const parser = new ProgressParser(emitStatus, vi.fn())
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(active, '[Merger] Merging formats into "/tmp/final.mp4"')

		expect(active.mediaPath).toBe('/tmp/final.mp4')
		expect(emitStatus).toHaveBeenCalledWith('job-1', 'download', STATUS_KEY.mergingFormats)
	})

	it('marks media postprocess as started when postprocess statuses appear', () => {
		const emitStatus = vi.fn()
		const parser = new ProgressParser(emitStatus, vi.fn())
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(active, '[ExtractAudio] Destination: /tmp/video.m4a')

		expect(active.mediaPostprocessStarted).toBe(true)
		expect(emitStatus).toHaveBeenCalledWith('job-1', 'download', STATUS_KEY.extractingAudio)
	})

	it('records audio extraction destination as the final media path', () => {
		const parser = new ProgressParser(vi.fn(), vi.fn())
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(active, '[download] Destination: /tmp/video.webm')
		parser.consume(active, '[ExtractAudio] Destination: /tmp/video.mp3')

		expect(active.mediaComponentPaths).toEqual(['/tmp/video.webm'])
		expect(active.mediaPath).toBe('/tmp/video.mp3')
	})

	it('updates moved subtitle paths and emits artifact move events', () => {
		const emitArtifact = vi.fn()
		const parser = new ProgressParser(vi.fn(), vi.fn(), emitArtifact)
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(active, '[download] Destination: /tmp/.arroxy-temp/job/video.en.srt')
		parser.consume(active, '[MoveFiles] Moving file "/tmp/.arroxy-temp/job/video.en.srt" to "/tmp/video.en.srt"')

		expect(active.subtitlePaths).toEqual(['/tmp/video.en.srt'])
		expect(emitArtifact).toHaveBeenCalledWith({jobId: 'job-1', path: '/tmp/video.en.srt', kind: 'subtitle', fromPath: '/tmp/.arroxy-temp/job/video.en.srt', at: '2024-01-01T00:00:00.000Z'})
	})

	it('records generated sidecar files for completion instead of emitting them early', () => {
		const emitArtifact = vi.fn()
		const parser = new ProgressParser(vi.fn(), vi.fn(), emitArtifact)
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(active, '[info] Writing video description to: /tmp/video.description')
		parser.consume(active, '[info] Writing video metadata as JSON to: /tmp/video.info.json')
		parser.consume(active, '[info] Writing video thumbnail 41 to: /tmp/.arroxy-temp/video.webp')
		parser.consume(active, '[MoveFiles] Moving file "/tmp/.arroxy-temp/video.webp" to "/tmp/video.webp"')

		// A thumbnail can be written and then deleted by an embed, so sidecars
		// are reported at completion, once it is known they are still on disk.
		expect(emitArtifact).toHaveBeenCalledTimes(1)
		expect(emitArtifact).toHaveBeenCalledWith(expect.objectContaining({path: '/tmp/video.webp', fromPath: '/tmp/.arroxy-temp/video.webp'}))
		expect(active.sidecarPaths).toEqual(['/tmp/video.description', '/tmp/video.info.json', '/tmp/video.webp'])
	})

	it('marks cached probe info-json artifact events as internal', () => {
		const emitArtifact = vi.fn()
		const parser = new ProgressParser(vi.fn(), vi.fn(), emitArtifact)
		const active = makeActive({...BASE_INPUT_SINGLE_FORMAT, probeInfoJsonPath: '/tmp/.arroxy/probe.info.json'})

		parser.consume(active, '[info] Writing video metadata as JSON to: /tmp/.arroxy/probe.info.json')

		expect(emitArtifact).toHaveBeenCalledWith({jobId: 'job-1', path: '/tmp/.arroxy/probe.info.json', kind: 'companion', at: '2024-01-01T00:00:00.000Z', internal: true})
	})
})

describe('ProgressParser — transfer retries', () => {
	// The reported "works once, then needs a restart" stall: yt-dlp retried a
	// dead CDN host 16 times over ~8 minutes while the row showed "Downloading"
	// at 0%, because the retry line reached the progress channel (where the
	// formatter drops it) instead of the status channel.
	it('reports a media transfer retry as status rather than progress', () => {
		const emitStatus = vi.fn()
		const emitProgress = vi.fn()
		const parser = new ProgressParser(emitStatus, emitProgress)
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(active, "[download] Got error: (<HTTPSConnection(host='rr3---sn-txhxooxu-n5il.googlevideo.com', port=443) at 0x2b1>, 'Connection to rr3---sn-txhxooxu-n5il.googlevideo.com timed out. (connect timeout=20.0)'). Retrying (1/20)...\n")

		expect(emitStatus).toHaveBeenCalledWith('job-1', 'download', STATUS_KEY.retryingTransfer, {attempt: 1, total: 20})
		expect(emitProgress).not.toHaveBeenCalled()
	})
})
