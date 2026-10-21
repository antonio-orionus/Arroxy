import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {QuickProfileControl} from '@renderer/components/wizard/QuickProfileControl.js'
import {formatHotkeyChord} from '@renderer/lib/hotkeyLabel.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppSettings, HotkeyRegistrationStatus} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {expectHint} from '../shared/hint.js'
import {TooltipProvider} from '@renderer/components/ui/tooltip.js'

// The Quick Download card shows names only: Quick Download, the profile, and
// where it saves. What each does waits in its hint. The global shortcut is in
// Quick Download's hint on the URL tab, and only while the OS has the chord
// registered: the hint is a promise that pressing it queues the clipboard link.

function buildSettings(common: Partial<AppSettings['common']> = {}): AppSettings {
	const base = defaultAppSettings('/tmp')
	return {...base, common: {...base.common, ...common}}
}

interface MountOptions {
	common?: Partial<AppSettings['common']>
	registration?: HotkeyRegistrationStatus
	size?: 'default' | 'compact'
	testIdPrefix?: 'profiles' | 'bulk'
	destination?: string
	destinationDetail?: string
	disabled?: boolean
	onDownload?: () => void
}

function mount({common = {}, registration, size = 'default', testIdPrefix = 'profiles', destination, destinationDetail, disabled = false, onDownload = vi.fn()}: MountOptions = {}): void {
	Object.defineProperty(window, 'appApi', {writable: true, value: buildMockAppApi()})
	const settings = buildSettings(common)
	useAppStore.setState({initialized: true, initializing: false, settings, hotkeyRegistration: registration ?? (settings.common.hotkeyEnabled ? 'registered' : 'off')})
	render(
		<TooltipProvider>
			<QuickProfileControl destination={destination} destinationDetail={destinationDetail} disabled={disabled} onDownload={onDownload} onEditProfile={vi.fn()} onManageProfiles={vi.fn()} onNewProfile={vi.fn()} onPickProfile={vi.fn()} preparing={false} size={size} testIdPrefix={testIdPrefix} />
		</TooltipProvider>
	)
}

function openTooltipTexts(): string[] {
	return [...document.querySelectorAll<HTMLElement>('[data-slot="tooltip-content"]')].map(tip => tip.textContent)
}

// Hovers Quick Download and returns its open hint.
async function openQuickDownloadHint(testIdPrefix: 'profiles' | 'bulk' = 'profiles'): Promise<HTMLElement> {
	const quick = screen.getByTestId(`${testIdPrefix}-quick-download`)
	fireEvent.mouseEnter(quick)
	fireEvent.mouseMove(quick)
	return screen.findByTestId(`${testIdPrefix}-quick-download-hint`, undefined, {timeout: 1500})
}

describe('Quick Download action', () => {
	beforeEach(() => {
		useAppStore.setState({settings: null, hotkeyRegistration: 'off'})
	})

	it('shows its name only and names the profile in its hint', async () => {
		mount()
		const quick = screen.getByTestId('profiles-quick-download')
		expect(quick.textContent).toBe('Quick Download')
		expect(quick).not.toHaveTextContent('Will download using')

		await expectHint(quick, 'Will download using: Balanced 720p')
	})

	it('keeps its hint reachable while it cannot act yet, and a click does nothing', async () => {
		const onDownload = vi.fn()
		mount({disabled: true, onDownload, common: {hotkeyEnabled: true, hotkeyAccelerator: 'CommandOrControl+Shift+D'}})
		const quick = screen.getByTestId('profiles-quick-download')
		expect(quick).toHaveAttribute('aria-disabled', 'true')
		expect(quick).not.toHaveAttribute('disabled')

		await expectHint(quick, 'Will download using: Balanced 720p')
		await expectHint(quick, 'Global shortcut')
		fireEvent.click(quick)
		expect(onDownload).not.toHaveBeenCalled()
	})

	it('has no arrow: it starts at once and opens nothing', () => {
		mount()
		const quick = screen.getByTestId('profiles-quick-download')
		expect(quick.querySelector('.lucide-chevron-right')).toBeNull()
		expect(quick.querySelectorAll('svg')).toHaveLength(1)
	})

	it('adds the global shortcut and its chord to the hint while the hotkey is registered', async () => {
		mount({common: {hotkeyEnabled: true, hotkeyAccelerator: 'CommandOrControl+Shift+D'}})
		const hint = await openQuickDownloadHint()
		const line = within(hint).getByTestId('quick-download-global-hotkey')
		expect(line).toHaveTextContent('Global shortcut')
		expect(Array.from(line.querySelectorAll('[data-slot="kbd"]'), key => key.textContent)).toEqual(formatHotkeyChord('CommandOrControl+Shift+D'))
		// Name and chord only: Settings explains the hotkey and changes it.
		expect(within(hint).queryByRole('button')).toBeNull()
	})

	it('leaves the global shortcut out of the face of the card', () => {
		mount({common: {hotkeyEnabled: true}})
		expect(screen.getByTestId('profiles-quick-preview')).not.toHaveTextContent('Global shortcut')
		expect(screen.getByTestId('profiles-quick-preview')).not.toHaveTextContent('Or press')
		expect(screen.queryByTestId('quick-download-global-hotkey')).toBeNull()
	})

	it.each<[string, Partial<AppSettings['common']>, HotkeyRegistrationStatus | undefined]>([
		['the hotkey is disabled', {hotkeyEnabled: false}, undefined],
		['another app owns the chord', {hotkeyEnabled: true}, 'conflict'],
		['registration is pending', {hotkeyEnabled: true}, 'pending']
	])('names no shortcut while %s', async (_label, common, registration) => {
		mount({common, registration})
		const hint = await openQuickDownloadHint()
		expect(hint).toHaveTextContent('Will download using: Balanced 720p')
		expect(within(hint).queryByTestId('quick-download-global-hotkey')).toBeNull()
	})

	it('names the shortcut once the shared registration status turns registered', async () => {
		mount({common: {hotkeyEnabled: true}, registration: 'pending'})
		act(() => useAppStore.setState({hotkeyRegistration: 'registered'}))
		const hint = await openQuickDownloadHint()
		expect(within(hint).getByTestId('quick-download-global-hotkey')).toHaveTextContent('Global shortcut')
	})

	it('never names the global shortcut in the Bulk dialog', async () => {
		mount({common: {hotkeyEnabled: true}, registration: 'registered', size: 'compact', testIdPrefix: 'bulk'})
		const quick = screen.getByTestId('bulk-quick-download')
		expect(quick.textContent).toBe('Quick Download')
		expect(quick.querySelector('.lucide-chevron-right')).toBeNull()
		const hint = await openQuickDownloadHint('bulk')
		expect(hint).toHaveTextContent('Will download using: Balanced 720p')
		expect(hint).not.toHaveTextContent('Global shortcut')
		expect(within(hint).queryByTestId('quick-download-global-hotkey')).toBeNull()
	})
})

