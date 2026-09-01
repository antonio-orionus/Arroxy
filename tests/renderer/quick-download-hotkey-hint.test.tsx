import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import {QuickProfileControl} from '@renderer/components/wizard/QuickProfileControl.js'
import {formatHotkeyChord} from '@renderer/lib/hotkeyLabel.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppSettings} from '@shared/types.js'
import {ok} from '@shared/result.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {TooltipProvider} from '@renderer/components/ui/tooltip.js'

// The hint is a promise to the user: pressing this chord queues the clipboard
// link. It may only appear when the hotkey is both enabled in settings and
// actually registered with the OS — otherwise the promise is false.

function buildSettings(common: Partial<AppSettings['common']> = {}): AppSettings {
	const base = defaultAppSettings('/tmp')
	return {...base, common: {...base.common, ...common}}
}

function mount(common: Partial<AppSettings['common']> = {}, registered = true, size: 'default' | 'compact' = 'default', testIdPrefix: 'profiles' | 'bulk' = 'profiles'): void {
	const mockApi = buildMockAppApi()
	mockApi.hotkey.getState = vi.fn().mockResolvedValue(ok({accelerator: common.hotkeyAccelerator ?? 'CommandOrControl+Shift+D', registered}))
	Object.defineProperty(window, 'appApi', {writable: true, value: mockApi})
	useAppStore.setState({initialized: true, initializing: false, settings: buildSettings(common)})
	render(
		<TooltipProvider>
			<QuickProfileControl disabled={false} onDownload={vi.fn()} onEditProfile={vi.fn()} onManageProfiles={vi.fn()} onNewProfile={vi.fn()} onPickProfile={vi.fn()} preparing={false} size={size} testIdPrefix={testIdPrefix} />
		</TooltipProvider>
	)
}

describe('quick download hotkey hint', () => {
	beforeEach(() => {
		useAppStore.setState({settings: undefined})
	})

	it('shows the chord when the hotkey is enabled and registered', async () => {
		mount({hotkeyEnabled: true, hotkeyAccelerator: 'CommandOrControl+Shift+D'}, true)
		const hint = await screen.findByTestId('quick-download-hotkey-hint')
		expect(hint).toHaveTextContent('Or press')
		expect(Array.from(hint.querySelectorAll('[data-slot="kbd"]'), key => key.textContent)).toEqual(formatHotkeyChord('CommandOrControl+Shift+D').map(key => key))
	})

	it('explains the clipboard action and settings path in the tooltip', async () => {
		mount({hotkeyEnabled: true}, true)
		const hint = await screen.findByTestId('quick-download-hotkey-hint')
		fireEvent.mouseEnter(hint)

		expect(await screen.findByText('Copy a video link anywhere, press this shortcut, and Arroxy queues it with your active profile — no need to switch windows.')).toBeInTheDocument()
		expect(screen.getByText('Change or turn it off in Settings.')).toBeInTheDocument()
	})

	it('stays hidden while the hotkey is disabled', async () => {
		mount({hotkeyEnabled: false}, true)
		await waitFor(() => expect(screen.getByTestId('profiles-quick-preview')).toBeTruthy())
		expect(screen.queryByTestId('quick-download-hotkey-hint')).toBeNull()
	})

	it('stays hidden when another app owns the chord', async () => {
		mount({hotkeyEnabled: true}, false)
		await waitFor(() => expect(screen.getByTestId('profiles-quick-preview')).toBeTruthy())
		expect(screen.queryByTestId('quick-download-hotkey-hint')).toBeNull()
	})

	it('stays hidden in the compact bulk-dialog variant', async () => {
		mount({hotkeyEnabled: true}, true, 'compact', 'bulk')
		await waitFor(() => expect(screen.getByTestId('bulk-quick-profile-preview')).toBeTruthy())
		expect(screen.queryByTestId('quick-download-hotkey-hint')).toBeNull()
	})

	it('advertises the shortcut to assistive tech on the download button itself', async () => {
		mount({hotkeyEnabled: true, hotkeyAccelerator: 'CommandOrControl+Shift+D'}, true)
		await screen.findByTestId('quick-download-hotkey-hint')
		const button = screen.getByRole('button', {name: /quick/i})
		expect(button.getAttribute('aria-keyshortcuts')).toBe('CommandOrControl+Shift+D')
	})
})
