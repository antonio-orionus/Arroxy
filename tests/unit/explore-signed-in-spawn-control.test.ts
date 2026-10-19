// @vitest-environment node
// Cancel and pause of an escalated download, through the real DownloadService,
// VideoPhase, YtDlp and ExploreSpawnGate; only yt-dlp itself is faked.
import {EventEmitter} from 'node:events'
import {mkdtemp, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'

// On Windows a tree kill shells out to `taskkill /pid <pid>`. Route it to the
// fake yt-dlp it names, as the group-kill spy does on Unix, so a fake pid never
// reaches the real taskkill (or a real process that happens to hold that pid).
const taskkill = vi.hoisted(() => ({route: (_pid: number): void => undefined}))
vi.mock('node:child_process', async importOriginal => {
	const actual = await importOriginal<typeof import('node:child_process')>()
	const spawn = (command: string, args: readonly string[] = [], options: import('node:child_process').SpawnOptions = {}): ReturnType<typeof actual.spawn> => {
		if (command !== 'taskkill') return actual.spawn(command, args, options)
		taskkill.route(Number(args[args.indexOf('/pid') + 1]))
		return {on: () => undefined} as never
	}
	return {...actual, spawn}
})
vi.mock('@main/utils/process', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/utils/process.js')>()
	return {...actual, spawnYtDlp: vi.fn()}
})
vi.mock('@main/services/ytDlpJsRuntime', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/services/ytDlpJsRuntime.js')>()
	return {...actual, probeElectronNodeRuntime: vi.fn()}
})
vi.mock('@main/utils/diskSpace', () => ({checkDiskSpace: vi.fn().mockResolvedValue({ok: true, freeBytes: 1e12, requiredBytes: 0})}))
vi.mock('@main/services/download/tempDirVisibility.js', async importOriginal => {
	const actual = await importOriginal<typeof import('@main/services/download/tempDirVisibility.js')>()
	return {...actual, hideTempDirRoot: vi.fn()}
})

import {spawnYtDlp} from '@main/utils/process.js'
import {probeElectronNodeRuntime} from '@main/services/ytDlpJsRuntime.js'
import {DownloadService} from '@main/services/DownloadService.js'
import {QueueService} from '@main/services/QueueService.js'
import {QueueStore} from '@main/stores/QueueStore.js'
import {makeItem} from '../shared/fixtures.js'
import {YtDlp} from '@main/services/YtDlp.js'
import {ExploreSpawnGate} from '@main/services/exploreSpawnGate.js'
import type {PreparedJob} from '@shared/preparedJob.js'
import type {JobAuth, StatusEvent} from '@shared/types.js'
import {STATUS_KEY, type ExploreSignInState} from '@shared/schemas.js'

const URL = 'https://www.youtube.com/watch?v=abc'
const JOB: PreparedJob = {kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '18', sponsorBlock: {mode: 'off'}, embed: {chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false}}
const LOGIN_REQUIRED_STDERR = 'ERROR: [youtube] abc: This video is only available for registered users.\n'

// A yt-dlp stand-in: `exitCode` closes it on its own; null keeps it running
// until it is killed (pause / cancel), like a long transfer. Exit and close
// arrive the way node reports them, so `exitCode` reads like a real child's.
let nextPid = 900_000
function fakeProcess(exitCode: number | null, stderr = '') {
	const exit = (code: number): void => {
		proc.exitCode = code
		proc.emit('exit', code, null)
		proc.emit('close', code)
	}
	const proc = Object.assign(new EventEmitter(), {pid: nextPid++, exitCode: null as number | null, signalCode: null as NodeJS.Signals | null, stdout: new EventEmitter(), stderr: new EventEmitter(), kill: vi.fn(() => setTimeout(() => exit(143), 1))})
	if (exitCode !== null)
		setTimeout(() => {
			if (stderr) proc.stderr.emit('data', Buffer.from(stderr))
			exit(exitCode)
		}, 5)
	fakes.set(proc.pid, proc)
	return proc
}
const fakes = new Map<number, ReturnType<typeof fakeProcess>>()
taskkill.route = pid => fakes.get(pid)?.kill()

// Group kills go through process.kill(-pid); a fake pid must never reach the real one.
function groupKills(): number[] {
	return processKill.mock.calls.map(call => Number(call[0]))
}
const processKill = vi.spyOn(process, 'kill')

let outputDir: string