describe('active profile tile', () => {
	it('shows the profile name without the "Active profile" kicker', () => {
		mount()
		const card = screen.getByTestId('profiles-active-profile-card')
		expect(card).toHaveTextContent('Balanced 720p')
		expect(card).not.toHaveTextContent('Active profile')
	})

	it('leads its hint with "Active profile", above the profile summary', async () => {
		mount()
		const trigger = screen.getByTestId('profiles-active-profile-trigger')
		fireEvent.mouseEnter(trigger)
		fireEvent.mouseMove(trigger)
		const hint = await screen.findByTestId('profiles-active-profile-hint', undefined, {timeout: 2000})
		expect(hint.firstElementChild?.textContent).toBe('Active profile')
		expect(within(hint).getByTestId('profile-summary-balanced')).toHaveTextContent('Up to 720p · Best picture')
	})
})

describe('destination line', () => {
	const destination = '/Users/me/Downloads/Arroxy/Balanced 720p'
	const detail = 'Using global destination + profile subfolder'

	it('reads "Saves to" and the path, with nothing to click', () => {
		mount({destination, destinationDetail: detail})
		const line = screen.getByTestId('profiles-profile-destination')
		expect(line).toHaveTextContent('Saves to')
		expect(line).toHaveTextContent(destination)
		// The rule moves into the hint; the line itself only says where.
		expect(line).not.toHaveTextContent(detail)
		expect(within(line).queryByRole('button')).toBeNull()
		expect(screen.queryByTestId('profiles-change-global-destination')).toBeNull()
		expect(screen.queryByRole('button', {name: 'Change global destination'})).toBeNull()
	})

	it('hints the full path, which rule applies, and where to change it', async () => {
		mount({destination, destinationDetail: detail})
		const line = screen.getByTestId('profiles-profile-destination')
		fireEvent.mouseEnter(line)
		fireEvent.mouseMove(line)
		const hint = await screen.findByTestId('profiles-profile-destination-hint', undefined, {timeout: 1500})
		expect(hint).toHaveTextContent(destination)
		expect(hint).toHaveTextContent(detail)
		expect(hint).toHaveTextContent('To change where it saves, edit the profile.')
	})

	it('falls back to a generic rule name when no detail is given', async () => {
		mount({destination})
		const line = screen.getByTestId('profiles-profile-destination')
		fireEvent.mouseEnter(line)
		fireEvent.mouseMove(line)
		await waitFor(() => expect(openTooltipTexts().some(text => text.includes('Destination') && text.includes(destination))).toBe(true), {timeout: 1500})
	})

	it('is left out of the compact Bulk card', () => {
		mount({destination, destinationDetail: detail, size: 'compact', testIdPrefix: 'bulk'})
		expect(screen.queryByTestId('bulk-profile-destination')).toBeNull()
	})
})
