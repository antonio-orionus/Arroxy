import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
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
import {expectHint} from '../shared/hint.js'

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

	// The rail's styling keys on the trigger's slot; a hint wrapper must not replace it.
	it('keeps every home tab a tabs-trigger slot', () => {
		render(<DownloadProfilesHome />)

		for (const tab of within(screen.getByTestId('profiles-tabs')).getAllByRole('tab')) expect(tab).toHaveAttribute('data-slot', 'tabs-trigger')
	})

	it('uses the localized Downloads tab label', () => {
		i18next.addResource('en', 'translation', 'queue.tabLabel', 'Lineup')

		render(<DownloadProfilesHome />)

		expect(screen.getByRole('tab', {name: /^lineup/i})).toBeInTheDocument()
	})

	// The badge counts the rows only the user can move on: a failed
	// preparation or an open choice. Otherwise it shows how many rows there are.
	it('turns the Downloads badge into the count of rows that need attention', async () => {
		const unresolved = {kind: 'unresolved', extractor: '', extractorKey: ''} as const
		render(<DownloadProfilesHome />)
		const tab = screen.getByRole('tab', {name: /^downloads/i})
		expect(within(tab).queryByTestId('downloads-attention-badge')).not.toBeInTheDocument()
		expect(tab).toHaveTextContent('1')

		act(() =>
			useAppStore.setState({
				queue: [
					makeItem({id: 'pending', status: 'pending'}),
					makeItem({id: 'failed-download', status: 'error', error: {kind: 'network', raw: 'x'}}),
					makeItem({id: 'probe-error', status: 'error', error: {kind: 'network', raw: 'x'}, job: unresolved, probeMode: 'video'}),
					makeItem({id: 'choice', status: 'needs-choice', choice: {kind: 'playlist-review', count: 3}, job: unresolved, probeMode: 'video'}),
					makeItem({id: 'probing', status: 'probing', job: unresolved, probeMode: 'video'})
				]
			})
		)
		const badge = within(tab).getByTestId('downloads-attention-badge')
		expect(badge).toHaveTextContent('2')
		expect(badge).toHaveAccessibleName('2 downloads need your attention')
		await expectHint(tab, '2 downloads need your attention')
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

describe('DownloadProfilesHome profiles tab reordering', () => {
	beforeEach(() => {
		window.appApi = buildMockAppApi()
		window.history.replaceState(null, '', '#profiles')
		localStorage.clear()
		useAppStore.setState({queue: [], wizardUrl: '', quickDownloadStatus: 'idle', quickDownloadFailure: null, quickDownloadProgressFailed: 0, settings: defaultAppSettings('/tmp')})
		vi.mocked(window.appApi.settings.update).mockImplementation(async patch => {
			const current = useAppStore.getState().settings
			return ok({...current, profiles: {...current?.profiles, ...patch.profiles}} as AppSettings)
		})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	const cardIds = (): string[] => screen.getAllByTestId(/^profiles-manage-card-[^-]+(?:-[^-]+)*$/).flatMap(node => (node.tagName === 'ARTICLE' ? [node.dataset.testid?.replace('profiles-manage-card-', '') ?? ''] : []))

	// jsdom lays nothing out: give each profile card a box in a two-column grid,
	// in DOM order, so keyboard moves can find the card beside it.
	function stubCardGrid(): void {
		const original = HTMLElement.prototype.getBoundingClientRect
		vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
			if (this.tagName !== 'ARTICLE' || !this.parentElement) return original.call(this)
			const index = Array.from(this.parentElement.children).indexOf(this)
			const left = (index % 2) * 300
			const top = Math.floor(index / 2) * 100
			return {x: left, y: top, left, top, width: 280, height: 90, right: left + 280, bottom: top + 90, toJSON: () => ({})}
		})
	}

	const settle = (): Promise<void> =>
		act(async () => {
			await new Promise(resolve => setTimeout(resolve, 0))
		})

	it('moves a profile with the keyboard from its grip, announces it and saves the order', async () => {
		stubCardGrid()
		render(<DownloadProfilesHome />)
		expect(cardIds().slice(0, 2)).toEqual(['best-quality', 'best-2160'])

		const grip = screen.getByRole('button', {name: 'Move Best available'})
		expect(grip).toHaveAttribute('aria-roledescription', 'movable profile')
		grip.focus()
		fireEvent.keyDown(grip, {code: 'Space', key: ' '})
		await settle()
		expect(screen.getByText('Picked up Best available. It is in position 1 of 13.')).toBeInTheDocument()
		fireEvent.keyDown(document, {code: 'ArrowRight', key: 'ArrowRight'})
		await settle()
		fireEvent.keyDown(document, {code: 'Space', key: ' '})

		await waitFor(() => expect(window.appApi.settings.update).toHaveBeenCalledTimes(1))
		expect(window.appApi.settings.update).toHaveBeenCalledWith({profiles: expect.objectContaining({order: expect.arrayContaining(['best-2160', 'best-quality'])})})
		await waitFor(() => expect(cardIds().slice(0, 2)).toEqual(['best-2160', 'best-quality']))
		expect(screen.getByText('Dropped Best available in position 2 of 13.')).toBeInTheDocument()
	})

	// The pick-up render can outlast the next key press; that key must still move the card.
	const pressAll = (target: HTMLElement, codes: readonly string[]): void => {
		for (const code of codes) fireEvent.keyDown(target, {code, key: code === 'Space' ? ' ' : code})
	}

	it('moves a profile by an arrow pressed before the pick-up has settled', async () => {
		stubCardGrid()
		render(<DownloadProfilesHome />)

		const grip = screen.getByRole('button', {name: 'Move Best available'})
		grip.focus()
		pressAll(grip, ['Space', 'ArrowRight'])
		await settle()
		fireEvent.keyDown(grip, {code: 'Space', key: ' '})

		await waitFor(() => expect(cardIds().slice(0, 2)).toEqual(['best-2160', 'best-quality']))
		expect(screen.getByText('Dropped Best available in position 2 of 13.')).toBeInTheDocument()
	})

	it('applies every key pressed before the pick-up has settled, in order', async () => {
		stubCardGrid()
		render(<DownloadProfilesHome />)

		const grip = screen.getByRole('button', {name: 'Move Best available'})
		grip.focus()
		pressAll(grip, ['Space', 'ArrowRight', 'ArrowDown', 'Space'])

		await waitFor(() => expect(cardIds().slice(0, 4)).toEqual(['best-2160', 'best-1440', 'hd-1080', 'best-quality']))
		expect(screen.getByText('Dropped Best available in position 4 of 13.')).toBeInTheDocument()
	})

	it('discards held keys when the drag is cancelled before they replay', async () => {
		stubCardGrid()
		render(<DownloadProfilesHome />)

		const grip = screen.getByRole('button', {name: 'Move Best available'})
		grip.focus()
		pressAll(grip, ['Space', 'ArrowRight', 'Space'])
		fireEvent(window, new Event('resize'))
		await settle()
		await settle()

		expect(screen.getByText('Move cancelled. Best available stays in position 1 of 13.')).toBeInTheDocument()
		expect(screen.queryByText(/Picked up/)).not.toBeInTheDocument()
		expect(cardIds().slice(0, 2)).toEqual(['best-quality', 'best-2160'])
	})

	it('cancels a move by an Escape pressed before the pick-up has settled', async () => {
		stubCardGrid()
		render(<DownloadProfilesHome />)

		const grip = screen.getByRole('button', {name: 'Move Best available'})
		grip.focus()
		pressAll(grip, ['Space', 'ArrowRight', 'Escape'])

		await waitFor(() => expect(screen.getByText('Move cancelled. Best available stays in position 1 of 13.')).toBeInTheDocument())
		expect(cardIds().slice(0, 2)).toEqual(['best-quality', 'best-2160'])
		expect(window.appApi.settings.update).not.toHaveBeenCalled()
	})

	it('picks nothing up when Space is pressed on a card button other than the grip', async () => {
		stubCardGrid()
		render(<DownloadProfilesHome />)

		const edit = within(screen.getByTestId('profiles-manage-card-best-quality')).getByRole('button', {name: 'Edit'})
		edit.focus()
		fireEvent.keyDown(edit, {code: 'Space', key: ' '})
		await settle()
		fireEvent.keyDown(document, {code: 'ArrowRight', key: 'ArrowRight'})
		await settle()
		fireEvent.keyDown(document, {code: 'Space', key: ' '})
		await settle()

		expect(screen.queryByText(/Picked up/)).not.toBeInTheDocument()
		expect(window.appApi.settings.update).not.toHaveBeenCalled()
	})

	it('lists profiles in the saved order in the Quick Download profile menu', () => {
		window.history.replaceState(null, '', '#download')
		useAppStore.setState({settings: {...defaultAppSettings('/tmp'), profiles: {...defaultAppSettings('/tmp').profiles, order: ['audio-only', 'mp4-720']}}, wizardUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'})
		render(<DownloadProfilesHome />)

		fireEvent.click(screen.getByTestId('profiles-active-profile-trigger'))
		const options = screen.getAllByTestId(/^profiles-profile-option-/).map(node => node.dataset.testid?.replace('profiles-profile-option-', ''))
		expect(options.slice(0, 3)).toEqual(['audio-only', 'mp4-720', 'best-quality'])
	})
})
