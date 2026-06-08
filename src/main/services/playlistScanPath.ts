import {promises as fsPromises} from 'node:fs'
import path from 'node:path'
import type {AppSettings} from '@shared/types.js'
import {buildCommonPaths} from '@main/ipc/utils.js'

export function isPathInsideRoot(candidate: string, root: string): boolean {
	const rel = path.relative(root, candidate)
	return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))
}

export function collectPlaylistScanRoots(settings: AppSettings): string[] {
	const roots = new Set<string>()
	const common = buildCommonPaths()
	for (const p of [common.downloads, common.videos, common.music, common.desktop, common.documents, common.pictures, common.home]) {
		if (p) roots.add(p)
	}
	if (settings.common.defaultOutputDir) roots.add(settings.common.defaultOutputDir)
	return [...roots]
}

export async function resolveAllowedOutputDir(outputDir: string, allowedRoots: readonly string[]): Promise<{ok: true; path: string} | {ok: false; message: string}> {
	let resolvedTarget: string
	try {
		resolvedTarget = await fsPromises.realpath(path.resolve(outputDir))
	} catch {
		return {ok: false, message: 'Output directory does not exist or is not accessible'}
	}

	try {
		const stat = await fsPromises.stat(resolvedTarget)
		if (!stat.isDirectory()) {
			return {ok: false, message: 'Output path is not a directory'}
		}
	} catch {
		return {ok: false, message: 'Output directory does not exist or is not accessible'}
	}

	const resolvedRoots = await Promise.all(
		allowedRoots.flatMap(root => {
			if (!root.trim()) return []
			return [
				(async (): Promise<string | null> => {
					try {
						return await fsPromises.realpath(path.resolve(root))
					} catch {
						return null
					}
				})()
			]
		})
	)

	for (const resolvedRoot of resolvedRoots) {
		if (resolvedRoot === null) continue
		if (isPathInsideRoot(resolvedTarget, resolvedRoot)) {
			return {ok: true, path: resolvedTarget}
		}
	}

	return {ok: false, message: 'Output directory is outside allowed locations'}
}
