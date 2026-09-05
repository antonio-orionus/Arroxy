import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {DownloadProfilesHome} from '@renderer/components/wizard/DownloadProfilesHome.js'
import {DownloadProfilesSettingsTab} from '@renderer/components/wizard/DownloadProfilesSettingsTab.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {i18next} from '@shared/i18n/index.js'
import en from '@shared/i18n/locales/en.json' with {type: 'json'}
import {BUILTIN_DOWNLOAD_PROFILES, resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import {defaultAppSettings} from '@shared/constants.js'
import {ok} from '@shared/result.js'
import type {AppSettings} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {makeItem} from '../shared/fixtures.js'

vi.mock('@tanstack/react-virtual', () => ({
	useVirtualizer: ({count, estimateSize}: {count: number; estimateSize: () => number}) => {
		const size = estimateSize()
		return {getTotalSize: () => count * size, getVirtualItems: () => Array.from({length: count}, (_, index) => ({index, key: index, size, start: index * size})), measureElement: () => undefined}
	}
}))

describe('DownloadProfilesHome downloads tab', () => {
	beforeEach(() => {
		window.appApi = buildMockAppApi()
		window.history.replaceState(null, '', '#download')
		localStorage.clear()
		useAppStore.setState({queue: [makeItem({id: 'queued-video', title: 'Queued video', status: 'pending'})], wizardUrl: '', quickDownloadStatus: 'idle', quickDownloadFailure: null, quickDownloadProgressFailed: 0})
	})

	afterEach(() => {
		i18next.removeResourceBundle('en', 'translation')
		i18next.addResourceBundle('en', 'translation', en, true, true)
	})

	it('opens the queue manager from the top-level tab row', async () => {
		render(<DownloadProfilesHome />)

		fireEvent.click(screen.getByRole('tab', {name: /^downloads/i}))

		expect(screen.getByTestId('queue-manager-tab')).toBeInTheDocument()
		expect(await screen.findByTestId('queue-manager-row-queued-video')).toHaveTextContent('Queued video')
	})

	it('uses the localized Downloads tab label', () => {
		i18next.addResource('en', 'translation', 'queue.tabLabel', 'Lineup')

		render(<DownloadProfilesHome />)

		expect(screen.getByRole('tab', {name: /^lineup/i})).toBeInTheDocument()
	})

	it('marks the Downloads tab active only while queue work is running or moving files', () => {
		render(<DownloadProfilesHome />)
		expect(screen.getByRole('tab', {name: /^downloads/i})).not.toHaveAttribute('data-queue-active', 'true')

		act(() => useAppStore.setState({queue: [makeItem({id: 'running-video', title: 'Running video', status: 'running'})]}))
		expect(screen.getByRole('tab', {name: /^downloads/i})).toHaveAttribute('data-queue-active', 'true')

		act(() => useAppStore.setState({queue: [makeItem({id: 'moving-video', title: 'Moving video', status: 'pending', lastStatus: {key: 'movingFiles'}})]}))
		expect(screen.getByRole('tab', {name: /^downloads/i})).toHaveAttribute('data-queue-active', 'true')
	})

	it('shows the Downloads tab mascot cue the first time a queue item appears', () => {
		useAppStore.setState({queue: []})
		render(<DownloadProfilesHome />)

		expect(screen.queryByTestId('queue-tab-first-run-cue')).not.toBeInTheDocument()

		act(() => useAppStore.setState({queue: [makeItem({id: 'first-queued-video', title: 'First queued video', status: 'pending'})]}))

		expect(screen.getByTestId('queue-tab-first-run-cue')).toHaveTextContent('Downloads tab')
		expect(localStorage.getItem('arroxy_seen_queue_tab_tip')).toBe('1')
	})

	it('shows the Downloads tab mascot cue on launch when existing queue items are present', () => {
		render(<DownloadProfilesHome />)

		expect(screen.getByTestId('queue-tab-first-run-cue')).toHaveTextContent('Downloads tab')
		expect(localStorage.getItem('arroxy_seen_queue_tab_tip')).toBe('1')
	})

	it('shows the new Downloads tab cue even when the old smart drawer tip was seen', () => {
		localStorage.setItem('arroxy_seen_queue_tip', '1')
		useAppStore.setState({queue: []})
		render(<DownloadProfilesHome />)

		act(() => useAppStore.setState({queue: [makeItem({id: 'first-queued-video', title: 'First queued video', status: 'pending'})]}))

		expect(screen.getByTestId('queue-tab-first-run-cue')).toBeInTheDocument()
	})

	it('does not show the Downloads tab cue after the new tab tip was seen', () => {
		localStorage.setItem('arroxy_seen_queue_tab_tip', '1')
		useAppStore.setState({queue: []})
		render(<DownloadProfilesHome />)

		act(() => useAppStore.setState({queue: [makeItem({id: 'first-queued-video', title: 'First queued video', status: 'pending'})]}))

		expect(screen.queryByTestId('queue-tab-first-run-cue')).not.toBeInTheDocument()
	})

	it('scrolls the hotkey panel into view when settings open with the hotkey target', () => {
		const scrolledTargets: HTMLElement[] = []
		const originalDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView')
		Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
			configurable: true,
			value: function (this: HTMLElement): void {
				scrolledTargets.push(this)
			}
		})
		try {
			useAppStore.setState({advancedAutoOpen: true, advancedAutoTarget: 'hotkey'})
			render(<DownloadProfilesSettingsTab />)

			const panel = screen.getByTestId('hotkey-section')
			expect(scrolledTargets).toContain(panel)
		} finally {
			if (originalDescriptor) Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalDescriptor)
			else Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {configurable: true, value: undefined})
		}
	})
})

