// @vitest-environment jsdom
import {afterEach, beforeEach, describe, expect, it, vi, type MockInstance} from 'vite-plus/test'
import {render, act} from '@testing-library/react'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {StepUrlInput} from '@renderer/components/wizard/StepUrlInput.js'
import {notify} from '@renderer/lib/notify.js'
import {bindOpenedLinks} from '@renderer/store/wizard/copiedLinkIntake.js'
import {selectProfilesTab} from '@renderer/components/wizard/homeTabRoute.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppApi} from '@shared/api.js'
import {importWithReleaseFlagsOff} from '../helpers/releaseFlags.js'

let mockApi: AppApi
let openedLinkListener: ((url: string) => void) | null
let unbind: () => void = () => undefined

const OPENED_URL = 'https://www.youtube.com/watch?v=openedLink'
const OLD_URL = 'https://www.youtube.com/watch?v=alreadyHere'

function open(url: string): void {
	act(() => {
		openedLinkListener!(url)
	})
}

beforeEach(() => {
	window.history.replaceState(null, '', '/')
	openedLinkListener = null
	mockApi = buildMockAppApi()
	mockApi.events.onOpenedLink = (cb): (() => void) => {
		openedLinkListener = cb
		return () => {
			openedLinkListener = null
		}
	}
	window.appApi = mockApi
	window.platform = 'linux'
	const settings = defaultAppSettings('/tmp')
	useAppStore.setState({initialized: true, initializing: false, splashDismissed: true, settings, wizardStep: 'url', wizardMode: 'single', formatsLoading: false, wizardUrl: '', quickDownloadStatus: 'idle', queue: [], copiedLink: null})
})

afterEach(() => {
	unbind()
	unbind = () => undefined
	vi.unstubAllEnvs()
	vi.resetModules()
})

describe('a link opened in Arroxy', () => {
	let toastSpy: MockInstance<typeof notify.clipboard>

	beforeEach(() => {
		toastSpy = vi.spyOn(notify, 'clipboard').mockImplementation(() => undefined)
	})

	afterEach(() => {
		toastSpy.mockRestore()
	})

	it('asks main for links only once it listens for them', () => {
		const order: string[] = []
		mockApi.events.onOpenedLink = (cb): (() => void) => {
			order.push('listen')
			openedLinkListener = cb
			return () => undefined
		}
		vi.mocked(mockApi.links.rendererReady).mockImplementation(() => {
			order.push('ready')
			return Promise.resolve({ok: true, data: undefined})
		})
		unbind = bindOpenedLinks(useAppStore.setState)
		expect(order).toEqual(['listen', 'ready'])
	})

	it('fills the URL field and says where the link came from', () => {
		unbind = bindOpenedLinks(useAppStore.setState)
		render(<StepUrlInput />)

		open(OPENED_URL)

		expect(useAppStore.getState().wizardUrl).toBe(OPENED_URL)
		expect(toastSpy).toHaveBeenCalledExactlyOnceWith('Link opened in Arroxy')
		expect(mockApi.queue.cmd.add).not.toHaveBeenCalled()
		expect(mockApi.downloads.probe).not.toHaveBeenCalled()
	})

	it('replaces the field with Undo, like a copied link', () => {
		useAppStore.setState({wizardUrl: OLD_URL})
		unbind = bindOpenedLinks(useAppStore.setState)
		render(<StepUrlInput />)

		open(OPENED_URL)

		expect(useAppStore.getState().wizardUrl).toBe(OPENED_URL)
		const [message, actions] = toastSpy.mock.calls[0] ?? []
		expect(message).toBe('Replaced with the link opened in Arroxy')
		act(() => actions?.[0].onClick())
		expect(useAppStore.getState().wizardUrl).toBe(OLD_URL)
	})

	it('waits for the Download tab', () => {
		unbind = bindOpenedLinks(useAppStore.setState)
		render(<StepUrlInput />)
		act(() => selectProfilesTab('queue'))

		open(OPENED_URL)
		expect(useAppStore.getState().wizardUrl).toBe('')

		act(() => selectProfilesTab('download'))
		expect(useAppStore.getState().wizardUrl).toBe(OPENED_URL)
	})

	it('keeps punctuation inside the link', () => {
		unbind = bindOpenedLinks(useAppStore.setState)
		render(<StepUrlInput />)

		open('https://example.com/video,part2.mp4')

		expect(useAppStore.getState().wizardUrl).toBe('https://example.com/video,part2.mp4')
	})

	it('re-checks what crossed IPC and drops anything but one web link', () => {
		unbind = bindOpenedLinks(useAppStore.setState)
		render(<StepUrlInput />)

		open('file:///etc/passwd')
		open(`${OPENED_URL} ${OLD_URL}`)

		expect(useAppStore.getState().wizardUrl).toBe('')
		expect(toastSpy).not.toHaveBeenCalled()
	})

	it('is not listened for in a release build', async () => {
		const {bindOpenedLinks: bind} = await importWithReleaseFlagsOff(() => import('@renderer/store/wizard/copiedLinkIntake.js'))
		unbind = bind(useAppStore.setState)
		expect(openedLinkListener).toBeNull()
		expect(mockApi.links.rendererReady).not.toHaveBeenCalled()
	})
})