beforeEach(async () => {
	vi.clearAllMocks()
	outputDir = await mkdtemp(join(tmpdir(), 'arroxy-signed-in-control-'))
	// A group kill reaches the fake leader, never a real process.
	processKill.mockImplementation((pid: number) => {
		fakes.get(-pid)?.kill()
		return true
	})
	vi.mocked(probeElectronNodeRuntime).mockResolvedValue({ok: true, runtime: {kind: 'electron-node', executablePath: process.execPath, version: '24.16.0'}, output: 'v24.16.0'})
})

afterEach(async () => {
	// Windows can still hold the job's temp dir for a moment after the test ends (EPERM).
	await rm(outputDir, {recursive: true, force: true, maxRetries: 5, retryDelay: 100})
})

function harness(gate: ExploreSpawnGate, opts: {mintToken?: () => Promise<{token: string; visitorData: string}>; canEscalate?: boolean; verified?: ExploreSignInState} = {}) {
	// Every signed-in spawn writes exactly one jar, so this counts them.
	const jars: string[] = []
	const withJar = <T>(siteId: string, fn: (jarPath: string) => Promise<T>): Promise<T> => {
		jars.push(siteId)
		return fn(join(outputDir, 'jar.txt'))
	}
	const binaryManager = {ensureYtDlp: vi.fn().mockResolvedValue('/fake/yt-dlp'), ensureFFmpeg: vi.fn().mockResolvedValue('/fake/ffmpeg'), ensureFFprobe: vi.fn().mockResolvedValue(null), getLastDiagnostic: vi.fn().mockReturnValue(undefined), forgetProbeVerdict: vi.fn()}
	const tokenService = {getToken: vi.fn(opts.mintToken ?? (() => Promise.resolve({token: 'tok', visitorData: 'vd'}))), invalidateCache: vi.fn(), resetSession: vi.fn()}
	const settingsStore = {get: vi.fn().mockResolvedValue({common: {cookiesMode: 'explore'}, playlist: {}})}
	const ytDlp = new YtDlp(binaryManager as never, tokenService as never, settingsStore, {sessionJars: {withJar}, spawnGate: gate, sessionAuth: {canEscalate: () => Promise.resolve(true)}})
	const recentJobsStore = {push: vi.fn().mockResolvedValue(undefined)}
	const service = new DownloadService(ytDlp, recentJobsStore as never, false, undefined, {exploreGate: {canEscalate: () => Promise.resolve(opts.canEscalate ?? true)}, exploreSession: {verifySignedIn: () => Promise.resolve(opts.verified ?? 'signedIn')}, spawnGate: gate})
	const statuses: StatusEvent[] = []
	service.on('status', (event: StatusEvent) => statuses.push(event))
	const start = async (auth?: JobAuth): Promise<string> => {
		const result = await service.start({url: URL, outputDir, job: JOB, ...(auth ? {auth} : {})})
		if (!result.ok) throw new Error(result.error.message)
		return result.data.job.id
	}
	return {service, jars, recentJobsStore, statuses, start}
}

// Holds the gate's only slot until released, as another signed-in download would.
function holdSlot(gate: ExploreSpawnGate): () => void {
	let release!: () => void
	void gate.run('other-job', () => new Promise<void>(resolve => (release = resolve)))
	return () => release()
}

// Each wait below is for a state change that depends on module loading and a chain of
// awaits, so under suite load it can take far longer than waitFor's 1 s default; a
// failing run is still bounded by the test timeout.
const SETTLE = {timeout: 15_000}

// Resolves, per job id, the moment that job's spawn enters the gate: an explicit
// milestone to await instead of polling a spy against a clock.
function watchGate(gate: ExploreSpawnGate): {entered: (jobId: string) => Promise<void>} {
	const entries = new Map<string, {promise: Promise<void>; resolve: () => void}>()
	const entry = (jobId: string) => {
		let found = entries.get(jobId)
		if (!found) {
			let resolve!: () => void
			found = {promise: new Promise<void>(r => (resolve = r)), resolve}
			entries.set(jobId, found)
		}
		return found
	}
	const original = gate.run.bind(gate)
	vi.spyOn(gate, 'run').mockImplementation((jobId, fn, signal) => {
		entry(jobId).resolve()
		return original(jobId, fn, signal)
	})
	return {entered: jobId => entry(jobId).promise}
}

