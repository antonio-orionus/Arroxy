import {spawn, type ChildProcessWithoutNullStreams} from 'node:child_process'
import {StringDecoder} from 'node:string_decoder'
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

export function spawnYtDlp(binaryPath: string, args: string[], ffmpegPath: string | null, e2eMode?: E2eHarnessMode, transformEnv?: (env: NodeJS.ProcessEnv) => NodeJS.ProcessEnv): ChildProcessWithoutNullStreams {
	const env = envWithFfmpegPaths(ffmpegPath, {e2eMode})
	return spawn(binaryPath, args, {env: transformEnv ? transformEnv(env) : env, shell: false, windowsHide: true, detached: process.platform !== 'win32'})
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

// yt-dlp separates progress *updates* with a bare carriage return (that is what
// `\r` means on a terminal: overwrite the line you just drew) and only ends real
// lines with `\n`. Splitting on `/\r?\n/` therefore keeps a whole burst of
// progress redraws glued into one "line" — and silently swallows any real line
// that got flushed behind one, `[download] Destination: …` included. Every
// terminator is a line boundary.
export function splitStderrLines(text: string): string[] {
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
// ProgressParser scrapes out of that text, and a corrupted path fails silently —
// the file simply is not found where we look for it.
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
