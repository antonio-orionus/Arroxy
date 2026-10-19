import {spawn, type ChildProcess} from 'node:child_process'
import {StringDecoder} from 'node:string_decoder'
import {redactArgs, excerpt} from './redaction.js'
import type {CommandResult} from './types.js'

/** Where the runner reports problems it absorbs. Defaults to silence. */
export interface RunnerLogger {
	warn(message: string, meta?: Record<string, unknown>): void
}

export interface RunCommandOptions {
	timeoutMs: number
	maxOutputBytes: number
	cwd?: string
	env?: NodeJS.ProcessEnv
	signal?: AbortSignal
	/** Called with each complete stdout line, trimmed and non-empty, as it arrives. */
	onStdoutLine?: (line: string) => void
	/** Called with each complete stderr line, trimmed and non-empty, as it arrives. */
	onStderrLine?: (line: string) => void
	logger?: RunnerLogger
}

export class CommandExecutionError extends Error {
	readonly result: CommandResult

	constructor(message: string, result: CommandResult) {
		super(message)
		this.name = 'CommandExecutionError'
		this.result = result
	}
}

// Spawn the child as the leader of its own process group on Unix, so
// killProcessTree's `kill(-pid)` reaches every descendant (yt-dlp forks ffmpeg,
// ffmpeg may fork codec helpers). Windows has no process groups; taskkill /T
// walks the tree instead. A detached child no longer receives the terminal's
// Ctrl+C, so callers stop it through the abort signal or killProcessTree.
export const SPAWN_AS_PROCESS_GROUP = process.platform !== 'win32'

// yt-dlp separates progress *updates* with a bare carriage return (that is what
// `\r` means on a terminal: overwrite the line you just drew) and only ends real
// lines with `\n`. Splitting on `/\r?\n/` therefore keeps a whole burst of
// progress redraws glued into one "line" — and silently swallows any real line
// that got flushed behind one, `[download] Destination: …` included. Every
// terminator is a line boundary.
export function splitOutputLines(text: string): string[] {
	return text.split(/[\r\n]+/).flatMap(line => {
		const trimmed = line.trim()
		return trimmed ? [trimmed] : []
	})
}

export interface StreamTextChunk {
	/** Everything decoded so far from this chunk. Never held back. */
	text: string
	/** Whole lines only — ends on a line boundary, or '' while a line is still in flight. */
	lines: string
}

export interface StreamTextReader {
	push(chunk: Buffer): StreamTextChunk
	/** Stream end: releases the trailing partial line and any truncated byte sequence. */
	flush(): StreamTextChunk
}

// A child's stdout is a byte stream, not a tidy sequence of lines. A pipe read
// caps at the highWaterMark and cuts wherever it lands, which breaks parsing two
// ways: `chunk.toString()` decodes each chunk alone, so a multi-byte UTF-8
// character straddling the cut becomes U+FFFD; and a line split across the cut
// reaches the parser as two fragments that match nothing. Both corrupt the paths
// scraped out of that text, and a corrupted path fails silently — the file
// simply is not found where it is looked for.
//
// `text` and `lines` are separate on purpose: accumulated stdout/stderr must stay
// complete for error classification and JSON parsing, while parsers must only
// ever see whole lines.
export function createStreamTextReader(): StreamTextReader {
	const decoder = new StringDecoder('utf8')
	let pending = ''

	const take = (text: string, atEnd: boolean): StreamTextChunk => {
		pending += text
		if (!pending) return {text, lines: ''}
		if (atEnd) {
			const lines = pending
			pending = ''
			return {text, lines}
		}
		const boundary = Math.max(pending.lastIndexOf('\n'), pending.lastIndexOf('\r'))
		if (boundary < 0) return {text, lines: ''}
		const lines = pending.slice(0, boundary + 1)
		pending = pending.slice(boundary + 1)
		return {text, lines}
	}

	return {push: chunk => take(decoder.write(chunk), false), flush: () => take(decoder.end(), true)}
}

/** The parts of a child process killProcessTree reads. */
export type KillableProcess = Pick<ChildProcess, 'pid' | 'exitCode' | 'signalCode' | 'kill'>

// A child node has reaped: its pid is free for the OS to hand to anything else.
function hasExited(proc: KillableProcess): boolean {
	return (proc.exitCode ?? null) !== null || (proc.signalCode ?? null) !== null
}

// Kills a child spawned with `detached: SPAWN_AS_PROCESS_GROUP` together with
// everything it forked.
export function killProcessTree(proc: KillableProcess, signal: NodeJS.Signals, logger?: RunnerLogger): void {
	// Never signal a reaped pid — `taskkill /T /F` or `kill(-pid)` would reach
	// whatever process tree has since been given that number.
	if (hasExited(proc)) return
	if (proc.pid == null) {
		proc.kill(signal)
		return
	}
	if (process.platform === 'win32') {
		// /T tree, /F force. Failure modes are silent (already-exited PID, race
		// with natural close); the child's own 'close' still fires if it was alive.
		// An 'error' (taskkill missing from PATH, EAGAIN) is only worth a log line:
		// with no listener it would crash the host process.
		const pid = proc.pid
		spawn('taskkill', ['/pid', String(pid), '/T', '/F'], {windowsHide: true}).on('error', error => logger?.warn('taskkill failed to start', {pid, message: error.message}))
		return
	}
	// Unix: the child is its own process-group leader. -pid hits the leader plus
	// every descendant in that group. Falls back to a single-process kill only if
	// the group call throws (ESRCH on a race).
	try {
		process.kill(-proc.pid, signal)
	} catch {
		proc.kill(signal)
	}
}

