import {EventEmitter} from 'node:events'
import {spawn} from 'node:child_process'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import {killProcessTree, type KillableProcess} from '../src/runner.js'

vi.mock('node:child_process', () => ({spawn: vi.fn()}))

function child(state: {exitCode?: number | null; signalCode?: NodeJS.Signals | null; pid?: number}): KillableProcess {
	return {pid: 'pid' in state ? state.pid : 4242, exitCode: state.exitCode ?? null, signalCode: state.signalCode ?? null, kill: vi.fn()}
}

const processKill = vi.spyOn(process, 'kill').mockImplementation(() => true)

const originalPlatform = process.platform
afterEach(() => {
	processKill.mockReset()
	processKill.mockImplementation(() => true)
	vi.mocked(spawn).mockReset()
	Object.defineProperty(process, 'platform', {value: originalPlatform})
})

describe('killProcessTree on Unix', () => {
	it('signals the whole process group of a live child', () => {
		Object.defineProperty(process, 'platform', {value: 'linux'})
		killProcessTree(child({}), 'SIGTERM')
		expect(processKill).toHaveBeenCalledWith(-4242, 'SIGTERM')
	})

	it('falls back to the child alone when the group signal throws', () => {
		Object.defineProperty(process, 'platform', {value: 'linux'})
		processKill.mockImplementation(() => {
			throw Object.assign(new Error('kill ESRCH'), {code: 'ESRCH'})
		})
		const proc = child({})
		killProcessTree(proc, 'SIGKILL')
		expect(proc.kill).toHaveBeenCalledWith('SIGKILL')
	})

	it('signals the child directly when it has no pid yet', () => {
		const proc = child({pid: undefined})
		killProcessTree(proc, 'SIGTERM')
		expect(processKill).not.toHaveBeenCalled()
		expect(proc.kill).toHaveBeenCalledWith('SIGTERM')
	})
})

describe('killProcessTree reaped-pid guard', () => {
	it('never signals a child that already exited or was killed: its pid may have been reused', () => {
		const exited = child({exitCode: 0})
		const signalled = child({signalCode: 'SIGKILL'})
		killProcessTree(exited, 'SIGKILL')
		killProcessTree(signalled, 'SIGKILL')
		expect(processKill).not.toHaveBeenCalled()
		expect(spawn).not.toHaveBeenCalled()
		expect(exited.kill).not.toHaveBeenCalled()
		expect(signalled.kill).not.toHaveBeenCalled()
	})
})

describe('killProcessTree on Windows', () => {
	it('tree-kills with taskkill and logs a failed taskkill spawn instead of throwing', () => {
		Object.defineProperty(process, 'platform', {value: 'win32'})
		const taskkill = new EventEmitter()
		vi.mocked(spawn).mockReturnValue(taskkill as never)
		const warn = vi.fn()

		killProcessTree(child({}), 'SIGTERM', {warn})

		expect(spawn).toHaveBeenCalledWith('taskkill', ['/pid', '4242', '/T', '/F'], {windowsHide: true})
		// An unhandled 'error' event would throw here.
		expect(() => taskkill.emit('error', Object.assign(new Error('spawn taskkill ENOENT'), {code: 'ENOENT'}))).not.toThrow()
		expect(warn).toHaveBeenCalledWith('taskkill failed to start', {pid: 4242, message: 'spawn taskkill ENOENT'})
	})

	it('absorbs a failed taskkill spawn without a logger', () => {
		Object.defineProperty(process, 'platform', {value: 'win32'})
		const taskkill = new EventEmitter()
		vi.mocked(spawn).mockReturnValue(taskkill as never)
		killProcessTree(child({}), 'SIGTERM')
		expect(() => taskkill.emit('error', new Error('spawn taskkill ENOENT'))).not.toThrow()
	})
})
