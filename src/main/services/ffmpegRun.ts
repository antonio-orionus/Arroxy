import type {ChildProcessWithoutNullStreams} from 'node:child_process'
import {spawnFFmpeg} from '@main/utils/process.js'

// Enough of ffmpeg's stderr to name the failing stream without flooding the log.
const STDERR_TAIL_CHARS = 2000

// One ffmpeg run. `onSpawn` hands the child to the caller, which kills it on cancel.
export function runFfmpeg(ffmpegPath: string, args: string[], onSpawn: (proc: ChildProcessWithoutNullStreams) => void): Promise<{ok: boolean; stderrTail: string}> {
	return new Promise(resolve => {
		let stderrTail = ''
		const proc = spawnFFmpeg(ffmpegPath, args)
		onSpawn(proc)
		proc.stderr.on('data', (chunk: Buffer | string) => {
			stderrTail = (stderrTail + chunk.toString()).slice(-STDERR_TAIL_CHARS)
		})
		proc.on('error', () => resolve({ok: false, stderrTail}))
		proc.on('close', code => resolve({ok: code === 0, stderrTail}))
	})
}
