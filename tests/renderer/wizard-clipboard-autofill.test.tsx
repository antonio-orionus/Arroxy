// @vitest-environment jsdom
import {afterEach, beforeEach, describe, expect, it, vi, type MockInstance} from 'vite-plus/test'
import {render, act, fireEvent, screen} from '@testing-library/react'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {StepUrlInput} from '@renderer/components/wizard/StepUrlInput.js'
import {notify} from '@renderer/lib/notify.js'
import {bindCopiedLinks} from '@renderer/store/wizard/copiedLinkIntake.js'
import {selectProfilesTab} from '@renderer/components/wizard/homeTabRoute.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppApi} from '@shared/api.js'

let mockApi: AppApi
let unbindCopiedLinks: () => void
let clipboardListener: ((url: string) => void) | null

function resetStore(overrides: Partial<ReturnType<typeof useAppStore.getState>> = {}): void {
	const settings = defaultAppSettings('/tmp')
	useAppStore.setState({
		initialized: true,
		initializing: false,
		splashDismissed: true,
		settings: {...settings, common: {...settings.common, rememberLastOutputDir: false, clipboardWatchEnabled: true, cookiesMode: 'off', cookiesPath: ''}},
		wizardStep: 'url',
		wizardMode: 'single',
		formatsLoading: false,
		wizardUrl: '',
		wizardTitle: '',
		wizardThumbnail: '',
		wizardFormats: [],
		selectedVideoFormatId: '',
		audioSelection: {kind: 'none'},
		wizardMediaKind: 'video',
		wizardOutputDir: '',
		wizardError: null,
		wizardErrorOrigin: null,
		playlistItems: [],
		queue: [],
		quickDownloadStatus: 'idle',
		copiedLink: null,
		...overrides
	})
}

beforeEach(() => {
	window.history.replaceState(null, '', '/')
	clipboardListener = null
	mockApi = buildMockAppApi()
	mockApi.events.onClipboardUrl = (cb): (() => void) => {
		clipboardListener = cb
		return () => {
			clipboardListener = null
		}
	}
	window.appApi = mockApi
	window.platform = 'linux'
	resetStore()
	unbindCopiedLinks = bindCopiedLinks(useAppStore.setState)
})

afterEach(() => {
	unbindCopiedLinks()
})

const FRESH_URL = 'https://www.youtube.com/watch?v=fromClipboard'
const OLD_URL = 'https://www.youtube.com/watch?v=alreadyHere'

function copy(text: string): void {
	act(() => {
		clipboardListener!(text)
	})
}

