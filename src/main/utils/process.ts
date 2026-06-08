import {spawn, type ChildProcessWithoutNullStreams} from 'node:child_process'
import path from 'node:path'
import type {E2eHarnessMode} from '@main/e2eHarness.js'

// Linux: BtbN's shared ffmpeg build expects libav*.so.* siblings in
// the executable's own directory (or LD_LIBRARY_PATH). The binary has
// no rpath set, so we inject LD_LIBRARY_PATH at spawn time. Harmless on
// non-Linux (DYLD_LIBRARY_PATH is SIP-blocked on macOS, and Win uses
// native exe-dir DLL search).
function envWithFfmpegPaths(ffmpegPath: string | null, opts: {e2eMode?: E2eHarnessMode} = {}): NodeJS.ProcessEnv {
	const env = opts.e2eMode?.applySpawnEnv(process.env) ?? {...process.env}
	if (!ffmpegPath) return env
	const ffmpegDir = path.dirname(ffmpegPath)
	env.PATH = ffmpegDir + path.delimiter + (env.PATH ?? '')
	if (process.platform === 'linux') {
		env.LD_LIBRARY_PATH = ffmpegDir + path.delimiter + (env.LD_LIBRARY_PATH ?? '')
	}
	return env
}

export function spawnYtDlp(binaryPath: string, args: string[], ffmpegPath: string | null, e2eMode?: E2eHarnessMode): ChildProcessWithoutNullStreams {
	return spawn(binaryPath, args, {env: envWithFfmpegPaths(ffmpegPath, {e2eMode}), windowsHide: true, detached: process.platform !== 'win32'})
}

export function spawnFFmpeg(binaryPath: string, args: string[]): ChildProcessWithoutNullStreams {
	return spawn(binaryPath, args, {
		env: envWithFfmpegPaths(binaryPath),
		windowsHide: true,
		// Same group-leader trick as spawnYtDlp so killProcessTree's process-group
		// kill reaches any subprocesses ffmpeg might fork (rare but possible with
		// hardware-accelerated codecs that fan out to vendor helpers).
		detached: process.platform !== 'win32'
	})
}

export function splitStderrLines(text: string): string[] {
	return text
		.split(/\r?\n/)
		.map(line => line.trim())
		.filter(Boolean)
}