describe('escalated download waiting for a signed-in slot (I1)', () => {
	it('is dropped, not spawned, when the job is cancelled while it waits', async () => {
		const gate = new ExploreSpawnGate({maxConcurrent: 1, minSpacingMs: 0})
		const release = holdSlot(gate)
		const watch = watchGate(gate)
		// Built when the job spawns it: fakeProcess starts its exit timer on creation, and a
		// child that exits before the job attaches its listeners is never seen to close.
		let anonymous!: ReturnType<typeof fakeProcess>
		vi.mocked(spawnYtDlp).mockImplementationOnce(() => (anonymous = fakeProcess(1, LOGIN_REQUIRED_STDERR)) as never)
		const {service, jars, recentJobsStore, start} = harness(gate)

		const jobId = await start()
		await watch.entered(jobId)
		await service.cancel(jobId)
		// The anonymous run already exited: its pid may belong to anything by now.
		expect(anonymous.kill).not.toHaveBeenCalled()
		expect(groupKills()).not.toContain(-anonymous.pid)

		await vi.waitFor(() => expect(recentJobsStore.push).toHaveBeenCalledWith(expect.objectContaining({status: 'cancelled'})), SETTLE)
		release()
		await new Promise(resolve => setTimeout(resolve, 20))
		expect(jars).toEqual([])
		expect(spawnYtDlp).toHaveBeenCalledOnce()
	})

	it('is dropped, not spawned, when the job is paused while it waits', async () => {
		const gate = new ExploreSpawnGate({maxConcurrent: 1, minSpacingMs: 0})
		const release = holdSlot(gate)
		const watch = watchGate(gate)
		// Built when the job spawns it: fakeProcess starts its exit timer on creation, and a
		// child that exits before the job attaches its listeners is never seen to close.
		let anonymous!: ReturnType<typeof fakeProcess>
		vi.mocked(spawnYtDlp).mockImplementationOnce(() => (anonymous = fakeProcess(1, LOGIN_REQUIRED_STDERR)) as never)
		const {service, jars, start} = harness(gate)

		const jobId = await start()
		await watch.entered(jobId)
		expect(await service.pause(jobId)).toMatchObject({ok: true, data: {paused: true}})
		// Paused because it has no live process, not by signalling the exited one.
		expect(anonymous.kill).not.toHaveBeenCalled()
		expect(groupKills()).not.toContain(-anonymous.pid)

		// Parked as paused: no longer active, and resumable.
		await vi.waitFor(() => expect(service.activeCount).toBe(0), SETTLE)
		release()
		await new Promise(resolve => setTimeout(resolve, 20))
		expect(jars).toEqual([])
		expect(spawnYtDlp).toHaveBeenCalledOnce()
	})
})

describe('signed-in spawn budget across pause and resume (I2)', () => {
	it('does not run out after many pause/resume cycles of one escalated job', async () => {
		const gate = new ExploreSpawnGate({minSpacingMs: 0})
		vi.mocked(spawnYtDlp).mockImplementation(() => fakeProcess(null) as never)
		const {service, jars, statuses, start} = harness(gate)

		const jobId = await start('exploreSession')
		const cycles = 8
		for (let cycle = 1; cycle <= cycles; cycle++) {
			await vi.waitFor(() => expect(spawnYtDlp).toHaveBeenCalledTimes(cycle), SETTLE)
			expect(await service.pause(jobId)).toMatchObject({ok: true, data: {paused: true}})
			await vi.waitFor(() => expect(service.activeCount).toBe(0), SETTLE)
			if (cycle < cycles) expect(await service.resume(jobId)).toMatchObject({ok: true, data: {resumed: true}})
		}

		expect(jars).toHaveLength(cycles)
		expect(statuses.filter(s => s.stage === 'error')).toEqual([])
	})
})

