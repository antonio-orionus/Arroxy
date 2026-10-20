// @vitest-environment jsdom
import {act, cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import type {AppSettings, DownloadProfile, DownloadProfileRef, PlaylistEntry} from '@shared/types.js'
import * as downloadProfilesModule from '@shared/downloadProfiles.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppState} from '@renderer/store/types.js'
import {StepPlaylistItems} from '@renderer/components/wizard/StepPlaylistItems.js'
import {StepPlaylistProfiles} from '@renderer/components/wizard/StepPlaylistProfiles.js'
import {multiProfileBreakdown} from '@renderer/store/wizard/downloadReviewProjection.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// Entry-button gating uses the real `enabledDownloadProfiles` in production,
// but that helper always prepends the enabled real builtins — so the catalog
// it returns can never actually drop below 2. Wrapping it in a passthrough
// spy lets the gating-boundary test below control exactly what the component
// sees (1 vs 2 profiles) without touching how `StepPlaylistProfiles`'s tests
// further down exercise the real, unmodified catalog.
vi.mock('@shared/downloadProfiles.js', async importOriginal => {
	const actual = await importOriginal<typeof import('@shared/downloadProfiles.js')>()
	return {...actual, enabledDownloadProfiles: vi.fn(actual.enabledDownloadProfiles)}
})

function profile(id: string, name: string, icon: DownloadProfile['icon']): DownloadProfile {
	return {
		id,
		name,
		icon,
		enabled: true,
		media: {kind: 'video-audio', goal: 'best-picture', tier: '1080', fileType: 'auto', audio: {native: {kind: 'default'}}},
		subtitles: {enabled: false, languages: [], source: 'manual-first', mode: 'sidecar', format: 'srt'},
		output: {kind: 'default'},
		filename: {kind: 'default'},
		subfolder: {enabled: false, name: ''},
		sponsorBlock: {mode: 'off', categories: []},
		embed: {chapters: true, metadata: true, thumbnail: false, description: false, thumbnailSidecar: false},
		createdAt: '2026-08-12T00:00:00.000Z',
		updatedAt: '2026-08-12T00:00:00.000Z'
	}
}

const ARCHIVE = profile('archive', 'Archive 4K', 'archive')
const PODCAST = profile('podcast', 'Podcast MP3', 'podcast')
const ARCHIVE_REF: DownloadProfileRef = {kind: 'custom', id: 'archive'}
const PODCAST_REF: DownloadProfileRef = {kind: 'custom', id: 'podcast'}

// Simulates a profile coming back renamed from the editor, without driving the
// editor's own save plumbing (already covered where that plumbing lives) —
// this only exercises whether the step re-derives row labels from the
// settings it's handed, per `resolveAssignedProfile`.
function renameProfile(id: string, name: string): void {
	act(() => {
		useAppStore.setState((state): Partial<AppState> => {
			const settings = state.settings
			if (!settings) return state
			return {settings: {...settings, profiles: {...settings.profiles, custom: settings.profiles.custom.map(candidate => (candidate.id === id ? {...candidate, name} : candidate))}}}
		})
	})
}

// jsdom reports a zero-height scroll container, so the real virtualizer only
// windows in a single row. Stub it to always render every row — same fix
// queue-manager-tab.test.tsx uses for the same reason.
vi.mock('@tanstack/react-virtual', () => ({
	useVirtualizer: ({count, estimateSize}: {count: number; estimateSize: () => number}) => {
		const size = estimateSize()
		return {getTotalSize: () => count * size, getVirtualItems: () => Array.from({length: count}, (_, index) => ({index, key: index, size, start: index * size})), measureElement: () => undefined}
	}
}))

// Stubbed per test where the editor's save matters; restored in beforeEach so
// a stub never leaks into the next test through the module-level store.
const ORIGINAL_SAVE_DOWNLOAD_PROFILE = useAppStore.getState().saveDownloadProfile

// The real catalog + downloadProfileActions model is used everywhere below —
// no mock. The screen lists profiles in the user's saved order, like every
// other profile picker.
function renderStep(overrides: {common?: Partial<AppSettings['common']>} = {}): ReturnType<typeof render> {
	if (overrides.common) {
		useAppStore.setState((state): Partial<AppState> => {
			const settings = state.settings
			if (!settings) return state
			return {settings: {...settings, common: {...settings.common, ...overrides.common}}}
		})
	}
	return render(<StepPlaylistProfiles />)
}

beforeEach(() => {
	window.appApi = buildMockAppApi()
	useAppStore.setState({
		wizardMode: 'playlist',
		wizardStep: 'playlistProfiles',
		multiProfileMode: true,
		playlistItems: [
			{id: 'a', url: 'https://example.com/a', title: 'Under my Spell', thumbnail: '', duration: 200, playlistIndex: 0, videoId: 'a'},
			{id: 'b', url: 'https://example.com/b', title: 'One Last Breath', thumbnail: '', duration: 210, playlistIndex: 1, videoId: 'b'},
			{id: 'c', url: 'https://example.com/c', title: 'Burn the Witch', thumbnail: '', duration: 220, playlistIndex: 2, videoId: 'c'}
		],
		selectedPlaylistItemIds: ['a', 'b', 'c'],
		removedPlaylistItemIds: [],
		playlistProfileAssignments: {},
		// Narrow cast on just this nested object — it's genuinely incomplete
		// (no common/single/playlist), unlike the rest of this patch.
		settings: {profiles: {active: ARCHIVE_REF, custom: [ARCHIVE, PODCAST], overrides: []}} as unknown as AppSettings,
		saveDownloadProfile: ORIGINAL_SAVE_DOWNLOAD_PROFILE
	} satisfies Partial<AppState>)
})

function profileCell(rowId: string): HTMLElement {
	return screen.getByTestId(`profile-cell-${rowId}`)
}

function check(rowId: string): void {
	fireEvent.click(screen.getByTestId(`select-row-${rowId}`))
}

function openToolbarMenu(): void {
	fireEvent.click(screen.getByTestId('playlist-profile-assign-trigger'))
}

function pickFromToolbar(profileId: string): void {
	openToolbarMenu()
	fireEvent.click(screen.getByTestId(`playlist-profile-option-${profileId}`))
}

function openRowMenu(rowId: string): void {
	fireEvent.click(profileCell(rowId))
}

function pickFromRow(rowId: string, profileId: string): void {
	openRowMenu(rowId)
	fireEvent.click(screen.getByTestId(`playlist-row-profile-option-${profileId}`))
}

function editFromRowMenu(rowId: string, profileName: string): void {
	openRowMenu(rowId)
	fireEvent.click(within(screen.getByTestId('playlist-row-profile-menu-actions')).getByRole('button', {name: `Edit ${profileName}`}))
}

function expectSelected(selected: Record<string, boolean>): void {
	for (const [rowId, isSelected] of Object.entries(selected)) expect(screen.getByTestId(`profile-row-${rowId}`)).toHaveAttribute('aria-selected', String(isSelected))
}

describe('StepPlaylistProfiles', () => {
	it('starts every item on the active profile', () => {
		renderStep()
		for (const rowId of ['a', 'b', 'c']) expect(profileCell(rowId)).toHaveTextContent('Archive 4K')
	})

	it('shows no how-to banner: the checkboxes and pickers carry the gestures', () => {
		renderStep()
		expect(screen.queryByTestId('multi-profile-hint')).not.toBeInTheDocument()
	})

	describe('checkbox selection', () => {
		it('checks rows one by one without collapsing the rows already selected', () => {
			renderStep()
			check('a')
			check('c')
			expectSelected({a: true, b: false, c: true})
			expect(screen.getByTestId('select-row-a')).toHaveAttribute('aria-checked', 'true')
			expect(screen.getByTestId('select-row-b')).toHaveAttribute('aria-checked', 'false')
			expect(screen.getByTestId('playlist-profile-summary')).toHaveTextContent('2 of 3 selected')
		})

		it('unchecks one row out of a shift-click range', () => {
			renderStep()
			fireEvent.click(screen.getByText('Under my Spell'))
			fireEvent.click(screen.getByText('Burn the Witch'), {shiftKey: true})
			check('b')
			expectSelected({a: true, b: false, c: true})
		})

		it('select-all checks every row, reads as mixed for a partial selection, and clears a full one', () => {
			renderStep()
			const selectAll = screen.getByTestId('playlist-profile-select-all')
			expect(selectAll).toHaveAttribute('aria-checked', 'false')

			check('b')
			expect(selectAll).toHaveAttribute('aria-checked', 'mixed')

			fireEvent.click(selectAll)
			expectSelected({a: true, b: true, c: true})
			expect(selectAll).toHaveAttribute('aria-checked', 'true')

			fireEvent.click(selectAll)
			expectSelected({a: false, b: false, c: false})
		})

		it('select-all covers only the rows the filter shows', () => {
			renderStep()
			pickFromRow('b', 'podcast')
			fireEvent.click(screen.getByTestId('filter-profile-archive'))
			fireEvent.click(screen.getByTestId('playlist-profile-select-all'))
			fireEvent.click(screen.getByTestId('filter-profile-all'))
			expectSelected({a: true, b: false, c: true})
		})

		it('Ctrl/Cmd+A selects only the currently filtered rows, not every item', () => {
			renderStep()
			// 'b' moves to a third profile first, so a select-all that wrongly took
			// every row would also flip it in the final assignment.
			pickFromRow('b', 'podcast')
			fireEvent.click(screen.getByTestId('filter-profile-archive'))
			expect(screen.getAllByTestId(/^profile-row-/)).toHaveLength(2)

			fireEvent.keyDown(window, {key: 'a', code: 'KeyA', ctrlKey: true})
			pickFromToolbar('best-quality')

			fireEvent.click(screen.getByTestId('filter-profile-all'))
			expect(profileCell('a')).toHaveTextContent('Best available')
			expect(profileCell('c')).toHaveTextContent('Best available')
			expect(profileCell('b')).toHaveTextContent('Podcast MP3')
		})
	})

	describe('toolbar picker', () => {
		it('is disabled until a row is selected, then names how many rows it assigns to', () => {
			renderStep()
			const trigger = screen.getByTestId('playlist-profile-assign-trigger')
			expect(trigger).toBeDisabled()
			expect(trigger).toHaveTextContent('Assign profile')
			check('a')
			check('b')
			expect(trigger).toBeEnabled()
			expect(trigger).toHaveTextContent('Assign to 2 videos')
		})

		it('assigns the profile picked in the shared menu to the selected rows', () => {
			renderStep()
			check('a')
			check('c')
			pickFromToolbar('podcast')
			expect(profileCell('a')).toHaveTextContent('Podcast MP3')
			expect(profileCell('b')).toHaveTextContent('Archive 4K')
			expect(profileCell('c')).toHaveTextContent('Podcast MP3')
		})

		it('marks the profile every selected row shares, and its Edit opens that profile', async () => {
			renderStep()
			check('a')
			check('b')
			openToolbarMenu()
			expect(screen.getByTestId('playlist-profile-option-archive')).toHaveAttribute('aria-pressed', 'true')
			expect(screen.getByTestId('playlist-profile-option-podcast')).toHaveAttribute('aria-pressed', 'false')

			fireEvent.click(within(screen.getByTestId('playlist-profile-menu-actions')).getByRole('button', {name: 'Edit Archive 4K'}))
			expect(await screen.findByTestId('profiles-editor-dialog')).toBeInTheDocument()
			expect(screen.getByTestId('profiles-editor-name')).toHaveValue('Archive 4K')
		})

		it('marks nothing and offers no Edit when the selected rows use different profiles', () => {
			renderStep()
			pickFromRow('b', 'podcast')
			check('a')
			check('b')
			openToolbarMenu()
			expect(within(screen.getByTestId('playlist-profile-menu-grid')).queryAllByRole('button', {pressed: true})).toHaveLength(0)
			expect(within(screen.getByTestId('playlist-profile-menu-actions')).queryByRole('button', {name: /^Edit/})).not.toBeInTheDocument()
		})

		it('lists profiles in the saved order, with no re-sort for the baseline or custom profiles', () => {
			useAppStore.setState({settings: {profiles: {active: ARCHIVE_REF, custom: [ARCHIVE, PODCAST], overrides: [], enabledOverrides: {}, order: ['audio-only', 'podcast', 'hd-1080', 'archive']}} as unknown as AppSettings})
			renderStep()
			check('b')
			openToolbarMenu()
			const ids = within(screen.getByTestId('playlist-profile-menu-grid'))
				.getAllByTestId(/^playlist-profile-option-/)
				.map(button => button.dataset.testid?.replace('playlist-profile-option-', ''))
			expect(ids.slice(0, 4)).toEqual(['audio-only', 'podcast', 'hd-1080', 'archive'])
		})

		it('assigns a builtin profile from the end of the menu', () => {
			renderStep()
			check('b')
			pickFromToolbar('audio-only')
			expect(profileCell('b')).toHaveTextContent('Audio only')
			expect(profileCell('a')).toHaveTextContent('Archive 4K')
			expect(profileCell('c')).toHaveTextContent('Archive 4K')
		})

		it('resets the filter to "All" once the filtered profile\'s count drops to zero', () => {
			renderStep()
			pickFromRow('b', 'podcast')
			fireEvent.click(screen.getByTestId('filter-profile-podcast'))
			expect(screen.getAllByTestId(/^profile-row-/)).toHaveLength(1)

			// Its chip disappears with its last row; a filter left on it would
			// strand an empty table with nothing to click back to "All".
			check('b')
			fireEvent.click(screen.getByTestId('playlist-profile-reset'))

			expect(screen.queryByTestId('filter-profile-podcast')).not.toBeInTheDocument()
			expect(screen.getByTestId('filter-profile-all')).toHaveAttribute('aria-pressed', 'true')
			expect(screen.getAllByTestId(/^profile-row-/)).toHaveLength(3)
		})
	})

	describe('row picker', () => {
		it("opens the shared menu from a row's profile and reassigns just that row", () => {
			renderStep()
			check('a')
			openRowMenu('b')
			expect(screen.getByTestId('playlist-row-profile-option-archive')).toHaveAttribute('aria-pressed', 'true')
			fireEvent.click(screen.getByTestId('playlist-row-profile-option-podcast'))

			expect(profileCell('b')).toHaveTextContent('Podcast MP3')
			expect(profileCell('a')).toHaveTextContent('Archive 4K')
			expect(profileCell('c')).toHaveTextContent('Archive 4K')
			// Opening the picker is not a row click: the selection stays as it was.
			expectSelected({a: true, b: false, c: false})
		})

		it('reassigns the whole selection when the row is part of it', () => {
			renderStep()
			check('a')
			check('b')
			pickFromRow('b', 'podcast')
			expect(profileCell('a')).toHaveTextContent('Podcast MP3')
			expect(profileCell('b')).toHaveTextContent('Podcast MP3')
			expect(profileCell('c')).toHaveTextContent('Archive 4K')
		})

		it('edits the profile of the row it was opened from', async () => {
			renderStep()
			pickFromRow('b', 'podcast')
			editFromRowMenu('b', 'Podcast MP3')
			expect(await screen.findByTestId('profiles-editor-dialog')).toBeInTheDocument()
			expect(screen.getByTestId('profiles-editor-name')).toHaveValue('Podcast MP3')
		})
	})

	describe('profile editing', () => {
		it("saves an edited profile without making it the app's active profile", async () => {
			const save = vi.fn(async () => true)
			useAppStore.setState({saveDownloadProfile: save})
			renderStep()
			pickFromRow('b', 'podcast')
			editFromRowMenu('b', 'Podcast MP3')
			fireEvent.click(await screen.findByRole('button', {name: 'Save profile'}))
			// Activating it would move the baseline under every unassigned row.
			await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({id: 'podcast'}), false))
		})

		it('assigns a profile created from the menu to the rows the menu was opened for', async () => {
			const save = vi.fn(async (created: DownloadProfile) => {
				useAppStore.setState((state): Partial<AppState> => {
					const settings = state.settings
					if (!settings) return state
					return {settings: {...settings, profiles: {...settings.profiles, custom: [...settings.profiles.custom, created]}}}
				})
				return true
			})
			useAppStore.setState({saveDownloadProfile: save})
			renderStep()
			check('a')
			check('c')
			openToolbarMenu()
			fireEvent.click(within(screen.getByTestId('playlist-profile-menu-actions')).getByRole('button', {name: 'New profile'}))
			fireEvent.change(await screen.findByTestId('profiles-editor-name'), {target: {value: 'Shorts'}})
			fireEvent.click(screen.getByRole('button', {name: 'Save profile'}))

			await waitFor(() => expect(profileCell('a')).toHaveTextContent('Shorts'))
			expect(profileCell('c')).toHaveTextContent('Shorts')
			expect(profileCell('b')).toHaveTextContent('Archive 4K')
			expect(save).toHaveBeenCalledWith(expect.objectContaining({name: 'Shorts'}), false)
		})

		it('wires the global-destination handler so the editor never shows a dead "Change" button', async () => {
			renderStep()
			editFromRowMenu('b', 'Archive 4K')
			await screen.findByTestId('profiles-editor-dialog')
			expect(screen.getByRole('button', {name: 'Change global destination'})).not.toHaveAttribute('aria-disabled', 'true')
		})

		it('ignores the Delete shortcut while the profile editor dialog is open', async () => {
			// The editor is full of non-text controls isTypingTarget does not
			// recognize, so without a guard the window-scoped shortcut would delete
			// the selection behind the open dialog.
			renderStep()
			check('b')
			editFromRowMenu('b', 'Archive 4K')
			await screen.findByTestId('profiles-editor-dialog')

			fireEvent.keyDown(window, {key: 'Delete'})
			expect(useAppStore.getState().removedPlaylistItemIds).toEqual([])
			expect(screen.getByTestId('profile-row-b')).toBeInTheDocument()
		})

		it('re-labels assigned rows when the profile is edited', () => {
			renderStep()
			pickFromRow('b', 'podcast')
			renameProfile('podcast', 'Podcast 320')
			expect(profileCell('b')).toHaveTextContent('Podcast 320')
		})
	})

	it('removes the row from the context menu, prunes its profile assignment, and shows a restore control', async () => {
		renderStep()
		pickFromRow('b', 'podcast')
		expect(profileCell('b')).toHaveTextContent('Podcast MP3')

		fireEvent.contextMenu(screen.getByTestId('profile-row-b'))
		fireEvent.click(await screen.findByRole('menuitem', {name: /remove \d+ from list/i}))

		expect(screen.queryByTestId('profile-row-b')).not.toBeInTheDocument()
		// Pruned everywhere, not just dropped from the visible rows — an orphaned
		// assignment would silently resurrect on restore.
		expect(useAppStore.getState().removedPlaylistItemIds).toEqual(['b'])
		expect(useAppStore.getState().playlistProfileAssignments).toEqual({})
		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['a', 'c'])
		expect(screen.getByTestId('removed-playlist-items-count')).toHaveTextContent('1 removed')
	})

	it('removes the selected rows with the Delete key', () => {
		renderStep()
		fireEvent.click(screen.getByText('One Last Breath'))

		fireEvent.keyDown(window, {key: 'Delete'})

		expect(screen.queryByTestId('profile-row-b')).not.toBeInTheDocument()
		expect(useAppStore.getState().removedPlaylistItemIds).toEqual(['b'])
	})

	it('does not remove items on Backspace — only Delete', () => {
		// Backspace is a common "go back" reflex with no visible affordance
		// warning it deletes rows on this screen; only Delete is bound, matching
		// StepPlaylistItems.
		renderStep()
		fireEvent.click(screen.getByText('One Last Breath'))

		fireEvent.keyDown(window, {key: 'Backspace'})

		expect(useAppStore.getState().removedPlaylistItemIds).toEqual([])
		expect(screen.getByTestId('profile-row-b')).toBeInTheDocument()
	})

	it('restores the row to this step, re-included, through the Restore button', async () => {
		// removePlaylistItems prunes selectedPlaylistItemIds, and
		// restoreRemovedPlaylistItems must undo that (via removedSelectionIds) or
		// the row can never rejoin `items`, which requires that membership.
		renderStep()
		fireEvent.click(screen.getByText('One Last Breath'))
		fireEvent.contextMenu(screen.getByTestId('profile-row-b'))
		fireEvent.click(await screen.findByRole('menuitem', {name: /remove \d+ from list/i}))
		expect(screen.queryByTestId('profile-row-b')).not.toBeInTheDocument()

		fireEvent.click(screen.getByTestId('restore-removed-playlist-items'))

		expect(useAppStore.getState().removedPlaylistItemIds).toEqual([])
		expect(useAppStore.getState().selectedPlaylistItemIds.slice().sort()).toEqual(['a', 'b', 'c'])
		expect(screen.getByTestId('profile-row-b')).toBeInTheDocument()
		expect(screen.queryByTestId('removed-playlist-items-count')).not.toBeInTheDocument()
	})

	it('shows the empty state and disables Continue once every item is removed', async () => {
		renderStep()
		// Every row selected, so the right-click below acts on all three
		// (openContextMenuForRow keeps a selection it right-clicks into), not just 'a'.
		fireEvent.click(screen.getByTestId('playlist-profile-select-all'))
		fireEvent.contextMenu(screen.getByTestId('profile-row-a'))
		fireEvent.click(await screen.findByRole('menuitem', {name: /remove \d+ from list/i}))

		expect(screen.queryAllByTestId(/^profile-row-/)).toHaveLength(0)
		expect(useAppStore.getState().removedPlaylistItemIds.sort()).toEqual(['a', 'b', 'c'])
		expect(screen.getByTestId('playlist-profile-empty')).toBeInTheDocument()
		expect(screen.getByRole('button', {name: 'Continue'})).toBeDisabled()
		// Restore stays reachable even though the table itself is gone.
		expect(screen.getByTestId('restore-removed-playlist-items')).toBeInTheDocument()
	})

	it('keeps assignments when leaving via Back, so re-entering the mode restores them', () => {
		// Removing one row earns a persistent Restore control with exact undo —
		// discarding every assignment on Back must not get a worse deal: no
		// confirm, no undo, and (unlike removal) no visible sign it happened.
		renderStep()
		pickFromRow('b', 'podcast')
		expect(profileCell('b')).toHaveTextContent('Podcast MP3')

		fireEvent.click(screen.getByRole('button', {name: 'Back'}))

		expect(useAppStore.getState().multiProfileMode).toBe(false)
		expect(useAppStore.getState().playlistProfileAssignments).toEqual({b: PODCAST_REF})
	})
})