describe('wizard clipboard auto-fill', () => {
	let toastSpy: MockInstance<typeof notify.clipboard>

	beforeEach(() => {
		toastSpy = vi.spyOn(notify, 'clipboard').mockImplementation(() => undefined)
	})

	afterEach(() => {
		toastSpy.mockRestore()
	})

	it('fills an empty URL field', () => {
		render(<StepUrlInput />)

		copy(FRESH_URL)

		expect(useAppStore.getState().wizardUrl).toBe(FRESH_URL)
		expect(toastSpy).toHaveBeenCalledExactlyOnceWith('Link added from clipboard')
	})

	it('replaces a link already in the field without asking, and Undo restores it', () => {
		useAppStore.setState({wizardUrl: OLD_URL})
		render(<StepUrlInput />)

		copy(FRESH_URL)

		expect(useAppStore.getState().wizardUrl).toBe(FRESH_URL)
		expect(screen.queryByTestId('clipboard-pending')).not.toBeInTheDocument()
		const [message, actions] = toastSpy.mock.calls[0] ?? []
		expect(message).toBe('Replaced with copied link')
		expect(actions?.[0].label).toBe('Undo')

		act(() => actions?.[0].onClick())
		expect(useAppStore.getState().wizardUrl).toBe(OLD_URL)
	})

	it('Undo leaves the field alone once the user has changed it again', () => {
		useAppStore.setState({wizardUrl: OLD_URL})
		render(<StepUrlInput />)
		copy(FRESH_URL)
		const actions = toastSpy.mock.calls[0]?.[1]

		act(() => useAppStore.getState().setWizardUrl('typed-after'))
		act(() => actions?.[0].onClick())

		expect(useAppStore.getState().wizardUrl).toBe('typed-after')
	})

	it('replaces each time a new link is copied', () => {
		render(<StepUrlInput />)

		copy(OLD_URL)
		copy(FRESH_URL)

		expect(useAppStore.getState().wizardUrl).toBe(FRESH_URL)
	})

	it('ignores a link inside other text', () => {
		useAppStore.setState({wizardUrl: OLD_URL})
		render(<StepUrlInput />)

		copy(`watch this: ${FRESH_URL}`)

		expect(useAppStore.getState().wizardUrl).toBe(OLD_URL)
		expect(toastSpy).not.toHaveBeenCalled()
	})

	it('waits while a probe is in flight, then applies the latest copied link', () => {
		useAppStore.setState({wizardUrl: OLD_URL, formatsLoading: true})
		render(<StepUrlInput />)

		copy('https://www.youtube.com/watch?v=older')
		copy(FRESH_URL)
		expect(useAppStore.getState().wizardUrl).toBe(OLD_URL)

		act(() => useAppStore.setState({formatsLoading: false}))
		expect(useAppStore.getState().wizardUrl).toBe(FRESH_URL)
	})

	it('waits while a quick download is preparing', () => {
		useAppStore.setState({quickDownloadStatus: 'preparing'})
		render(<StepUrlInput />)

		copy(FRESH_URL)
		expect(useAppStore.getState().wizardUrl).toBe('')

		act(() => useAppStore.setState({quickDownloadStatus: 'idle'}))
		expect(useAppStore.getState().wizardUrl).toBe(FRESH_URL)
	})

	it('waits while the bulk URL dialog is open without touching its textarea', () => {
		render(<StepUrlInput />)
		fireEvent.click(screen.getByTestId('profiles-bulk-urls'))

		copy(FRESH_URL)

		expect(useAppStore.getState().wizardUrl).toBe('')
		expect(screen.getByTestId('bulk-url-textarea')).toHaveValue('')

		fireEvent.keyDown(screen.getByTestId('bulk-url-textarea'), {key: 'Escape'})
		expect(screen.queryByTestId('bulk-url-dialog')).not.toBeInTheDocument()
		expect(useAppStore.getState().wizardUrl).toBe(FRESH_URL)
	})

	it('waits while another home tab is shown', () => {
		render(<StepUrlInput />)
		act(() => selectProfilesTab('queue'))

		copy(FRESH_URL)
		expect(useAppStore.getState().wizardUrl).toBe('')

		act(() => selectProfilesTab('download'))
		expect(useAppStore.getState().wizardUrl).toBe(FRESH_URL)
	})

	it('keeps a link copied while the URL step is not shown, and applies it when it is', () => {
		copy(FRESH_URL)
		expect(useAppStore.getState().wizardUrl).toBe('')

		render(<StepUrlInput />)
		expect(useAppStore.getState().wizardUrl).toBe(FRESH_URL)
	})

	it('auto-fills even while the splash screen is dismissing', () => {
		resetStore({initialized: true, splashDismissed: false})
		render(<StepUrlInput />)

		copy(FRESH_URL)

		expect(useAppStore.getState().wizardUrl).toBe(FRESH_URL)
	})

	it('hints at Bulk URLs for several links, never filling or opening anything', () => {
		useAppStore.setState({wizardUrl: OLD_URL})
		render(<StepUrlInput />)

		copy('Grab https://example.com/one, https://example.com/two')

		expect(useAppStore.getState().wizardUrl).toBe(OLD_URL)
		expect(screen.queryByTestId('bulk-url-dialog')).not.toBeInTheDocument()
		expect(toastSpy).toHaveBeenCalledExactlyOnceWith('Multiple links copied — use Bulk URLs to add them')
	})

	it('drops a waiting link when several links are copied after it', () => {
		useAppStore.setState({formatsLoading: true})
		render(<StepUrlInput />)

		copy(FRESH_URL)
		copy('Grab https://example.com/one, https://example.com/two')
		act(() => useAppStore.setState({formatsLoading: false}))

		expect(useAppStore.getState().wizardUrl).toBe('')
	})

	it('clearing the field leaves it empty', () => {
		useAppStore.setState({wizardUrl: OLD_URL})
		render(<StepUrlInput />)

		fireEvent.click(screen.getByTestId('url-clear'))

		expect(useAppStore.getState().wizardUrl).toBe('')
	})
})

