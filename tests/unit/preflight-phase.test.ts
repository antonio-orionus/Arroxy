import {describe, expect, it, vi, beforeEach} from 'vitest'
import {PreflightPhase} from '@main/services/phases/PreflightPhase.js'
import {AsyncStack} from '@main/services/phases/types.js'
import type {PhaseContext, ActiveDownload} from '@main/services/phases/types.js'
import type {DownloadJob, StartDownloadInput} from '@shared/types.js'
import type {PreparedJob, EmbedOptions, SponsorBlockOptions} from '@shared/preparedJob.js'

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const SB_OFF: SponsorBlockOptions = {mode: 'off'}
const DEFAULT_JOB: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF}

vi.mock('@main/utils/diskSpace', () => ({checkDiskSpace: vi.fn()}))

import {checkDiskSpace} from '@main/utils/diskSpace.js'

beforeEach(() => {
	vi.clearAllMocks()
})

function makeCtx(outputDir = '/output'): PhaseContext {
	const input: StartDownloadInput = {url: 'https://www.youtube.com/watch?v=test', outputDir, job: DEFAULT_JOB}
	const job: DownloadJob = {id: 'test-job-id', url: 'https://www.youtube.com/watch?v=test', outputDir, status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
	const controller = new AbortController()
	const active: ActiveDownload = {job, input, controller, signal: controller.signal, cancelRequested: false, pauseRequested: false, subtitlePaths: [], disposables: new AsyncStack()}
	return {active, signal: active.signal, ytDlp: {} as never, emitStatus: vi.fn(), register: () => undefined, safeConsume: vi.fn()}
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
})
