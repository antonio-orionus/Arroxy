// @vitest-environment node
// Stopping a yt-dlp run on Windows. yt-dlp.exe is a PyInstaller onefile: a
// leader process whose Python child does the work. Killing only the leader
// (node's `proc.kill` is TerminateProcess on that one pid) leaves the child
// downloading, and once the leader is gone `taskkill /T` can no longer walk to
// it. So every stop must tree-kill while the leader is still alive.
import {EventEmitter} from 'node:events'
import {spawn} from 'node:child_process'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'

vi.mock('node:child_process', async importOriginal => {
	const actual = await importOriginal<typeof import('node:child_process')>()
	return {...actual, spawn: vi.fn()}
})
vi.mock('node:fs/promises', async importOriginal => {
	const actual = await importOriginal<typeof import('node:fs/promises')>()
	return {...actual, mkdir: vi.fn(async () => undefined)}
})
vi.mock('@main/utils/process', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/utils/process.js')>()
	return {...actual, spawnYtDlp: vi.fn()}
})
vi.mock('@main/services/ytDlpJsRuntime', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/services/ytDlpJsRuntime.js')>()
	return {...actual, probeElectronNodeRuntime: vi.fn()}
})

import {spawnYtDlp} from '@main/utils/process.js'
import {probeElectronNodeRuntime} from '@main/services/ytDlpJsRuntime.js'
import {PROBE_TIMEOUT_MESSAGE, YtDlp, type YtDlpRequest} from '@main/services/YtDlp.js'
import {buildYtDlpSignal, trackFfmpegProcess} from '@main/services/phases/phaseHelpers.js'
import {AsyncStack, type ActiveJob, type PhaseContext} from '@main/services/phases/types.js'

const PROBE: YtDlpRequest = {kind: 'probe', url: 'https://www.bilibili.com/video/BV1bK411W797?p=1', selection: {playlistMode: 'video'}}
const MEDIA: YtDlpRequest = {kind: 'media', url: 'https://www.bilibili.com/video/BV1bK411W797?p=1', output: {directory: '/downloads'}, selection: {formatId: '18'}, embed: {}}
const PID = 4242

// What happened, in order, across the leader and taskkill.
let events: string[]

// A leader that never ends on its own. `kill` is TerminateProcess on the leader
// alone: it dies, but its Python child keeps the pipes open, so 'close' never comes.
function leader() {
	const proc = Object.assign(new EventEmitter(), {
		pid: PID,
		exitCode: null as number | null,
		signalCode: null as NodeJS.Signals | null,
		stdout: new EventEmitter(),
		stderr: new EventEmitter(),
		kill: vi.fn((signal: NodeJS.Signals) => {
			events.push(`leader-kill:${signal}`)
			proc.signalCode = signal
			proc.emit('exit', null, signal)
			return true
		})
	})
	return proc
}

let proc: ReturnType<typeof leader>
// Off when taskkill fails to start or is refused: the tree lives on.
let taskkillEndsTree: boolean

const originalPlatform = process.platform

beforeEach(() => {
	vi.clearAllMocks()
	events = []
	taskkillEndsTree = true
	Object.defineProperty(process, 'platform', {value: 'win32'})
	proc = leader()
	vi.mocked(spawnYtDlp).mockImplementation(() => proc as never)
	// taskkill /T /F against a live leader ends the whole tree a moment later.
	vi.mocked(spawn).mockImplementation(((file: string, args: string[]) => {
		events.push(`${file} ${args.join(' ')}`)
		if (taskkillEndsTree && proc.exitCode === null && proc.signalCode === null) {
			setTimeout(() => {
				proc.exitCode = 1
				events.push('close')
				proc.emit('exit', 1, null)
				proc.emit('close', 1, null)
			}, 20)
		}
		return new EventEmitter()
	}) as never)
	vi.mocked(probeElectronNodeRuntime).mockResolvedValue({ok: true, runtime: {kind: 'electron-node', executablePath: process.execPath, version: '24.16.0'}, output: 'v24.16.0'})
})

afterEach(() => {
	vi.useRealTimers()
	Object.defineProperty(process, 'platform', {value: originalPlatform})
})

function makeYtDlp() {
	const tokenService = {getToken: vi.fn().mockResolvedValue({token: 'tok', visitorData: 'vd', fromCache: false}), invalidateCache: vi.fn()}
	const binaryManager = {ensureYtDlp: vi.fn().mockResolvedValue('/fake/yt-dlp'), ensureFFmpeg: vi.fn().mockResolvedValue('/fake/ffmpeg'), ensureFFprobe: vi.fn().mockResolvedValue(null), getLastDiagnostic: vi.fn().mockReturnValue(undefined), forgetProbeVerdict: vi.fn()}
	const settingsStore = {get: vi.fn().mockResolvedValue({})}
	return new YtDlp(binaryManager as never, tokenService as never, settingsStore)
}

const TREE_KILL = `taskkill /pid ${PID} /T /F`

