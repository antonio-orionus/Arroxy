// A job's temp folder: `.arroxy-temp/<job>` inside its output folder, where
// yt-dlp keeps partial files and the info-json and report files it is asked
// for. Cleanup removes it, and the root once empty, when the job finalizes.
import {mkdir, rm} from 'node:fs/promises'
import {dirname, join} from 'node:path'
import {TEMP_DIR_NAME} from './cleanup.js'
import {hideTempDirRoot, normalizeCreatedPath} from './tempDirVisibility.js'

export async function setupTempDir(outputDir: string, jobId: string, preserve: boolean, overridePath?: string): Promise<string | undefined> {
	const tempDir = overridePath ?? join(outputDir, TEMP_DIR_NAME, jobId.slice(0, 8))
	try {
		if (!preserve) await rm(tempDir, {recursive: true, force: true})
		// One recursive `mkdir` builds the root and the job directory together, and
		// its result says which of them was new: it resolves to the first path it
		// created, or undefined when everything already existed. So a result that
		// is not the job directory itself means `.arroxy-temp` was just brought
		// into existence, which is the only moment it needs hiding — cleanup
		// removes the root again when a job finalizes, so hiding once per session
		// would leave every later download's folder visible on Windows.
		//
		// Deliberately a single call. Creating the root separately leaves a window
		// in which the startup sweep can `rmdir` an empty root between the two,
		// after which the second call silently recreates it unhidden.
		const created = await mkdir(tempDir, {recursive: true})
		// Cosmetic and Windows-only, so it neither blocks nor can fail the setup.
		if (created !== undefined && normalizeCreatedPath(created) !== tempDir) await hideTempDirRoot(dirname(tempDir))
		return tempDir
	} catch {
		return undefined
	}
}
