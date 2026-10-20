import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {createTranscriptProcess} from '../helpers/processTranscript.js'

vi.mock('node:fs/promises', () => ({mkdtemp: vi.fn(), rename: vi.fn().mockResolvedValue(undefined), rm: vi.fn().mockResolvedValue(undefined)}))

vi.mock('@main/utils/process.js', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/utils/process.js')>()
	return {...actual, spawnFFmpeg: vi.fn()}
})

import {join} from 'node:path'
import {mkdtemp, rename, rm} from 'node:fs/promises'
import {spawnFFmpeg} from '@main/utils/process.js'
import {dropAudioStreams} from '@main/services/audioStrip.js'

// What ffmpeg says when asked for the first audio stream of a file that has none.
const NO_AUDIO = `Stream map '' matches no streams.
To ignore this, add a trailing '?' to the map.
Failed to set value '0:a:0' for option 'map': Invalid argument
`
const PROBE_ARGS = ['-hide_banner', '-v', 'error', '-i', '/out/clip.mp4', '-map', '0:a:0', '-c', 'copy', '-frames:a', '1', '-f', 'null', '-']
const VIDEO_PROBE_ARGS = ['-hide_banner', '-v', 'error', '-i', '/out/clip.mp4', '-map', '0:V:0', '-c', 'copy', '-frames:v', '1', '-f', 'null', '-']
const NO_VIDEO = NO_AUDIO.replaceAll("'0:a:0'", "'0:V:0'")

function ffmpegRun(stderr: string, exitCode: number) {
	return createTranscriptProcess([{stream: 'stderr', data: stderr}, {close: exitCode}])
}

const OPTS = {ffmpegPath: '/fake/ffmpeg', videoPath: '/out/clip.mp4', onSpawn: vi.fn(), jobId: 'job-1'}

const SCRATCH = '/out/.arroxy-no-audio-x1'
const COPY = join(SCRATCH, 'clip.mp4')

beforeEach(() => {
	vi.clearAllMocks()
	vi.mocked(mkdtemp).mockResolvedValue(SCRATCH)
})

describe('dropAudioStreams', () => {
	it('leaves a file with no audio alone: one look, no copy', async () => {
		vi.mocked(spawnFFmpeg).mockReturnValueOnce(ffmpegRun(NO_AUDIO, 234) as never)

		expect(await dropAudioStreams(OPTS)).toEqual({ok: true, dropped: false})
		expect(spawnFFmpeg).toHaveBeenCalledTimes(1)
		expect(vi.mocked(spawnFFmpeg).mock.calls[0]?.[1]).toEqual(PROBE_ARGS)
		expect(rename).not.toHaveBeenCalled()
	})

	// A video-only profile on a site with only sound (SoundCloud) downloads the
	// sound: taking it off would leave nothing.
	it('keeps the audio of a file with no picture', async () => {
		vi.mocked(spawnFFmpeg)
			.mockReturnValueOnce(ffmpegRun('', 0) as never)
			.mockReturnValueOnce(ffmpegRun(NO_VIDEO, 234) as never)

		expect(await dropAudioStreams(OPTS)).toEqual({ok: true, dropped: false})
		expect(vi.mocked(spawnFFmpeg).mock.calls[1]?.[1]).toEqual(VIDEO_PROBE_ARGS)
		expect(rename).not.toHaveBeenCalled()
	})

	it('keeps a file it cannot read as it is', async () => {
		vi.mocked(spawnFFmpeg).mockReturnValueOnce(ffmpegRun('clip.mp4: Invalid data found when processing input', 1) as never)

		expect(await dropAudioStreams(OPTS)).toEqual({ok: false, dropped: false})
		expect(spawnFFmpeg).toHaveBeenCalledTimes(1)
	})

	it('copies every stream but the audio, then puts the copy in place of the file', async () => {
		vi.mocked(spawnFFmpeg)
			.mockReturnValueOnce(ffmpegRun('', 0) as never)
			.mockReturnValueOnce(ffmpegRun('', 0) as never)
			.mockReturnValueOnce(ffmpegRun('', 0) as never)

		expect(await dropAudioStreams(OPTS)).toEqual({ok: true, dropped: true})
		// yt-dlp's own stream copy (`stream_copy_opts`) minus the audio: data streams
		// MP4 can't hold (timecode, bin_data) would fail the copy.
		expect(vi.mocked(spawnFFmpeg).mock.calls[2]?.[1]).toEqual(['-y', '-hide_banner', '-i', '/out/clip.mp4', '-map', '0', '-map', '-0:a', '-dn', '-ignore_unknown', '-c', 'copy', '-c:s', 'mov_text', COPY])
		expect(rename).toHaveBeenCalledWith(COPY, '/out/clip.mp4')
		expect(rm).toHaveBeenCalledWith(SCRATCH, {recursive: true, force: true})
	})

	// A name picked beside the video could be a file the user already has there.
	it('writes the copy into a folder of its own, made beside the video so the move stays on one disk', async () => {
		vi.mocked(spawnFFmpeg)
			.mockReturnValueOnce(ffmpegRun('', 0) as never)
			.mockReturnValueOnce(ffmpegRun('', 0) as never)
			.mockReturnValueOnce(ffmpegRun('', 0) as never)

		await dropAudioStreams(OPTS)
		expect(mkdtemp).toHaveBeenCalledWith(join('/out', '.arroxy-no-audio-'))
	})

	it('keeps the original when the copy fails', async () => {
		vi.mocked(spawnFFmpeg)
			.mockReturnValueOnce(ffmpegRun('', 0) as never)
			.mockReturnValueOnce(ffmpegRun('', 0) as never)
			.mockReturnValueOnce(ffmpegRun('Conversion failed!', 1) as never)

		expect(await dropAudioStreams(OPTS)).toEqual({ok: false, dropped: false})
		expect(rename).not.toHaveBeenCalled()
		expect(rm).toHaveBeenCalledWith(SCRATCH, {recursive: true, force: true})
	})

	it('keeps the file when no folder can be made beside it', async () => {
		vi.mocked(mkdtemp).mockRejectedValueOnce(Object.assign(new Error('EACCES'), {code: 'EACCES'}))
		vi.mocked(spawnFFmpeg)
			.mockReturnValueOnce(ffmpegRun('', 0) as never)
			.mockReturnValueOnce(ffmpegRun('', 0) as never)

		expect(await dropAudioStreams(OPTS)).toEqual({ok: false, dropped: false})
		expect(spawnFFmpeg).toHaveBeenCalledTimes(2)
		expect(rename).not.toHaveBeenCalled()
	})

	it('hands every ffmpeg run to the caller, so a cancel can kill it', async () => {
		vi.mocked(spawnFFmpeg)
			.mockReturnValueOnce(ffmpegRun('', 0) as never)
			.mockReturnValueOnce(ffmpegRun('', 0) as never)
			.mockReturnValueOnce(ffmpegRun('', 0) as never)

		await dropAudioStreams(OPTS)
		expect(OPTS.onSpawn).toHaveBeenCalledTimes(3)
	})
})
