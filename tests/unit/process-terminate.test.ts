// @vitest-environment node
// Stopping a child tree. On Unix it gets SIGTERM first: yt-dlp's PyInstaller
// bootloader removes its `_MEI*` unpack folder (tens of MB in TMPDIR) only when
// it can handle the signal, and SIGKILL leaves the folder behind on every
// cancel. SIGKILL follows only if the tree outlives a short grace. Windows keeps
// `taskkill /T /F`, which is already a forced kill.
import {EventEmitter} from 'node:events'
import {spawn, type ChildProcessWithoutNullStreams} from 'node:child_process'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'

vi.mock('node:child_process', async importOriginal => {
	const actual = await importOriginal<typeof import('node:child_process')>()
	return {...actual, spawn: vi.fn()}
})

import {TERMINATE_GRACE_MS, terminateProcessTree} from '@main/utils/process.js'

function child(): ChildProcessWithoutNullStreams & {exitCode: number | null; signalCode: NodeJS.Signals | null} {
	return Object.assign(new EventEmitter(), {pid: 4242, exitCode: null, signalCode: null, kill: vi.fn()}) as never
}

const processKill = vi.spyOn(process, 'kill').mockImplementation(() => true)
const originalPlatform = process.platform

beforeEach(() => {
	vi.useFakeTimers()
	processKill.mockClear()
	vi.mocked(spawn).mockReset()
})

afterEach(() => {
	vi.useRealTimers()
	Object.defineProperty(process, 'platform', {value: originalPlatform})
})

describe.skipIf(process.platform === 'win32')('terminateProcessTree on Unix', () => {
	it('sends SIGTERM to the group, and SIGKILL only once the grace runs out', () => {
		terminateProcessTree(child())

		expect(processKill.mock.calls).toEqual([[-4242, 'SIGTERM']])
		vi.advanceTimersByTime(TERMINATE_GRACE_MS - 1)
		expect(processKill.mock.calls).toEqual([[-4242, 'SIGTERM']])
		vi.advanceTimersByTime(1)
		expect(processKill.mock.calls).toEqual([
			[-4242, 'SIGTERM'],
			[-4242, 'SIGKILL']
		])
	})

	it('never sends SIGKILL to a tree that closed on SIGTERM: its pid may have been reused', () => {
		const proc = child()
		terminateProcessTree(proc)
		proc.signalCode = 'SIGTERM'
		proc.emit('exit', null, 'SIGTERM')
		proc.emit('close', null, 'SIGTERM')

		vi.advanceTimersByTime(TERMINATE_GRACE_MS)

		expect(processKill.mock.calls).toEqual([[-4242, 'SIGTERM']])
		expect(vi.getTimerCount()).toBe(0)
	})

	// The leader (PyInstaller's bootloader) exited, but a descendant that shrugged
	// off SIGTERM still holds the pipes, so 'close' never came. Its group still
	// exists, so its id cannot have been handed to another process.
	it('sends SIGKILL to the group when the leader exited but the tree never closed', () => {
		const proc = child()
		terminateProcessTree(proc)
		proc.signalCode = 'SIGTERM'
		proc.emit('exit', null, 'SIGTERM')

		vi.advanceTimersByTime(TERMINATE_GRACE_MS)

		expect(processKill.mock.calls).toEqual([
			[-4242, 'SIGTERM'],
			[-4242, 'SIGKILL']
		])
	})

	it('survives a group that is already gone when the grace runs out', () => {
		const proc = child()
		terminateProcessTree(proc)
		proc.signalCode = 'SIGTERM'
		proc.emit('exit', null, 'SIGTERM')
		processKill.mockImplementationOnce(() => {
			throw Object.assign(new Error('kill ESRCH'), {code: 'ESRCH'})
		})

		expect(() => vi.advanceTimersByTime(TERMINATE_GRACE_MS)).not.toThrow()
	})
})

describe('terminateProcessTree on Windows', () => {
	it('runs one forced taskkill for the tree, with nothing to escalate', () => {
		Object.defineProperty(process, 'platform', {value: 'win32'})
		vi.mocked(spawn).mockReturnValue(new EventEmitter() as never)

		terminateProcessTree(child())
		vi.advanceTimersByTime(TERMINATE_GRACE_MS)

		expect(spawn).toHaveBeenCalledOnce()
		expect(spawn).toHaveBeenCalledWith('taskkill', ['/pid', '4242', '/T', '/F'], {windowsHide: true})
		expect(processKill).not.toHaveBeenCalled()
	})
})
