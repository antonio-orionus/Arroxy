// Process-tree kill helpers. Extracted from DownloadService so the lifecycle
// concerns (which OS, how to kill grandchildren, signal nuance) live separately
// from job orchestration and progress parsing.
//
// Both yt-dlp and ffmpeg are spawned with `detached: true` on Unix (see
// utils/process.ts), making each spawn the leader of its own process group.
// `process.kill(-pid, signal)` then reaches every descendant in that group.
// On Windows we shell out to `taskkill /T /F`.

import {spawn, type ChildProcessWithoutNullStreams} from 'node:child_process'
import type {ActiveDownload} from '../phases/types.js'

function killProcessTree(proc: ChildProcessWithoutNullStreams, signal: NodeJS.Signals): void {
	if (proc.pid == null) {
		proc.kill(signal)
		return
	}
	if (process.platform === 'win32') {
		// /T tree, /F force. Failure modes are silent (already-exited PID, race
		// with natural close); the child's own 'close' will still fire if it was
		// alive — `settled` guards in invokeOnce absorb the duplicate.
		spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F'], {windowsHide: true})
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

export function killActiveProcesses(active: ActiveDownload, signal: NodeJS.Signals): void {
	if (active.ytDlpProcess) killProcessTree(active.ytDlpProcess, signal)
	if (active.ffmpegProcess) killProcessTree(active.ffmpegProcess, signal)
}
