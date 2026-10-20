import path from 'node:path'
import {resolveManagedPath, type ResolvedOutputPolicy} from './filesystem.js'
import type {SubtitleMode} from './schemas.js'

// Where a workflow writes, and every yt-dlp flag that says so. yt-dlp runs
// expandvars(expanduser(...)) over every path it is given: over `-o` and
// `--print-to-file` before it fills fields, and over `--paths`,
// `--load-info-json` and `--download-archive` with no escape at all on POSIX.
// So no folder text reaches argv: the run's working directory is the folder
// (`plan.cwd`), every path in argv is relative to it, and the only literal
// text left, in the templates, goes through templateLiteral().

export interface CallerOutput {
	// Absolute: the job's folder and the run's working directory. Any characters.
	directory: string
	// The file name as an output template: fields, and literal text from
	// templateLiteral(). Relative to `directory`.
	template?: string
	// Inside `directory`, absolute or relative to it.
	tempDirectory?: string
	subtitleMode?: SubtitleMode
	// Files inside `directory` that yt-dlp appends what it wrote to.
	// finalPath: the media's absolute path once every postprocessor and the
	// move are done (`after_move:filepath`). subtitles: `requested_subtitles`
	// as JSON, one line per video, with each track's `filepath` (`after_video`,
	// which a `--skip-download` run reaches).
	report?: {finalPath?: string; subtitles?: string}
}

export interface CallerMediaOutputOptions {
	skipDownload: boolean
	resume?: {writeInfoJson?: boolean; infoJsonBaseName?: string}
}

const DEFAULT_CALLER_OUTPUT_TEMPLATE = '%(title).200B.%(ext)s'
const DEFAULT_INFO_JSON_BASE_NAME = '_arroxy'
const SUBTITLE_SUBFOLDER = 'subtitles'

export function callerOutputTemplate(output: CallerOutput): string {
	return output.template ?? DEFAULT_CALLER_OUTPUT_TEMPLATE
}

/**
 * Literal text for an output template (`-o`, a `--print-to-file` file). Each
 * `%`, `$` and `~` becomes an absent field whose default is that sign,
 * `%(_absent|$)s`. yt-dlp expands before it fills fields, so expansion never
 * sees a `$`, a leading `~` or a `%NAME%`, and the fill then puts the sign
 * back. Lossless on POSIX and Windows.
 *
 * Not `%%`: ntpath pairs `%` signs left to right, and one field before a `%%`
 * (yt-dlp's own escape) shifts the pairing so that a literal `%NAME%`
 * expands. Here every run between two `%` signs starts with `(` or `)`, which
 * no set variable's name does, and each sign adds two `%`, so the pairing of
 * what follows stays as it was.
 */
export function templateLiteral(text: string): string {
	return text.replace(/[%$~]/g, sign => `%(_absent|${sign})s`)
}

function relativeInside(directory: string, file: string): string | null {
	const relative = path.isAbsolute(file) ? path.relative(directory, file) : path.normalize(file)
	const escapes = relative === '' || relative === '.' || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)
	return escapes ? null : relative
}

// A path the run reads or writes inside the folder, relative to it.
function insideTarget(directory: string, file: string, label: string): string {
	const relative = relativeInside(directory, file)
	if (relative === null) throw new Error(`${label} must be inside output.directory`)
	return relative
}

function reportArgs(output: CallerOutput): string[] {
	const args: string[] = []
	const {finalPath, subtitles} = output.report ?? {}
	if (finalPath) args.push('--print-to-file', 'after_move:filepath', templateLiteral(insideTarget(output.directory, finalPath, 'output.report.finalPath')))
	if (subtitles) args.push('--print-to-file', 'after_video:%(requested_subtitles)j', templateLiteral(insideTarget(output.directory, subtitles, 'output.report.subtitles')))
	return args
}

// A file from outside the folder (a probe's info-json) is the caller's own
// path and goes as given; yt-dlp expands it.
export function loadInfoJsonArgs(output: CallerOutput, file: string | undefined): string[] {
	if (!file) return []
	return ['--load-info-json', relativeInside(output.directory, file) ?? file]
}

export function callerMediaOutputArgs(output: CallerOutput, options: CallerMediaOutputOptions): string[] {
	const template = callerOutputTemplate(output)
	const temp = output.tempDirectory ? insideTarget(output.directory, output.tempDirectory, 'output.tempDirectory') : undefined
	const args = temp ? ['--paths', `temp:${temp}`, '-o', template] : ['-o', template]
	if (temp && !options.skipDownload && options.resume?.writeInfoJson !== false) {
		args.push('--write-info-json', '-o', `infojson:${templateLiteral(path.join(temp, options.resume?.infoJsonBaseName ?? DEFAULT_INFO_JSON_BASE_NAME))}`)
	}
	args.push(...reportArgs(output))
	return args
}

export function callerSubtitlesOutputArgs(output: CallerOutput): string[] {
	const template = callerOutputTemplate(output)
	return ['-o', output.subtitleMode === 'subfolder' ? `${SUBTITLE_SUBFOLDER}/${template}` : template, ...reportArgs(output)]
}

// The output root is the run's working directory. A temp root inside it goes
// relative; one elsewhere is the server's own path and goes as configured.
export function managedOutputArgs(policy: ResolvedOutputPolicy): string[] {
	return ['--paths', `temp:${relativeInside(policy.outputRoot, policy.tempRoot) ?? policy.tempRoot}`, '--output', policy.outputTemplate]
}

// Relative to the output root unless the server allows any path.
export function managedDownloadArchiveArgs(policy: ResolvedOutputPolicy, archive: string | undefined, allowArbitraryOutputPaths: boolean): string[] {
	if (!archive) return []
	const resolved = resolveManagedPath(policy.outputRoot, archive, 'downloadArchive', allowArbitraryOutputPaths)
	return ['--download-archive', relativeInside(policy.outputRoot, resolved) ?? resolved]
}