describe('DownloadProfilesHome profiles tab visibility', () => {
	beforeEach(() => {
		window.appApi = buildMockAppApi()
		window.history.replaceState(null, '', '#profiles')
		localStorage.clear()
		useAppStore.setState({queue: [], wizardUrl: '', quickDownloadStatus: 'idle', quickDownloadFailure: null, quickDownloadProgressFailed: 0, settings: defaultAppSettings('/tmp')})
	})

	afterEach(() => {
		i18next.removeResourceBundle('en', 'translation')
		i18next.addResourceBundle('en', 'translation', en, true, true)
	})

	it('renders opt-in low-data built-ins muted with a Hidden badge', () => {
		render(<DownloadProfilesHome />)

		const card = screen.getByTestId('profiles-manage-card-low-240')
		expect(card).toHaveAttribute('data-disabled-profile', 'true')
		expect(card.className).toMatch(/opacity-60/)
		expect(within(card).getByText('Hidden')).toBeInTheDocument()
		expect(within(card).getByText('Built-in')).toBeInTheDocument()
	})

	it('omits disabled profiles from the Quick Download popover', () => {
		window.history.replaceState(null, '', '#download')
		useAppStore.setState({settings: defaultAppSettings('/tmp'), wizardUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'})
		render(<DownloadProfilesHome />)

		fireEvent.click(screen.getByTestId('profiles-active-profile-trigger'))
		expect(screen.queryByTestId('profiles-profile-option-low-240')).not.toBeInTheDocument()
		expect(screen.getByTestId('profiles-profile-option-balanced')).toBeInTheDocument()
	})

	it('does not move the active profile when saving an edit to a hidden profile', async () => {
		vi.mocked(window.appApi.settings.update).mockImplementation(async patch => {
			const current = useAppStore.getState().settings
			return ok({...current, profiles: {...current?.profiles, ...patch.profiles}} as AppSettings)
		})
		useAppStore.setState({settings: {...defaultAppSettings('/tmp'), profiles: {...defaultAppSettings('/tmp').profiles, active: {kind: 'builtin', id: 'audio-only'}}}})
		render(<DownloadProfilesHome />)

		fireEvent.click(within(screen.getByTestId('profiles-manage-card-low-240')).getByRole('button', {name: 'Edit'}))
		// DownloadProfilesHome renders the editor behind React.lazy + Suspense, and
		// the first open in a worker measures ~500ms end to end against findBy*'s 1s
		// default — too little headroom on a loaded Windows CI runner, where this
		// timed out. Neither preloading the module (28ms) nor pre-rendering the
		// editor (107ms) accounts for it, so widen the window rather than pretend a
		// warmup fixes it. Subsequent opens in the same worker cost ~100ms.
		fireEvent.click(await screen.findByRole('button', {name: 'Save profile'}, {timeout: 15_000}))

		await waitFor(() => expect(window.appApi.settings.update).toHaveBeenCalledTimes(1))
		const profiles = useAppStore.getState().settings!.profiles
		expect(resolveActiveDownloadProfile(profiles).ref).toEqual({kind: 'builtin', id: 'audio-only'})
	})

	it('toggling off the active profile switches active and persists once', async () => {
		vi.mocked(window.appApi.settings.update).mockImplementation(async patch => {
			const current = useAppStore.getState().settings
			return ok({...current, profiles: {...current?.profiles, ...patch.profiles}} as AppSettings)
		})
		render(<DownloadProfilesHome />)

		const toggle = screen.getByTestId('profiles-manage-card-balanced-enabled-toggle')
		fireEvent.click(toggle)

		await waitFor(() => expect(window.appApi.settings.update).toHaveBeenCalledTimes(1))
		expect(window.appApi.settings.update).toHaveBeenCalledWith(expect.objectContaining({profiles: expect.objectContaining({enabledOverrides: expect.objectContaining({balanced: false})})}))
		await waitFor(() => expect(useAppStore.getState().settings?.profiles.active.id).not.toBe('balanced'))
	})

	it('hard-disables the Switch on the last enabled profile', () => {
		const onlyBalancedOverrides = Object.fromEntries(BUILTIN_DOWNLOAD_PROFILES.filter(profile => profile.id !== 'balanced').map(profile => [profile.id, false]))
		useAppStore.setState({settings: {...defaultAppSettings('/tmp'), profiles: {...defaultAppSettings('/tmp').profiles, enabledOverrides: onlyBalancedOverrides}}})
		render(<DownloadProfilesHome />)

		const toggle = screen.getByTestId('profiles-manage-card-balanced-enabled-toggle')
		expect(toggle).toHaveAttribute('aria-disabled', 'true')
		expect(toggle).toHaveAttribute('data-disabled', '')
	})

	it('keeps the Switch outside the picker button', () => {
		render(<DownloadProfilesHome />)

		const picker = screen.getByTestId('profiles-manage-card-balanced-picker')
		expect(within(picker).queryByRole('switch')).toBeNull()
		expect(screen.getByTestId('profiles-manage-card-balanced-enabled-toggle')).toBeInTheDocument()
	})
})
