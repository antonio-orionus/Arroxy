import {afterEach, describe, it, expect, vi} from 'vitest'
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

		expect(timeoutSpy).toHaveBeenCalledTimes(2)
		expect(timeoutSpy).toHaveBeenNthCalledWith(1, 1_800_000)
		expect(timeoutSpy).toHaveBeenNthCalledWith(2, 1_800_000)
	})
})
