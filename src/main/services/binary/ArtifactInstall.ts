import fsPromises from 'node:fs/promises'
import path from 'node:path'
import {setTimeout as sleep} from 'node:timers/promises'
import log from 'electron-log/main.js'
import {DownloadIntegrityError, DownloadSizeMismatchError, DownloadStalledError} from './BinaryDownloader.js'

export type ArtifactErrorCode = 'UNSUPPORTED_PLATFORM' | 'NETWORK' | 'TIMEOUT' | 'CANCELLED' | 'CHECKSUM' | 'SIZE_MISMATCH' | 'EXTRACTION' | 'ARCHIVE_SECURITY' | 'EXECUTABLE_MISSING' | 'PERMISSION' | 'DISK' | 'LOCK' | 'INTERNAL'

export class ArtifactMaterializeError extends Error {
	constructor(
		readonly code: ArtifactErrorCode,
		message: string,
		readonly cause?: unknown
	) {
		super(message)
		this.name = 'ArtifactMaterializeError'
	}
}

const LOCK_POLL_MS = 200
const DEFAULT_LOCK_TIMEOUT_MS = 120_000
const OWNERLESS_LOCK_STALE_MS = 5_000

const logger = log.scope('artifact-install')

interface LockOwner {
	pid: number
	createdAt?: string
}

export function abortError(signal: AbortSignal | undefined): ArtifactMaterializeError {
	const message = signal?.reason instanceof Error ? signal.reason.message : 'Cancelled'
	return new ArtifactMaterializeError('CANCELLED', message, signal?.reason)
}

function parseLockOwner(raw: string): LockOwner | null {
	try {
		const parsed = JSON.parse(raw) as Partial<LockOwner>
		const pid = parsed.pid
		if (typeof pid !== 'number' || !Number.isInteger(pid) || pid <= 0) return null
		return {pid, createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : undefined}
	} catch {
		return null
	}
}

function processExists(pid: number): boolean {
	try {
		process.kill(pid, 0)
		return true
	} catch (err) {
		const code = (err as NodeJS.ErrnoException).code
		return code !== 'ESRCH'
	}
}

async function ownerlessLockIsOld(lockDir: string): Promise<boolean> {
	try {
		const stat = await fsPromises.stat(lockDir)
		return Date.now() - stat.mtimeMs > OWNERLESS_LOCK_STALE_MS
	} catch {
		return true
	}
}

async function staleLockReason(lockDir: string): Promise<string | null> {
	const ownerPath = path.join(lockDir, 'owner.json')
	try {
		const owner = parseLockOwner(await fsPromises.readFile(ownerPath, 'utf8'))
		if (!owner) return (await ownerlessLockIsOld(lockDir)) ? 'invalid-owner' : null
		return processExists(owner.pid) ? null : `dead-owner:${owner.pid}`
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === 'ENOENT') return (await ownerlessLockIsOld(lockDir)) ? 'missing-owner' : null
		throw err
	}
}

export function pathInside(root: string, target: string): boolean {
	const relative = path.relative(root, target)
	return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

export function artifactErrorToDependencyFailureKind(err: unknown): 'download_failed' | 'extract_failed' | 'hash_failed' | 'spawn_failed' | 'permission_denied' | 'blocked_or_quarantined' | 'bad_exit_code' | 'timeout' | 'pair_incomplete' {
	if (!(err instanceof ArtifactMaterializeError)) return 'download_failed'
	switch (err.code) {
		case 'CHECKSUM':
		case 'SIZE_MISMATCH':
			return 'hash_failed'
		case 'EXTRACTION':
		case 'ARCHIVE_SECURITY':
		case 'EXECUTABLE_MISSING':
			return 'extract_failed'
		case 'PERMISSION':
			return 'permission_denied'
		case 'TIMEOUT':
		case 'LOCK':
			return 'timeout'
		case 'CANCELLED':
		case 'NETWORK':
		case 'DISK':
		case 'UNSUPPORTED_PLATFORM':
		case 'INTERNAL':
			return 'download_failed'
	}
}

export async function withArtifactLock<T>(cacheRoot: string, cacheKey: string, signal: AbortSignal | undefined, lockTimeoutMs: number | undefined, run: () => Promise<T>): Promise<T> {
	const lockDir = path.join(cacheRoot, 'locks', cacheKey)
	const startedAt = Date.now()
	await fsPromises.mkdir(path.dirname(lockDir), {recursive: true})
	while (true) {
		if (signal?.aborted) throw abortError(signal)
		try {
			await fsPromises.mkdir(lockDir)
			await fsPromises.writeFile(path.join(lockDir, 'owner.json'), JSON.stringify({pid: process.pid, createdAt: new Date().toISOString()}))
			break
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw new ArtifactMaterializeError('LOCK', `Could not acquire artifact lock: ${String(err)}`, err)
			const reason = await staleLockReason(lockDir)
			if (reason) {
				logger.warn('Removing stale artifact lock', {cacheKey, reason})
				await fsPromises.rm(lockDir, {recursive: true, force: true})
				continue
			}
			if (Date.now() - startedAt > (lockTimeoutMs ?? DEFAULT_LOCK_TIMEOUT_MS)) throw new ArtifactMaterializeError('LOCK', `Timed out waiting for artifact lock ${cacheKey}`)
			await sleep(LOCK_POLL_MS, undefined, {signal}).catch((err: unknown) => {
				throw signal?.aborted ? abortError(signal) : err
			})
		}
	}

	try {
		return await run()
	} finally {
		await fsPromises.rm(lockDir, {recursive: true, force: true})
	}
}

// Turns a failed artifact download into the error the resolver reports.
export function downloadErrorToArtifactError(label: string, expectedSize: number, err: unknown, signal?: AbortSignal): ArtifactMaterializeError {
	if (err instanceof ArtifactMaterializeError) return err
	if (signal?.aborted) return abortError(signal)
	if (err instanceof DownloadIntegrityError) return new ArtifactMaterializeError('CHECKSUM', `${label} checksum mismatch`, err)
	if (err instanceof DownloadSizeMismatchError) return new ArtifactMaterializeError('SIZE_MISMATCH', `${label} size mismatch. Expected ${expectedSize}, got ${err.actualSize ?? 'unknown'}`, err)
	if (err instanceof DownloadStalledError) return new ArtifactMaterializeError('TIMEOUT', err.message, err)
	return new ArtifactMaterializeError('NETWORK', `All artifact URLs failed for ${label}`, err)
}
