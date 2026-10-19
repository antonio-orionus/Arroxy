// @vitest-environment node
// Signed-in (Explore session) runs at the YtDlp boundary: how long a probe may
// wait for a spawn slot, and that a stopped run's jar outlives its process tree.
import {EventEmitter} from 'node:events'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'

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
import {ExploreSpawnGate} from '@main/services/exploreSpawnGate.js'
import {createExploreGate} from '@main/services/exploreGate.js'
import type {SessionCookieJarPort} from '@main/services/sessionCookieJarPort.js'

const URL = 'https://www.youtube.com/watch?v=abc'
const PROBE: YtDlpRequest = {kind: 'probe', url: URL}
const MEDIA: YtDlpRequest = {kind: 'media', url: URL, output: {directory: '/downloads'}, selection: {formatId: '18'}, embed: {}}

// Order of what happened, across the jar port and the fake process tree.
let events: string[]

// A yt-dlp leader that never ends on its own; a group kill closes it a little later, as a real tree would.
function hangingProcess(pid: number) {
	const proc = Object.assign(new EventEmitter(), {pid, exitCode: null as number | null, signalCode: null as NodeJS.Signals | null, stdout: new EventEmitter(), stderr: new EventEmitter(), kill: vi.fn()})
	return proc
}

let procs: Map<number, ReturnType<typeof hangingProcess>>
const processKill = vi.spyOn(process, 'kill')

beforeEach(() => {
	vi.clearAllMocks()
	events = []
	procs = new Map()
	processKill.mockImplementation((pid: number, signal?: string | number) => {
		const proc = procs.get(-pid)
		if (!proc) return true
		events.push(`group-kill:${String(signal)}`)
		setTimeout(() => {
			proc.signalCode = 'SIGKILL'
			events.push('close')
			proc.emit('exit', null, 'SIGKILL')
			proc.emit('close', null, 'SIGKILL')
		}, 20)
		return true
	})
	let pid = 700_000
	vi.mocked(spawnYtDlp).mockImplementation(() => {
		const proc = hangingProcess(pid++)
		procs.set(proc.pid, proc)
		return proc as never
	})
	vi.mocked(probeElectronNodeRuntime).mockResolvedValue({ok: true, runtime: {kind: 'electron-node', executablePath: process.execPath, version: '24.16.0'}, output: 'v24.16.0'})
})

afterEach(() => processKill.mockReset())

function makeYtDlp(gate: ExploreSpawnGate, opts: {common?: () => Record<string, unknown>; signedIn?: () => boolean} = {}) {
	const jars: SessionCookieJarPort = {
		getUserAgent: () => 'Desktop/1.0',
		async withJar(_scope, fn) {
			events.push('jar-written')
			try {
				return await fn('/tmp/explore-jars/j.txt')
			} finally {
				events.push('jar-deleted')
			}
		}
	}
	const withJar = vi.spyOn(jars, 'withJar')
	const binaryManager = {ensureYtDlp: vi.fn().mockResolvedValue('/fake/yt-dlp'), ensureFFmpeg: vi.fn().mockResolvedValue('/fake/ffmpeg'), ensureFFprobe: vi.fn().mockResolvedValue(null), getLastDiagnostic: vi.fn().mockReturnValue(undefined), forgetProbeVerdict: vi.fn()}
	const tokenService = {getToken: vi.fn().mockResolvedValue({token: 'tok', visitorData: 'vd'}), invalidateCache: vi.fn()}
	// Read on every call, so a test can change the settings or the sign-in while a run waits.
	const settingsStore = {get: vi.fn(() => Promise.resolve({common: opts.common?.() ?? {cookiesMode: 'explore'}, playlist: {}}) as never)}
	const sessionAuth = createExploreGate({settings: settingsStore, session: {hasAuthCookies: () => Promise.resolve(opts.signedIn?.() ?? true)}})
	return {ytDlp: new YtDlp(binaryManager as never, tokenService as never, settingsStore, {sessionJars: jars, spawnGate: gate, sessionAuth}), withJar}
}

// Holds the gate's only slot, as a long signed-in download would.
function holdSlot(gate: ExploreSpawnGate): () => void {
	let release!: () => void
	void gate.run('download-job', () => new Promise<void>(resolve => (release = resolve)))
	return () => release()
}

describe('a signed-in probe waiting for a spawn slot (R21)', () => {
	it('gives up as a probe timeout once its budget runs out, without a jar or a spawn', async () => {
		const gate = new ExploreSpawnGate({maxConcurrent: 1, minSpacingMs: 0})
		const release = holdSlot(gate)
		const {ytDlp, withJar} = makeYtDlp(gate)

		const result = await ytDlp.run(PROBE, {timeoutMs: 50}, {identity: 'exploreSession'})

		expect(result).toMatchObject({kind: 'exit-error', errorKind: 'unknown', rawError: PROBE_TIMEOUT_MESSAGE})
		expect(withJar).not.toHaveBeenCalled()
		expect(spawnYtDlp).not.toHaveBeenCalled()
		// The slot it gave up on is not lost.
		release()
		await expect(gate.run('next', () => Promise.resolve('ran'))).resolves.toBe('ran')
	})

	it('does not bound a signed-in download the same way: it keeps its place until a slot frees up', async () => {
		const gate = new ExploreSpawnGate({maxConcurrent: 1, minSpacingMs: 0})
		const release = holdSlot(gate)
		const {ytDlp} = makeYtDlp(gate)
		const controller = new AbortController()

		const run = ytDlp.run(MEDIA, {abortSignal: controller.signal, timeoutMs: 50}, {identity: 'exploreSession', jobKey: 'job-1'})
		await new Promise(resolve => setTimeout(resolve, 100))
		expect(spawnYtDlp).not.toHaveBeenCalled()

		release()
		await vi.waitFor(() => expect(spawnYtDlp).toHaveBeenCalledOnce())
		controller.abort()
		await expect(run).resolves.toMatchObject({rawError: 'Cancelled'})
	})
})

