// Process lifecycle helpers for a download job. The tree stop itself (SIGTERM
// then SIGKILL to the process group on Unix, `taskkill /T /F` on Windows,
// reaped-pid guard) lives in utils/process and yt-dlp-bridge's runner; this
// file ties it to the job's processes and log.

import type {ChildProcessWithoutNullStreams} from 'node:child_process'
import log from 'electron-log/main.js'
import {terminateProcessTree} from '@main/utils/process.js'

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

// Every stop of a job's child (pause, cancel, cancel before spawn, finalize)
// goes through the tree terminate, never a bare `proc.kill`: on Windows that
// ends only a PyInstaller yt-dlp's leader while its Python child keeps
// downloading, and on Unix a SIGKILL leaves its unpack folder in TMPDIR.
export function stopJobProcess(proc: ChildProcessWithoutNullStreams): void {
	terminateProcessTree(proc, logger)
}

export function stopActiveProcesses(active: JobProcesses): void {
	if (active.ytDlpProcess) stopJobProcess(active.ytDlpProcess)
	if (active.ffmpegProcess) stopJobProcess(active.ffmpegProcess)
}
