import {mkdtemp, mkdir, writeFile, access, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {describe, expect, it} from 'vitest'
import {AsyncStack, type ActiveDownload} from '@main/services/phases/types.js'
import {QueueResumeLifecycle} from '@main/services/download/QueueResumeLifecycle.js'
import type {DownloadJob, QueueItem} from '@shared/types.js'
import type {PreparedJob} from '@shared/preparedJob.js'

const PREPARED_JOB: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', preset: 'custom', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}

function makeDownloadJob(): DownloadJob {
	return {id: 'job-1', url: 'https://www.youtube.com/watch?v=test', outputDir: '/tmp', status: 'running', createdAt: '2026-06-10T00:00:00.000Z', updatedAt: '2026-06-10T00:00:00.000Z'}
}

function makeActive(overrides: Partial<ActiveDownload> = {}): ActiveDownload {
	const controller = new AbortController()
	return {job: makeDownloadJob(), input: {url: 'https://www.youtube.com/watch?v=test', outputDir: '/tmp', job: PREPARED_JOB}, controller, signal: controller.signal, cancelRequested: false, pauseRequested: false, subtitlePaths: [], disposables: new AsyncStack(), ...overrides}
}

function makeItem(overrides: Partial<QueueItem> = {}): QueueItem {
	return {id: 'q-1', url: 'https://www.youtube.com/watch?v=test', title: 'Fixture', thumbnail: '', outputDir: '/tmp', formatLabel: '720p', status: 'pending', lane: 'normal', progressPercent: 0, progressDetail: null, lastStatus: null, error: null, finishedAt: null, writeM3u: true, job: PREPARED_JOB, ...overrides}
}

describe('QueueResumeLifecycle', () => {
	it('builds media-transfer retry context only after media evidence exists', () => {
		const tempDir = '/tmp/arroxy-resume'
		const active = makeActive({tempDir})

		expect(QueueResumeLifecycle.buildResumeContext(active, {kind: 'network', raw: 'reset'})).toBeUndefined()

		QueueResumeLifecycle.rememberMediaComponent(active, `${tempDir}/video.f137.mp4.part`)

		expect(QueueResumeLifecycle.buildResumeContext(active, {kind: 'network', raw: 'reset'})).toEqual({kind: 'media-retry', tempDir, reason: 'media-transfer', failureKind: 'network'})
	})

	it('builds postprocess retry context only after acquired media exists', () => {
		const tempDir = '/tmp/arroxy-postprocess'
		const active = makeActive({tempDir})

		QueueResumeLifecycle.markMediaPostprocessStarted(active)
		expect(QueueResumeLifecycle.buildResumeContext(active, {kind: 'postprocessFailure', raw: 'convert failed'})).toBeUndefined()

		QueueResumeLifecycle.rememberMediaComponent(active, `${tempDir}/video.f137.mp4`)
		expect(QueueResumeLifecycle.buildResumeContext(active, {kind: 'postprocessFailure', raw: 'convert failed'})).toEqual({kind: 'media-retry', tempDir, reason: 'postprocess', failureKind: 'postprocessFailure'})
	})

	it('validates preserved temp dirs and rejects missing ones', async () => {
		const tempDir = await mkdtemp(join(tmpdir(), 'arroxy-resume-lifecycle-'))
		try {
			await expect(QueueResumeLifecycle.validateTempDir(tempDir)).resolves.toBe(tempDir)
			await expect(QueueResumeLifecycle.validateTempDir(join(tempDir, 'missing'))).resolves.toBeUndefined()
		} finally {
			await rm(tempDir, {recursive: true, force: true})
		}
	})

	it('cleans temp data unless the active job owns a matching resume context', async () => {
		const outputDir = await mkdtemp(join(tmpdir(), 'arroxy-resume-cleanup-'))
		const tempDir = join(outputDir, '.arroxy-temp', 'job-1')
		await mkdir(tempDir, {recursive: true})
		await writeFile(join(outputDir, 'download.part'), 'partial')
		await writeFile(join(outputDir, 'keep.txt'), 'keep')
		await writeFile(join(tempDir, 'nested.part'), 'partial', {flag: 'w'})

		const active = makeActive({tempDir})
		QueueResumeLifecycle.registerVideoTempDataCleanup(active, outputDir, tempDir, disposable => active.disposables.defer(disposable))
		await active.disposables[Symbol.asyncDispose]()

		await expect(access(tempDir)).rejects.toThrow()
		await expect(access(join(outputDir, 'download.part'))).rejects.toThrow()
		await expect(access(join(outputDir, 'keep.txt'))).resolves.toBeUndefined()

		const preservedOutputDir = await mkdtemp(join(tmpdir(), 'arroxy-resume-preserved-'))
		const preservedTempDir = join(preservedOutputDir, '.arroxy-temp', 'job-2')
		await mkdir(preservedTempDir, {recursive: true})
		await writeFile(join(preservedTempDir, 'nested.part'), 'partial', {flag: 'w'})
		const preservedActive = makeActive({tempDir: preservedTempDir, resumeContext: {kind: 'media-retry', tempDir: preservedTempDir, reason: 'media-transfer', failureKind: 'network'}})
		QueueResumeLifecycle.registerVideoTempDataCleanup(preservedActive, preservedOutputDir, preservedTempDir, disposable => preservedActive.disposables.defer(disposable))
		await preservedActive.disposables[Symbol.asyncDispose]()
		await expect(access(preservedTempDir)).resolves.toBeUndefined()

		await rm(outputDir, {recursive: true, force: true})
		await rm(preservedOutputDir, {recursive: true, force: true})
	})

	it('projects queue items for persistence from one policy surface', () => {
		expect(QueueResumeLifecycle.prepareItemForPersistence(makeItem({status: 'cancelled'}))).toBeNull()
		expect(QueueResumeLifecycle.prepareItemForPersistence(makeItem({status: 'running', progressPercent: 42, progressDetail: '1 MiB/s', lastJobId: 'job-1'}))).toMatchObject({status: 'pending', progressPercent: 0, progressDetail: null, lastJobId: undefined})
		expect(QueueResumeLifecycle.prepareItemForPersistence(makeItem({status: 'paused-active', tempDir: '/tmp/resume', lastJobId: 'job-1'}))).toMatchObject({status: 'paused-active', tempDir: '/tmp/resume', lastJobId: 'job-1'})
	})
})