describe('URL input clear icon', () => {
	it('is hidden when the field is empty', () => {
		render(<StepUrlInput />)
		expect(screen.queryByTestId('url-clear')).not.toBeInTheDocument()
	})

	it('appears when the field has a value and clears it on click', () => {
		useAppStore.setState({wizardUrl: 'https://www.youtube.com/watch?v=abc'})
		render(<StepUrlInput />)

		const clearBtn = screen.getByTestId('url-clear')
		fireEvent.click(clearBtn)

		expect(useAppStore.getState().wizardUrl).toBe('')
	})

	it('treats whitespace-only values as empty (no clear icon)', () => {
		useAppStore.setState({wizardUrl: '   '})
		render(<StepUrlInput />)
		expect(screen.queryByTestId('url-clear')).not.toBeInTheDocument()
	})
})

describe('bulk URL dialog', () => {
	it('opens from the bulk button', () => {
		render(<StepUrlInput />)

		fireEvent.click(screen.getByTestId('profiles-bulk-urls'))

		expect(screen.getByTestId('bulk-url-dialog')).toBeInTheDocument()
		expect(screen.getByTestId('bulk-url-textarea')).toBeInTheDocument()
	})

	it('updates the preview from pasted URLs', () => {
		render(<StepUrlInput />)
		fireEvent.click(screen.getByTestId('profiles-bulk-urls'))

		fireEvent.change(screen.getByTestId('bulk-url-textarea'), {target: {value: 'https://example.com/one, https://example.com/two'}})

		expect(screen.getByTestId('bulk-url-valid-count')).toHaveTextContent('2')
		expect(screen.getByText('https://example.com/one')).toBeInTheDocument()
		expect(screen.getByText('https://example.com/two')).toBeInTheDocument()
	})

	it('keeps actions disabled for zero accepted URLs and enables them for one accepted URL', () => {
		render(<StepUrlInput />)
		fireEvent.click(screen.getByTestId('profiles-bulk-urls'))

		const confirm = screen.getByTestId('bulk-url-confirm')
		const quickConfirm = screen.getByTestId('bulk-quick-download')
		expect(confirm).toBeDisabled()
		expect(quickConfirm).toBeDisabled()

		fireEvent.change(screen.getByTestId('bulk-url-textarea'), {target: {value: 'https://example.com/one'}})

		expect(confirm).toBeEnabled()
		expect(quickConfirm).toBeEnabled()
	})

	it('confirm populates selectable bulk rows', () => {
		render(<StepUrlInput />)
		fireEvent.click(screen.getByTestId('profiles-bulk-urls'))
		fireEvent.change(screen.getByTestId('bulk-url-textarea'), {target: {value: 'https://example.com/one\nhttps://example.com/two'}})

		fireEvent.click(screen.getByTestId('bulk-url-confirm'))

		const state = useAppStore.getState()
		expect(state.wizardStep).toBe('playlistItems')
		expect(state.wizardMode).toBe('bulk')
		expect(state.playlistItems.map(item => item.url)).toEqual(['https://example.com/one', 'https://example.com/two'])
	})
})
