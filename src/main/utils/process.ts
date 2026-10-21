import {spawn, type ChildProcess, type ChildProcessWithoutNullStreams} from 'node:child_process'
import {existsSync} from 'node:fs'
import path from 'node:path'
import {killProcessTree, SPAWN_AS_PROCESS_GROUP, type KillableProcess, type RunnerLogger} from 'yt-dlp-bridge/runner'
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

export interface YtDlpSpawnOptions {
	e2eMode?: E2eHarnessMode
	transformEnv?: (env: NodeJS.ProcessEnv) => NodeJS.ProcessEnv
	// The run's folder, when its plan names one; else the app's own working directory.
	cwd?: string
}

export function spawnYtDlp(binaryPath: string, args: string[], ffmpegPath: string | null, opts: YtDlpSpawnOptions = {}): ChildProcessWithoutNullStreams {
	const env = envWithFfmpegPaths(ffmpegPath, {e2eMode: opts.e2eMode})
	return trackClose(spawn(binaryPath, args, {env: opts.transformEnv ? opts.transformEnv(env) : env, ...(opts.cwd === undefined ? {} : {cwd: opts.cwd}), shell: false, windowsHide: true, detached: SPAWN_AS_PROCESS_GROUP}))
}

export function spawnFFmpeg(binaryPath: string, args: string[]): ChildProcessWithoutNullStreams {
	return trackClose(
		spawn(binaryPath, args, {
			env: envWithFfmpegPaths(binaryPath),
			windowsHide: true,
			// Same group-leader trick as spawnYtDlp so killProcessTree's process-group
			// kill reaches any subprocesses ffmpeg might fork (rare but possible with
			// hardware-accelerated codecs that fan out to vendor helpers).
			detached: SPAWN_AS_PROCESS_GROUP
		})
	)
}

// How long a stopped tree gets to exit on SIGTERM before it is SIGKILLed.
export const TERMINATE_GRACE_MS = 2_000

// Stops a child spawned with SPAWN_AS_PROCESS_GROUP together with everything it
// forked. On Unix it sends SIGTERM first: yt-dlp's PyInstaller bootloader only
// removes its `_MEI*` unpack folder from TMPDIR when it can handle the signal,
// so SIGKILL alone leaves tens of MB behind on every stop (and some distros
// keep /tmp in RAM). yt-dlp and ffmpeg both exit at once on SIGTERM without
// finishing the file, so the `.part` stays a `.part`. A tree that has not
// closed after the grace gets SIGKILL. Windows' `taskkill /T /F` is already
// forced, so there is nothing to escalate there.
export function terminateProcessTree(proc: KillableProcess & Pick<ChildProcess, 'once'>, logger?: RunnerLogger): void {
	// A finalize drain reaches long-closed children: their pid and group id may
	// belong to someone else by now.
	if (closedChildren.has(proc)) return
	if (leaderExited(proc)) signalOpenGroup(proc, 'SIGTERM')
	else killProcessTree(proc, 'SIGTERM', logger)
	if (process.platform === 'win32') return
	const escalate = setTimeout(() => {
		if (leaderExited(proc)) signalOpenGroup(proc, 'SIGKILL')
		else killProcessTree(proc, 'SIGKILL', logger)
	}, TERMINATE_GRACE_MS)
	escalate.unref()
	// 'close', not 'exit': the leader can exit on SIGTERM while a descendant that
	// ignored it still holds the pipes, and that descendant still needs SIGKILL.
	proc.once('close', () => {
		closedChildren.add(proc)
		clearTimeout(escalate)
	})
}

// Children whose stdio has closed: the whole tree is gone. Only 'close' says
// so; a leader's exit code does not, since a descendant may outlive it.
const closedChildren = new WeakSet<object>()

function trackClose(proc: ChildProcessWithoutNullStreams): ChildProcessWithoutNullStreams {
	proc.once('close', () => closedChildren.add(proc))
	return proc
}

function leaderExited(proc: KillableProcess): boolean {
	return (proc.exitCode ?? null) !== null || (proc.signalCode ?? null) !== null
}

// The leader is reaped, so killProcessTree refuses its pid; its group is not
// gone while the tree has not closed (a descendant holds the pipes), and a group
// id is never handed to a new process while its group exists. Windows has no
// group to signal, and taskkill cannot walk from a reaped leader.
function signalOpenGroup(proc: KillableProcess, signal: NodeJS.Signals): void {
	if (process.platform === 'win32' || proc.pid == null) return
	try {
		process.kill(-proc.pid, signal)
	} catch {
		/* the group ended meanwhile */
	}
}
