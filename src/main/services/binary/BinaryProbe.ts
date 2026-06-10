import {execFile} from 'node:child_process'
import {constants as fsConstants} from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'
import {promisify} from 'node:util'
import type {DependencyFailure, DependencyId} from '@shared/types.js'

const execFileAsync = promisify(execFile)

const PROBE_TIMEOUT_MS = 10_000
const WINDOWS_YTDLP_PROBE_TIMEOUT_MS = 30_000

export function probeTimeoutMs(id: DependencyId, platform: NodeJS.Platform = process.platform): number {
	if (id === 'yt-dlp' && platform === 'win32') return WINDOWS_YTDLP_PROBE_TIMEOUT_MS
	return PROBE_TIMEOUT_MS
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

function abortFailure(message: string): DependencyFailure {
	return {kind: 'timeout', message, osCode: 'CANCELLED'}
}

export function probeArgs(id: DependencyId): string[] {
	if (id === 'ffmpeg' || id === 'ffprobe') return ['-version']
	return ['--version']
}

const MACOS_HOMEBREW_BIN_DIRS = ['/opt/homebrew/bin', '/usr/local/bin'] as const

export function fallbackPathCandidates(name: string, platform: NodeJS.Platform = process.platform): string[] {
	if (platform === 'darwin') return MACOS_HOMEBREW_BIN_DIRS.map(dir => path.join(dir, name))
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
export async function probeBinary(filePath: string, args: string[], timeoutMs: number = PROBE_TIMEOUT_MS, signal?: AbortSignal): Promise<{ok: true; output: string} | {ok: false; failure: DependencyFailure}> {
	if (signal?.aborted) return {ok: false, failure: abortFailure('Cancelled before probe')}
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
					resolve({ok: false, failure: abortFailure('Probe cancelled')})
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
				resolve({ok: false, failure: abortFailure('Probe cancelled')})
				return
			}
			resolve({ok: false, failure: classifyProbeError(err)})
		})
	})
}

// Discover binaries on PATH. On Windows uses `where.exe`; on POSIX uses `which`.
// Returns absolute paths in PATH order. Empty array on failure.
export async function whereOnPath(name: string, signal?: AbortSignal): Promise<string[]> {
	const found: string[] = []
	try {
		const tool = process.platform === 'win32' ? 'where' : 'which'
		const args = process.platform === 'win32' ? [name] : ['-a', name]
		const {stdout} = await execFileAsync(tool, args, {windowsHide: true, signal})
		found.push(
			...stdout
				.split(/\r?\n/)
				.map(line => line.trim())
				.filter(line => line.length > 0)
		)
	} catch {
		// PATH lookup failed; macOS GUI apps often miss Homebrew's bin dirs.
	}

	const fallbackCandidates = fallbackPathCandidates(name)
	const fallbackResults = await Promise.all(
		fallbackCandidates.map(async candidate => {
			try {
				await fsPromises.access(candidate)
				return candidate
			} catch {
				// absent fallback path
				return null
			}
		})
	)
	found.push(...fallbackResults.filter((candidate): candidate is string => candidate !== null))

	return [...new Set(found)]
}