const ITEMS_PLAYLIST_ENTRIES: PlaylistEntry[] = [
	{id: 'x', url: 'https://example.com/x', title: 'First video', thumbnail: '', duration: 120, playlistIndex: 0, videoId: 'x'},
	{id: 'y', url: 'https://example.com/y', title: 'Second video', thumbnail: '', duration: 130, playlistIndex: 1, videoId: 'y'}
]

function renderItemsStep({profiles, wizardMode = 'playlist'}: {profiles: DownloadProfile[]; wizardMode?: 'playlist' | 'bulk'}): ReturnType<typeof render> {
	useAppStore.setState({
		...RESET_WIZARD_STATE,
		initialized: true,
		initializing: false,
		settings: {...defaultAppSettings('/downloads'), profiles: {active: ARCHIVE_REF, custom: profiles.filter(p => p.id !== 'balanced'), overrides: [], enabledOverrides: {}}},
		wizardOutputDir: '/downloads',
		wizardStep: 'playlistItems',
		wizardMode,
		wizardExtractor: 'youtube:playlist',
		playlistItems: ITEMS_PLAYLIST_ENTRIES,
		selectedPlaylistItemIds: ITEMS_PLAYLIST_ENTRIES.map(entry => entry.id),
		playlistTitle: 'Playlist',
		playlistSelection: {kind: 'video', tier: 'best', codec: 'best'},
		queue: []
	} satisfies Partial<AppState>)
	// Controls the exact catalog size the gating check under test sees — see
	// the module-level `vi.mock` comment above for why this can't be done by
	// shaping `settings.profiles` alone. Deliberately mockReturnValueOnce, not
	// mockReturnValue: this file's beforeEach blocks only call
	// vi.clearAllMocks(), which clears call history but NOT a configured
	// mockReturnValue — a persistent stub here would leak into every later
	// test in the file (proven by running the suite: multiProfileBreakdown's
	// "resolves each row destination..." test starts failing once this is a
	// standing mockReturnValue, since it relies on the real, unmocked catalog).
	vi.mocked(downloadProfilesModule.enabledDownloadProfiles).mockReturnValueOnce(profiles)
	return render(<StepPlaylistItems />)
}

