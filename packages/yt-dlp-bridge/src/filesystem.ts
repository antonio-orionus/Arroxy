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
