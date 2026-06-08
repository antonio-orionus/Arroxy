import {statfs} from 'node:fs/promises'
import path from 'node:path'

export interface DiskSpaceResult {
	ok: boolean
	freeBytes: number | undefined
	requiredBytes: number | undefined
	// Distinguishes "checked and passed/failed" from "couldn't check" (statfs
	// threw — bad path, NFS unmount, EACCES). Callers that treat absence of
	// `error` as truth get a real verdict; callers that need to be lenient
	// (post-hoc disk probe in DownloadService) can still inspect `error` and
	// decide what to do.
	error?: string
}

const DEFAULT_MIN_FREE_BYTES = 200 * 1024 * 1024

async function statfsWalkUp(dir: string): Promise<{bavail: number; bsize: number}> {
	let current = dir
	while (true) {
		try {
			return await statfs(current)
		} catch (err) {
			const code = (err as NodeJS.ErrnoException).code
			if (code !== 'ENOENT' && code !== 'ENOTDIR') throw err
			const parent = path.dirname(current)
			if (parent === current) throw err
			current = parent
		}
	}
}

export async function checkDiskSpace(dir: string, expectedBytes: number | undefined, marginFactor = 1.5, minFreeBytes = DEFAULT_MIN_FREE_BYTES): Promise<DiskSpaceResult> {
	const requiredBytes = expectedBytes !== undefined ? Math.max(expectedBytes * marginFactor, minFreeBytes) : minFreeBytes

	try {
		const stats = await statfsWalkUp(dir)
		const freeBytes = stats.bavail * stats.bsize
		return {ok: freeBytes >= requiredBytes, freeBytes, requiredBytes}
	} catch (err) {
		const error = err instanceof Error ? err.message : String(err)
		return {ok: false, freeBytes: undefined, requiredBytes, error}
	}
}
