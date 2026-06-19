// @vitest-environment jsdom
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {render, act, fireEvent, screen} from '@testing-library/react'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {StepUrlInput} from '@renderer/components/wizard/StepUrlInput.js'
import {notify} from '@renderer/lib/notify.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppApi} from '@shared/api.js'

let mockApi: AppApi
let clipboardUnsub: () => void
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
		activePreset: null,
		wizardOutputDir: '',
		wizardError: null,
		wizardErrorOrigin: null,
		playlistItems: [],
		queue: [],
		...overrides
	})
}

beforeEach(() => {
	window.history.replaceState(null, '', '/')
	clipboardListener = null
	clipboardUnsub = vi.fn()
	mockApi = buildMockAppApi()
	mockApi.events.onClipboardUrl = (cb): (() => void) => {
		clipboardListener = cb
		return clipboardUnsub
	}
	window.appApi = mockApi
	window.platform = 'linux'
	resetStore()
})

const FRESH_URL = 'https://www.youtube.com/watch?v=fromClipboard'

describe('wizard clipboard auto-fill', () => {
	it('fills the URL field when the watcher fires and the field is empty', () => {
		const toastSpy = vi.spyOn(notify, 'clipboardAutofilled').mockImplementation(() => undefined)
		render(<StepUrlInput />)

		act(() => {
			clipboardListener!(FRESH_URL)
		})

		expect(screen.queryByTestId('clipboard-confirm-dialog')).not.toBeInTheDocument()
		expect(useAppStore.getState().wizardUrl).toBe(FRESH_URL)
		expect(toastSpy).toHaveBeenCalledWith('Link added from clipboard')
	})

	it('stores a copied link as pending instead of replacing an existing manual URL', () => {
		useAppStore.setState({wizardUrl: 'already-here'})
		render(<StepUrlInput />)

		act(() => {
			clipboardListener!(FRESH_URL)
		})

		expect(useAppStore.getState().wizardUrl).toBe('already-here')
		expect(screen.getByTestId('clipboard-pending-action')).toHaveTextContent('Use copied link')
	})

	it('stores clipboard watcher events while a probe is in flight', () => {
		useAppStore.setState({wizardUrl: '', formatsLoading: true})
		render(<StepUrlInput />)

		act(() => {
			clipboardListener!(FRESH_URL)
		})

		expect(useAppStore.getState().wizardUrl).toBe('')
		expect(screen.getByTestId('clipboard-pending-action')).toHaveTextContent('Use copied link')
	})

	it('auto-fills even while the splash screen is dismissing', () => {
		resetStore({initialized: true, splashDismissed: false})
		render(<StepUrlInput />)

		act(() => {
			clipboardListener!(FRESH_URL)
		})

		expect(useAppStore.getState().wizardUrl).toBe(FRESH_URL)
		expect(screen.queryByTestId('clipboard-confirm-dialog')).not.toBeInTheDocument()
	})

	it('opens the bulk URL dialog when clipboard text contains several accepted URLs', () => {
		const toastSpy = vi.spyOn(notify, 'clipboardAutofilled').mockImplementation(() => undefined)
		const raw = 'Grab https://example.com/one, https://example.com/two'
		render(<StepUrlInput />)

		act(() => {
			clipboardListener!(raw)
		})

		expect(useAppStore.getState().wizardUrl).toBe('')
		expect(screen.getByTestId('bulk-url-dialog')).toBeInTheDocument()
		expect(screen.getByTestId('bulk-url-textarea')).toHaveValue(raw)
		expect(screen.getByTestId('bulk-url-valid-count')).toHaveTextContent('2')
		expect(toastSpy).toHaveBeenCalledWith('2 links opened from clipboard')
	})

	it('unsubscribes from clipboard events when StepUrlInput unmounts', () => {
		const {unmount} = render(<StepUrlInput />)
		expect(clipboardUnsub).not.toHaveBeenCalled()
		unmount()
		expect(clipboardUnsub).toHaveBeenCalledTimes(1)
	})

	it('stores clipboard watcher events while the bulk URL dialog is open without overwriting the textarea', () => {
		render(<StepUrlInput />)

		fireEvent.click(screen.getByTestId('profiles-bulk-urls'))
		expect(screen.getByTestId('bulk-url-dialog')).toBeInTheDocument()

		act(() => {
			clipboardListener!(FRESH_URL)
		})

		expect(screen.queryByTestId('clipboard-confirm-dialog')).not.toBeInTheDocument()
		expect(useAppStore.getState().wizardUrl).toBe('')
		expect(screen.getByTestId('bulk-url-textarea')).toHaveValue('')
		expect(screen.getByTestId('clipboard-pending-action')).toHaveTextContent('Use copied link')
	})

	it('uses a pending copied link when clearing an occupied URL field', () => {
		useAppStore.setState({wizardUrl: 'already-here'})
		render(<StepUrlInput />)

		act(() => {
			clipboardListener!(FRESH_URL)
		})
		fireEvent.click(screen.getByTestId('url-clear'))

		expect(useAppStore.getState().wizardUrl).toBe(FRESH_URL)
		expect(screen.queryByTestId('clipboard-pending-action')).not.toBeInTheDocument()
	})

	it('opens pending copied links when clearing an occupied URL field', () => {
		const raw = 'Grab https://example.com/one, https://example.com/two'
		useAppStore.setState({wizardUrl: 'already-here'})
		render(<StepUrlInput />)

		act(() => {
			clipboardListener!(raw)
		})
		fireEvent.click(screen.getByTestId('url-clear'))

		expect(useAppStore.getState().wizardUrl).toBe('')
		expect(screen.getByTestId('bulk-url-dialog')).toBeInTheDocument()
		expect(screen.getByTestId('bulk-url-textarea')).toHaveValue(raw)
		expect(screen.queryByTestId('clipboard-pending-action')).not.toBeInTheDocument()
	})

	it('dismisses a pending clipboard candidate', () => {
		useAppStore.setState({wizardUrl: 'already-here'})
		render(<StepUrlInput />)

		act(() => {
			clipboardListener!(FRESH_URL)
		})
		fireEvent.click(screen.getByTestId('clipboard-pending-dismiss'))

		expect(screen.queryByTestId('clipboard-pending-action')).not.toBeInTheDocument()
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