describe('StepPlaylistItems multi-profile entry', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		window.platform = 'linux'
		window.appApi = buildMockAppApi()
	})

	it('offers the entry button only when two or more profiles exist', () => {
		renderItemsStep({profiles: [ARCHIVE]})
		expect(screen.queryByTestId('enter-multi-profile')).not.toBeInTheDocument()
		cleanup()

		renderItemsStep({profiles: [ARCHIVE, PODCAST]})
		expect(screen.getByTestId('enter-multi-profile')).toBeInTheDocument()
	})

	it('hides the entry button when only one profile is enabled', () => {
		const disabledPodcast = {...PODCAST, enabled: false}
		// Production filters disabled profiles before counting; simulate that
		// by returning only the enabled entry from the mocked helper.
		vi.mocked(downloadProfilesModule.enabledDownloadProfiles).mockReturnValueOnce([ARCHIVE])
		useAppStore.setState({
			...RESET_WIZARD_STATE,
			initialized: true,
			initializing: false,
			settings: {...defaultAppSettings('/downloads'), profiles: {active: ARCHIVE_REF, custom: [ARCHIVE, disabledPodcast], overrides: [], enabledOverrides: {}}},
			wizardOutputDir: '/downloads',
			wizardStep: 'playlistItems',
			wizardMode: 'playlist',
			wizardExtractor: 'youtube:playlist',
			playlistItems: ITEMS_PLAYLIST_ENTRIES,
			selectedPlaylistItemIds: ITEMS_PLAYLIST_ENTRIES.map(entry => entry.id),
			playlistTitle: 'Playlist',
			playlistSelection: {kind: 'video', tier: 'best', codec: 'best'},
			queue: []
		} satisfies Partial<AppState>)
		render(<StepPlaylistItems />)
		expect(screen.queryByTestId('enter-multi-profile')).not.toBeInTheDocument()
	})

	it('enters multi-profile mode when clicked', () => {
		renderItemsStep({profiles: [ARCHIVE, PODCAST]})

		fireEvent.click(screen.getByTestId('enter-multi-profile'))

		expect(useAppStore.getState().multiProfileMode).toBe(true)
		expect(useAppStore.getState().wizardStep).toBe('playlistProfiles')
	})

	it('disables the entry button when nothing is selected, matching Continue', () => {
		renderItemsStep({profiles: [ARCHIVE, PODCAST]})
		fireEvent.click(screen.getByText('Select none'))

		expect(screen.getByTestId('enter-multi-profile')).toBeDisabled()
	})

	it('is also reachable in bulk-URL wizard mode, not just playlist mode', () => {
		// The footer button isn't gated on wizardMode at all — bulk mode populates
		// the same playlistItems/selectedPlaylistItemIds shape a playlist probe
		// does, and the playlistProfiles step doesn't care which mode got it there.
		renderItemsStep({profiles: [ARCHIVE, PODCAST], wizardMode: 'bulk'})

		expect(screen.getByTestId('enter-multi-profile')).toBeInTheDocument()
		fireEvent.click(screen.getByTestId('enter-multi-profile'))
		expect(useAppStore.getState().multiProfileMode).toBe(true)
	})
})

