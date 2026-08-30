import {afterEach, describe, it, expect, vi} from 'vitest'
import log from 'electron-log/main.js'
import {WarmupService} from '@main/services/WarmupService.js'
import type {BinaryManager} from '@main/services/BinaryManager.js'
import type {TokenService} from '@main/services/TokenService.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import type {DependencyDiagnostic, DependencyId, WarmupProgressEvent} from '@shared/types.js'

function diag(id: DependencyId, state: DependencyDiagnostic['state']): DependencyDiagnostic {
	return {id, state, source: {kind: 'managed', channel: 'default', provider: 'github', url: 'mock'}, resolvedPath: state === 'runnable' ? `/mock/${id}` : null, failure: state === 'failed' ? {kind: 'spawn_failed', message: 'mock'} : undefined, attempts: []}
}

function fakeBinaryManager(opts: {ytDlp: 'runnable' | 'failed'; ffmpeg: 'runnable' | 'failed'; ffprobe: 'runnable' | 'failed'}): BinaryManager {
	return {invalidateResolved: vi.fn(), resolveYtDlp: vi.fn().mockResolvedValue(diag('yt-dlp', opts.ytDlp)), resolveFFmpegPair: vi.fn().mockResolvedValue({ffmpeg: diag('ffmpeg', opts.ffmpeg), ffprobe: diag('ffprobe', opts.ffprobe)})} as unknown as BinaryManager
}

function fakeWarmupWindow(): {window: NonNullable<ConstructorParameters<typeof WarmupService>[0]['window']>; send: ReturnType<typeof vi.fn>} {
	const send = vi.fn()
	return {window: {isDestroyed: () => false, webContents: {send}} as unknown as NonNullable<ConstructorParameters<typeof WarmupService>[0]['window']>, send}
}

function progressEvents(send: ReturnType<typeof vi.fn>): WarmupProgressEvent[] {
	return send.mock.calls.filter(([channel]) => channel === IPC_CHANNELS.warmupProgress).map(([, event]) => event as WarmupProgressEvent)
}

function progressfulBinaryManager(): BinaryManager {
	return {
		invalidateResolved: vi.fn(),
		resolveYtDlp: vi.fn().mockImplementation(({onProgress}) => {
			onProgress?.({binary: 'yt-dlp', phase: 'starting'})
			onProgress?.({binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: 5, totalBytes: 10})
			onProgress?.({binary: 'yt-dlp', phase: 'probing'})
			onProgress?.({binary: 'yt-dlp', phase: 'done'})
			return Promise.resolve(diag('yt-dlp', 'runnable'))
		}),
		resolveFFmpegPair: vi.fn().mockImplementation(({onProgress}) => {
			onProgress?.({binary: 'ffmpeg', phase: 'starting'})
			onProgress?.({binary: 'ffmpeg', phase: 'downloading', bytesDownloaded: 7, totalBytes: 10})
			onProgress?.({binary: 'ffmpeg', phase: 'extracting'})
			onProgress?.({binary: 'ffmpeg', phase: 'done'})
			onProgress?.({binary: 'ffprobe', phase: 'starting'})
			onProgress?.({binary: 'ffprobe', phase: 'probing'})
			onProgress?.({binary: 'ffprobe', phase: 'done'})
			return Promise.resolve({ffmpeg: diag('ffmpeg', 'runnable'), ffprobe: diag('ffprobe', 'runnable')})
		})
	} as unknown as BinaryManager
}

const noopToken = {warmUp: vi.fn().mockResolvedValue({ready: true})} as unknown as TokenService

afterEach(() => {
	vi.restoreAllMocks()
})

