// Video without audio from a stream that carries sound: every stream but the
// audio is copied into a new file (no re-encode), which then takes the
// original's place. A file with no audio stream, or with no picture, is left
// as it is. The copy is
// written into a folder made for it beside the video: on the same disk, so the
// move is a rename, and never over a file the user already has.

import type {ChildProcessWithoutNullStreams} from 'node:child_process'
import {mkdtemp, rename, rm} from 'node:fs/promises'
import {basename, dirname, join} from 'node:path'
import log from 'electron-log/main.js'
import {runFfmpeg} from './ffmpegRun.js'

export const logger = log.scope('audio-strip')

// Asks for the file's first stream of a kind (`a` audio, `V` video that is no
// cover picture), copying one packet of it to nowhere: ffmpeg exits 0 when
// there is one, and says the map matches no streams when not.
function streamProbeArgs(videoPath: string, kind: 'a' | 'V'): string[] {
	return ['-hide_banner', '-v', 'error', '-i', videoPath, '-map', `0:${kind}:0`, '-c', 'copy', `-frames:${kind.toLowerCase()}`, '1', '-f', 'null', '-']
}

type StreamCheck = 'present' | 'absent' | 'unreadable'

async function hasStream(ffmpegPath: string, videoPath: string, kind: 'a' | 'V', onSpawn: (proc: ChildProcessWithoutNullStreams) => void, jobId: string): Promise<StreamCheck> {
	const probe = await runFfmpeg(ffmpegPath, streamProbeArgs(videoPath, kind), onSpawn)
	if (probe.ok) return 'present'
	if (probe.stderrTail.includes('matches no streams')) return 'absent'
	logger.error('audio strip: could not read the file', {jobId, videoPath, stderrTail: probe.stderrTail})
	return 'unreadable'
}

export interface DropAudioResult {
	ok: boolean
	dropped: boolean
}

export async function dropAudioStreams(opts: {ffmpegPath: string; videoPath: string; onSpawn: (proc: ChildProcessWithoutNullStreams) => void; jobId: string}): Promise<DropAudioResult> {
	const {ffmpegPath, videoPath, onSpawn, jobId} = opts
	const audio = await hasStream(ffmpegPath, videoPath, 'a', onSpawn, jobId)
	if (audio !== 'present') return {ok: audio === 'absent', dropped: false}
	// A site with sound only gave its sound: taking that off would leave nothing.
	const video = await hasStream(ffmpegPath, videoPath, 'V', onSpawn, jobId)
	if (video !== 'present') return {ok: video === 'absent', dropped: false}

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
