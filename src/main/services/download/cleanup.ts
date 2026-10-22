// Filesystem cleanup helpers for download lifecycle. Pure FS ops, no
// orchestration state — owned by DownloadService and PhaseExecutor via
// callbacks on the PhaseContext.

import {rm, rmdir} from 'node:fs/promises'
import {dirname} from 'node:path'
import log from 'electron-log/main.js'

const logger = log.scope('downloads')

// The per-output-directory folder that holds one scratch directory per job.
// Owned here because both the writer (VideoPhase) and the sweepers key off it.
export const TEMP_DIR_NAME = '.arroxy-temp'

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
