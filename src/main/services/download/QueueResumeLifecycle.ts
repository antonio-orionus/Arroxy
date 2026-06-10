import {stat} from 'node:fs/promises'
import type {LocalizedError, QueueItem, QueueResumeContext, YtDlpErrorKind} from '@shared/types.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import type {Disposable, ActiveJob} from '../phases/types.js'
import {cleanupPartFiles, cleanupTempDirByPath} from './cleanup.js'

const RESUMABLE_MEDIA_FAILURES: ReadonlySet<YtDlpErrorKind> = new Set(['chunkTransferFailure', 'network', 'rateLimit', 'postprocessFailure', 'outOfDiskSpace'])

function hasMediaTransferStarted(active: ActiveJob): boolean {
	return active.mediaDownloadStarted === true || (active.mediaComponentPaths?.length ?? 0) > 0
}

function hasMediaAcquired(active: ActiveJob): boolean {
	return hasMediaTransferStarted(active) || active.mediaPath !== undefined
}

function hasMediaPostprocessStarted(active: ActiveJob): boolean {
	return active.mediaPostprocessStarted === true || Object.keys(active.postProcEmitted ?? {}).length > 0
}

async function validateTempDir(tempDir: string | undefined): Promise<string | undefined> {
	if (!tempDir) return undefined
	try {
		const s = await stat(tempDir)
		return s.isDirectory() ? tempDir : undefined
	} catch {
		return undefined
	}
}

function rememberMediaComponent(active: ActiveJob, path: string): void {
	active.mediaDownloadStarted = true
	const components = (active.mediaComponentPaths ??= [])
	if (!components.includes(path)) components.push(path)
	active.mediaPath = path
}

function markMediaPostprocessStarted(active: ActiveJob): void {
	active.mediaPostprocessStarted = true
}

function buildResumeContext(active: ActiveJob, payload: LocalizedError): QueueResumeContext | undefined {
	const tempDir = active.tempDir
	if (!tempDir) return undefined
	if (!RESUMABLE_MEDIA_FAILURES.has(payload.kind)) return undefined

	if (payload.kind === 'postprocessFailure' || payload.kind === 'outOfDiskSpace' || hasMediaPostprocessStarted(active)) {
		if (!hasMediaAcquired(active)) return undefined
		return {kind: 'media-retry', tempDir, reason: 'postprocess', failureKind: payload.kind}
	}

	if (!hasMediaTransferStarted(active)) return undefined
	return {kind: 'media-retry', tempDir, reason: 'media-transfer', failureKind: payload.kind}
}

function shouldPreserveTempData(active: ActiveJob, tempDir: string): boolean {
	return active.resumeContext?.tempDir === tempDir
}

function registerInputTempDirCleanup(active: ActiveJob): void {
	const tempDir = active.tempDir
	if (!tempDir) return
	active.disposables.defer(() => {
		if (shouldPreserveTempData(active, tempDir)) return
		return cleanupTempDirByPath(tempDir)
	})
}

function registerVideoTempDataCleanup(active: ActiveJob, outputDir: string, tempDir: string, register: (disposable: Disposable) => void): void {
	register(() => {
		if (shouldPreserveTempData(active, tempDir)) return
		return cleanupTempDirByPath(tempDir)
	})
	register(() => {
		if (shouldPreserveTempData(active, tempDir)) return
		return cleanupPartFiles(outputDir)
	})
}

function tempDirForQueueStart(item: QueueItem, explicitTempDir: string | undefined): string | undefined {
	return explicitTempDir ?? item.tempDir ?? item.resumeContext?.tempDir
}

async function validResumeContext(item: QueueItem): Promise<QueueResumeContext | undefined> {
	const resumeContext = item.resumeContext
	if (!resumeContext) return undefined
	return (await validateTempDir(resumeContext.tempDir)) ? resumeContext : undefined
}

async function cleanupResumeContext(item: QueueItem): Promise<void> {
	const tempDir = item.resumeContext?.tempDir
	if (!tempDir) return
	await cleanupTempDirByPath(tempDir)
}

function prepareItemForPersistence(item: QueueItem): QueueItem | null {
	if (item.status === QUEUE_STATUS.cancelled) return null
	const wasRunning = item.status === QUEUE_STATUS.running
	return {...item, status: wasRunning ? QUEUE_STATUS.pending : item.status, progressPercent: wasRunning ? 0 : item.progressPercent, progressDetail: wasRunning ? null : item.progressDetail, lastJobId: wasRunning ? undefined : item.lastJobId}
}

export const QueueResumeLifecycle = {buildResumeContext, cleanupResumeContext, markMediaPostprocessStarted, prepareItemForPersistence, registerInputTempDirCleanup, registerVideoTempDataCleanup, rememberMediaComponent, shouldPreserveTempData, tempDirForQueueStart, validResumeContext, validateTempDir}
