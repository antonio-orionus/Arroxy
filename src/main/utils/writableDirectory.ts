import {randomUUID} from 'node:crypto'
import {mkdir, unlink, writeFile} from 'node:fs/promises'
import {join} from 'node:path'

// `code` is the Node errno code (EACCES, EROFS, ENOSPC, ...) when the failure
// carries one, so callers can tell a refused write from a full disk.
export type WritableDirectoryResult = {ok: true} | {ok: false; code: string | undefined; error: string}

// Creates `dir` if missing, then writes and removes a probe file. A permission
// bit check (fs.access W_OK) is not enough: it misses read-only mounts, macOS
// privacy-protected folders, and Windows ACLs, which only a real write reveals.
export async function checkWritableDirectory(dir: string): Promise<WritableDirectoryResult> {
	try {
		await mkdir(dir, {recursive: true})
		const probePath = join(dir, `.arroxy-write-test-${process.pid}-${randomUUID()}`)
		await writeFile(probePath, '')
		await unlink(probePath)
		return {ok: true}
	} catch (error) {
		return {ok: false, code: errnoCode(error), error: error instanceof Error ? error.message : String(error)}
	}
}

function errnoCode(error: unknown): string | undefined {
	if (!(error instanceof Error) || !('code' in error)) return undefined
	return typeof error.code === 'string' ? error.code : undefined
}