describe('pause of a job with no live process (R24)', () => {
	it('Pause-all parks a signed-in job still waiting for its first slot; it never spawns until resumed', async () => {
		const gate = new ExploreSpawnGate({minSpacingMs: 0})
		const watch = watchGate(gate)
		vi.mocked(spawnYtDlp).mockImplementation(() => fakeProcess(null) as never)
		const {service, jars, start} = harness(gate)

		const holders = [await start('exploreSession'), await start('exploreSession')]
		await vi.waitFor(() => expect(spawnYtDlp).toHaveBeenCalledTimes(2), SETTLE)
		const waiter = await start('exploreSession')
		await watch.entered(waiter)

		// Pause-all: the slot holders first, as the queue walks its running rows.
		for (const jobId of [...holders, waiter]) expect(await service.pause(jobId)).toMatchObject({ok: true, data: {paused: true, jobId}})
		await vi.waitFor(() => expect(service.activeCount).toBe(0), SETTLE)
		await new Promise(resolve => setTimeout(resolve, 20))
		expect(spawnYtDlp).toHaveBeenCalledTimes(2)
		expect(jars).toHaveLength(2)

		expect(await service.resume(waiter)).toMatchObject({ok: true, data: {resumed: true}})
		await vi.waitFor(() => expect(spawnYtDlp).toHaveBeenCalledTimes(3), SETTLE)
		expect(jars).toHaveLength(3)
	})

	it('pauses an anonymous job that has not spawned yet (still minting its token) and resumes it', async () => {
		let releaseMint!: () => void
		const mintGate = new Promise<void>(resolve => (releaseMint = resolve))
		vi.mocked(spawnYtDlp).mockImplementation(() => fakeProcess(null) as never)
		const {service, start} = harness(new ExploreSpawnGate({minSpacingMs: 0}), {mintToken: () => mintGate.then(() => ({token: 'tok', visitorData: 'vd'}))})

		const jobId = await start()
		await new Promise(resolve => setTimeout(resolve, 20))
		expect(await service.pause(jobId)).toMatchObject({ok: true, data: {paused: true, jobId}})

		// The token arrives after the pause: nothing may start downloading.
		releaseMint()
		await vi.waitFor(() => expect(service.activeCount).toBe(0), SETTLE)
		await new Promise(resolve => setTimeout(resolve, 20))
		expect(spawnYtDlp).not.toHaveBeenCalled()

		expect(await service.resume(jobId)).toMatchObject({ok: true, data: {resumed: true}})
		await vi.waitFor(() => expect(spawnYtDlp).toHaveBeenCalledOnce(), SETTLE)
	})
})

describe('resume of a job whose pause has not parked yet (R25)', () => {
	function mintHeld() {
		let releaseMint!: () => void
		const mintGate = new Promise<void>(resolve => (releaseMint = resolve))
		return {releaseMint: () => releaseMint(), mintToken: () => mintGate.then(() => ({token: 'tok', visitorData: 'vd'}))}
	}

	it('waits for the pause to park, then resumes the same job with no orphan paused entry', async () => {
		const {releaseMint, mintToken} = mintHeld()
		vi.mocked(spawnYtDlp).mockImplementation(() => fakeProcess(null) as never)
		const {service, start} = harness(new ExploreSpawnGate({minSpacingMs: 0}), {mintToken})

		const jobId = await start()
		await new Promise(resolve => setTimeout(resolve, 20))
		expect(await service.pause(jobId)).toMatchObject({ok: true, data: {paused: true, jobId}})
		// Still in activeJobs: the run has not reached its next run point.
		expect(service.activeCount).toBe(1)

		const resumed = service.resume(jobId)
		await new Promise(resolve => setTimeout(resolve, 20))
		expect(spawnYtDlp).not.toHaveBeenCalled()

		releaseMint()
		expect(await resumed).toMatchObject({ok: true, data: {resumed: true, job: {id: jobId}}})
		await vi.waitFor(() => expect(spawnYtDlp).toHaveBeenCalledOnce(), SETTLE)
		// The same job runs again; nothing else was started in its place.
		expect(service.activeCount).toBe(1)
		expect(vi.mocked(spawnYtDlp)).toHaveBeenCalledTimes(1)
		expect(service.pausedCount).toBe(0)
	})

	it('reports the job as still live, not "nothing to resume", once the 10 s bound passes without the job parking', async () => {
		const {mintToken} = mintHeld()
		vi.mocked(spawnYtDlp).mockImplementation(() => fakeProcess(null) as never)
		const {service, start} = harness(new ExploreSpawnGate({minSpacingMs: 0}), {mintToken})

		const jobId = await start()
		await new Promise(resolve => setTimeout(resolve, 20))
		await service.pause(jobId)

		vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']})
		try {
			let settled = false
			const resumed = service.resume(jobId).then(result => {
				settled = true
				return result
			})
			await vi.advanceTimersByTimeAsync(9_999)
			expect(settled).toBe(false)
			await vi.advanceTimersByTimeAsync(1)
			expect(await resumed).toEqual({ok: true, data: {resumed: false, jobLive: true}})
		} finally {
			vi.useRealTimers()
		}
	})

	it('does not wait for a job that was cancelled after the pause', async () => {
		const {mintToken} = mintHeld()
		vi.mocked(spawnYtDlp).mockImplementation(() => fakeProcess(null) as never)
		const {service, start} = harness(new ExploreSpawnGate({minSpacingMs: 0}), {mintToken})

		const jobId = await start()
		await new Promise(resolve => setTimeout(resolve, 20))
		await service.pause(jobId)
		await service.cancel(jobId)

		const startedAt = Date.now()
		expect(await service.resume(jobId)).toMatchObject({ok: true, data: {resumed: false}})
		expect(Date.now() - startedAt).toBeLessThan(1000)
		expect(service.pausedCount).toBe(0)
	})
})

