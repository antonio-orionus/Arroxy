import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {HotkeySettingsSection} from '@renderer/components/wizard/HotkeySettingsSection.js'
import {formatHotkeyChord} from '@renderer/lib/hotkeyLabel.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {DEFAULTS, defaultAppSettings} from '@shared/constants.js'
import {hotkeyAcceleratorSchema} from '@shared/schemas.js'
import type {AppSettings, HotkeyRegistrationStatus} from '@shared/types.js'
import {fail, ok} from '@shared/result.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// Renderer contract for the hotkey settings section: toggle persists through
// the store action, the recorder captures a valid chord + saves it + reports
// registration state, modifierless key combos are ignored, and the conflict
// message renders only when main reports an unregistered chord.

type HotkeyMockApi = ReturnType<typeof buildMockAppApi>

let mockApi: HotkeyMockApi

function buildSettings(common: Partial<AppSettings['common']> = {}): AppSettings {
	const base = defaultAppSettings('/tmp')
	return {...base, common: {...base.common, ...common}}
}

function mount(common: Partial<AppSettings['common']> = {}, hotkeyOverrides: {registered?: boolean; getState?: HotkeyMockApi['hotkey']['getState']} = {}, hotkeyRegistration?: HotkeyRegistrationStatus): void {
	let settings = buildSettings(common)
	mockApi = buildMockAppApi()
	mockApi.settings.update = vi.fn(patch => {
		settings = {...settings, common: {...settings.common, ...(patch.common ?? {})}, playlist: {...settings.playlist, ...(patch.playlist ?? {})}, profiles: {...settings.profiles, ...(patch.profiles ?? {})}}
		return Promise.resolve(ok(settings))
	})
	mockApi.hotkey.getState = hotkeyOverrides.getState ?? vi.fn(() => Promise.resolve(ok({accelerator: settings.common.hotkeyAccelerator ?? DEFAULTS.hotkeyAccelerator, registered: hotkeyOverrides.registered ?? true})))
	mockApi.hotkey.testPress = vi.fn().mockResolvedValue(ok(undefined))
	Object.defineProperty(window, 'appApi', {writable: true, value: mockApi})
	useAppStore.setState({initialized: true, initializing: false, settings, hotkeyRegistration: hotkeyRegistration ?? (settings.common.hotkeyEnabled ? 'registered' : 'off')})
	render(<HotkeySettingsSection />)
}

function toggle(): HTMLElement {
	return screen.getByTestId('profiles-settings-hotkey-toggle')
}

