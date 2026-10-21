import fs from 'node:fs'
import path from 'node:path'
import type {ServerConfig} from './config.js'

interface PathImplementation {
	relative(from: string, to: string): string
	isAbsolute(path: string): boolean
}

export interface OutputPolicyInput {
	outputRoot?: string | undefined
	outputTemplate?: string | undefined
	tempRoot?: string | undefined
	allowOverwrite?: boolean
}

export interface ResolvedOutputPolicy {
	outputRoot: string
	tempRoot: string
	outputTemplate: string
	allowOverwrite: boolean
}

export function isPathInside(parent: string, child: string): boolean {
	return isPathInsideWith(path, parent, child)
}

export function isPathInsideWith(pathImpl: PathImplementation, parent: string, child: string): boolean {
	const relative = pathImpl.relative(parent, child)
	return relative === '' || (!relative.startsWith('..') && !pathImpl.isAbsolute(relative))
}

// What os.path.expandvars may change in a path, which yt-dlp's expand_path
// runs after expanduser. POSIX: `$name`, `${name}`. Windows (ntpath): also a
// `%name%` pair, `%%`, `$$`, and names with `-`. A lone `%`, a `$` before no
// name, or a `${` never closed, is literal. Set or not: the child's environment is the caller's.
const VARIABLE = process.platform === 'win32' ? /%[^%]*%|\$(?:[-\w$]|\{[^}]*\})/ : /\$(?:\w|\{[^}]*\})/
const LEADING_VARIABLE = process.platform === 'win32' ? /^(?:%[^%]*%|\$(?:[-\w]|\{[^}]*\}))/ : /^\$(?:\w|\{[^}]*\})/

export function expandsVariables(text: string): boolean {
	return VARIABLE.test(text)
}

// How yt-dlp reads a path flag: `--cookies` through expand_path,
// `--netrc-location` through expanduser only, `--plugin-dirs` as given.
export type YtDlpPathReading = 'expand-path' | 'expand-user' | 'literal'

// A path the caller gives yt-dlp (a cookie jar, a netrc, a plugin folder) is
// relative to the caller's working directory. A plan with its own `runCwd`
// (one that writes files) runs elsewhere, so a relative one is made absolute
// for it, unless yt-dlp's expansion makes it absolute (a leading `~` or
// variable). The caller's directory must then add nothing yt-dlp would expand.
export function callerPath(file: string, runCwd: string | undefined, reading: YtDlpPathReading, label: string, cwd: string = process.cwd()): string {
	if (runCwd === undefined || path.isAbsolute(file)) return file
	if (reading !== 'literal' && file.startsWith('~')) return file
	if (reading === 'expand-path') {
		if (LEADING_VARIABLE.test(file)) return file
		if (expandsVariables(cwd)) throw new Error(`${label} is relative to a working directory yt-dlp would expand (${cwd}); give an absolute path`)
	}
	return path.resolve(cwd, file)
}

export function hasParentTraversal(input: string): boolean {
	return input.split(/[\\/]+/).some(part => part === '..')
}

export function ensureWithinRoot(root: string, candidate: string, label: string): string {
	const resolvedRoot = path.resolve(root)
	const resolvedCandidate = path.resolve(candidate)
	if (!isPathInside(resolvedRoot, resolvedCandidate)) {
		throw new Error(`${label} must stay inside output root: ${resolvedRoot}`)
	}
	return resolvedCandidate
}

export function resolveManagedPath(root: string, candidate: string, label: string, allowArbitraryPath: boolean): string {
	const resolvedRoot = path.resolve(root)
	const resolvedCandidate = path.isAbsolute(candidate) ? path.resolve(candidate) : path.resolve(resolvedRoot, candidate)
	if (!allowArbitraryPath) ensureWithinRoot(resolvedRoot, resolvedCandidate, label)
	return resolvedCandidate
}

export function resolveOutputPolicy(config: ServerConfig, input: OutputPolicyInput = {}): ResolvedOutputPolicy {
	const outputRoot = input.outputRoot ? resolveManagedPath(config.outputRoot, input.outputRoot, 'outputRoot', config.allowArbitraryOutputPaths) : config.outputRoot
	const tempRoot = input.tempRoot ? resolveManagedPath(config.tempRoot, input.tempRoot, 'tempRoot', config.allowArbitraryOutputPaths) : config.tempRoot

	if (!config.allowArbitraryOutputPaths) ensureWithinRoot(config.outputRoot, outputRoot, 'outputRoot')
	if (!config.allowArbitraryOutputPaths) ensureWithinRoot(config.tempRoot, tempRoot, 'tempRoot')

	const outputTemplate = input.outputTemplate ?? '%(title).180B [%(id)s].%(ext)s'
	if (path.isAbsolute(outputTemplate) && !config.allowArbitraryOutputPaths) {
		ensureWithinRoot(outputRoot, outputTemplate, 'outputTemplate')
	}
	if (!config.allowArbitraryOutputPaths && !path.isAbsolute(outputTemplate) && hasParentTraversal(path.normalize(outputTemplate))) {
		throw new Error('outputTemplate must not contain parent-directory traversal')
	}

	return {outputRoot, tempRoot, outputTemplate, allowOverwrite: input.allowOverwrite ?? false}
}

export async function ensureDirectory(pathname: string): Promise<void> {
	await fs.promises.mkdir(pathname, {recursive: true})
}

export function readArchive(pathname: string): string[] {
	if (!fs.existsSync(pathname)) return []
	return fs
		.readFileSync(pathname, 'utf8')
		.split(/\r?\n/)
		.flatMap(line => {
			const archiveLine = line.trim()
			return archiveLine ? [archiveLine] : []
		})
}
