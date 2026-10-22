// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'
import {createQuitGate, decideQuit, type QuitGateDeps} from '@main/quitGate.js'

// Defaults: nothing running, the user confirms, the queue saves at once.
function makeDeps(impl: Partial<Pick<QuitGateDeps, 'runningCount' | 'askToQuit' | 'suspendQueue' | 'stopBudgetMs'>> = {}) {
	return {
		runningCount: vi.fn<QuitGateDeps['runningCount']>(impl.runningCount ?? (() => 0)),
		askToQuit: vi.fn<QuitGateDeps['askToQuit']>(impl.askToQuit ?? (() => Promise.resolve(true))),
		suspendQueue: vi.fn<QuitGateDeps['suspendQueue']>(impl.suspendQueue ?? (() => Promise.resolve())),
		dispose: vi.fn<QuitGateDeps['dispose']>(),
		quit: vi.fn<QuitGateDeps['quit']>(),
		log: {info: vi.fn(), warn: vi.fn()},
		...(impl.stopBudgetMs === undefined ? {} : {stopBudgetMs: impl.stopBudgetMs})
	}
}

function quitEvent() {
	return {preventDefault: vi.fn()}
}

// The gate's work after a held quit runs on promise continuations.
async function settle() {
	for (let i = 0; i < 10; i++) await Promise.resolve()
}

describe('decideQuit', () => {
	it('asks only when the user quits with downloads running', () => {
		expect(decideQuit({trigger: 'user', runningCount: 2})).toBe('ask')
		expect(decideQuit({trigger: 'user', runningCount: 0})).toBe('stop')
		expect(decideQuit({trigger: 'system', runningCount: 2})).toBe('stop')
		expect(decideQuit({trigger: 'system', runningCount: 0})).toBe('stop')
	})
})

