import {describe, expect, it, vi} from 'vitest'
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
	job: {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '248+251', preset: 'custom', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}} satisfies PreparedJob
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
		parser.consume(active, '[download] 100% of   34.29KiB in 00:00:00 at 132.99KiB/s')

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
		parser.consume(active, '[download]  72.3% of  500.00KiB at   1.00MiB/s ETA 00:00')

		expect(emitProgress).toHaveBeenCalledOnce()
		expect(emitProgress.mock.calls[0][0].percent).toBeUndefined()
	})

	it('forwards percent for media files', () => {
		const emitProgress = vi.fn()
		const parser = new ProgressParser(vi.fn(), emitProgress)
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(active, '[download] Destination: /tmp/video.mp4')
		emitProgress.mockClear()
		parser.consume(active, '[download]  72.3% of  500.00KiB at   1.00MiB/s ETA 00:00')

		expect(emitProgress).toHaveBeenCalledOnce()
		expect(emitProgress.mock.calls[0][0].percent).toBe(72.3)
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

	it('emits artifact events for generated sidecar files', () => {
		const emitArtifact = vi.fn()
		const parser = new ProgressParser(vi.fn(), vi.fn(), emitArtifact)
		const active = makeActive(BASE_INPUT_SINGLE_FORMAT)

		parser.consume(active, '[info] Writing video description to: /tmp/video.description')
		parser.consume(active, '[info] Writing video metadata as JSON to: /tmp/video.info.json')
		parser.consume(active, '[info] Writing video thumbnail 41 to: /tmp/video.webp')

		expect(emitArtifact).toHaveBeenCalledTimes(3)
		expect(emitArtifact).toHaveBeenNthCalledWith(1, {jobId: 'job-1', path: '/tmp/video.description', kind: 'description', at: '2024-01-01T00:00:00.000Z'})
		expect(emitArtifact).toHaveBeenNthCalledWith(2, {jobId: 'job-1', path: '/tmp/video.info.json', kind: 'companion', at: '2024-01-01T00:00:00.000Z'})
		expect(emitArtifact).toHaveBeenNthCalledWith(3, {jobId: 'job-1', path: '/tmp/video.webp', kind: 'thumbnail', at: '2024-01-01T00:00:00.000Z'})
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
