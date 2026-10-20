// Video without audio from a stream that carries sound: every stream but the
// audio is copied into a new file (no re-encode), which then takes the
// original's place. A file with no audio stream is left as it is. The copy is
// written into a folder made for it beside the video: on the same disk, so the
// move is a rename, and never over a file the user already has.

import type {ChildProcessWithoutNullStreams} from 'node:child_process'
import {mkdtemp, rename, rm} from 'node:fs/promises'
import {basename, dirname, join} from 'node:path'
import log from 'electron-log/main.js'
import {runFfmpeg} from './ffmpegRun.js'

export const logger = log.scope('audio-strip')

// Asks for the file's first audio stream, copying one packet of it to nowhere:
// ffmpeg exits 0 when there is one, and says the map matches no streams when not.
function audioProbeArgs(videoPath: string): string[] {
	return ['-hide_banner', '-v', 'error', '-i', videoPath, '-map', '0:a:0', '-c', 'copy', '-frames:a', '1', '-f', 'null', '-']
}

export interface DropAudioResult {
	ok: boolean
	dropped: boolean
}

export async function dropAudioStreams(opts: {ffmpegPath: string; videoPath: string; onSpawn: (proc: ChildProcessWithoutNullStreams) => void; jobId: string}): Promise<DropAudioResult> {
	const {ffmpegPath, videoPath, onSpawn, jobId} = opts
	const probe = await runFfmpeg(ffmpegPath, audioProbeArgs(videoPath), onSpawn)
	if (!probe.ok) {
		if (probe.stderrTail.includes('matches no streams')) return {ok: true, dropped: false}
		logger.error('audio strip: could not read the file', {jobId, videoPath, stderrTail: probe.stderrTail})
		return {ok: false, dropped: false}
	}

	let scratchDir: string
	try {
		scratchDir = await mkdtemp(join(dirname(videoPath), '.arroxy-no-audio-'))
	} catch (err) {
		logger.error('audio strip: no room for the copy beside the video', {jobId, message: err instanceof Error ? err.message : String(err)})
		return {ok: false, dropped: false}
	}
	try {
		const copyPath = join(scratchDir, basename(videoPath))
		const copied = await runFfmpeg(ffmpegPath, ['-y', '-hide_banner', '-i', videoPath, '-map', '0', '-map', '-0:a', '-c', 'copy', copyPath], onSpawn)
		if (!copied.ok) {
			logger.error('audio strip: ffmpeg failed or cancelled', {jobId, videoPath, stderrTail: copied.stderrTail})
			return {ok: false, dropped: false}
		}
		await rename(copyPath, videoPath)
		return {ok: true, dropped: true}
	} catch (err) {
		logger.error('audio strip: could not put the copy in place', {jobId, message: err instanceof Error ? err.message : String(err)})
		return {ok: false, dropped: false}
	} finally {
		await rm(scratchDir, {recursive: true, force: true}).catch(() => {})
	}
}
