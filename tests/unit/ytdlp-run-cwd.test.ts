import {EventEmitter} from 'node:events'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {YtDlp, type YtDlpRequest} from '@main/services/YtDlp.js'

// The working directory the plan asks for, over the bridge's own; undefined keeps the bridge's.
let planCwd: string | undefined

vi.mock('yt-dlp-bridge', async importOriginal => {
	const actual = await importOriginal<typeof import('yt-dlp-bridge')>()
	return {...actual, planWorkflow: (...args: Parameters<typeof actual.planWorkflow>) => ({...actual.planWorkflow(...args), ...(planCwd === undefined ? {} : {cwd: planCwd})})}
})

vi.mock('node:fs/promises', async importOriginal => {
	const actual = await importOriginal<typeof import('node:fs/promises')>()
	return {...actual, mkdir: vi.fn(actual.mkdir)}
})

vi.mock('@main/utils/process', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/utils/process.js')>()
	return {...actual, spawnYtDlp: vi.fn()}
})

vi.mock('@main/services/ytDlpJsRuntime', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/services/ytDlpJsRuntime.js')>()
	return {...actual, probeElectronNodeRuntime: vi.fn()}
})

import {mkdir} from 'node:fs/promises'
import {spawnYtDlp} from '@main/utils/process.js'
import {probeElectronNodeRuntime} from '@main/services/ytDlpJsRuntime.js'

// Not YouTube: one attempt, no token ladder.
const URL = 'https://example.com/video'
let workDir: string

function makeFakeProcess() {
	const proc = Object.assign(new EventEmitter(), {stdout: new EventEmitter(), stderr: new EventEmitter(), kill: vi.fn()})
	setTimeout(() => proc.emit('close', 0), 10)
	return proc
}

let binaryManager: {forgetProbeVerdict: ReturnType<typeof vi.fn>}

function makeYtDlp(opts: {onEnsureYtDlp?: () => void} = {}): YtDlp {
	const tokenService = {getToken: vi.fn(), invalidateCache: vi.fn()}
	const manager = {
		ensureYtDlp: vi.fn(() => {
			opts.onEnsureYtDlp?.()
			return Promise.resolve('/fake/yt-dlp')
		}),
		ensureFFmpeg: vi.fn().mockResolvedValue('/fake/ffmpeg'),
		ensureFFprobe: vi.fn().mockResolvedValue(null),
		getLastDiagnostic: vi.fn().mockReturnValue(null),
		forgetProbeVerdict: vi.fn()
	}
	const settingsStore = {get: vi.fn().mockResolvedValue({common: {}, playlist: {}})}
	binaryManager = manager
	return new YtDlp(manager as never, tokenService as never, settingsStore)
}

function subtitleRequest(): YtDlpRequest {
	return {kind: 'subtitles', url: URL, output: {directory: workDir}, subtitles: {languages: ['en'], format: 'srt'}}
}

function spawnCwd(): string | undefined {
	return vi.mocked(spawnYtDlp).mock.calls[0]?.[3]?.cwd
}

beforeEach(() => {
	vi.clearAllMocks()
	planCwd = undefined
	workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'arroxy-run-cwd-'))
	vi.mocked(probeElectronNodeRuntime).mockResolvedValue({ok: true, runtime: {kind: 'electron-node', executablePath: process.execPath, version: '24.16.0'}, output: 'v24.16.0'})
	vi.mocked(spawnYtDlp).mockImplementation(() => makeFakeProcess() as never)
})

afterEach(() => {
	fs.rmSync(workDir, {recursive: true, force: true})
})

describe('YtDlp — the run folder a plan asks for', () => {
	it('spawns in the inherited working directory when the plan names none', async () => {
		const onSpawn = vi.fn()

		// A probe writes no files, so its plan names no folder.
		await makeYtDlp().run({kind: 'probe', url: URL}, {onSpawn})

		expect(spawnCwd()).toBeUndefined()
		expect(onSpawn).toHaveBeenCalledWith(expect.anything(), undefined)
	})

	it("creates the plan's folder, spawns inside it and tells the caller", async () => {
		planCwd = path.join(workDir, 'Not yet created', 'Playlist')
		const onSpawn = vi.fn()

		const result = await makeYtDlp().run(subtitleRequest(), {onSpawn})

		expect(result.kind).toBe('success')
		expect(fs.statSync(planCwd).isDirectory()).toBe(true)
		expect(spawnCwd()).toBe(planCwd)
		expect(onSpawn).toHaveBeenCalledWith(expect.anything(), planCwd)
	})

	// Spawning in a folder that does not exist fails with ENOENT, which reads as
	// a missing yt-dlp binary and drops its probe verdict.
	it('fails as an unwritable output folder, without spawning, when the folder cannot be made', async () => {
		const blocker = path.join(workDir, 'a file')
		fs.writeFileSync(blocker, '')
		planCwd = path.join(blocker, 'job')

		const result = await makeYtDlp().run(subtitleRequest())

		expect(result).toMatchObject({kind: 'exit-error', errorKind: 'outputNotWritable'})
		expect(spawnYtDlp).not.toHaveBeenCalled()
		expect(binaryManager.forgetProbeVerdict).not.toHaveBeenCalled()
	})

	it('fails as a full disk when there is no room for the folder', async () => {
		planCwd = path.join(workDir, 'job')
		vi.mocked(mkdir).mockRejectedValueOnce(Object.assign(new Error('no space left on device'), {code: 'ENOSPC'}))

		const result = await makeYtDlp().run(subtitleRequest())

		expect(result).toMatchObject({kind: 'exit-error', errorKind: 'outOfDiskSpace'})
		expect(spawnYtDlp).not.toHaveBeenCalled()
	})

	// yt-dlp makes the folder only once it writes; a run stopped before it
	// spawns must not leave an empty one behind in the user's library.
	it('makes no folder for a run cancelled before it spawns', async () => {
		planCwd = path.join(workDir, 'job')
		const controller = new AbortController()

		const result = await makeYtDlp({onEnsureYtDlp: () => controller.abort()}).run(subtitleRequest(), {abortSignal: controller.signal})

		expect(result).toMatchObject({kind: 'exit-error', rawError: 'Cancelled'})
		expect(fs.existsSync(planCwd)).toBe(false)
	})

	// Making the folder is an await of its own: a pause landing during it finds
	// no process to pause, so the run must not spawn after it.
	it('does not spawn a run paused while its folder was being made', async () => {
		planCwd = path.join(workDir, 'job')
		const pause = new AbortController()
		const real = vi.mocked(mkdir).getMockImplementation()
		vi.mocked(mkdir).mockImplementationOnce(async (...args: Parameters<typeof mkdir>) => {
			const made = await (real as typeof mkdir)(...args)
			pause.abort()
			return made
		})

		const result = await makeYtDlp().run(subtitleRequest(), {pauseSignal: pause.signal})

		expect(result).toMatchObject({kind: 'exit-error', rawError: 'Cancelled'})
		expect(spawnYtDlp).not.toHaveBeenCalled()
	})
})