// A2-4: the queue must not start a replacement while the paused job still exists.
describe('queue resume of a job whose pause has not parked yet', () => {
	// A queue item whose download was paused while its token mint is held: the
	// pause is flagged but the job has not parked, so it still exists.
	async function parkingItem() {
		let releaseMint!: () => void
		const mintGate = new Promise<void>(resolve => (releaseMint = resolve))
		vi.mocked(spawnYtDlp).mockImplementation(() => fakeProcess(null) as never)
		const {service} = harness(new ExploreSpawnGate({minSpacingMs: 0}), {mintToken: () => mintGate.then(() => ({token: 'tok', visitorData: 'vd'}))})
		const start = vi.spyOn(service, 'start')
		const queue = new QueueService(new QueueStore(join(outputDir, 'user-data')), service)
		await queue.init()
		const status = (): string | undefined => queue.snapshot().find(item => item.id === 'a')?.status

		expect(queue.add([makeItem({id: 'a', status: 'pending', url: URL, outputDir, job: JOB})]).ok).toBe(true)
		await vi.waitFor(() => expect(status()).toBe('running'), SETTLE)
		expect(await queue.pause('a')).toEqual({ok: true, data: undefined})
		expect(status()).toBe('paused-active')
		return {service, queue, start, status, releaseMint}
	}

	it('keeps the item paused and starts nothing new past the wait bound; once the late mint lands, Resume continues the same job', async () => {
		const {service, queue, start, status, releaseMint} = await parkingItem()

		vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout']})
		let resumed: Awaited<ReturnType<QueueService['resume']>>
		try {
			const pending = queue.resume('a')
			await vi.advanceTimersByTimeAsync(10_000)
			resumed = await pending
		} finally {
			vi.useRealTimers()
		}
		// A retryable refusal, not a fresh start beside the job that is still parking.
		expect(resumed).toMatchObject({ok: false, error: {code: 'conflict', recoverable: true}})
		expect(status()).toBe('paused-active')
		expect(start).toHaveBeenCalledOnce()

		releaseMint()
		await vi.waitFor(() => expect(service.pausedCount).toBe(1), SETTLE)
		expect(spawnYtDlp).not.toHaveBeenCalled()

		expect(await queue.resume('a')).toEqual({ok: true, data: undefined})
		await vi.waitFor(() => expect(spawnYtDlp).toHaveBeenCalledOnce(), SETTLE)
		expect(start).toHaveBeenCalledOnce()
		expect(service.pausedCount).toBe(0)
		expect(service.activeCount).toBe(1)
		expect(status()).toBe('running')
		await service.cancel()
	})

	it('runs the job once when Resume is pressed twice while the pause parks', async () => {
		const {service, queue, start, status, releaseMint} = await parkingItem()

		const first = queue.resume('a')
		const second = queue.resume('a')
		releaseMint()
		await Promise.all([first, second])

		await vi.waitFor(() => expect(spawnYtDlp).toHaveBeenCalledOnce(), SETTLE)
		await new Promise(resolve => setTimeout(resolve, 20))
		expect(start).toHaveBeenCalledOnce()
		expect(spawnYtDlp).toHaveBeenCalledOnce()
		expect(service.activeCount).toBe(1)
		expect(service.pausedCount).toBe(0)
		expect(status()).toBe('running')
		await service.cancel()
	})

	it('leaves the item cancelled when it is cancelled while Resume waits for the park', async () => {
		const {service, queue, start, status, releaseMint} = await parkingItem()

		const resumed = queue.resume('a')
		expect(await queue.cancel('a')).toEqual({ok: true, data: undefined})
		expect(status()).toBe('cancelled')
		releaseMint()
		expect(await resumed).toEqual({ok: true, data: undefined})

		await new Promise(resolve => setTimeout(resolve, 20))
		expect(status()).toBe('cancelled')
		expect(start).toHaveBeenCalledOnce()
		expect(spawnYtDlp).not.toHaveBeenCalled()
		expect(service.activeCount).toBe(0)
	})
})

