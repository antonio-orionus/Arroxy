import {spawn, type ChildProcessWithoutNullStreams} from 'node:child_process'
import {existsSync} from 'node:fs'
import path from 'node:path'
import {SPAWN_AS_PROCESS_GROUP} from 'yt-dlp-bridge/runner'
import type {E2eHarnessMode} from '@main/e2eHarness.js'

// Linux: BtbN's shared ffmpeg build expects libav*.so.* siblings in
// the executable's own directory (or LD_LIBRARY_PATH). The binary has
// no rpath set, so we inject LD_LIBRARY_PATH at spawn time. Harmless on
// non-Linux (DYLD_LIBRARY_PATH is SIP-blocked on macOS, and Win uses
// native exe-dir DLL search).
// macOS's embedded ffmpeg is a static OpenSSL build whose CA path points into
// the machine that built it, so every HTTPS open fails certificate verification.
// yt-dlp's ffmpeg downloader (any part of a video) opens the media URL in ffmpeg
// itself, so the child needs a bundle: OpenSSL reads SSL_CERT_FILE. Windows'
// build uses Schannel and Linux's finds the distro bundle, so only macOS needs
// this; a bundle or directory the user already set wins.
const MACOS_CA_BUNDLE = '/etc/ssl/cert.pem'

function withCaBundle(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
	if (process.platform !== 'darwin' || env.SSL_CERT_FILE || env.SSL_CERT_DIR || !existsSync(MACOS_CA_BUNDLE)) return env
	env.SSL_CERT_FILE = MACOS_CA_BUNDLE
	return env
}

export function envWithFfmpegPaths(ffmpegPath: string | null, opts: {e2eMode?: E2eHarnessMode} = {}): NodeJS.ProcessEnv {
	const env = opts.e2eMode?.applySpawnEnv(process.env) ?? {...process.env}
	if (!ffmpegPath) return env
	withCaBundle(env)
	const ffmpegDir = path.dirname(ffmpegPath)
	env.PATH = ffmpegDir + path.delimiter + (env.PATH ?? '')
	if (process.platform === 'linux') {
		env.LD_LIBRARY_PATH = ffmpegDir + path.delimiter + (env.LD_LIBRARY_PATH ?? '')
	}
	return env
}

// The environment a yt-dlp child runs with, which is also what yt-dlp expands
// `$NAME` in its output paths against.
export function ytDlpChildEnv(ffmpegPath: string | null, e2eMode?: E2eHarnessMode, transformEnv?: (env: NodeJS.ProcessEnv) => NodeJS.ProcessEnv): NodeJS.ProcessEnv {
	const env = envWithFfmpegPaths(ffmpegPath, {e2eMode})
	return transformEnv ? transformEnv(env) : env
}

export function spawnYtDlp(binaryPath: string, args: string[], ffmpegPath: string | null, e2eMode?: E2eHarnessMode, transformEnv?: (env: NodeJS.ProcessEnv) => NodeJS.ProcessEnv): ChildProcessWithoutNullStreams {
	return spawn(binaryPath, args, {env: ytDlpChildEnv(ffmpegPath, e2eMode, transformEnv), shell: false, windowsHide: true, detached: SPAWN_AS_PROCESS_GROUP})
}

export function spawnFFmpeg(binaryPath: string, args: string[]): ChildProcessWithoutNullStreams {
	return spawn(binaryPath, args, {
		env: envWithFfmpegPaths(binaryPath),
		windowsHide: true,
		// Same group-leader trick as spawnYtDlp so killProcessTree's process-group
		// kill reaches any subprocesses ffmpeg might fork (rare but possible with
		// hardware-accelerated codecs that fan out to vendor helpers).
		detached: SPAWN_AS_PROCESS_GROUP
	})
}
