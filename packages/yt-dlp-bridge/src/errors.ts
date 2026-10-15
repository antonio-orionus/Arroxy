import {classifyYtDlpStderr, errorKindMetadata, extractLastError} from 'ytdlp-errors'
import {excerpt} from './redaction.js'
import {CommandExecutionError} from './runner.js'
import type {StructuredError} from './types.js'

export function toStructuredError(error: unknown): StructuredError {
	if (error instanceof CommandExecutionError) {
		const stderr = [error.result.stderr, error.result.stdout, error.message].find(value => value.length > 0) ?? error.message
		const classified = classifyYtDlpStderr(stderr)
		const kind = inferUnsupportedUrl(stderr) ? 'unsupportedUrl' : classified.kind
		const metadata = errorKindMetadata(kind)
		const structured: StructuredError = {kind, message: extractLastError(stderr) ?? error.message, retryable: metadata.recoverable, exitCode: error.result.exitCode, stderrExcerpt: excerpt(stderr), suggestedFixes: suggestedFixes(kind, metadata.suggestedFlags)}
		const dependency = inferDependency(stderr)
		if (dependency) structured.dependency = dependency
		return structured
	}

	if (error instanceof Error) {
		return {kind: 'internal', message: error.message, retryable: false, stderrExcerpt: excerpt(error.stack ?? error.message), suggestedFixes: []}
	}

	return {kind: 'internal', message: String(error), retryable: false, suggestedFixes: []}
}

function inferDependency(text: string): string | undefined {
	if (/ffmpeg/i.test(text)) return 'ffmpeg'
	if (/ffprobe/i.test(text)) return 'ffprobe'
	if (/atomicparsley/i.test(text)) return 'AtomicParsley'
	if (/aria2c/i.test(text)) return 'aria2c'
	if (/curl_cffi|impersonat/i.test(text)) return 'curl_cffi'
	if (/\b(?:deno|node|bun|quickjs|javascript)\b/i.test(text)) return 'js-runtime'
	return undefined
}

function inferUnsupportedUrl(text: string): text is string {
	return /unsupported url|no suitable extractor|not a valid URL/i.test(text)
}

function suggestedFixes(kind: string, flags: readonly string[] | undefined): string[] {
	const fixes = new Set<string>()
	for (const flag of flags ?? []) fixes.add(`Consider ${flag} when appropriate.`)

	if (kind === 'missingDependency') fixes.add('Install the missing dependency or configure its path with the matching server environment variable.')
	if (kind === 'botBlock' || kind === 'loginRequired' || kind === 'ageRestricted') fixes.add('Provide cookies via a cookies file or cookies-from-browser configuration.')
	if (kind === 'rateLimit') fixes.add('Retry later or add conservative sleep/retry settings.')
	if (kind === 'geoBlocked') fixes.add('Use an allowed region, proxy, or yt-dlp geo-bypass option where legal.')
	if (kind === 'outOfDiskSpace') fixes.add('Free disk space or choose a different output root.')
	if (kind === 'outputNotWritable') fixes.add('Grant write access to the output root or choose a different one.')

	return [...fixes]
}