// The Explore view is told only when the site itself said signed out; a gate
// refusal (mode switched away, kill switch, cookies gone) emits the same
// status but proves nothing about the session.
describe('verified Explore sign-out signal (P2-R13)', () => {
	const COOKIES_REJECTED_STDERR = 'WARNING: [youtube] The provided YouTube account cookies are no longer valid. They have likely been rotated in the browser as a security measure.\nERROR: [youtube] abc: Sign in to confirm your age.\n'

	it('fires when the session check after rejected cookies says signed out', async () => {
		vi.mocked(spawnYtDlp).mockImplementation(() => fakeProcess(1, COOKIES_REJECTED_STDERR) as never)
		const {service, statuses, recentJobsStore, start} = harness(new ExploreSpawnGate({minSpacingMs: 0}), {verified: 'signedOut'})
		const verifiedSignedOut = vi.fn()
		service.onExploreVerifiedSignedOut(verifiedSignedOut)

		await start('exploreSession')

		await vi.waitFor(() => expect(recentJobsStore.push).toHaveBeenCalledWith(expect.objectContaining({status: 'failed'})), SETTLE)
		expect(statuses.map(s => s.statusKey)).toContain(STATUS_KEY.exploreSignedOut)
		expect(verifiedSignedOut).toHaveBeenCalledTimes(1)
	})

	it('does not fire when the check says the session is still signed in or cannot tell', async () => {
		for (const verified of ['signedIn', 'unknown'] as const) {
			vi.mocked(spawnYtDlp).mockImplementation(() => fakeProcess(1, COOKIES_REJECTED_STDERR) as never)
			const {service, recentJobsStore, start} = harness(new ExploreSpawnGate({minSpacingMs: 0}), {verified})
			const verifiedSignedOut = vi.fn()
			service.onExploreVerifiedSignedOut(verifiedSignedOut)

			await start('exploreSession')

			await vi.waitFor(() => expect(recentJobsStore.push).toHaveBeenCalledWith(expect.objectContaining({status: 'failed'})), SETTLE)
			expect(verifiedSignedOut).not.toHaveBeenCalled()
		}
	})

	it('fires for a run that succeeded although yt-dlp rejected the cookies, and keeps the download', async () => {
		const REJECTED_WARNING = 'WARNING: [youtube] The provided YouTube account cookies are no longer valid. They have likely been rotated in the browser as a security measure.\n'
		vi.mocked(spawnYtDlp).mockImplementation(() => fakeProcess(0, REJECTED_WARNING) as never)
		const {service, recentJobsStore, start} = harness(new ExploreSpawnGate({minSpacingMs: 0}), {verified: 'signedOut'})
		const verifiedSignedOut = vi.fn()
		service.onExploreVerifiedSignedOut(verifiedSignedOut)

		await start('exploreSession')

		await vi.waitFor(() => expect(recentJobsStore.push).toHaveBeenCalledWith(expect.objectContaining({status: 'completed'})), SETTLE)
		expect(verifiedSignedOut).toHaveBeenCalledTimes(1)
		expect(spawnYtDlp).toHaveBeenCalledOnce()
	})

	it('does not fire when the gate refuses a signed-in spawn', async () => {
		vi.mocked(spawnYtDlp).mockImplementation(() => fakeProcess(1, COOKIES_REJECTED_STDERR) as never)
		const {service, statuses, recentJobsStore, start} = harness(new ExploreSpawnGate({minSpacingMs: 0}), {canEscalate: false, verified: 'signedOut'})
		const verifiedSignedOut = vi.fn()
		service.onExploreVerifiedSignedOut(verifiedSignedOut)

		await start('exploreSession')

		await vi.waitFor(() => expect(recentJobsStore.push).toHaveBeenCalledWith(expect.objectContaining({status: 'failed'})), SETTLE)
		expect(statuses.map(s => s.statusKey)).toContain(STATUS_KEY.exploreSignedOut)
		expect(spawnYtDlp).not.toHaveBeenCalled()
		expect(verifiedSignedOut).not.toHaveBeenCalled()
	})
})