describe('StepPlaylistItems remove and restore', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		window.platform = 'linux'
		window.appApi = buildMockAppApi()
	})

	it('removes an unchecked row via the context menu without touching the rest of the selection', async () => {
		renderItemsStep({profiles: [ARCHIVE, PODCAST]})
		fireEvent.click(screen.getByTestId('playlist-item-row-y'))
		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['x'])

		fireEvent.contextMenu(screen.getByTestId('playlist-item-row-y'))
		fireEvent.click(await screen.findByRole('menuitem', {name: /remove \d+ from list/i}))

		expect(screen.queryByTestId('playlist-item-row-y')).not.toBeInTheDocument()
		expect(screen.getByTestId('playlist-item-row-x')).toBeInTheDocument()
		expect(useAppStore.getState().removedPlaylistItemIds).toEqual(['y'])
		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['x'])
		expect(screen.getByTestId('removed-playlist-items-count')).toHaveTextContent('1 removed')
	})

	it('removes the whole checked set when right-clicking a checked row', async () => {
		renderItemsStep({profiles: [ARCHIVE, PODCAST]})

		fireEvent.contextMenu(screen.getByTestId('playlist-item-row-x'))
		fireEvent.click(await screen.findByRole('menuitem', {name: /remove \d+ from list/i}))

		expect(screen.queryAllByTestId(/^playlist-item-row-/)).toHaveLength(0)
		expect(useAppStore.getState().removedPlaylistItemIds.slice().sort()).toEqual(['x', 'y'])
	})

	it('removes the checked items with the Delete key, but not while typing in the range inputs', () => {
		renderItemsStep({profiles: [ARCHIVE, PODCAST]})

		fireEvent.keyDown(screen.getByPlaceholderText('1'), {key: 'Delete'})
		expect(useAppStore.getState().removedPlaylistItemIds).toEqual([])

		fireEvent.keyDown(window, {key: 'Delete'})
		expect(useAppStore.getState().removedPlaylistItemIds.slice().sort()).toEqual(['x', 'y'])
	})

	it('does not remove items on Backspace — only Delete (I5)', () => {
		// Backspace is a common "go back" reflex with no visible affordance
		// warning it deletes rows on this screen; only Delete is bound.
		renderItemsStep({profiles: [ARCHIVE, PODCAST]})

		fireEvent.keyDown(window, {key: 'Backspace'})

		expect(useAppStore.getState().removedPlaylistItemIds).toEqual([])
		expect(screen.getByTestId('playlist-item-row-x')).toBeInTheDocument()
		expect(screen.getByTestId('playlist-item-row-y')).toBeInTheDocument()
	})

	it('states the count being removed in the context-menu label (I5)', async () => {
		// Both x and y are checked by default, so right-clicking the checked row
		// x acts on the whole checked set (2), not just the row clicked — the
		// label must say so instead of a bare "Remove from list".
		renderItemsStep({profiles: [ARCHIVE, PODCAST]})

		fireEvent.contextMenu(screen.getByTestId('playlist-item-row-x'))
		expect(await screen.findByRole('menuitem', {name: 'Remove 2 from list'})).toBeInTheDocument()
	})

	it('restores removed items via the Restore button, re-checked', async () => {
		renderItemsStep({profiles: [ARCHIVE, PODCAST]})
		fireEvent.contextMenu(screen.getByTestId('playlist-item-row-x'))
		fireEvent.click(await screen.findByRole('menuitem', {name: /remove \d+ from list/i}))
		expect(screen.queryAllByTestId(/^playlist-item-row-/)).toHaveLength(0)

		fireEvent.click(screen.getByTestId('restore-removed-playlist-items'))

		expect(useAppStore.getState().removedPlaylistItemIds).toEqual([])
		expect(useAppStore.getState().selectedPlaylistItemIds.slice().sort()).toEqual(['x', 'y'])
		expect(screen.getByTestId('playlist-item-row-x')).toHaveAttribute('aria-checked', 'true')
		expect(screen.getByTestId('playlist-item-row-y')).toHaveAttribute('aria-checked', 'true')
	})

	it('restores a removed row unchecked when it was unchecked at the moment it was removed', async () => {
		// This is the regression option (b) exists to prevent: re-adding *every*
		// removed id to the selection would silently check a row the user had
		// deliberately left unchecked before removing it.
		renderItemsStep({profiles: [ARCHIVE, PODCAST]})
		fireEvent.click(screen.getByTestId('playlist-item-row-y'))
		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['x'])

		fireEvent.contextMenu(screen.getByTestId('playlist-item-row-y'))
		fireEvent.click(await screen.findByRole('menuitem', {name: /remove \d+ from list/i}))
		expect(screen.queryByTestId('playlist-item-row-y')).not.toBeInTheDocument()

		fireEvent.click(screen.getByTestId('restore-removed-playlist-items'))

		expect(useAppStore.getState().removedPlaylistItemIds).toEqual([])
		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['x'])
		expect(screen.getByTestId('playlist-item-row-y')).toBeInTheDocument()
		expect(screen.getByTestId('playlist-item-row-y')).toHaveAttribute('aria-checked', 'false')
	})

	it('shows the empty state and disables Continue once every item is removed', async () => {
		renderItemsStep({profiles: [ARCHIVE, PODCAST]})
		fireEvent.contextMenu(screen.getByTestId('playlist-item-row-x'))
		fireEvent.click(await screen.findByRole('menuitem', {name: /remove \d+ from list/i}))

		expect(screen.getByTestId('playlist-items-empty')).toBeInTheDocument()
		expect(screen.getByRole('button', {name: 'Continue'})).toBeDisabled()
		expect(screen.getByTestId('restore-removed-playlist-items')).toBeInTheDocument()
	})
})

