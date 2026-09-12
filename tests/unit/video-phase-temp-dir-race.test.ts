// The startup sweep runs unawaited while the boot-time spawn pass is already
// starting jobs, so it can `rmdir` an empty `.arroxy-temp` underneath a job that
// is setting up in the same folder.
//
// Creating the root and the job directory in two separate `mkdir` calls opens a
// window between them: the sweep removes the empty root, the second call
// silently recreates it, and the recreated root never gets the Windows Hidden
// attribute because the first call had already reported "it was already there".
// `setupTempDir` therefore uses a single recursive `mkdir`, and this pins that.

import {mkdtemp, mkdir, rm, rmdir, access} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {VideoPhase} from '@main/services/phases/VideoPhase.js'
import {hideTempDirRoot} from '@main/services/download/tempDirVisibility.js'
import {AsyncStack} from '@main/services/phases/types.js'
import type {ActiveDownload, PhaseContext} from '@main/services/phases/types.js'
import type {DownloadJob, ResolvedStartDownloadInput} from '@shared/types.js'
import type {EmbedOptions, PreparedJob, SponsorBlockOptions} from '@shared/preparedJob.js'
import type {YtDlpResult} from '@main/services/YtDlp.js'

vi.mock('@main/services/download/tempDirVisibility.js', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/services/download/tempDirVisibility.js')>()
	return {...actual, hideTempDirRoot: vi.fn()}
})

// Wrapped rather than replaced: the phase still needs real directories on disk,
// and the test only needs to land the sweep's `rmdir` in the gap after the
// first `mkdir` resolves.
vi.mock('node:fs/promises', async importOriginal => {
	const actual = await importOriginal<typeof import('node:fs/promises')>()
	return {...actual, mkdir: vi.fn(actual.mkdir)}
})

const EMBED_OFF: EmbedOptions = {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}
const SB_OFF: SponsorBlockOptions = {mode: 'off'}
const BASE_JOB: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: 'bv+ba', preset: 'custom', sponsorBlock: SB_OFF, embed: EMBED_OFF}
const SUCCESS: YtDlpResult = {kind: 'success', stdout: '', stderr: '', usedExtractorFallback: false}

let outputDir: string

beforeEach(async () => {
	outputDir = await mkdtemp(join(tmpdir(), 'arroxy-race-'))
	vi.mocked(hideTempDirRoot).mockClear()
})

afterEach(async () => {
	vi.mocked(mkdir).mockImplementation(vi.mocked(mkdir).getMockImplementation() as never)
	await rm(outputDir, {recursive: true, force: true})
})

function makeCtx(): PhaseContext {
	const job: DownloadJob = {id: 'job-1', url: 'https://x/y', outputDir, status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
	const input: ResolvedStartDownloadInput = {url: 'https://x/y', outputDir, job: BASE_JOB as Extract<PreparedJob, {kind: 'single-format'}>}
	const controller = new AbortController()
	const active: ActiveDownload = {job, input, controller, signal: controller.signal, cancelRequested: false, pauseRequested: false, subtitlePaths: [], disposables: new AsyncStack()}
	return {active, signal: controller.signal, register: d => active.disposables.defer(d), ytDlp: {run: vi.fn().mockResolvedValue(SUCCESS)} as never, emitStatus: vi.fn(), safeConsume: vi.fn()}
}

describe('VideoPhase — startup sweep racing temp dir setup', () => {
	it('gives the sweep no window to remove the root mid-setup', async () => {
		const root = join(outputDir, '.arroxy-temp')
		// The exact real-world state: a leftover root with nothing in it, which is
		// what makes the sweep's `rmdir(parent)` succeed.
		await mkdir(root, {recursive: true})

		// Stands in for the sweep, landing the instant the first `mkdir` resolves.
		let sweepRemovedRoot = false
		const real = vi.mocked(mkdir).getMockImplementation()
		let fired = false
		vi.mocked(mkdir).mockImplementation(async (...args: Parameters<typeof mkdir>) => {
			const result = await (real as typeof mkdir)(...args)
			if (!fired) {
				fired = true
				try {
					await rmdir(root)
					sweepRemovedRoot = true
				} catch {
					// ENOTEMPTY — the job directory already landed inside, which is
					// exactly what closes the window.
				}
			}
			return result
		})

		await VideoPhase(false).run(makeCtx())

		// The assertion that fails against a split mkdir: with two calls the root
		// is still empty when the sweep fires, so the rmdir succeeds and the
		// second call recreates an unhidden root.
		expect(sweepRemovedRoot).toBe(false)
		await expect(access(join(root, 'job-1'.slice(0, 8)))).resolves.toBeUndefined()
	})

	it('hides the root it recreates when the sweep got there first', async () => {
		// Sweep already removed the root before the job started: the job creates it,
		// so the job owns hiding it.
		await VideoPhase(false).run(makeCtx())

		expect(vi.mocked(hideTempDirRoot)).toHaveBeenCalledWith(join(outputDir, '.arroxy-temp'))
	})
})
