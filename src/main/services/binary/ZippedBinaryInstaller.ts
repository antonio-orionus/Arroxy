import fsPromises from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import extractZip from 'extract-zip'
import type {StatusKey} from '@shared/types.js'
import {downloadFile, type DownloadProgressCallback, sha256ForFile} from './BinaryDownloader.js'
import {ManagedSetupError, withManagedSetupStep} from './ManagedSetup.js'

type StatusReporter = (statusKey: StatusKey, params?: Record<string, string | number>) => void

export interface EnsureZippedBinaryConfig {
	name: string
	downloadUrl: string
	archiveFileName: string
	innerExecutableName: string
	destinationPath: string
	expectedSha256?: string
	onStatus?: StatusReporter
	onDownloadProgress?: DownloadProgressCallback
	signal?: AbortSignal
}

const ARCHIVE_TREE_MAX_DEPTH = 8

async function findExecutableInTree(root: string, name: string, depth = 0): Promise<string | null> {
	if (depth > ARCHIVE_TREE_MAX_DEPTH) return null
	const entries = await fsPromises.readdir(root, {withFileTypes: true})
	for (const entry of entries) {
		if (entry.isSymbolicLink()) continue
		const full = path.join(root, entry.name)
		if (entry.isDirectory()) {
			const nested = await findExecutableInTree(full, name, depth + 1)
			if (nested) return nested
		} else if (entry.isFile() && entry.name === name) {
			return full
		}
	}
	return null
}

export class ZippedBinaryInstaller {
	private readonly inProgress = new Map<string, Promise<void>>()

	async ensure(config: EnsureZippedBinaryConfig): Promise<void> {
		const {destinationPath, name, onStatus, onDownloadProgress, signal} = config

		const existing = this.inProgress.get(destinationPath)
		if (existing) return existing

		const promise = (async (): Promise<void> => {
			if (signal?.aborted) throw new ManagedSetupError('preflight', new DOMException('Cancelled', 'AbortError'))
			const tempDir = await fsPromises.mkdtemp(path.join(os.tmpdir(), `arroxy-${name}-`))
			await using _cleanup = {[Symbol.asyncDispose]: () => fsPromises.rm(tempDir, {recursive: true, force: true})}
			const zipPath = path.join(tempDir, config.archiveFileName)

			onStatus?.('downloadingBinary', {name})
			await withManagedSetupStep('download', () => downloadFile(config.downloadUrl, zipPath, onDownloadProgress, true, signal))

			const expected = config.expectedSha256
			if (expected) {
				const actual = await withManagedSetupStep('checksum_verify', () => sha256ForFile(zipPath))
				if (actual !== expected) {
					throw new ManagedSetupError('checksum_verify', new Error(`${name} checksum mismatch. Expected ${expected.slice(0, 8)}..., got ${actual.slice(0, 8)}...`))
				}
			}

			const extractDir = path.join(tempDir, 'unpacked')
			await withManagedSetupStep('extract', async () => {
				await fsPromises.mkdir(extractDir, {recursive: true})
				await extractZip(zipPath, {dir: extractDir})
			})

			const innerPath = await withManagedSetupStep('extract', () => findExecutableInTree(extractDir, config.innerExecutableName))
			if (!innerPath) {
				throw new ManagedSetupError('extract', new Error(`${name} archive did not contain ${config.innerExecutableName}`))
			}

			await withManagedSetupStep('install', async () => {
				await fsPromises.mkdir(path.dirname(destinationPath), {recursive: true})
				await fsPromises.copyFile(innerPath, destinationPath)
				if (process.platform !== 'win32') {
					await fsPromises.chmod(destinationPath, 0o755)
				}
			})
		})().finally(() => {
			this.inProgress.delete(destinationPath)
		})

		this.inProgress.set(destinationPath, promise)
		return promise
	}
}
