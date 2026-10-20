import {afterEach, describe, expect, it, vi, beforeEach} from 'vite-plus/test'
import {PreflightPhase} from '@main/services/phases/PreflightPhase.js'
import {AsyncStack} from '@main/services/phases/types.js'
import type {PhaseContext, ActiveDownload} from '@main/services/phases/types.js'
import type {DownloadJob, ResolvedStartDownloadInput} from '@shared/types.js'
import type {PreparedJob, EmbedOptions, SponsorBlockOptions} from '@shared/preparedJob.js'
import {CookielessRetry} from '@main/services/download/cookielessRetry.js'
import {explorePorts} from '../helpers/explorePorts.js'

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const SB_OFF: SponsorBlockOptions = {mode: 'off'}
const DEFAULT_JOB: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', sponsorBlock: SB_OFF, embed: EMBED_OFF}

vi.mock('@main/utils/diskSpace', () => ({checkDiskSpace: vi.fn()}))
vi.mock('@main/utils/writableDirectory', () => ({checkWritableDirectory: vi.fn()}))

import {checkDiskSpace} from '@main/utils/diskSpace.js'
import {checkWritableDirectory} from '@main/utils/writableDirectory.js'

beforeEach(() => {
	vi.clearAllMocks()
	vi.mocked(checkWritableDirectory).mockResolvedValue({ok: true})
})