describe('HotkeySettingsSection', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		useAppStore.setState({settings: null, hotkeyRegistration: 'off'})
	})

	it('renders the toggle, current chord, and Test button', () => {
		mount({hotkeyEnabled: true}, {}, 'pending')

		expect(screen.getByText('Enable global hotkey')).toBeInTheDocument()
		expect(toggle()).toHaveAttribute('aria-checked', 'true')
		expect(screen.getByTestId('profiles-settings-hotkey-chord-value')).toHaveTextContent(formatHotkeyChord(DEFAULTS.hotkeyAccelerator).join(' + '))
		expect(screen.getByTestId('profiles-settings-hotkey-test')).toBeDisabled()
		expect(screen.getByTestId('profiles-settings-hotkey-reset')).toBeDisabled()
	})

	it('reset restores the default accelerator', async () => {
		mount({hotkeyEnabled: true, hotkeyAccelerator: 'Super+Shift+S'})

		fireEvent.click(screen.getByTestId('profiles-settings-hotkey-reset'))

		await waitFor(() => expect(mockApi.settings.update).toHaveBeenCalledWith({common: {hotkeyAccelerator: DEFAULTS.hotkeyAccelerator}}))
		await waitFor(() => expect(screen.getByTestId('profiles-settings-hotkey-chord-value')).toHaveTextContent(formatHotkeyChord(DEFAULTS.hotkeyAccelerator).join(' + ')))
		await waitFor(() => expect(useAppStore.getState().hotkeyRegistration).toBe('registered'))
	})

	it('toggling on persists hotkeyEnabled and pulls registration state', async () => {
		mount({hotkeyEnabled: false})

		fireEvent.click(toggle())

		await waitFor(() => expect(mockApi.settings.update).toHaveBeenCalledWith({common: {hotkeyEnabled: true}}))
		await waitFor(() => expect(useAppStore.getState().hotkeyRegistration).toBe('registered'))
		expect(mockApi.hotkey.getState).toHaveBeenCalledOnce()
	})

	it('recorder captures a valid chord, saves it, and stops recording', async () => {
		mount({hotkeyEnabled: true})

		fireEvent.click(screen.getByTestId('profiles-settings-hotkey-change'))
		expect(screen.getByTestId('profiles-settings-hotkey-recording')).toBeInTheDocument()

		const recording = screen.getByTestId('profiles-settings-hotkey-recording')
		fireEvent.keyDown(recording, {key: 'J', code: 'KeyJ', ctrlKey: true, altKey: true, shiftKey: true})

		await waitFor(() => expect(mockApi.settings.update).toHaveBeenCalledWith({common: {hotkeyAccelerator: 'Ctrl+Alt+Shift+J'}}))
		await waitFor(() => expect(screen.getByTestId('profiles-settings-hotkey-change')).toBeInTheDocument())
		expect(screen.getByTestId('profiles-settings-hotkey-chord-value')).toHaveTextContent(formatHotkeyChord('Ctrl+Alt+Shift+J').join(' + '))
	})

	it('records Command before Shift when both modifiers are pressed', async () => {
		mount({hotkeyEnabled: true})

		fireEvent.click(screen.getByTestId('profiles-settings-hotkey-change'))
		fireEvent.keyDown(screen.getByTestId('profiles-settings-hotkey-recording'), {key: 'S', code: 'KeyS', metaKey: true, shiftKey: true})

		await waitFor(() => expect(mockApi.settings.update).toHaveBeenCalledWith({common: {hotkeyAccelerator: 'Super+Shift+S'}}))
	})

	// The recorder reads the physical key (event.code), not the produced
	// character: Shift+1 types "!" and macOS Option+A types "å", yet both are
	// the chords the user pressed. Every key below is one Electron accepts.
	it.each([
		[{key: '!', code: 'Digit1', ctrlKey: true, shiftKey: true}, 'Ctrl+Shift+1'],
		[{key: 'å', code: 'KeyA', altKey: true}, 'Alt+A'],
		[{key: 'ArrowUp', code: 'ArrowUp', ctrlKey: true}, 'Ctrl+Up'],
		[{key: 'ArrowLeft', code: 'ArrowLeft', altKey: true}, 'Alt+Left'],
		[{key: '?', code: 'Slash', ctrlKey: true, shiftKey: true}, 'Ctrl+Shift+/'],
		[{key: '+', code: 'Equal', ctrlKey: true, shiftKey: true}, 'Ctrl+Shift+='],
		[{key: '`', code: 'Backquote', ctrlKey: true}, 'Ctrl+`'],
		[{key: 'PageDown', code: 'PageDown', ctrlKey: true}, 'Ctrl+PageDown'],
		[{key: 'Home', code: 'Home', ctrlKey: true}, 'Ctrl+Home'],
		[{key: 'Insert', code: 'Insert', ctrlKey: true}, 'Ctrl+Insert'],
		[{key: 'Delete', code: 'Delete', ctrlKey: true, shiftKey: true}, 'Ctrl+Shift+Delete'],
		[{key: '5', code: 'Numpad5', ctrlKey: true}, 'Ctrl+num5'],
		[{key: '+', code: 'NumpadAdd', ctrlKey: true}, 'Ctrl+numadd'],
		[{key: 'F24', code: 'F24', ctrlKey: true}, 'Ctrl+F24']
	])('records %o as %s', async (keyInit, expected) => {
		mount({hotkeyEnabled: true})

		fireEvent.click(screen.getByTestId('profiles-settings-hotkey-change'))
		fireEvent.keyDown(screen.getByTestId('profiles-settings-hotkey-recording'), keyInit)

		await waitFor(() => expect(mockApi.settings.update).toHaveBeenCalledWith({common: {hotkeyAccelerator: expected}}))
	})

	it('ignores a bare modifier press and keeps recording', () => {
		mount({hotkeyEnabled: true})

		fireEvent.click(screen.getByTestId('profiles-settings-hotkey-change'))
		fireEvent.keyDown(screen.getByTestId('profiles-settings-hotkey-recording'), {key: 'Shift', code: 'ShiftLeft', shiftKey: true, ctrlKey: true})

		expect(mockApi.settings.update).not.toHaveBeenCalled()
		expect(screen.getByTestId('profiles-settings-hotkey-recording')).toBeInTheDocument()
	})

	it('recorder ignores modifierless keypresses and keeps recording; Escape cancels', () => {
		mount({hotkeyEnabled: true})

		fireEvent.click(screen.getByTestId('profiles-settings-hotkey-change'))
		const recording = screen.getByTestId('profiles-settings-hotkey-recording')
		fireEvent.keyDown(recording, {key: 'J', code: 'KeyJ'})
		fireEvent.keyDown(recording, {key: 'Enter', code: 'Enter'})

		expect(mockApi.settings.update).not.toHaveBeenCalled()
		expect(screen.getByTestId('profiles-settings-hotkey-recording')).toBeInTheDocument()

		fireEvent.keyDown(recording, {key: 'Escape'})
		expect(screen.getByTestId('profiles-settings-hotkey-change')).toBeInTheDocument()
	})

	it('Tab cancels recording without moving focus back to the change button', async () => {
		const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus')
		try {
			mount({hotkeyEnabled: true})
			fireEvent.click(screen.getByTestId('profiles-settings-hotkey-change'))
			await waitFor(() => expect(screen.getByTestId('profiles-settings-hotkey-recording')).toHaveFocus())
			focusSpy.mockClear()

			fireEvent.keyDown(screen.getByTestId('profiles-settings-hotkey-recording'), {key: 'Tab'})

			await screen.findByTestId('profiles-settings-hotkey-change')
			expect(focusSpy).not.toHaveBeenCalled()
		} finally {
			focusSpy.mockRestore()
		}
	})

	it('saved chord always satisfies the shared schema (recorder output)', () => {
		// Recorder builds chords like Ctrl+Alt+Shift+J; anything it emits must
		// pass hotkeyAcceleratorSchema, otherwise settings.update would reject.
		expect(hotkeyAcceleratorSchema.safeParse('Ctrl+Alt+Shift+J').success).toBe(true)
		expect(hotkeyAcceleratorSchema.safeParse('Ctrl+F5').success).toBe(true)
		expect(hotkeyAcceleratorSchema.safeParse('J').success).toBe(false)
		expect(hotkeyAcceleratorSchema.safeParse('Ctrl+F25').success).toBe(false)
		expect(hotkeyAcceleratorSchema.safeParse('Ctrl++').success).toBe(false)
	})

	// Electron's globalShortcut.register throws on `Backquote`, which older
	// recorders saved; a stored chord is read as the key Electron does accept.
	it('reads a stored Backquote chord as the backtick key', () => {
		expect(hotkeyAcceleratorSchema.parse('Ctrl+Shift+Backquote')).toBe('Ctrl+Shift+`')
	})

	it('shows the conflict message only when the chord is not registered', async () => {
		mount({hotkeyEnabled: false}, {registered: false})

		fireEvent.click(toggle())

		await waitFor(() => expect(screen.getByTestId('profiles-settings-hotkey-conflict')).toBeInTheDocument())
	})

	it('Test button fires the real trigger pipeline once enabled', async () => {
		mount({hotkeyEnabled: false})

		expect(screen.getByTestId('profiles-settings-hotkey-test')).toBeDisabled()

		fireEvent.click(toggle())
		await waitFor(() => expect(screen.getByTestId('profiles-settings-hotkey-test')).toBeEnabled())
		fireEvent.click(screen.getByTestId('profiles-settings-hotkey-test'))
		await waitFor(() => expect(mockApi.hotkey.testPress).toHaveBeenCalledOnce())
	})

	it('keeps Test disabled until main confirms the chord is registered', async () => {
		type HotkeyStateResult = Awaited<ReturnType<HotkeyMockApi['hotkey']['getState']>>
		let resolveState: ((value: HotkeyStateResult) => void) | undefined
		const getState = vi.fn(() => new Promise<HotkeyStateResult>(resolve => (resolveState = resolve)))
		mount({hotkeyEnabled: true}, {getState}, 'registered')

		const updatePromise = useAppStore.getState().setHotkeyAccelerator('Ctrl+Shift+K')
		await waitFor(() => expect(mockApi.hotkey.getState).toHaveBeenCalledOnce())
		expect(screen.getByTestId('profiles-settings-hotkey-test')).toBeDisabled()
		resolveState?.(ok({accelerator: 'Ctrl+Shift+K', registered: true}))
		await updatePromise
		await waitFor(() => expect(screen.getByTestId('profiles-settings-hotkey-test')).toBeEnabled())
	})

	it('stores one shared registration status after a hotkey setting changes', async () => {
		const getState = vi.fn().mockResolvedValue(ok({accelerator: 'Ctrl+Shift+K', registered: true}))
		mount({hotkeyEnabled: true}, {getState}, 'pending')

		await useAppStore.getState().setHotkeyAccelerator('Ctrl+Shift+K')

		expect(getState).toHaveBeenCalledOnce()
		expect(useAppStore.getState().hotkeyRegistration).toBe('registered')
	})

	it('lets the newest accelerator win when two hotkey patches overlap', async () => {
		// The queue holds the second write until the first resolves, so main sees
		// the same order the user pressed and the store never rewinds to an older
		// response. Each queued write resolves its own registration, so the final
		// state describes the chord that actually stuck.
		type SettingsUpdateResult = Awaited<ReturnType<HotkeyMockApi['settings']['update']>>
		let resolveFirst: ((value: SettingsUpdateResult) => void) | undefined
		const getState = vi.fn().mockResolvedValue(ok({accelerator: 'Ctrl+Shift+L', registered: true}))
		mount({hotkeyEnabled: true}, {getState})
		const update = vi
			.fn()
			.mockImplementationOnce(() => new Promise<SettingsUpdateResult>(resolve => (resolveFirst = resolve)))
			.mockImplementationOnce(() => Promise.resolve(ok(buildSettings({hotkeyEnabled: true, hotkeyAccelerator: 'Ctrl+Shift+L'}))))
		mockApi.settings.update = update

		await act(async () => {
			const patches = Promise.all([useAppStore.getState().setHotkeyAccelerator('Ctrl+Shift+K'), useAppStore.getState().setHotkeyAccelerator('Ctrl+Shift+L')])
			await Promise.resolve()
			expect(update).toHaveBeenCalledOnce()
			resolveFirst?.(ok(buildSettings({hotkeyEnabled: true, hotkeyAccelerator: 'Ctrl+Shift+K'})))
			await patches
		})

		expect(update).toHaveBeenCalledTimes(2)
		expect(useAppStore.getState().settings?.common.hotkeyAccelerator).toBe('Ctrl+Shift+L')
		expect(useAppStore.getState().hotkeyRegistration).toBe('registered')
		expect(getState).toHaveBeenCalledTimes(2)
	})

	it('serializes overlapping hotkey writes so a failed one cannot strand the optimistic value', async () => {
		// Overlapping writes run one at a time, and a failure rolls back to what
		// main actually holds rather than to a snapshot that predates the write
		// before it. Registration resolves too, instead of sticking at 'pending'
		// because the older patch found itself superseded.
		const getState = vi.fn().mockResolvedValue(ok({accelerator: 'Ctrl+Shift+K', registered: true}))
		mount({hotkeyEnabled: true}, {getState})
		const persisted = buildSettings({hotkeyEnabled: true, hotkeyAccelerator: 'Ctrl+Shift+K'})
		const update = vi
			.fn()
			.mockResolvedValueOnce(ok(persisted))
			.mockResolvedValueOnce(fail({kind: 'other', code: 'settings_write_failed', message: 'nope'}))
		mockApi.settings.update = update
		// Main kept the first write, so that is what the rollback re-reads.
		mockApi.settings.get = vi.fn().mockResolvedValue(ok(persisted))

		await act(async () => {
			await Promise.all([useAppStore.getState().setHotkeyAccelerator('Ctrl+Shift+K'), useAppStore.getState().setHotkeyAccelerator('Ctrl+Shift+L')])
		})

		expect(useAppStore.getState().settings?.common.hotkeyAccelerator).toBe('Ctrl+Shift+K')
		expect(useAppStore.getState().hotkeyRegistration).toBe('registered')
	})

	it('keeps registration off without querying main while the hotkey is disabled', () => {
		const getState = vi.fn().mockResolvedValue(ok({accelerator: null, registered: false}))
		mount({hotkeyEnabled: false}, {getState})

		expect(useAppStore.getState().hotkeyRegistration).toBe('off')
		expect(getState).not.toHaveBeenCalled()
	})
})
