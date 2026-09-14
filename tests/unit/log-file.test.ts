import {describe, expect, it, vi} from 'vitest'
import type {LogFile} from 'electron-log'
import {configureLogFile, LOG_FILE_MAX_BYTES} from '@main/utils/logFile.js'

function makeTransport() {
	const archived: string[] = []
	return {
		archived,
		transport: {
			maxSize: 1024 ** 2,
			resolvePathFn: () => 'default.log',
			archiveLogFn: (file: LogFile) => {
				archived.push(file.path)
			}
		}
	}
}

const oldFile = {path: '/logs/main.log'} as LogFile

describe('configureLogFile', () => {
	it('writes to the given path with a 5 MB cap', () => {
		const {transport} = makeTransport()

		configureLogFile(transport, {logPath: '/logs/main.log', onRotated: vi.fn()})

		expect(transport.resolvePathFn()).toBe('/logs/main.log')
		expect(transport.maxSize).toBe(LOG_FILE_MAX_BYTES)
		expect(LOG_FILE_MAX_BYTES).toBe(5 * 1024 * 1024)
	})

	// electron-log archives, resets the file, and only then writes the message
	// that triggered rotation. Logging from inside archiveLogFn would re-enter the
	// transport before that reset, so the context line has to wait its turn.
	it('keeps the default archive and reports the rotation only after it', () => {
		const {transport, archived} = makeTransport()
		const onRotated = vi.fn()
		const deferred: Array<() => void> = []

		configureLogFile(transport, {logPath: '/logs/main.log', onRotated, defer: fn => deferred.push(fn)})
		transport.archiveLogFn(oldFile)

		expect(archived).toEqual(['/logs/main.log'])
		expect(onRotated).not.toHaveBeenCalled()

		for (const fn of deferred) fn()
		expect(onRotated).toHaveBeenCalledOnce()
	})
})
