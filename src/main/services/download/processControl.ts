// Process-tree kill helpers. Extracted from DownloadService so the lifecycle
// concerns (which OS, how to kill grandchildren, signal nuance) live separately
// from job orchestration and progress parsing.
//
// Both yt-dlp and ffmpeg are spawned with `detached: true` on Unix (see
// utils/process.ts), making each spawn the leader of its own process group.
// `process.kill(-pid, signal)` then reaches every descendant in that group.
// On Windows we shell out to `taskkill /T /F`.

import {spawn, type ChildProcessWithoutNullStreams} from 'node:child_process'
import log from 'electron-log/main.js'

const logger = log.scope('download')

// The processes a download job may hold. Structural, so YtDlp can use the
// tree kill without depending on the phase types.
interface JobProcesses {
	ytDlpProcess?: ChildProcessWithoutNullStreams
	ffmpegProcess?: ChildProcessWithoutNullStreams
}

// A child node has reaped: its pid is free for the OS to hand to anything else.
function hasExited(proc: ChildProcessWithoutNullStreams): boolean {
	return (proc.exitCode ?? null) !== null || (proc.signalCode ?? null) !== null
}

export function killProcessTree(proc: ChildProcessWithoutNullStreams, signal: NodeJS.Signals): void {
	// Never signal a reaped pid — `taskkill /T /F` or `kill(-pid)` would reach
	// whatever process tree has since been given that number.
	if (hasExited(proc)) return
	if (proc.pid == null) {
		proc.kill(signal)
		return
	}
	if (process.platform === 'win32') {
		// /T tree, /F force. Failure modes are silent (already-exited PID, race
		// with natural close); the child's own 'close' will still fire if it was
		// alive — `settled` guards in invokeOnce absorb the duplicate.
		// An 'error' (taskkill missing from PATH, EAGAIN) is only worth a log line: with no listener it would crash main.
		spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], {windowsHide: true}).on('error', error => logger.warn('taskkill failed to start', {pid: proc.pid, message: error.message}))
		return
	}
	// Unix: child is its own process-group leader. -pid hits the leader plus
	// every descendant in that group — including grandchildren that yt-dlp/
	// ffmpeg might have forked. Falls back to a single-process kill only if the
	// group call throws (ESRCH on a race).
	try {
		process.kill(-proc.pid, signal)
	} catch {
		proc.kill(signal)
	}
}

// Drops the job's reference once the child exits, so pause and cancel see a
// job with no live process instead of signalling a stale pid.
export function forgetOnExit(proc: ChildProcessWithoutNullStreams, forget: () => void): void {
	proc.once('exit', forget)
	proc.once('close', forget)
}

export function killActiveProcesses(active: JobProcesses, signal: NodeJS.Signals): void {
	if (active.ytDlpProcess) killProcessTree(active.ytDlpProcess, signal)
	if (active.ffmpegProcess) killProcessTree(active.ffmpegProcess, signal)
}
