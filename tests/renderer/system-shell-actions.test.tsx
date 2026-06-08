import {beforeEach, describe, expect, it, vi} from 'vitest'
import {fail} from '@shared/result.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

describe('system shell actions', () => {
	beforeEach(() => {
		window.appApi = buildMockAppApi()
		vi.spyOn(console, 'error').mockImplementation(() => undefined)
	})

	it('logs failed openLogs IPC results', async () => {
		const error = {code: 'ipc' as const, message: 'Explorer failed'}
		vi.mocked(window.appApi.logs.openDir).mockResolvedValue(fail(error))

		await useAppStore.getState().openLogs()

		expect(console.error).toHaveBeenCalledWith('[shell] logs.openDir failed', error)
	})

	it('logs failed openBinariesDir IPC results', async () => {
		const error = {code: 'ipc' as const, message: 'Explorer failed'}
		vi.mocked(window.appApi.shell.openBinariesDir).mockResolvedValue(fail(error))

		await useAppStore.getState().openBinariesDir()

		expect(console.error).toHaveBeenCalledWith('[shell] shell.openBinariesDir failed', error)
	})
})