function multiProfileState(overrides: Partial<AppState> = {}): AppState {
	return {
		wizardOutputDir: '/downloads',
		playlistItems: [],
		selectedPlaylistItemIds: [],
		removedPlaylistItemIds: [],
		playlistProfileAssignments: {},
		settings: {...defaultAppSettings('/downloads'), profiles: {active: ARCHIVE_REF, custom: [ARCHIVE, PODCAST], overrides: [], enabledOverrides: {}}},
		...overrides
	} as AppState
}

describe('multiProfileBreakdown', () => {
	it('groups the confirm summary by profile, in the saved profile order', () => {
		const assigned = {playlistItems: ITEMS_PLAYLIST_ENTRIES, selectedPlaylistItemIds: ['x', 'y'], playlistProfileAssignments: {y: PODCAST_REF}}
		expect(multiProfileBreakdown(multiProfileState(assigned)).map(row => [row.name, row.count])).toEqual([
			['Archive 4K', 1],
			['Podcast MP3', 1]
		])

		const reordered = multiProfileState({...assigned, settings: {...defaultAppSettings('/downloads'), profiles: {active: ARCHIVE_REF, custom: [ARCHIVE, PODCAST], overrides: [], enabledOverrides: {}, order: ['podcast', 'archive']}}})
		expect(multiProfileBreakdown(reordered).map(row => [row.name, row.count])).toEqual([
			['Podcast MP3', 1],
			['Archive 4K', 1]
		])
	})

	it('excludes profiles nothing was assigned to', () => {
		const rows = multiProfileBreakdown(multiProfileState({playlistItems: ITEMS_PLAYLIST_ENTRIES, selectedPlaylistItemIds: ['x', 'y'], playlistProfileAssignments: {}}))

		expect(rows).toHaveLength(1)
		expect(rows[0]?.name).toBe('Archive 4K')
		expect(rows[0]?.count).toBe(2)
	})

	it('excludes removed items from the counts', () => {
		const rows = multiProfileBreakdown(multiProfileState({playlistItems: ITEMS_PLAYLIST_ENTRIES, selectedPlaylistItemIds: ['x', 'y'], removedPlaylistItemIds: ['y'], playlistProfileAssignments: {y: PODCAST_REF}}))

		expect(rows.map(row => [row.name, row.count])).toEqual([['Archive 4K', 1]])
	})

	it("resolves each row destination from that profile's own fixed output dir, not the wizard default", () => {
		// ARCHIVE/PODCAST as defined above both use output.kind 'default', which
		// would collapse to the same shared dir and make this assertion trivially
		// true. Give each a distinct fixed dir so the test actually proves
		// per-profile resolution rather than both rows echoing wizardOutputDir.
		const archiveFixed: DownloadProfile = {...ARCHIVE, output: {kind: 'fixed', dir: '/downloads/archive'}}
		const podcastFixed: DownloadProfile = {...PODCAST, output: {kind: 'fixed', dir: '/downloads/podcast'}}
		const rows = multiProfileBreakdown(
			multiProfileState({playlistItems: ITEMS_PLAYLIST_ENTRIES, selectedPlaylistItemIds: ['x', 'y'], playlistProfileAssignments: {y: PODCAST_REF}, settings: {...defaultAppSettings('/downloads'), profiles: {active: ARCHIVE_REF, custom: [archiveFixed, podcastFixed], overrides: [], enabledOverrides: {}}}})
		)

		const archiveRow = rows.find(row => row.profileId === 'archive')
		const podcastRow = rows.find(row => row.profileId === 'podcast')
		expect(archiveRow?.outputDir).toBe('/downloads/archive')
		expect(podcastRow?.outputDir).toBe('/downloads/podcast')
	})
})

