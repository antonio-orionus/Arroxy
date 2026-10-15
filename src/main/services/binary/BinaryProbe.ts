import {execFile} from 'node:child_process'
import {constants as fsConstants} from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import type {DependencyFailure, DependencyId} from '@shared/types.js'

// ffmpeg/ffprobe ship inside the app bundle and answer `-version` in ~20ms.
const PROBE_TIMEOUT_MS = 30_000

// yt-dlp does not. Every platform gets the PyInstaller onefile build, which
// unpacks ~100 bundled libraries into a fresh temp directory on *every*
// invocation and deletes them on exit. The OS then inspects what was just
// written — Gatekeeper/XProtect on macOS, Defender on Windows — and a cold run
// measured 28-32s on an M5 Pro. A 30s budget sits inside that range, so the
// probe was being killed mid-success and the binary written off as broken.
const YT_DLP_PROBE_TIMEOUT_MS = 120_000

// Once one candidate has proven the environment hostile, the remaining ones are
// probed on a short leash. We are no longer asking "does this work?" but "is
// there a *fast* alternative here?" — a Homebrew or pipx yt-dlp is a Python
// wrapper script rather than an onefile bundle and answers in milliseconds. A
// candidate that cannot beat this clock is not the escape hatch we need, and
// waiting the full budget on each one turns a 2-minute stall into an 8-minute
// one on exactly the machines that are already struggling.
const SHORT_LEASH_PROBE_TIMEOUT_MS = 5_000
// A PATH scan is a few dozen stats and answers in milliseconds; one still
// running after this is stuck on an unreachable entry (an offline network
// share), and an unbounded one would hold binary resolution, and the splash,
// with it.
const PATH_LOOKUP_TIMEOUT_MS = 10_000

// 'full' is the ordinary budget. 'shortLeash' applies after an environment-fatal
// failure — see isEnvironmentFatalFailure in @shared/dependencyPolicy.
export type ProbeBudget = 'full' | 'shortLeash'

export function probeTimeoutMs(id: DependencyId, budget: ProbeBudget = 'full'): number {
	if (budget === 'shortLeash') return SHORT_LEASH_PROBE_TIMEOUT_MS
	return id === 'yt-dlp' ? YT_DLP_PROBE_TIMEOUT_MS : PROBE_TIMEOUT_MS
}

export function isAbortError(err: unknown): boolean {
	if (!(err instanceof Error)) return false
	return err.name === 'AbortError' || (err as {code?: string}).code === 'ABORT_ERR'
}

// Cancellation errors must keep their AbortError marker so classifyDownloadError
// → 'timeout'. A plain `new Error('Cancelled')` reads as a generic download_failed.
export function cancelError(message = 'Cancelled'): Error {
	const err = new Error(message)
	err.name = 'AbortError'
	return err
}

// A cancelled probe and a timed-out probe both surface as kind 'timeout', but
// they mean opposite things to the resolver: one says "the user left", the other
// says "this machine is slow". Carry the difference explicitly rather than
// making callers sniff osCode.
export type ProbeResult = {ok: true; output: string} | {ok: false; failure: DependencyFailure; cancelled?: true}

function abortResult(message: string): ProbeResult {
	return {ok: false, failure: {kind: 'timeout', message, osCode: 'CANCELLED'}, cancelled: true}
}

export function probeArgs(id: DependencyId): string[] {
	if (id === 'ffmpeg' || id === 'ffprobe') return ['-version']
	return ['--version']
}

const MACOS_HOMEBREW_BIN_DIRS = ['/opt/homebrew/bin', '/usr/local/bin'] as const

