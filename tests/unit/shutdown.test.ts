// @vitest-environment node

import {describe, expect, it, vi} from 'vitest'
import {cancelQueueBeforeExit, waitForQueueFileMovesBeforeExit} from '@main/shutdown.js'
import {fail, ok, type Result} from '@shared/result.js'

interface CancelOutput {
	cancelled: boolean
}

function makeDeps(queueCancelResult: Result<CancelOutput> = ok({cancelled: true})) {
	return {queueService: {cancel: vi.fn().mockResolvedValue(queueCancelResult), pauseAll: vi.fn().mockResolvedValue(undefined), whenFileMovesIdle: vi.fn().mockResolvedValue(undefined)}, tokenService: {dispose: vi.fn()}, logInfo: vi.fn(), exit: vi.fn()}
}

describe('cancelQueueBeforeExit', () => {
	it('cancels through QueueService before disposing tokens and exiting', async () => {
		const deps = makeDeps()

		await cancelQueueBeforeExit(deps)

		expect(deps.queueService.cancel).toHaveBeenCalledWith(null)
		expect(deps.tokenService.dispose).toHaveBeenCalledOnce()
		expect(deps.logInfo).toHaveBeenCalledWith('App shutting down')
		expect(deps.exit).toHaveBeenCalledWith(0)
		expect(deps.queueService.cancel.mock.invocationCallOrder[0]).toBeLessThan(deps.tokenService.dispose.mock.invocationCallOrder[0])
		expect(deps.tokenService.dispose.mock.invocationCallOrder[0]).toBeLessThan(deps.exit.mock.invocationCallOrder[0])
	})

	it('still disposes tokens and exits if queue cancellation reports failure', async () => {
		const deps = makeDeps(fail({code: 'download', message: 'cancel failed'}))

		await cancelQueueBeforeExit(deps)

		expect(deps.queueService.cancel).toHaveBeenCalledWith(null)
		expect(deps.logInfo).toHaveBeenCalledWith('Queue cancellation before shutdown failed', {error: 'cancel failed'})
		expect(deps.tokenService.dispose).toHaveBeenCalledOnce()
		expect(deps.exit).toHaveBeenCalledWith(0)
	})

	it('waits for file moves after queue cancellation before disposing tokens and exiting', async () => {
		const deps = makeDeps()
		let releaseIdle: (() => void) | undefined
		deps.queueService.whenFileMovesIdle.mockReturnValue(
			new Promise<void>(resolve => {
				releaseIdle = resolve
			})
		)

		const pending = cancelQueueBeforeExit(deps)
		await Promise.resolve()

		expect(deps.queueService.cancel).toHaveBeenCalledWith(null)
		expect(deps.queueService.whenFileMovesIdle).toHaveBeenCalledOnce()
		expect(deps.tokenService.dispose).not.toHaveBeenCalled()
		expect(deps.exit).not.toHaveBeenCalled()
		releaseIdle?.()
		await pending

		expect(deps.tokenService.dispose).toHaveBeenCalledOnce()
		expect(deps.exit).toHaveBeenCalledWith(0)
	})
})

describe('waitForQueueFileMovesBeforeExit', () => {
	it('waits for file moves without cancelling the queue before disposing tokens and exiting', async () => {
		const deps = makeDeps()
		let releaseIdle: (() => void) | undefined
		deps.queueService.whenFileMovesIdle.mockReturnValue(
			new Promise<void>(resolve => {
				releaseIdle = resolve
			})
		)

		const pending = waitForQueueFileMovesBeforeExit(deps)

		expect(deps.queueService.whenFileMovesIdle).toHaveBeenCalledOnce()
		expect(deps.queueService.cancel).not.toHaveBeenCalled()
		expect(deps.tokenService.dispose).not.toHaveBeenCalled()
		releaseIdle?.()
		await pending

		expect(deps.tokenService.dispose).toHaveBeenCalledOnce()
		expect(deps.logInfo).toHaveBeenCalledWith('App shutting down')
		expect(deps.exit).toHaveBeenCalledWith(0)
	})
})
