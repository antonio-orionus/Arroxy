// Filesystem cleanup helpers for download lifecycle. Pure FS ops, no
// orchestration state — owned by DownloadService and PhaseExecutor via
// callbacks on the PhaseContext.

import {readdir, rm, rmdir, unlink} from 'node:fs/promises'
import {dirname, join} from 'node:path'
import log from 'electron-log/main.js'

const logger = log.scope('downloads')

// Delete leftover .part / .ytdl files in `outputDir`. Tolerant: if the dir is
// missing or unreadable, log and continue — partial-file cleanup never blocks
// a finalize() path.
export async function cleanupPartFiles(outputDir: string): Promise<void> {
	try {
		const files = await readdir(outputDir)
		const toDelete = files.filter(f => f.endsWith('.part') || f.endsWith('.ytdl'))
		if (toDelete.length === 0) {
			logger.info('cleanupPartFiles — no .part/.ytdl files found', {outputDir})
			return
		}
		logger.info('cleanupPartFiles — deleting leftover files', {outputDir, files: toDelete})
		await Promise.all(toDelete.map(f => unlink(join(outputDir, f)).catch(() => {})))
		logger.info('cleanupPartFiles — done', {outputDir, deleted: toDelete.length})
	} catch {
		logger.info('cleanupPartFiles — directory inaccessible, skipping', {outputDir})
	}
}

// Recursively remove a tempDir and its parent (.arroxy-temp) iff the parent
// becomes empty. Logs at WARN if the tempDir itself can't be removed; benign
// failures on the parent (ENOTEMPTY/ENOENT/EPERM) are silent.
export async function cleanupTempDirByPath(tempDir: string): Promise<void> {
	try {
		await rm(tempDir, {recursive: true, force: true})
		logger.info('cleanupTempDir — removed', {tempDir})
	} catch {
		logger.warn('cleanupTempDir — failed to remove', {tempDir})
		return
	}
	const parent = dirname(tempDir)
	try {
		await rmdir(parent)
		logger.info('cleanupTempDir — removed parent', {parent})
	} catch (err) {
		const code = (err as NodeJS.ErrnoException).code
		if (code !== 'ENOTEMPTY' && code !== 'ENOENT' && code !== 'EPERM') {
			logger.warn('cleanupTempDir — parent rmdir failed', {parent, code})
		}
	}
}