function makeCtx(outputDir = '/output'): PhaseContext {
	const input: ResolvedStartDownloadInput = {url: 'https://www.youtube.com/watch?v=test', outputDir, job: DEFAULT_JOB as Extract<PreparedJob, {kind: 'single-format'}>}
	const job: DownloadJob = {id: 'test-job-id', url: 'https://www.youtube.com/watch?v=test', outputDir, status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
	const controller = new AbortController()
	const active: ActiveDownload = {job, input, controller, signal: controller.signal, cancelRequested: false, pauseRequested: false, subtitlePaths: [], disposables: new AsyncStack()}
	return {active, signal: active.signal, ytDlp: {} as never, emitStatus: vi.fn(), register: () => undefined, safeConsume: vi.fn(), cookielessRetry: new CookielessRetry(), ...explorePorts()}
}

describe('PreflightPhase', () => {
	it('returns continue when disk space is sufficient', async () => {
		vi.mocked(checkDiskSpace).mockResolvedValue({ok: true, freeBytes: 10_000_000_000, requiredBytes: 6_000_000_000})
		const phase = PreflightPhase(4_000_000_000)
		const outcome = await phase.run(makeCtx())
		expect(outcome.kind).toBe('continue')
	})

	it('returns hard-failed with outOfDiskSpace key when space is insufficient', async () => {
		vi.mocked(checkDiskSpace).mockResolvedValue({ok: false, freeBytes: 500_000_000, requiredBytes: 1_500_000_000})
		const phase = PreflightPhase(1_000_000_000)
		const outcome = await phase.run(makeCtx())
		expect(outcome.kind).toBe('hard-failed')
		if (outcome.kind === 'hard-failed') {
			expect(outcome.error.kind).toBe('outOfDiskSpace')
		}
	})

	it('returns continue when expectedBytes is undefined and free space exceeds floor', async () => {
		vi.mocked(checkDiskSpace).mockResolvedValue({ok: true, freeBytes: 5_000_000_000, requiredBytes: 200 * 1024 * 1024})
		const phase = PreflightPhase(undefined)
		const outcome = await phase.run(makeCtx())
		expect(outcome.kind).toBe('continue')
	})

	it('still trips when expectedBytes undefined but free space is below floor', async () => {
		vi.mocked(checkDiskSpace).mockResolvedValue({ok: false, freeBytes: 50 * 1024 * 1024, requiredBytes: 200 * 1024 * 1024})
		const phase = PreflightPhase(undefined)
		const outcome = await phase.run(makeCtx())
		expect(outcome.kind).toBe('hard-failed')
		if (outcome.kind === 'hard-failed') {
			expect(outcome.error.kind).toBe('outOfDiskSpace')
		}
	})

	it('emits an error status on insufficient space', async () => {
		vi.mocked(checkDiskSpace).mockResolvedValue({ok: false, freeBytes: 100_000_000, requiredBytes: 600_000_000})
		const ctx = makeCtx()
		const phase = PreflightPhase(400_000_000)
		await phase.run(ctx)
		// Localized status key with GB-formatted required/free params; payload still
		// carries the actionable yt-dlp error key for downstream classification.
		expect(ctx.emitStatus).toHaveBeenCalledWith('error', 'diskSpaceInsufficient', expect.objectContaining({required: expect.any(String), free: expect.any(String)}), expect.objectContaining({kind: 'outOfDiskSpace'}))
	})

	it('calls checkDiskSpace with the job outputDir', async () => {
		vi.mocked(checkDiskSpace).mockResolvedValue({ok: true, freeBytes: 999, requiredBytes: undefined})
		const phase = PreflightPhase(500_000_000)
		await phase.run(makeCtx('/my/output'))
		expect(checkDiskSpace).toHaveBeenCalledWith('/my/output', 500_000_000)
	})

	it('hard-failed error raw text includes GB amounts', async () => {
		vi.mocked(checkDiskSpace).mockResolvedValue({ok: false, freeBytes: 1_073_741_824, requiredBytes: 4_294_967_296})
		const phase = PreflightPhase(2_000_000_000)
		const outcome = await phase.run(makeCtx())
		if (outcome.kind === 'hard-failed') {
			expect(outcome.error.raw).toContain('GB')
		}
	})

	it('fails with outputNotWritable before checking disk space when the folder refuses writes', async () => {
		vi.mocked(checkWritableDirectory).mockResolvedValue({ok: false, code: 'EACCES', error: "EACCES: permission denied, open '/locked/.arroxy-write-test'"})
		const ctx = makeCtx('/locked')
		const outcome = await PreflightPhase(500_000_000).run(ctx)

		expect(outcome.kind).toBe('hard-failed')
		if (outcome.kind === 'hard-failed') expect(outcome.error).toEqual({kind: 'outputNotWritable', raw: "/locked: EACCES: permission denied, open '/locked/.arroxy-write-test'"})
		expect(ctx.emitStatus).toHaveBeenCalledWith('error', 'outputNotWritable', {dir: '/locked'}, expect.objectContaining({kind: 'outputNotWritable'}))
		expect(checkDiskSpace).not.toHaveBeenCalled()
	})

	it('defers a disk-full write probe to the disk-space check', async () => {
		vi.mocked(checkWritableDirectory).mockResolvedValue({ok: false, code: 'ENOSPC', error: "ENOSPC: no space left on device, open '/full/.arroxy-write-test'"})
		vi.mocked(checkDiskSpace).mockResolvedValue({ok: false, freeBytes: 0, requiredBytes: 200 * 1024 * 1024})
		const ctx = makeCtx('/full')
		const outcome = await PreflightPhase(undefined).run(ctx)

		expect(outcome.kind).toBe('hard-failed')
		if (outcome.kind === 'hard-failed') expect(outcome.error.kind).toBe('outOfDiskSpace')
		expect(ctx.emitStatus).toHaveBeenCalledWith('error', 'diskSpaceInsufficient', expect.any(Object), expect.objectContaining({kind: 'outOfDiskSpace'}))
	})

	describe('a folder yt-dlp would expand', () => {
		afterEach(() => {
			vi.unstubAllEnvs()
		})

		it('fails with outputPathExpands after the write probe and before the disk check', async () => {
			vi.stubEnv('ARROXY_PREFLIGHT_DIR', 'elsewhere')
			const ctx = makeCtx('/media/$ARROXY_PREFLIGHT_DIR')
			const running = PreflightPhase(undefined).run(ctx)
			// The queue learns the job id only after start() returns; a status
			// emitted synchronously would be dropped.
			expect(ctx.emitStatus).not.toHaveBeenCalled()
			const outcome = await running

			expect(outcome.kind).toBe('hard-failed')
			if (outcome.kind === 'hard-failed') expect(outcome.error).toEqual({kind: 'outputPathExpands', raw: '/media/$ARROXY_PREFLIGHT_DIR: yt-dlp would write to /media/elsewhere'})
			expect(ctx.emitStatus).toHaveBeenCalledWith('error', 'outputPathExpands', {dir: '/media/$ARROXY_PREFLIGHT_DIR'}, expect.objectContaining({kind: 'outputPathExpands'}))
			expect(checkWritableDirectory).toHaveBeenCalledWith('/media/$ARROXY_PREFLIGHT_DIR')
			expect(checkDiskSpace).not.toHaveBeenCalled()
		})

		it('counts the variables Arroxy adds to the yt-dlp child', async () => {
			vi.stubEnv('ELECTRON_RUN_AS_NODE', undefined)
			const outcome = await PreflightPhase(undefined).run(makeCtx('/media/$ELECTRON_RUN_AS_NODE'))

			expect(outcome.kind).toBe('hard-failed')
			if (outcome.kind === 'hard-failed') expect(outcome.error.kind).toBe('outputPathExpands')
		})

		it('lets a $ that names no set variable through', async () => {
			vi.stubEnv('ARROXY_PREFLIGHT_DIR', undefined)
			vi.mocked(checkDiskSpace).mockResolvedValue({ok: true, freeBytes: 5_000_000_000, requiredBytes: undefined})
			const outcome = await PreflightPhase(undefined).run(makeCtx('/media/$ARROXY_PREFLIGHT_DIR $5'))

			expect(outcome.kind).toBe('continue')
		})
	})

	it('checks that the job outputDir is writable', async () => {
		vi.mocked(checkDiskSpace).mockResolvedValue({ok: true, freeBytes: 999, requiredBytes: undefined})
		await PreflightPhase(undefined).run(makeCtx('/my/output'))
		expect(checkWritableDirectory).toHaveBeenCalledWith('/my/output')
	})
})
