// Process lifecycle helpers for a download job. The tree kill itself (process
// group on Unix, `taskkill /T /F` on Windows, reaped-pid guard) lives in
// yt-dlp-bridge's runner; this file ties it to the job's processes and log.

import type {ChildProcessWithoutNullStreams} from 'node:child_process'
import log from 'electron-log/main.js'
import {killProcessTree} from 'yt-dlp-bridge/runner'

const logger = log.scope('download')

// The processes a download job may hold. Structural, so this file does not
// depend on the phase types.
interface JobProcesses {
	ytDlpProcess?: ChildProcessWithoutNullStreams
	ffmpegProcess?: ChildProcessWithoutNullStreams
}

// Drops the job's reference once the child exits, so pause and cancel see a
// job with no live process instead of signalling a stale pid.
export function forgetOnExit(proc: ChildProcessWithoutNullStreams, forget: () => void): void {
	proc.once('exit', forget)
	proc.once('close', forget)
}

// Every stop of a job's child goes through the tree kill, never a bare
// `proc.kill`: on Windows that ends only a PyInstaller yt-dlp's leader, its
// Python child keeps downloading, and `taskkill /T` can no longer reach it.
export function killJobProcess(proc: ChildProcessWithoutNullStreams, signal: NodeJS.Signals): void {
	killProcessTree(proc, signal, logger)
}

export function killActiveProcesses(active: JobProcesses, signal: NodeJS.Signals): void {
	if (active.ytDlpProcess) killJobProcess(active.ytDlpProcess, signal)
	if (active.ffmpegProcess) killJobProcess(active.ffmpegProcess, signal)
}