export function fallbackPathCandidates(name: string, platform: NodeJS.Platform = process.platform): string[] {
	// path.posix, not path: these are literal macOS paths, and the result must not
	// pick up backslashes just because the test asking for them runs on Windows.
	if (platform === 'darwin') return MACOS_HOMEBREW_BIN_DIRS.map(dir => path.posix.join(dir, name))
	if (platform !== 'win32') return []

	const exeName = name.toLowerCase().endsWith('.exe') ? name : `${name}.exe`
	return [
		process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WindowsApps', exeName) : null,
		process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Microsoft', 'WinGet', 'Links', exeName) : null,
		process.env.ProgramFiles ? path.join(process.env.ProgramFiles, 'WinGet', 'Links', exeName) : null,
		process.env['ProgramFiles(x86)'] ? path.join(process.env['ProgramFiles(x86)'], 'WinGet', 'Links', exeName) : null
	].filter((candidate): candidate is string => candidate !== null)
}

async function isExecutable(filePath: string): Promise<boolean> {
	try {
		await fsPromises.access(filePath, fsConstants.X_OK)
		return true
	} catch {
		return false
	}
}

export async function firstExecutable(candidates: string[]): Promise<string | null> {
	const executable = await Promise.all(candidates.map(candidate => isExecutable(candidate)))
	const firstIndex = executable.findIndex(Boolean)
	return firstIndex >= 0 ? (candidates[firstIndex] ?? null) : null
}

export function classifyProbeError(err: NodeJS.ErrnoException, stderr?: string): DependencyFailure {
	const code = err.code
	const msg = err.message ?? String(err)
	const errno = (err as {errno?: number}).errno
	const killed = (err as {killed?: boolean}).killed
	if (killed || code === 'ETIMEDOUT') return {kind: 'timeout', message: msg, osCode: code}
	if (code === 'ENOENT') return {kind: 'spawn_failed', message: msg, osCode: code}
	if (code === 'EACCES' || code === 'EPERM') return {kind: 'permission_denied', message: msg, osCode: code}
	const blob = `${msg} ${stderr ?? ''}`
	if (process.platform === 'win32' && /SmartScreen|Defender|virus|threat|0x800704EC|0x80070424/i.test(blob)) {
		return {kind: 'blocked_or_quarantined', message: msg, osCode: code}
	}
	if (process.platform === 'win32' && (code === 'UNKNOWN' || errno === -4094)) {
		return {kind: 'blocked_or_quarantined', message: msg, osCode: code}
	}
	return {kind: 'bad_exit_code', message: msg, osCode: code}
}

// Spawn a binary, run its --version probe, and classify failures. Pure I/O —
// no policy. Version-comparison + acceptability decisions live in
// BinaryResolver (the strategy chain inside BinaryManager).
export async function probeBinary(filePath: string, args: string[], timeoutMs: number = PROBE_TIMEOUT_MS, signal?: AbortSignal): Promise<ProbeResult> {
	if (signal?.aborted) return abortResult('Cancelled before probe')
	// BtbN's Linux shared ffmpeg/ffprobe build expects libav*.so.* siblings in
	// the executable's own directory. Inject LD_LIBRARY_PATH so probing the
	// bundled binary works the same way spawnYtDlp/spawnFFmpeg do at runtime.
	const env = process.platform === 'linux' ? {...process.env, LD_LIBRARY_PATH: path.dirname(filePath) + (process.env.LD_LIBRARY_PATH ? path.delimiter + process.env.LD_LIBRARY_PATH : '')} : undefined
	return new Promise(resolve => {
		let settled = false
		const child = execFile(filePath, args, {timeout: timeoutMs, windowsHide: true, maxBuffer: 1024 * 1024, signal, env}, (err, stdout, stderr) => {
			if (settled) return
			settled = true
			if (err) {
				if (isAbortError(err)) {
					resolve(abortResult('Probe cancelled'))
					return
				}
				resolve({ok: false, failure: classifyProbeError(err as NodeJS.ErrnoException, stderr)})
				return
			}
			const output = (stdout || stderr || '').trim()
			if (!output) {
				resolve({ok: false, failure: {kind: 'bad_exit_code', message: 'Empty version output'}})
				return
			}
			resolve({ok: true, output})
		})
		child.once('error', err => {
			if (settled) return
			settled = true
			if (isAbortError(err)) {
				resolve(abortResult('Probe cancelled'))
				return
			}
			resolve({ok: false, failure: classifyProbeError(err)})
		})
	})
}

