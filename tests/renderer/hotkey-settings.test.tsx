import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {HotkeySettingsSection} from '@renderer/components/wizard/HotkeySettingsSection.js'
import {formatHotkeyChord} from '@renderer/lib/hotkeyLabel.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {DEFAULTS, defaultAppSettings} from '@shared/constants.js'
import {hotkeyAcceleratorSchema} from '@shared/schemas.js'
import type {AppSettings, HotkeyRegistrationStatus} from '@shared/types.js'
import {ok} from '@shared/result.js'
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
		settings = {...settings, common: {...settings.common, ...(patch.common ?? {})}, single: {...settings.single, ...(patch.single ?? {})}, playlist: {...settings.playlist, ...(patch.playlist ?? {})}, profiles: {...settings.profiles, ...(patch.profiles ?? {})}}
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
		fireEvent.keyDown(recording, {key: 'J', ctrlKey: true, altKey: true, shiftKey: true})

		await waitFor(() => expect(mockApi.settings.update).toHaveBeenCalledWith({common: {hotkeyAccelerator: 'Ctrl+Alt+Shift+J'}}))
		await waitFor(() => expect(screen.getByTestId('profiles-settings-hotkey-change')).toBeInTheDocument())
		expect(screen.getByTestId('profiles-settings-hotkey-chord-value')).toHaveTextContent(formatHotkeyChord('Ctrl+Alt+Shift+J').join(' + '))
	})

	it('records Command before Shift when both modifiers are pressed', async () => {
		mount({hotkeyEnabled: true})

		fireEvent.click(screen.getByTestId('profiles-settings-hotkey-change'))
		fireEvent.keyDown(screen.getByTestId('profiles-settings-hotkey-recording'), {key: 'S', metaKey: true, shiftKey: true})

		await waitFor(() => expect(mockApi.settings.update).toHaveBeenCalledWith({common: {hotkeyAccelerator: 'Super+Shift+S'}}))
	})

	it('recorder ignores modifierless keypresses and keeps recording; Escape cancels', () => {
		mount({hotkeyEnabled: true})

		fireEvent.click(screen.getByTestId('profiles-settings-hotkey-change'))
		const recording = screen.getByTestId('profiles-settings-hotkey-recording')
		fireEvent.keyDown(recording, {key: 'J'})
		fireEvent.keyDown(recording, {key: 'Enter'})

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

	it('keeps registration off without querying main while the hotkey is disabled', () => {
		const getState = vi.fn().mockResolvedValue(ok({accelerator: null, registered: false}))
		mount({hotkeyEnabled: false}, {getState})

		expect(useAppStore.getState().hotkeyRegistration).toBe('off')
		expect(getState).not.toHaveBeenCalled()
	})
})