// A row keeps a profile hidden after it was assigned (and downloads with it),
// so every picker on the step still shows that profile, first, tagged Hidden.
describe('StepPlaylistProfiles with a profile hidden after it was assigned', () => {
	function hidePodcast(): void {
		act(() => {
			useAppStore.setState((state): Partial<AppState> => {
				const settings = state.settings
				if (!settings) return state
				return {settings: {...settings, profiles: {...settings.profiles, custom: settings.profiles.custom.map(candidate => (candidate.id === 'podcast' ? {...candidate, enabled: false} : candidate))}}}
			})
		})
	}

	it('keeps the row on the hidden profile, with its filter chip', () => {
		renderStep()
		pickFromRow('b', 'podcast')
		hidePodcast()

		expect(profileCell('b')).toHaveTextContent('Podcast MP3')
		expect(screen.getByTestId('filter-profile-podcast')).toHaveTextContent(/Podcast MP3/i)
	})

	it("lists the hidden profile first in the row's menu, checked and tagged Hidden", () => {
		renderStep()
		pickFromRow('b', 'podcast')
		hidePodcast()
		openRowMenu('b')

		const [first] = within(screen.getByTestId('playlist-row-profile-menu-grid')).getAllByTestId(/^playlist-row-profile-option-/)
		expect(first).toHaveAttribute('data-testid', 'playlist-row-profile-option-podcast')
		expect(first).toHaveAttribute('aria-pressed', 'true')
		expect(first).toHaveTextContent('Hidden')
	})

	it('offers the hidden profile first in the right-click menu, checked, and assigns from it', async () => {
		renderStep()
		pickFromRow('b', 'podcast')
		hidePodcast()
		fireEvent.contextMenu(screen.getByTestId('profile-row-b'))

		const radios = await screen.findAllByRole('menuitemradio')
		expect(radios[0]).toHaveTextContent(/^Podcast MP3Hidden/)
		expect(radios[0]).toHaveAttribute('aria-checked', 'true')
		expect(radios.filter(radio => radio.getAttribute('aria-checked') === 'true')).toHaveLength(1)

		const archive = radios.find(radio => radio.textContent?.startsWith('Archive 4K'))
		if (!archive) throw new Error('expected an Archive 4K item')
		fireEvent.click(archive)
		await waitFor(() => expect(profileCell('b')).toHaveTextContent('Archive 4K'))
	})
})
