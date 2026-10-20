import {EventEmitter} from 'node:events'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {YtDlp, type YtDlpRequest} from '@main/services/YtDlp.js'

// The working directory the bridge's plan asks for; undefined plans none.
let planCwd: string | undefined

vi.mock('yt-dlp-bridge', async importOriginal => {
	const actual = await importOriginal<typeof import('yt-dlp-bridge')>()
	return {...actual, planWorkflow: (...args: Parameters<typeof actual.planWorkflow>) => ({...actual.planWorkflow(...args), ...(planCwd === undefined ? {} : {cwd: planCwd})})}
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

// Not YouTube: one attempt, no token ladder.
const URL = 'https://example.com/video'
let workDir: string

function makeFakeProcess() {
	const proc = Object.assign(new EventEmitter(), {stdout: new EventEmitter(), stderr: new EventEmitter(), kill: vi.fn()})
	setTimeout(() => proc.emit('close', 0), 10)
	return proc
}

function makeYtDlp(): YtDlp {
	const tokenService = {getToken: vi.fn(), invalidateCache: vi.fn()}
	const binaryManager = {ensureYtDlp: vi.fn().mockResolvedValue('/fake/yt-dlp'), ensureFFmpeg: vi.fn().mockResolvedValue('/fake/ffmpeg'), ensureFFprobe: vi.fn().mockResolvedValue(null), getLastDiagnostic: vi.fn().mockReturnValue(null)}
	const settingsStore = {get: vi.fn().mockResolvedValue({common: {}, playlist: {}})}
	return new YtDlp(binaryManager as never, tokenService as never, settingsStore)
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

		await makeYtDlp().run(subtitleRequest(), {onSpawn})

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
	})
})
