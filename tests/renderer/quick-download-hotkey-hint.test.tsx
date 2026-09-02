import {act, fireEvent, render, screen} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {QuickProfileControl} from '@renderer/components/wizard/QuickProfileControl.js'
import {formatHotkeyChord} from '@renderer/lib/hotkeyLabel.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppSettings, HotkeyRegistrationStatus} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {TooltipProvider} from '@renderer/components/ui/tooltip.js'

// The hint is a promise to the user: pressing this chord queues the clipboard
// link. It may only appear when the hotkey is both enabled in settings and
// actually registered with the OS — otherwise the promise is false.

function buildSettings(common: Partial<AppSettings['common']> = {}): AppSettings {
	const base = defaultAppSettings('/tmp')
	return {...base, common: {...base.common, ...common}}
}

function mount(common: Partial<AppSettings['common']> = {}, registration?: HotkeyRegistrationStatus, size: 'default' | 'compact' = 'default', testIdPrefix: 'profiles' | 'bulk' = 'profiles'): void {
	const mockApi = buildMockAppApi()
	Object.defineProperty(window, 'appApi', {writable: true, value: mockApi})
	const settings = buildSettings(common)
	useAppStore.setState({initialized: true, initializing: false, settings, hotkeyRegistration: registration ?? (settings.common.hotkeyEnabled ? 'registered' : 'off')})
	render(
		<TooltipProvider>
			<QuickProfileControl disabled={false} onDownload={vi.fn()} onEditProfile={vi.fn()} onManageProfiles={vi.fn()} onNewProfile={vi.fn()} onPickProfile={vi.fn()} preparing={false} size={size} testIdPrefix={testIdPrefix} />
		</TooltipProvider>
	)
}

describe('quick download hotkey hint', () => {
	beforeEach(() => {
		useAppStore.setState({settings: null, hotkeyRegistration: 'off'})
	})

	it('shows the chord when the hotkey is enabled and registered', async () => {
		mount({hotkeyEnabled: true, hotkeyAccelerator: 'CommandOrControl+Shift+D'})
		const hint = await screen.findByTestId('quick-download-hotkey-hint')
		expect(hint).toHaveTextContent('Or press')
		expect(Array.from(hint.querySelectorAll('[data-slot="kbd"]'), key => key.textContent)).toEqual(formatHotkeyChord('CommandOrControl+Shift+D').map(key => key))
	})

	it('explains the clipboard action and settings path in the tooltip', async () => {
		mount({hotkeyEnabled: true})
		const hint = await screen.findByTestId('quick-download-hotkey-hint')
		fireEvent.mouseEnter(hint)

		expect(await screen.findByText('Copy a video link anywhere, press this shortcut, and Arroxy queues it with your active profile — no need to switch windows.')).toBeInTheDocument()
		expect(screen.getByText('Change or turn it off in Settings.')).toBeInTheDocument()
	})

	it('opens the hotkey settings from the tooltip action', async () => {
		const openAdvancedSettings = vi.fn()
		useAppStore.setState({openAdvancedSettings})
		mount({hotkeyEnabled: true})
		const hint = await screen.findByTestId('quick-download-hotkey-hint')
		fireEvent.mouseEnter(hint)

		fireEvent.click(await screen.findByRole('button', {name: 'Change or turn it off in Settings.'}))

		expect(openAdvancedSettings).toHaveBeenCalledWith('hotkey')
	})

	it('stays hidden while the hotkey is disabled', () => {
		mount({hotkeyEnabled: false})
		expect(screen.getByTestId('profiles-quick-preview')).toBeTruthy()
		expect(screen.queryByTestId('quick-download-hotkey-hint')).toBeNull()
	})

	it('stays hidden when another app owns the chord', () => {
		mount({hotkeyEnabled: true}, 'conflict')
		expect(screen.getByTestId('profiles-quick-preview')).toBeTruthy()
		expect(screen.queryByTestId('quick-download-hotkey-hint')).toBeNull()
	})

	it('stays hidden in the compact bulk-dialog variant', () => {
		mount({hotkeyEnabled: true}, 'registered', 'compact', 'bulk')
		expect(screen.getByTestId('bulk-quick-profile-preview')).toBeTruthy()
		expect(screen.queryByTestId('quick-download-hotkey-hint')).toBeNull()
	})

	it('reacts when the shared registration status changes', () => {
		mount({hotkeyEnabled: true}, 'pending')
		expect(screen.queryByTestId('quick-download-hotkey-hint')).toBeNull()

		act(() => useAppStore.setState({hotkeyRegistration: 'registered'}))

		expect(screen.getByTestId('quick-download-hotkey-hint')).toBeInTheDocument()
	})

	it('advertises the shortcut to assistive tech on the download button itself', async () => {
		mount({hotkeyEnabled: true, hotkeyAccelerator: 'CommandOrControl+Shift+D'})
		await screen.findByTestId('quick-download-hotkey-hint')
		const button = screen.getByRole('button', {name: /quick/i})
		expect(button.getAttribute('aria-keyshortcuts')).toBe('CommandOrControl+Shift+D')
	})
})