describe('stopping a signed-out yt-dlp run on Windows', () => {
	it('tree-kills a timed-out probe while its leader is alive, and settles once the tree is gone', async () => {
		const result = await makeYtDlp().run(PROBE, {timeoutMs: 30})

		expect(result).toMatchObject({kind: 'exit-error', rawError: PROBE_TIMEOUT_MESSAGE})
		expect(events).toEqual([TREE_KILL, 'close'])
		expect(proc.kill).not.toHaveBeenCalled()
	})

	it('tree-kills a cancelled download while its leader is alive, and settles once the tree is gone', async () => {
		const controller = new AbortController()
		const run = makeYtDlp().run(MEDIA, {abortSignal: controller.signal})
		await vi.waitFor(() => expect(spawnYtDlp).toHaveBeenCalledOnce())

		controller.abort()

		await expect(run).resolves.toMatchObject({kind: 'exit-error', rawError: 'Cancelled'})
		expect(events).toEqual([TREE_KILL, 'close'])
		expect(proc.kill).not.toHaveBeenCalled()
	})

	it('settles after the grace when the tree kill fails, killing the still-live leader as a last resort', async () => {
		taskkillEndsTree = false
		const controller = new AbortController()
		const run = makeYtDlp().run(MEDIA, {abortSignal: controller.signal})
		await vi.waitFor(() => expect(spawnYtDlp).toHaveBeenCalledOnce())
		vi.useFakeTimers()

		controller.abort()
		await vi.advanceTimersByTimeAsync(4_999)
		expect(proc.kill).not.toHaveBeenCalled()
		await vi.advanceTimersByTimeAsync(1)

		await expect(run).resolves.toMatchObject({kind: 'exit-error', rawError: 'Cancelled'})
		expect(events).toEqual([TREE_KILL, 'leader-kill:SIGKILL'])
	})

	it('settles after the grace without signalling a leader that already exited while its tree holds the pipes', async () => {
		const controller = new AbortController()
		const run = makeYtDlp().run(MEDIA, {abortSignal: controller.signal})
		await vi.waitFor(() => expect(spawnYtDlp).toHaveBeenCalledOnce())
		proc.exitCode = 0
		vi.useFakeTimers()

		controller.abort()
		await vi.advanceTimersByTimeAsync(5_000)

		await expect(run).resolves.toMatchObject({kind: 'exit-error', rawError: 'Cancelled'})
		// Its pid may already belong to another process.
		expect(events).toEqual([])
	})
})

function makeActive(): ActiveJob {
	return {
		job: {id: 'job-1', url: 'https://example.com/v', outputDir: '/downloads', status: 'running', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z'},
		input: {url: 'https://example.com/v', outputDir: '/downloads', job: {kind: 'single-format', extractor: 'generic', extractorKey: 'Generic', formatId: '18', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}},
		controller: new AbortController(),
		get signal(): AbortSignal {
			return this.controller.signal
		},
		cancelRequested: false,
		pauseRequested: false,
		subtitlePaths: [],
		disposables: new AsyncStack()
	}
}

describe('a download phase stopping its yt-dlp run on Windows', () => {
	it('tree-kills a run that spawned after cancel was requested', () => {
		const active = makeActive()
		active.cancelRequested = true
		const ctx = {register: vi.fn(), safeConsume: vi.fn()} as unknown as PhaseContext

		buildYtDlpSignal(ctx, active).onSpawn?.(proc as never, undefined)

		expect(events).toEqual([TREE_KILL])
		expect(proc.kill).not.toHaveBeenCalled()
	})

	it('tree-kills a run still alive when the job finalizes', async () => {
		const active = makeActive()
		const register = vi.fn<(fn: () => void | Promise<void>) => void>()
		const ctx = {register, safeConsume: vi.fn()} as unknown as PhaseContext

		buildYtDlpSignal(ctx, active).onSpawn?.(proc as never, undefined)
		await register.mock.calls[0]?.[0]()

		expect(events).toEqual([TREE_KILL])
		expect(proc.kill).not.toHaveBeenCalled()
	})
})

describe('a download phase stopping its ffmpeg run on Windows', () => {
	it('tree-kills a run that spawned after cancel was requested', () => {
		const active = makeActive()
		active.cancelRequested = true
		const ctx = {register: vi.fn()} as unknown as PhaseContext

		trackFfmpegProcess(ctx, active)(proc as never)

		expect(active.ffmpegProcess).toBe(proc)
		expect(events).toEqual([TREE_KILL])
		expect(proc.kill).not.toHaveBeenCalled()
	})

	it('tree-kills a run still alive when the job finalizes', async () => {
		const active = makeActive()
		const register = vi.fn<(fn: () => void | Promise<void>) => void>()
		const ctx = {register} as unknown as PhaseContext

		trackFfmpegProcess(ctx, active)(proc as never)
		await register.mock.calls[0]?.[0]()

		expect(events).toEqual([TREE_KILL])
		expect(proc.kill).not.toHaveBeenCalled()
	})
})