// Absolute PATH entries only. `where.exe` also searches the working directory
// first, and a relative or empty entry resolves against it: either lets a
// binary planted next to the process shadow the real one.
function pathDirectories(rawPath: string | undefined): string[] {
	return (rawPath ?? '')
		.split(path.delimiter)
		.map(entry => entry.replace(/^"(.*)"$/, '$1'))
		.filter(entry => path.isAbsolute(entry))
}

async function isRunnableFile(candidate: string): Promise<boolean> {
	try {
		if (!(await fsPromises.stat(candidate)).isFile()) return false
	} catch (error) {
		// App Execution Aliases (WindowsApps\winget.exe) are reparse points that
		// stat refuses with EACCES although Windows launches them; access sees them.
		const aliasRefusal = process.platform === 'win32' && error instanceof Error && 'code' in error && error.code === 'EACCES'
		if (!aliasRefusal) return false
	}
	return isExecutable(candidate)
}

// Resolves when `work` settles, `timeoutMs` passes, or `signal` aborts, whichever
// comes first. Never rejects; `work` must not either.
async function settleWithin(work: Promise<unknown>, timeoutMs: number, signal?: AbortSignal): Promise<void> {
	if (signal?.aborted) return
	let timer: NodeJS.Timeout | undefined
	const stop = new AbortController()
	const cutoff = new Promise<void>(resolve => {
		timer = setTimeout(resolve, timeoutMs)
		signal?.addEventListener('abort', () => resolve(), {once: true, signal: stop.signal})
	})
	try {
		await Promise.race([work, cutoff])
	} finally {
		clearTimeout(timer)
		stop.abort()
	}
}

// A stat on an unreachable share holds one libuv threadpool worker for the SMB
// timeout (21s measured on Windows 11), and the pool has four by default: five
// offline shares on PATH starved the scan and stalled every other filesystem
// call in the process. Network candidates therefore take turns in one lane
// shared by every lookup, so they never hold more than one worker. Only UNC
// paths are recognised; a mapped drive letter looks local.
let networkLane: Promise<void> = Promise.resolve()

function isNetworkPath(candidate: string): boolean {
	return process.platform === 'win32' && /^[\\/]{2}(?![?.][\\/])/.test(candidate)
}

// Discover binaries on PATH, then in the platform's fallback locations (macOS
// GUI apps often miss Homebrew's bin dirs). Scans in-process rather than
// spawning `where`/`which`, whose process creation can stall on a loaded
// Windows host. Returns absolute paths in that order; a stalled entry is
// dropped at the deadline and the matches that answered are kept.
export async function whereOnPath(name: string, signal?: AbortSignal): Promise<string[]> {
	const candidates = [...pathDirectories(process.env.PATH).map(dir => path.join(dir, name)), ...fallbackPathCandidates(name)]
	const matches: Array<string | null> = candidates.map(() => null)
	let expired = false
	const check = async (candidate: string, index: number): Promise<void> => {
		if (await isRunnableFile(candidate)) matches[index] = candidate
	}
	const checks = candidates.map((candidate, index) => {
		if (!isNetworkPath(candidate)) return check(candidate, index)
		// A turn reached after this lookup gave up is skipped, so a stalled share
		// does not leave a backlog of dead checks queued behind it.
		const turn = networkLane.then(() => (expired ? undefined : check(candidate, index)))
		networkLane = turn
		return turn
	})
	await settleWithin(Promise.all(checks), PATH_LOOKUP_TIMEOUT_MS, signal)
	expired = true
	return [...new Set(matches.filter((match): match is string => match !== null))]
}