describe('createQuitGate', () => {
	it('holds an idle quit until the queue is saved, then quits for real', async () => {
		const deps = makeDeps()
		const gate = createQuitGate(deps)
		const first = quitEvent()

		gate.onBeforeQuit(first)
		expect(first.preventDefault).toHaveBeenCalledOnce()
		await settle()

		expect(deps.askToQuit).not.toHaveBeenCalled()
		expect(deps.suspendQueue).toHaveBeenCalledOnce()
		expect(deps.dispose).toHaveBeenCalledOnce()
		expect(deps.quit).toHaveBeenCalledOnce()
		expect(deps.suspendQueue.mock.invocationCallOrder[0]).toBeLessThan(deps.dispose.mock.invocationCallOrder[0])
		expect(deps.dispose.mock.invocationCallOrder[0]).toBeLessThan(deps.quit.mock.invocationCallOrder[0])
		expect(gate.approved).toBe(true)

		const second = quitEvent()
		gate.onBeforeQuit(second)
		expect(second.preventDefault).not.toHaveBeenCalled()
		expect(deps.suspendQueue).toHaveBeenCalledOnce()
	})

	it('asks before quitting with downloads running, and keeps everything when told to keep downloading', async () => {
		const deps = makeDeps({runningCount: () => 2, askToQuit: () => Promise.resolve(false)})
		const gate = createQuitGate(deps)
		const event = quitEvent()

		gate.onBeforeQuit(event)
		await settle()

		expect(event.preventDefault).toHaveBeenCalledOnce()
		expect(deps.askToQuit).toHaveBeenCalledWith(2)
		expect(deps.suspendQueue).not.toHaveBeenCalled()
		expect(deps.dispose).not.toHaveBeenCalled()
		expect(deps.quit).not.toHaveBeenCalled()
		expect(gate.approved).toBe(false)

		// Asked again on the next attempt, not remembered.
		gate.onBeforeQuit(quitEvent())
		await settle()
		expect(deps.askToQuit).toHaveBeenCalledTimes(2)
	})

	it('saves the queue and quits when the user confirms', async () => {
		const deps = makeDeps({runningCount: () => 1})
		const gate = createQuitGate(deps)

		gate.onBeforeQuit(quitEvent())
		await settle()

		expect(deps.askToQuit).toHaveBeenCalledWith(1)
		expect(deps.suspendQueue).toHaveBeenCalledOnce()
		expect(deps.quit).toHaveBeenCalledOnce()
		expect(gate.approved).toBe(true)
	})

	it('holds a second quit while the dialog is open instead of stacking another one', async () => {
		let answer: (quit: boolean) => void = () => undefined
		const deps = makeDeps({runningCount: () => 1, askToQuit: () => new Promise<boolean>(resolve => (answer = resolve))})
		const gate = createQuitGate(deps)

		gate.onBeforeQuit(quitEvent())
		await settle()
		const second = quitEvent()
		gate.onBeforeQuit(second)
		await settle()

		expect(second.preventDefault).toHaveBeenCalledOnce()
		expect(deps.askToQuit).toHaveBeenCalledOnce()
		answer(true)
		await settle()
		expect(deps.quit).toHaveBeenCalledOnce()
	})

	it('treats a failed dialog as keep downloading, and asks again next time', async () => {
		const deps = makeDeps({runningCount: () => 1, askToQuit: () => Promise.reject(new Error('no window'))})
		const gate = createQuitGate(deps)

		gate.onBeforeQuit(quitEvent())
		await settle()
		expect(deps.quit).not.toHaveBeenCalled()

		gate.onBeforeQuit(quitEvent())
		await settle()
		expect(deps.askToQuit).toHaveBeenCalledTimes(2)
	})

	it('never asks when the system is ending the session', async () => {
		const deps = makeDeps({runningCount: () => 3})
		const gate = createQuitGate(deps)

		gate.sessionEnding()
		await settle()

		expect(deps.askToQuit).not.toHaveBeenCalled()
		expect(deps.suspendQueue).toHaveBeenCalledOnce()
		expect(deps.quit).toHaveBeenCalledOnce()
		const event = quitEvent()
		gate.onBeforeQuit(event)
		expect(event.preventDefault).not.toHaveBeenCalled()
	})

	it('stops without waiting for an open dialog when the session ends', async () => {
		let answer: (quit: boolean) => void = () => undefined
		const deps = makeDeps({runningCount: () => 1, askToQuit: () => new Promise<boolean>(resolve => (answer = resolve))})
		const gate = createQuitGate(deps)

		gate.onBeforeQuit(quitEvent())
		await settle()
		gate.sessionEnding()
		await settle()

		expect(deps.suspendQueue).toHaveBeenCalledOnce()
		expect(deps.quit).toHaveBeenCalledOnce()
		// A late "keep downloading" no longer matters.
		answer(false)
		await settle()
		expect(deps.quit).toHaveBeenCalledOnce()
		expect(gate.approved).toBe(true)
	})

	it('still quits when saving the queue fails', async () => {
		const deps = makeDeps({suspendQueue: () => Promise.reject(new Error('disk full'))})
		const gate = createQuitGate(deps)

		gate.onBeforeQuit(quitEvent())
		await settle()

		expect(deps.log.warn).toHaveBeenCalledWith('Saving the queue before quitting failed', {error: 'disk full'})
		expect(deps.dispose).toHaveBeenCalledOnce()
		expect(deps.quit).toHaveBeenCalledOnce()
	})

	it('still quits, and lets the next quit through, when a disposer throws', async () => {
		const deps = makeDeps()
		deps.dispose.mockImplementation(() => {
			throw new Error('tray already gone')
		})
		const gate = createQuitGate(deps)

		gate.onBeforeQuit(quitEvent())
		await settle()

		expect(deps.log.warn).toHaveBeenCalledWith('Releasing app services before quitting failed', {error: 'tray already gone'})
		expect(deps.quit).toHaveBeenCalledOnce()
		expect(gate.approved).toBe(true)
		const next = quitEvent()
		gate.onBeforeQuit(next)
		expect(next.preventDefault).not.toHaveBeenCalled()
	})

	it('quits once its budget runs out when saving the queue hangs', async () => {
		vi.useFakeTimers()
		try {
			const deps = makeDeps({suspendQueue: () => new Promise<void>(() => undefined), stopBudgetMs: 1000})
			const gate = createQuitGate(deps)

			gate.onBeforeQuit(quitEvent())
			await settle()
			expect(deps.quit).not.toHaveBeenCalled()
			await vi.advanceTimersByTimeAsync(1000)

			expect(deps.log.warn).toHaveBeenCalledWith('Saving the queue before quitting took too long; quitting anyway', {budgetMs: 1000})
			expect(deps.quit).toHaveBeenCalledOnce()
		} finally {
			vi.useRealTimers()
		}
	})

	it('prepares for an exit someone else drives, such as an update install, without asking or quitting', async () => {
		const deps = makeDeps({runningCount: () => 2})
		const gate = createQuitGate(deps)

		await gate.prepareForExit()

		expect(deps.askToQuit).not.toHaveBeenCalled()
		expect(deps.suspendQueue).toHaveBeenCalledOnce()
		expect(deps.dispose).toHaveBeenCalledOnce()
		expect(deps.quit).not.toHaveBeenCalled()
		const event = quitEvent()
		gate.onBeforeQuit(event)
		expect(event.preventDefault).not.toHaveBeenCalled()
	})
})
