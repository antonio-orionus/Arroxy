import {resolveManagedPath, type ResolvedOutputPolicy} from './filesystem.js'
import type {SubtitleMode} from './schemas.js'

// Where a workflow writes, and every yt-dlp flag that says so. yt-dlp reads
// each path flag its own way: `-o` is an output template, `--paths` and
// `--load-info-json` are plain paths. So the flags are composed here, in one
// place, and no planner turns a folder into a flag by itself.

export interface CallerOutput {
	directory: string
	template?: string
	tempDirectory?: string
	subtitleMode?: SubtitleMode
}

export interface CallerMediaOutputOptions {
	skipDownload: boolean
	resume?: {writeInfoJson?: boolean; infoJsonBaseName?: string}
}

const DEFAULT_CALLER_OUTPUT_TEMPLATE = '%(title).200B.%(ext)s'
const DEFAULT_INFO_JSON_BASE_NAME = '_arroxy'

export function callerOutputTemplate(output: CallerOutput): string {
	return output.template ?? DEFAULT_CALLER_OUTPUT_TEMPLATE
}

// A caller's directory is literal text, but `-o` is an output template, so a
// `%` in it would collapse (`%%`) or open a field (`%(`). `--paths` is not a
// template and takes the directory as it is.
function literalOutputPath(text: string): string {
	return text.replaceAll('%', '%%')
}

export function loadInfoJsonArgs(path: string | undefined): string[] {
	return path ? ['--load-info-json', path] : []
}

export function callerMediaOutputArgs(output: CallerOutput, options: CallerMediaOutputOptions): string[] {
	const template = callerOutputTemplate(output)
	const args = output.tempDirectory ? ['--paths', `home:${output.directory}`, '--paths', `temp:${output.tempDirectory}`, '-o', template] : ['-o', `${literalOutputPath(output.directory)}/${template}`]
	if (output.tempDirectory && !options.skipDownload && options.resume?.writeInfoJson !== false) {
		args.push('--write-info-json', '-o', `infojson:${literalOutputPath(`${output.tempDirectory}/${options.resume?.infoJsonBaseName ?? DEFAULT_INFO_JSON_BASE_NAME}`)}`)
	}
	return args
}

export function callerSubtitlesOutputArgs(output: CallerOutput): string[] {
	const directory = output.subtitleMode === 'subfolder' ? `${output.directory}/subtitles` : output.directory
	return ['-o', `${literalOutputPath(directory)}/${callerOutputTemplate(output)}`]
}

export function managedOutputArgs(policy: ResolvedOutputPolicy): string[] {
	return ['--paths', `home:${policy.outputRoot}`, '--paths', `temp:${policy.tempRoot}`, '--output', policy.outputTemplate]
}

// Relative to the output root unless the server allows any path.
export function managedDownloadArchiveArgs(policy: ResolvedOutputPolicy, archive: string | undefined, allowArbitraryOutputPaths: boolean): string[] {
	return archive ? ['--download-archive', resolveManagedPath(policy.outputRoot, archive, 'downloadArchive', allowArbitraryOutputPaths)] : []
}
