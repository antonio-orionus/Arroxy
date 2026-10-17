// @vitest-environment node

import {describe, expect, it, vi} from 'vite-plus/test'
import {ExploreEventBridge} from '@main/services/explore/ExploreEventBridge.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import type {ExploreLinkAction} from '@shared/schemas.js'

vi.mock('electron-log/main.js', () => ({default: {scope: () => ({warn: vi.fn(), info: vi.fn()})}}))

function makeWindow(destroyed = false) {
	return {webContents: {send: vi.fn()}, isDestroyed: vi.fn().mockReturnValue(destroyed)} as unknown as Electron.BrowserWindow & {webContents: {send: ReturnType<typeof vi.fn>}}
}

describe('ExploreEventBridge link actions', () => {
	it('sends a link menu pick to the renderer', () => {
		const win = makeWindow()
		const action: ExploreLinkAction = {kind: 'download', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', profile: {kind: 'builtin', id: 'audio-only'}}

		new ExploreEventBridge(win).linkAction(action)

		expect(win.webContents.send).toHaveBeenCalledWith(IPC_CHANNELS.exploreLinkAction, action)
	})

	it('drops a pick that does not match the schema instead of throwing', () => {
		const win = makeWindow()
		const bad = {kind: 'download', url: 42} as unknown as ExploreLinkAction

		expect(() => new ExploreEventBridge(win).linkAction(bad)).not.toThrow()
		expect(win.webContents.send).not.toHaveBeenCalled()
	})

	it('sends nothing once the window is gone', () => {
		const win = makeWindow(true)

		new ExploreEventBridge(win).linkAction({kind: 'interactive', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'})

		expect(win.webContents.send).not.toHaveBeenCalled()
	})
})
