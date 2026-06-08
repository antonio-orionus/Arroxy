import {afterEach, describe, it, expect, vi} from 'vitest'
import {WarmupService} from '@main/services/WarmupService.js'
import type {BinaryManager} from '@main/services/BinaryManager.js'
import type {TokenService} from '@main/services/TokenService.js'
import type {DependencyDiagnostic, DependencyId} from '@shared/types.js'
import type {E2eHarnessMode} from '@main/e2eHarness.js'

function diag(id: DependencyId, state: DependencyDiagnostic['state']): DependencyDiagnostic {
	return {id, state, source: {kind: 'managed', channel: 'default', url: 'mock'}, resolvedPath: state === 'runnable' ? `/mock/${id}` : null, failure: state === 'failed' ? {kind: 'spawn_failed', message: 'mock'} : undefined, attempts: []}
}

function fakeBinaryManager(opts: {ytDlp: 'runnable' | 'failed'; ffmpeg: 'runnable' | 'failed'; ffprobe: 'runnable' | 'failed'; deno: 'runnable' | 'failed'}): BinaryManager {
	return {
		invalidateResolved: vi.fn(),
		resolveYtDlp: vi.fn().mockResolvedValue(diag('yt-dlp', opts.ytDlp)),
		resolveFFmpegPair: vi.fn().mockResolvedValue({ffmpeg: diag('ffmpeg', opts.ffmpeg), ffprobe: diag('ffprobe', opts.ffprobe)}),
		resolveDeno: vi.fn().mockResolvedValue(diag('deno', opts.deno))
	} as unknown as BinaryManager
}

const noopToken = {warmUp: vi.fn().mockResolvedValue({ready: true})} as unknown as TokenService

const e2eMode = {enabled: true, skipDeno: true, disableAnalytics: true, disableUpdater: true, useMockTokenProvider: true, commandLineSwitches: [], applyAppSettingsDefaults: settings => settings, applySpawnEnv: env => ({...env}), ytDlpArgs: () => []} satisfies E2eHarnessMode

afterEach(() => {
	vi.restoreAllMocks()
})

describe('WarmupService', () => {
	it('returns blockingFailures excluding deno', async () => {
		const bm = fakeBinaryManager({ytDlp: 'runnable', ffmpeg: 'runnable', ffprobe: 'runnable', deno: 'failed'})
		const svc = new WarmupService({binaryManager: bm, tokenService: noopToken})
		const result = await svc.run()
		expect(result.ok).toBe(true)
		if (!result.ok) return
		expect(result.data.completed).toBe(true)
		expect(result.data.blockingFailures).toEqual([])
		expect(result.data.dependencies.deno.state).toBe('failed')
	})

	it('flags blocking failures for yt-dlp/ffmpeg/ffprobe', async () => {
		const bm = fakeBinaryManager({ytDlp: 'failed', ffmpeg: 'runnable', ffprobe: 'runnable', deno: 'runnable'})
		const svc = new WarmupService({binaryManager: bm, tokenService: noopToken})
		const result = await svc.run()
		if (!result.ok) throw new Error('expected ok')
		expect(result.data.completed).toBe(false)
		expect(result.data.blockingFailures).toEqual(['yt-dlp'])
	})

	it('skips deno resolution when requested by the E2E harness', async () => {
		const bm = fakeBinaryManager({ytDlp: 'runnable', ffmpeg: 'runnable', ffprobe: 'runnable', deno: 'runnable'})
		const svc = new WarmupService({binaryManager: bm, tokenService: noopToken, e2eMode})

		const result = await svc.run()

		expect(bm.resolveDeno).not.toHaveBeenCalled()
		if (!result.ok) throw new Error('expected ok')
		expect(result.data.completed).toBe(true)
		expect(result.data.dependencies.deno.state).toBe('failed')
		expect(result.data.dependencies.deno.failure?.message).toMatch(/Skipped/)
	})

	it('force-rerun invalidates cached binaries and returns fresh result', async () => {
		const bm = fakeBinaryManager({ytDlp: 'failed', ffmpeg: 'runnable', ffprobe: 'runnable', deno: 'runnable'})
		const svc = new WarmupService({binaryManager: bm, tokenService: noopToken})
		await svc.run()
		// After first run: rebind so the second pass returns runnable yt-dlp.
		;(bm.resolveYtDlp as ReturnType<typeof vi.fn>).mockResolvedValueOnce(diag('yt-dlp', 'runnable'))
		const second = await svc.run({force: true})
		expect(bm.invalidateResolved).toHaveBeenCalled()
		if (!second.ok) throw new Error('expected ok')
		expect(second.data.completed).toBe(true)
		expect(second.data.blockingFailures).toEqual([])
	})

	it('memoizes in-flight runs without force', async () => {
		let resolveYt!: (d: DependencyDiagnostic) => void
		const ytPromise = new Promise<DependencyDiagnostic>(r => {
			resolveYt = r
		})
		const bm = {invalidateResolved: vi.fn(), resolveYtDlp: vi.fn().mockReturnValue(ytPromise), resolveFFmpegPair: vi.fn().mockResolvedValue({ffmpeg: diag('ffmpeg', 'runnable'), ffprobe: diag('ffprobe', 'runnable')}), resolveDeno: vi.fn().mockResolvedValue(diag('deno', 'runnable'))} as unknown as BinaryManager
		const svc = new WarmupService({binaryManager: bm, tokenService: noopToken})
		const a = svc.run()
		const b = svc.run()
		expect(a).toBe(b)
		resolveYt(diag('yt-dlp', 'runnable'))
		await a
		expect((bm.resolveYtDlp as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1)
	})

	it('uses a 30 minute per-binary warmup budget', async () => {
		const timeoutSpy = vi.spyOn(AbortSignal, 'timeout').mockImplementation(() => new AbortController().signal)
		const bm = fakeBinaryManager({ytDlp: 'runnable', ffmpeg: 'runnable', ffprobe: 'runnable', deno: 'runnable'})
		const svc = new WarmupService({binaryManager: bm, tokenService: noopToken})

		await svc.run()

		expect(timeoutSpy).toHaveBeenCalledTimes(3)
		expect(timeoutSpy).toHaveBeenNthCalledWith(1, 1_800_000)
		expect(timeoutSpy).toHaveBeenNthCalledWith(2, 1_800_000)
		expect(timeoutSpy).toHaveBeenNthCalledWith(3, 1_800_000)
	})
})