describe('WarmupService', () => {
	it('streams progress IPC for every resolver branch so the splash never looks stuck', async () => {
		const {window, send} = fakeWarmupWindow()
		const svc = new WarmupService({binaryManager: progressfulBinaryManager(), tokenService: noopToken, window})

		const result = await svc.run()

		if (!result.ok) throw new Error('expected ok')
		expect(result.data.blockingFailures).toEqual([])
		expect(progressEvents(send).map(event => `${event.binary}:${event.phase}`)).toEqual(['yt-dlp:starting', 'yt-dlp:downloading', 'yt-dlp:probing', 'yt-dlp:done', 'ffmpeg:starting', 'ffmpeg:downloading', 'ffmpeg:extracting', 'ffmpeg:done', 'ffprobe:starting', 'ffprobe:probing', 'ffprobe:done'])
	})

	it('flags blocking failures for yt-dlp/ffmpeg/ffprobe', async () => {
		const bm = fakeBinaryManager({ytDlp: 'failed', ffmpeg: 'runnable', ffprobe: 'runnable'})
		const svc = new WarmupService({binaryManager: bm, tokenService: noopToken})
		const result = await svc.run()
		if (!result.ok) throw new Error('expected ok')
		expect(result.data.completed).toBe(false)
		expect(result.data.blockingFailures).toEqual(['yt-dlp'])
	})

	it('force-rerun invalidates cached binaries and returns fresh result', async () => {
		const bm = fakeBinaryManager({ytDlp: 'failed', ffmpeg: 'runnable', ffprobe: 'runnable'})
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
		const bm = {invalidateResolved: vi.fn(), resolveYtDlp: vi.fn().mockReturnValue(ytPromise), resolveFFmpegPair: vi.fn().mockResolvedValue({ffmpeg: diag('ffmpeg', 'runnable'), ffprobe: diag('ffprobe', 'runnable')})} as unknown as BinaryManager
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
		const bm = fakeBinaryManager({ytDlp: 'runnable', ffmpeg: 'runnable', ffprobe: 'runnable'})
		const svc = new WarmupService({binaryManager: bm, tokenService: noopToken})

		await svc.run()

		// The token branch is started before the binary resolves, so its 30s budget
		// is the first timeout created; the two binary budgets follow.
		expect(timeoutSpy).toHaveBeenCalledTimes(3)
		expect(timeoutSpy).toHaveBeenNthCalledWith(1, 30_000)
		expect(timeoutSpy).toHaveBeenNthCalledWith(2, 1_800_000)
		expect(timeoutSpy).toHaveBeenNthCalledWith(3, 1_800_000)
	})

	it('logs each branch as it settles so a hung branch is identifiable by omission', async () => {
		vi.mocked(log.info).mockClear()
		const svc = new WarmupService({binaryManager: fakeBinaryManager({ytDlp: 'runnable', ffmpeg: 'runnable', ffprobe: 'runnable'}), tokenService: noopToken})

		await svc.run()

		for (const branch of ['ytDlp', 'ffmpeg', 'token']) {
			expect(log.info).toHaveBeenCalledWith('Warmup branch settled', expect.objectContaining({branch, elapsedMs: expect.any(Number)}))
		}
	})

	it('names the slowest awaited branch as the one that gated completion', async () => {
		vi.mocked(log.info).mockClear()
		const slowFfmpeg = {
			invalidateResolved: vi.fn(),
			resolveYtDlp: vi.fn().mockResolvedValue(diag('yt-dlp', 'runnable')),
			resolveFFmpegPair: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ffmpeg: diag('ffmpeg', 'runnable'), ffprobe: diag('ffprobe', 'runnable')}), 40)))
		} as unknown as BinaryManager
		const svc = new WarmupService({binaryManager: slowFfmpeg, tokenService: noopToken})

		await svc.run()

		expect(log.info).toHaveBeenCalledWith('Warmup completed', expect.objectContaining({gatedBy: 'ffmpeg', totalMs: expect.any(Number)}))
	})

	it('completes without waiting for a token branch that never settles', async () => {
		const neverToken = {warmUp: vi.fn().mockImplementation(() => new Promise(() => {}))} as unknown as TokenService
		const svc = new WarmupService({binaryManager: fakeBinaryManager({ytDlp: 'runnable', ffmpeg: 'runnable', ffprobe: 'runnable'}), tokenService: neverToken})

		const result = await svc.run()

		expect(result.ok).toBe(true)
		if (result.ok) expect(result.data.completed).toBe(true)
	})

	it('never blames the token branch for gating, since it is no longer awaited', async () => {
		vi.mocked(log.info).mockClear()
		const slowToken = {warmUp: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ready: true}), 40)))} as unknown as TokenService
		const svc = new WarmupService({binaryManager: fakeBinaryManager({ytDlp: 'runnable', ffmpeg: 'runnable', ffprobe: 'runnable'}), tokenService: slowToken})

		await svc.run()

		const completed = vi.mocked(log.info).mock.calls.find(([msg]) => msg === 'Warmup completed')
		const timings = completed?.[1] as {gatedBy: string} | undefined
		expect(timings?.gatedBy).toBeDefined()
		expect(timings?.gatedBy).not.toBe('token')
	})
	// The startup splash is dismissed by `initialized`, which the renderer only
	// sets after `warmUp()` settles. A rejection therefore has no landing place:
	// nothing wraps the IPC handler and nothing catches in the store, so the
	// splash stays up forever with no error and no way out. The resolver can
	// genuinely reject — an EACCES on the artifact cache directory propagates out
	// of the readdir — so the failure has to arrive as a value.
	it('reports a rejecting resolver as a failed Result instead of rejecting', async () => {
		const exploding = {invalidateResolved: vi.fn(), resolveYtDlp: vi.fn().mockRejectedValue(Object.assign(new Error('EACCES: permission denied'), {code: 'EACCES'})), resolveFFmpegPair: vi.fn().mockResolvedValue({ffmpeg: diag('ffmpeg', 'runnable'), ffprobe: diag('ffprobe', 'runnable')})} as unknown as BinaryManager
		const svc = new WarmupService({binaryManager: exploding, tokenService: noopToken})

		const result = await svc.run()

		expect(result.ok).toBe(false)
		if (result.ok) throw new Error('expected fail')
		expect(result.error.code).toBe('binary')
		expect(result.error.message).toContain('EACCES')
	})

	it('flushes buffered progress before surfacing a rejecting resolver', async () => {
		const {window, send} = fakeWarmupWindow()
		const exploding = {
			invalidateResolved: vi.fn(),
			resolveYtDlp: vi.fn().mockImplementation(({onProgress}) => {
				onProgress?.({binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: 9, totalBytes: 10})
				return Promise.reject(new Error('cache unreadable'))
			}),
			resolveFFmpegPair: vi.fn().mockResolvedValue({ffmpeg: diag('ffmpeg', 'runnable'), ffprobe: diag('ffprobe', 'runnable')})
		} as unknown as BinaryManager
		const svc = new WarmupService({binaryManager: exploding, tokenService: noopToken, window})

		const result = await svc.run()

		expect(result.ok).toBe(false)
		expect(progressEvents(send).map(event => `${event.binary}:${event.phase}`)).toContain('yt-dlp:downloading')
	})

	it('clears the in-flight memo after a rejecting run so a retry can start', async () => {
		const bm = {invalidateResolved: vi.fn(), resolveYtDlp: vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValue(diag('yt-dlp', 'runnable')), resolveFFmpegPair: vi.fn().mockResolvedValue({ffmpeg: diag('ffmpeg', 'runnable'), ffprobe: diag('ffprobe', 'runnable')})} as unknown as BinaryManager
		const svc = new WarmupService({binaryManager: bm, tokenService: noopToken})

		expect((await svc.run()).ok).toBe(false)
		const second = await svc.run()

		expect(second.ok).toBe(true)
		if (second.ok) expect(second.data.completed).toBe(true)
	})

	// The token branch is not awaited, so its status is usually still pending when
	// the gating branches finish. Carrying it anyway is what lets a slow cold
	// start say "binaries fine, YouTube unreachable" instead of saying nothing.
	it('reports token warmup as pending when the binaries settle first', async () => {
		const neverToken = {warmUp: vi.fn().mockImplementation(() => new Promise(() => {}))} as unknown as TokenService
		const svc = new WarmupService({binaryManager: fakeBinaryManager({ytDlp: 'runnable', ffmpeg: 'runnable', ffprobe: 'runnable'}), tokenService: neverToken})

		const result = await svc.run()

		if (!result.ok) throw new Error('expected ok')
		expect(result.data.tokenWarmup).toBe('pending')
	})

	it('reports token warmup as unavailable once a failed token branch has settled', async () => {
		const failingToken = {warmUp: vi.fn().mockResolvedValue({ready: false, reason: 'no-visitor-data'})} as unknown as TokenService
		const slowBinaries = {
			invalidateResolved: vi.fn(),
			resolveYtDlp: vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(diag('yt-dlp', 'runnable')), 20))),
			resolveFFmpegPair: vi.fn().mockResolvedValue({ffmpeg: diag('ffmpeg', 'runnable'), ffprobe: diag('ffprobe', 'runnable')})
		} as unknown as BinaryManager
		const svc = new WarmupService({binaryManager: slowBinaries, tokenService: failingToken})

		const result = await svc.run()

		if (!result.ok) throw new Error('expected ok')
		expect(result.data.tokenWarmup).toBe('unavailable')
	})
})
