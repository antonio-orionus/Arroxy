import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'

const logger = vi.hoisted(() => ({debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn()}))
vi.mock('electron-log/main.js', () => ({default: {...logger, scope: () => logger}}))

import {SettingsStore} from '@main/stores/SettingsStore.js'
import {defaultAppSettings} from '@shared/constants.js'

// A feedback log has to tell which cookie mode a failed download ran under,
// so every change is logged from the mode it left to the one it took.
describe('SettingsStore cookie settings log', () => {
	const defaults = defaultAppSettings('/tmp')

	async function store(): Promise<SettingsStore> {
		return new SettingsStore(await fs.mkdtemp(path.join(os.tmpdir(), 'settings-cookie-log-')), defaults)
	}

	const lines = (message: string): unknown[] => logger.info.mock.calls.filter(call => call[0] === message).map(call => call[1])

	beforeEach(() => logger.info.mockClear())

	it('logs a cookie mode change from the previous mode to the new one', async () => {
		const settings = await store()
		await settings.update({common: {cookiesMode: 'explore'}})
		await settings.update({common: {cookiesMode: 'browser', cookiesBrowser: 'firefox'}})
		expect(lines('Cookie mode changed')).toEqual([
			{from: 'off', to: 'explore'},
			{from: 'explore', to: 'browser'}
		])
	})

	it('logs the Explore tab being turned off and on', async () => {
		const settings = await store()
		await settings.update({common: {exploreEnabled: false}})
		await settings.update({common: {exploreEnabled: true}})
		expect(lines('Explore tab toggled')).toEqual([
			{from: true, to: false},
			{from: false, to: true}
		])
	})

	it('logs nothing when an update leaves the cookie settings as they were', async () => {
		const settings = await store()
		await settings.update({common: {cookiesMode: 'off', defaultOutputDir: '/home/test/downloads'}})
		expect(lines('Cookie mode changed')).toEqual([])
		expect(lines('Explore tab toggled')).toEqual([])
	})

	it('logs nothing for an update that failed validation', async () => {
		const settings = await store()
		await settings.update({common: {cookiesMode: 'nonsense' as never}})
		expect(lines('Cookie mode changed')).toEqual([])
	})
})
