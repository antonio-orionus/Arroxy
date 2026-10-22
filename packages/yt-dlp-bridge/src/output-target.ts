import {mkdir, rename, stat} from 'node:fs/promises'
import path from 'node:path'
import {expandsVariables, resolveManagedPath, type ResolvedOutputPolicy} from './filesystem.js'
import {templateLiteral} from './output-template.js'
import type {SubtitleMode} from './schemas.js'

// Where a workflow writes, and every yt-dlp flag that says so. yt-dlp runs
// expandvars(expanduser(...)) over every path it is given: over `-o` and
// `--print-to-file` before it fills fields, and over `--paths`,
// `--load-info-json` and `--download-archive` with no escape at all on POSIX.
// So no folder text reaches argv: the run's working directory is the folder
// (`plan.cwd`), every path in argv is relative to it, and the only literal
// text left, in the templates, goes through templateLiteral()
// (output-template.ts).

export interface CallerOutput {
	// Absolute: the job's folder and the run's working directory. Any characters.
	directory: string
	// The file name as an output template: fields, and literal text from
	// templateLiteral(). Relative to `directory`.
	template?: string
	// Where media and subtitle runs keep files in progress (`.part` included)
	// before yt-dlp moves each finished one to the same path under
	// `directory`. Inside `directory`, absolute or relative to it. yt-dlp has
	// no escape for it, so a variable below `directory` (`$NAME`, `%NAME%` on
	// Windows) is refused.
	tempDirectory?: string
	subtitleMode?: SubtitleMode
	// Files inside `directory` that yt-dlp appends what it wrote to.
	// finalPath: the media's absolute path once every postprocessor and the
	// move are done (`after_move:filepath`). subtitles: `requested_subtitles`
	// as JSON, one line per video, with each track's `filepath` (`after_video`,
	// which a `--skip-download` run reaches). With a `tempDirectory`, a track
	// yt-dlp wrote is reported where it wrote it, inside `tempDirectory`: its
	// move does not update `requested_subtitles`, and skips some converted
	// tracks. Read each `filepath` through settleReportedSubtitle().
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

// Written with `/`, which yt-dlp takes on Windows too, so argv is the same on
// every OS.
function relativeInside(directory: string, file: string): string | null {
	const relative = path.isAbsolute(file) ? path.relative(directory, file) : path.normalize(file)
	const escapes = relative === '' || relative === '.' || relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)
	return escapes ? null : relative.split(path.sep).join('/')
}

// A path the run reads or writes inside the folder, relative to it.
function insideTarget(directory: string, file: string, label: string): string {
	const relative = relativeInside(directory, file)
	if (relative === null) throw new Error(`${label} must be inside output.directory`)
	return relative
}

// `--paths`, `--load-info-json` and `--download-archive` take no template, so
// no escape: yt-dlp runs expand_path over them, and strips a `--paths` value
// first. Behind `./` a leading `~` or space is a folder name; a variable
// cannot be protected, so it is refused. `--paths` values also end in `/`,
// which keeps a trailing space.
function unexpandedRelative(relative: string, label: string): string {
	if (expandsVariables(relative)) throw new Error(`${label} names a variable yt-dlp would expand (${relative}); it has no escape there`)
	return `./${relative}`
}

function unexpandedInside(directory: string, file: string, label: string): string {
	return unexpandedRelative(insideTarget(directory, file, label), label)
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
export function loadInfoJsonArgs(output: CallerOutput, file: string | undefined, label: string): string[] {
	if (!file) return []
	return ['--load-info-json', relativeInside(output.directory, file) === null ? file : unexpandedInside(output.directory, file, label)]
}

// The temp folder relative to the folder, if the caller gave one.
function callerTemp(output: CallerOutput): string | undefined {
	return output.tempDirectory ? insideTarget(output.directory, output.tempDirectory, 'output.tempDirectory') : undefined
}

// yt-dlp downloads into the temp folder, `.part` files included, and moves a
// finished file to the same path under the folder.
function tempPathArgs(output: CallerOutput, temp: string | undefined): string[] {
	return temp ? ['--paths', `temp:${unexpandedInside(output.directory, temp, 'output.tempDirectory')}/`] : []
}

export function callerMediaOutputArgs(output: CallerOutput, options: CallerMediaOutputOptions): string[] {
	const template = callerOutputTemplate(output)
	const temp = callerTemp(output)
	const args = [...tempPathArgs(output, temp), '-o', template]
	if (temp && !options.skipDownload && options.resume?.writeInfoJson !== false) {
		args.push('--write-info-json', '-o', `infojson:${templateLiteral(`${temp}/${options.resume?.infoJsonBaseName ?? DEFAULT_INFO_JSON_BASE_NAME}`)}`)
	}
	args.push(...reportArgs(output))
	return args
}

// A track is written and converted in the temp folder (the subfolder too),
// then moved: `<temp>/subtitles/x.en.srt` ends as `subtitles/x.en.srt`.
export function callerSubtitlesOutputArgs(output: CallerOutput): string[] {
	const template = callerOutputTemplate(output)
	return [...tempPathArgs(output, callerTemp(output)), '-o', output.subtitleMode === 'subfolder' ? `${SUBTITLE_SUBFOLDER}/${template}` : template, ...reportArgs(output)]
}

// Where a track the subtitles report names is once the run is done, as an
// absolute path. yt-dlp reports a track it wrote at its path in the temp
// folder, then moves it to the same path under the folder, replacing an older
// file there. It never registers a track converted from dfxp, ttml or tt to
// srt for that move, so one still in the temp folder is moved here. A track
// outside the temp folder (found already present, or a run without one) is
// where the report says.
export async function settleReportedSubtitle(output: CallerOutput, filepath: string): Promise<string> {
	const directory = path.resolve(output.directory)
	const file = path.resolve(directory, filepath)
	const temp = callerTemp(output)
	const inTemp = temp === undefined ? null : relativeInside(path.resolve(directory, temp), file)
	if (inTemp === null) return file
	const settled = path.resolve(directory, inTemp)
	const leftInTemp = await stat(file).then(
		entry => entry.isFile(),
		() => false
	)
	if (leftInTemp) {
		await mkdir(path.dirname(settled), {recursive: true})
		await rename(file, settled)
	}
	return settled
}

// The output root is the run's working directory. A path inside it goes
// relative; one elsewhere is the server's own path and goes as configured.
function managedPath(policy: ResolvedOutputPolicy, file: string, label: string): string | null {
	const relative = relativeInside(policy.outputRoot, file)
	return relative === null ? null : unexpandedRelative(relative, label)
}

// A temp root that is the output root itself is `./` (path.relative compares
// as the OS does: without case on Windows).
export function managedOutputArgs(policy: ResolvedOutputPolicy): string[] {
	const temp = path.relative(policy.outputRoot, policy.tempRoot) === '' ? '.' : managedPath(policy, policy.tempRoot, 'tempRoot')
	return ['--paths', `temp:${temp === null ? policy.tempRoot : `${temp}/`}`, '--output', policy.outputTemplate]
}

// Relative to the output root unless the server allows any path.
export function managedDownloadArchiveArgs(policy: ResolvedOutputPolicy, archive: string | undefined, allowArbitraryOutputPaths: boolean): string[] {
	if (!archive) return []
	const resolved = resolveManagedPath(policy.outputRoot, archive, 'downloadArchive', allowArbitraryOutputPaths)
	return ['--download-archive', managedPath(policy, resolved, 'downloadArchive') ?? resolved]
}