// A2-1: authorization is decided again once the slot is free, right before the jar.
describe('a signed-in run that waited for a slot while the user opted out', () => {
	const UNAVAILABLE = {kind: 'exit-error', exitCode: -1, errorKind: 'loginRequired', rawError: 'Explore session unavailable', stdout: '', stderr: ''}
	const optOuts: Array<[string, {common?: Record<string, unknown>; signedIn?: boolean}]> = [
		['cookies switched off', {common: {cookiesMode: 'off'}}],
		['Explore switched off', {common: {cookiesMode: 'explore', exploreEnabled: false}}],
		['signed out of Explore', {signedIn: false}]
	]

	it.each(optOuts)('is refused without a jar or a spawn: %s', async (_label, after) => {
		const gate = new ExploreSpawnGate({maxConcurrent: 2, minSpacingMs: 0})
		const releaseFirst = holdSlot(gate)
		const releaseSecond = holdSlot(gate)
		let optedOut = false
		const {ytDlp, withJar} = makeYtDlp(gate, {common: () => (optedOut && after.common ? after.common : {cookiesMode: 'explore'}), signedIn: () => !(optedOut && after.signedIn === false)})
		const entered = vi.spyOn(gate, 'run')

		const run = ytDlp.run(MEDIA, undefined, {identity: 'exploreSession', jobKey: 'job-3'})
		await vi.waitFor(() => expect(entered).toHaveBeenCalledWith('job-3', expect.any(Function), expect.anything()))
		optedOut = true
		releaseFirst()

		await expect(run).resolves.toEqual(UNAVAILABLE)
		expect(withJar).not.toHaveBeenCalled()
		expect(spawnYtDlp).not.toHaveBeenCalled()
		releaseSecond()
	})

	it('still runs signed in when nothing changed during the wait', async () => {
		const gate = new ExploreSpawnGate({maxConcurrent: 2, minSpacingMs: 0})
		const releaseFirst = holdSlot(gate)
		holdSlot(gate)
		const {ytDlp, withJar} = makeYtDlp(gate)
		const controller = new AbortController()
		const entered = vi.spyOn(gate, 'run')

		const run = ytDlp.run(MEDIA, {abortSignal: controller.signal}, {identity: 'exploreSession', jobKey: 'job-3'})
		await vi.waitFor(() => expect(entered).toHaveBeenCalled())
		releaseFirst()

		await vi.waitFor(() => expect(spawnYtDlp).toHaveBeenCalledOnce())
		expect(withJar).toHaveBeenCalledOnce()
		controller.abort()
		await run
	})
})

describe.skipIf(process.platform === 'win32')('a stopped signed-in run', () => {
	it('kills the whole process tree on timeout and keeps the jar until the tree is gone', async () => {
		const {ytDlp} = makeYtDlp(new ExploreSpawnGate({minSpacingMs: 0}))

		const result = await ytDlp.run(PROBE, {timeoutMs: 30}, {identity: 'exploreSession'})

		expect(result).toMatchObject({kind: 'exit-error', rawError: PROBE_TIMEOUT_MESSAGE})
		expect(events).toEqual(['jar-written', 'group-kill:SIGKILL', 'close', 'jar-deleted'])
	})

	it('kills the whole process tree on cancel and keeps the jar until the tree is gone', async () => {
		const {ytDlp} = makeYtDlp(new ExploreSpawnGate({minSpacingMs: 0}))
		const controller = new AbortController()

		const run = ytDlp.run(MEDIA, {abortSignal: controller.signal}, {identity: 'exploreSession', jobKey: 'job-1'})
		await vi.waitFor(() => expect(spawnYtDlp).toHaveBeenCalledOnce())
		controller.abort()

		await expect(run).resolves.toMatchObject({rawError: 'Cancelled'})
		expect(events).toEqual(['jar-written', 'group-kill:SIGKILL', 'close', 'jar-deleted'])
	})

	it('leaves an anonymous run as before: the leader is killed directly and the run settles at once', async () => {
		const {ytDlp} = makeYtDlp(new ExploreSpawnGate({minSpacingMs: 0}))

		const result = await ytDlp.run(PROBE, {timeoutMs: 30})

		expect(result).toMatchObject({kind: 'exit-error', rawError: PROBE_TIMEOUT_MESSAGE})
		expect(processKill).not.toHaveBeenCalled()
		expect(procs.values().next().value?.kill).toHaveBeenCalledWith('SIGKILL')
	})
})