// Keeps the last `maxBytes` of a stream without copying the whole buffer on
// every chunk: chunks are kept as they arrive and joined once at the end.
function createOutputTail(maxBytes: number): {push(chunk: Buffer): void; text(): string} {
	const chunks: Buffer[] = []
	let size = 0
	return {
		push(chunk) {
			chunks.push(chunk)
			size += chunk.length
			while (chunks.length > 1 && size - (chunks[0]?.length ?? 0) >= maxBytes) size -= chunks.shift()?.length ?? 0
		},
		text() {
			const all = Buffer.concat(chunks, size)
			return (all.length > maxBytes ? all.subarray(all.length - maxBytes) : all).toString('utf8')
		}
	}
}

function createLineEmitter(onLine: ((line: string) => void) | undefined): {push(chunk: Buffer): void; flush(): void} {
	if (!onLine) return {push: () => undefined, flush: () => undefined}
	const reader = createStreamTextReader()
	const emit = (lines: string): void => {
		for (const line of splitOutputLines(lines)) onLine(line)
	}
	return {push: chunk => emit(reader.push(chunk).lines), flush: () => emit(reader.flush().lines)}
}

const KILL_ESCALATION_MS = 2_000

export async function runCommand(command: string, args: string[], options: RunCommandOptions): Promise<CommandResult> {
	const startedAt = Date.now()
	const redactedArgs = redactArgs(args)

	return await new Promise<CommandResult>((resolve, reject) => {
		let settled = false
		const child = spawn(command, args, {cwd: options.cwd, env: options.env, shell: false, windowsHide: true, detached: SPAWN_AS_PROCESS_GROUP, stdio: ['ignore', 'pipe', 'pipe']})

		const stdout = createOutputTail(options.maxOutputBytes)
		const stderr = createOutputTail(options.maxOutputBytes)
		const stdoutLines = createLineEmitter(options.onStdoutLine)
		const stderrLines = createLineEmitter(options.onStderrLine)
		let timedOut = false
		let aborted = false

		const kill = (reason: 'timeout' | 'abort'): void => {
			if (reason === 'timeout') timedOut = true
			if (reason === 'abort') aborted = true
			killProcessTree(child, 'SIGTERM', options.logger)
			setTimeout(() => {
				if (!settled) killProcessTree(child, 'SIGKILL', options.logger)
			}, KILL_ESCALATION_MS).unref()
		}

		const timer = setTimeout(() => kill('timeout'), options.timeoutMs)
		timer.unref()
		const onAbort = (): void => kill('abort')
		if (options.signal?.aborted) onAbort()
		options.signal?.addEventListener('abort', onAbort, {once: true})

		const settle = (): boolean => {
			if (settled) return false
			settled = true
			clearTimeout(timer)
			options.signal?.removeEventListener('abort', onAbort)
			return true
		}

		child.stdout.on('data', (chunk: Buffer) => {
			stdout.push(chunk)
			stdoutLines.push(chunk)
		})
		child.stderr.on('data', (chunk: Buffer) => {
			stderr.push(chunk)
			stderrLines.push(chunk)
		})

		child.on('error', error => {
			if (!settle()) return
			const result = makeResult(command, redactedArgs, stdout.text(), error.message, 127, startedAt)
			reject(new CommandExecutionError(`Failed to spawn ${command}: ${error.message}`, result))
		})

		child.on('close', code => {
			if (!settle()) return
			stdoutLines.flush()
			stderrLines.flush()
			const exitCode = timedOut ? 124 : aborted ? 130 : (code ?? 1)
			const stdoutText = stdout.text()
			const stderrText = stderr.text()
			const result = makeResult(command, redactedArgs, stdoutText, stderrText, exitCode, startedAt)
			if (result.exitCode === 0) {
				resolve(result)
				return
			}
			const reason = timedOut ? `Command timed out after ${options.timeoutMs}ms` : aborted ? 'Command was cancelled' : `Command exited with code ${result.exitCode}`
			const output = stderrText.length > 0 ? stderrText : stdoutText
			reject(new CommandExecutionError(`${reason}: ${command} ${redactedArgs.join(' ')}\n${excerpt(output)}`, result))
		})
	})
}

function makeResult(command: string, args: string[], stdout: string, stderr: string, exitCode: number, startedAt: number): CommandResult {
	return {command, args, stdout, stderr, exitCode, durationMs: Date.now() - startedAt}
}
