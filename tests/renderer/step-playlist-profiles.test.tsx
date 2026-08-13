// @vitest-environment jsdom
import {act, cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import type {AppSettings, DownloadProfile, DownloadProfileRef, PlaylistEntry} from '@shared/types.js'
import * as downloadProfilesModule from '@shared/downloadProfiles.js'
import {defaultAppSettings} from '@shared/constants.js'
import {ok} from '@shared/result.js'
import type {AppState} from '@renderer/store/types.js'
import {StepPlaylistItems} from '@renderer/components/wizard/StepPlaylistItems.js'
import {StepPlaylistProfiles} from '@renderer/components/wizard/StepPlaylistProfiles.js'
import {multiProfileBreakdown} from '@renderer/store/wizard/downloadReviewProjection.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// Entry-button gating uses the real `allDownloadProfiles` in production, but
// that helper always prepends the 10 real builtins — so the catalog it
// returns can never actually drop below 2. Wrapping it in a passthrough spy
// lets the gating-boundary test below control exactly what the component
// sees (1 vs 2 profiles) without touching how `StepPlaylistProfiles`'s tests
// further down exercise the real, unmodified catalog.
vi.mock('@shared/downloadProfiles.js', async importOriginal => {
	const actual = await importOriginal<typeof import('@shared/downloadProfiles.js')>()
	return {...actual, allDownloadProfiles: vi.fn(actual.allDownloadProfiles)}
})

function profile(id: string, name: string, icon: DownloadProfile['icon']): DownloadProfile {
	return {
		id,
		name,
		icon,
		media: {kind: 'video-audio', codec: 'best', tiers: ['1080'], audio: {format: 'best'}},
		subtitles: {enabled: false, languages: [], source: 'manual-first', mode: 'sidecar', format: 'srt'},
		output: {kind: 'default'},
		filename: {kind: 'default'},
		subfolder: {enabled: false, name: ''},
		sponsorBlock: {mode: 'off', categories: []},
		embed: {chapters: true, metadata: true, thumbnail: false, description: false, thumbnailSidecar: false},
		createdAt: '2026-08-12T00:00:00.000Z',
		updatedAt: '2026-08-12T00:00:00.000Z'
	} as DownloadProfile
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
		useAppStore.setState(state => {
			const profiles = state.settings?.profiles
			if (!profiles) return state
			return {settings: {...state.settings, profiles: {...profiles, custom: profiles.custom.map(candidate => (candidate.id === id ? {...candidate, name} : candidate))}}} as never
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

// The real catalog + downloadProfileActions model is used everywhere below —
// no mock. With the screen's baseline-then-custom-then-builtin ordering
// (playlistProfileOrder.ts), the two custom fixture profiles below sort to
// the front of the action bar, so the click-based tests reach them directly
// without needing to open "More…". The one test that specifically covers the
// overflow branch (further down) forces a builtin id, 'audio-only', past the
// eight visible slots and asserts it's reachable through the popover.
function renderStep(overrides: {common?: Partial<AppSettings['common']>} = {}): ReturnType<typeof render> {
	if (overrides.common) {
		useAppStore.setState(state => ({settings: {...state.settings, common: {...state.settings?.common, ...overrides.common}}}) as never)
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
		settings: {profiles: {active: ARCHIVE_REF, custom: [ARCHIVE, PODCAST], overrides: []}}
	} as never)
})

describe('StepPlaylistProfiles', () => {
	it('starts every item on the active profile', () => {
		renderStep()
		expect(screen.getAllByText('Archive 4K')).toHaveLength(3)
	})

	it('assigns the clicked profile to the selected rows', () => {
		renderStep()
		fireEvent.click(screen.getByText('One Last Breath'))
		fireEvent.click(screen.getByTestId('assign-profile-podcast'))
		expect(within(screen.getByTestId('profile-row-b')).getByText('Podcast MP3')).toBeInTheDocument()
	})

	it('extends the selection with shift-click before assigning', () => {
		renderStep()
		fireEvent.click(screen.getByText('Under my Spell'))
		fireEvent.click(screen.getByText('Burn the Witch'), {shiftKey: true})
		fireEvent.click(screen.getByTestId('assign-profile-podcast'))
		expect(screen.getAllByText('Podcast MP3')).toHaveLength(3)
	})

	it('filters rows by profile without changing assignments', () => {
		renderStep()
		fireEvent.click(screen.getByText('One Last Breath'))
		fireEvent.click(screen.getByTestId('assign-profile-podcast'))
		fireEvent.click(screen.getByTestId('filter-profile-podcast'))
		expect(screen.getAllByTestId(/^profile-row-/)).toHaveLength(1)
	})

	it('puts the baseline and custom profiles ahead of builtins in the visible action bar', () => {
		renderStep()
		// The action bar is disabled with nothing selected; select a row so the
		// buttons (including "More…") are interactive.
		fireEvent.click(screen.getByText('One Last Breath'))

		// `allDownloadProfiles` (and so the unordered catalog model) returns all
		// 10 builtins before either custom profile — under that order "archive"
		// and "podcast" would sit at slots 10-11, past the action bar's 8 visible
		// slots, and these testids would only exist once "More…" is opened. This
		// asserts they're reachable directly, proving the screen re-sorts to
		// baseline-then-custom-then-builtin instead of using catalog order as-is.
		const bar = within(screen.getByTestId('playlist-profile-actions'))
		expect(bar.getByTestId('assign-profile-archive')).toBeInTheDocument()
		expect(bar.getByTestId('assign-profile-podcast')).toBeInTheDocument()

		// And a builtin — 'audio-only', the likeliest pick this reordering exists
		// to surface — is pushed out to the overflow instead, since the two
		// customs now occupy two of the eight visible slots.
		expect(screen.queryByTestId('assign-profile-audio-only')).not.toBeInTheDocument()
		fireEvent.click(screen.getByTestId('playlist-profile-more'))
		expect(screen.getByTestId('assign-profile-audio-only')).toBeInTheDocument()
	})

	it('assigns a builtin profile reached through the "More…" overflow popover', () => {
		renderStep()
		fireEvent.click(screen.getByText('One Last Breath'))
		fireEvent.click(screen.getByTestId('playlist-profile-more'))
		fireEvent.click(screen.getByTestId('assign-profile-audio-only'))

		expect(within(screen.getByTestId('profile-row-b')).getByText('Audio only')).toBeInTheDocument()
		// Untouched rows keep the baseline profile.
		expect(within(screen.getByTestId('profile-row-a')).getByText('Archive 4K')).toBeInTheDocument()
		expect(within(screen.getByTestId('profile-row-c')).getByText('Archive 4K')).toBeInTheDocument()
	})

	it('Ctrl/Cmd+A selects only the currently filtered rows, not every item', () => {
		renderStep()
		// Move 'b' onto Podcast first so the "archive" filter chip narrows to just
		// 'a' and 'c' — and so 'b' ends up on a *third*, distinct profile from the
		// one the filtered bulk-assign below applies. If Ctrl+A incorrectly
		// selected every row instead of only the filtered ones, 'b' would also
		// flip to that third profile and the final assertion on 'b' would fail.
		fireEvent.click(screen.getByText('One Last Breath'))
		fireEvent.click(screen.getByTestId('assign-profile-podcast'))
		fireEvent.click(screen.getByTestId('filter-profile-archive'))
		expect(screen.getAllByTestId(/^profile-row-/)).toHaveLength(2)

		fireEvent.keyDown(window, {key: 'a', code: 'KeyA', ctrlKey: true})
		fireEvent.click(screen.getByTestId('assign-profile-best-quality'))

		// Switch back to the unfiltered view to inspect every row: 'a' and 'c'
		// were selected by Ctrl+A (visible under the "archive" filter) and should
		// have moved to "Best available"; 'b' was filtered out of view and must
		// keep "Podcast MP3" untouched.
		fireEvent.click(screen.getByTestId('filter-profile-all'))
		expect(within(screen.getByTestId('profile-row-a')).getByText('Best available')).toBeInTheDocument()
		expect(within(screen.getByTestId('profile-row-c')).getByText('Best available')).toBeInTheDocument()
		expect(within(screen.getByTestId('profile-row-b')).getByText('Podcast MP3')).toBeInTheDocument()
	})

	it('shows the hint until it is dismissed, and persists the dismissal', async () => {
		renderStep()
		expect(screen.getByTestId('multi-profile-hint')).toBeInTheDocument()

		// The default mock echoes back a fixed settings snapshot regardless of
		// what was patched in. Make it merge the patch instead, the way the real
		// main-process settings store does — otherwise the final `set({settings:
		// result.data})` in applyCommonPatchAsync would clobber the optimistic
		// dismissal and the alert would reappear once the promise resolves.
		vi.mocked(window.appApi.settings.update).mockImplementation(async patch => {
			const current = useAppStore.getState().settings
			return ok({...current, common: {...current?.common, ...patch.common}} as AppSettings)
		})

		fireEvent.click(within(screen.getByTestId('multi-profile-hint')).getByRole('button', {name: /close/i}))
		// The dismiss action is async (settings.update round-trip) — flush it
		// before asserting so the eventual unmount has actually happened.
		await waitFor(() => expect(screen.queryByTestId('multi-profile-hint')).not.toBeInTheDocument())

		// Not just a local dismiss — this must survive app restarts (see task
		// brief), so assert the persisted store action actually fired rather than
		// only that the alert unmounted, which a plain useState toggle would also
		// satisfy.
		expect(window.appApi.settings.update).toHaveBeenCalledWith(expect.objectContaining({common: expect.objectContaining({multiProfileHintDismissed: true})}))
	})

	it('stays hidden when already dismissed in settings', () => {
		renderStep({common: {multiProfileHintDismissed: true}})
		expect(screen.queryByTestId('multi-profile-hint')).not.toBeInTheDocument()
	})

	it('opens the profile editor from the action bar', async () => {
		renderStep()
		fireEvent.click(screen.getByTestId('edit-profile-podcast'))
		expect(await screen.findByTestId('profiles-editor-dialog')).toBeInTheDocument()
	})

	it('wires the global-destination handler so the editor never shows a dead "Change" button', async () => {
		// DownloadProfileEditor always renders the "Change global destination"
		// button and only `disabled`s it when `onChangeGlobalDestination` is
		// missing — unlike `resetProfile`, which is conditionally rendered. This
		// step is the first call site in the app to open the editor at all, so
		// nothing previously exercised the case of that prop being left out.
		renderStep()
		fireEvent.click(screen.getByTestId('edit-profile-podcast'))
		await screen.findByTestId('profiles-editor-dialog')
		expect(screen.getByRole('button', {name: 'Change global destination'})).toBeEnabled()
	})

	it('does not reassign the selection when the pencil is clicked', () => {
		renderStep()
		// Select a row first so the action bar's assign buttons are live — this is
		// the exact state in which a bubbled click would silently reassign 'b'.
		fireEvent.click(screen.getByText('One Last Breath'))
		fireEvent.click(screen.getByTestId('edit-profile-podcast'))

		// The editor opened (proven by the previous test); the point here is what
		// did NOT happen: the selected row must still be on the baseline profile,
		// not the one whose pencil was clicked.
		expect(within(screen.getByTestId('profile-row-b')).getByText('Archive 4K')).toBeInTheDocument()
	})

	it('re-labels assigned rows when the profile is edited', () => {
		renderStep()
		fireEvent.click(screen.getByText('One Last Breath'))
		fireEvent.click(screen.getByTestId('assign-profile-podcast'))
		renameProfile('podcast', 'Podcast 320')
		expect(within(screen.getByTestId('profile-row-b')).getByText('Podcast 320')).toBeInTheDocument()
	})

	it('removes the row from the context menu, prunes its profile assignment, and shows a restore control', async () => {
		renderStep()
		fireEvent.click(screen.getByText('One Last Breath'))
		fireEvent.click(screen.getByTestId('assign-profile-podcast'))
		expect(within(screen.getByTestId('profile-row-b')).getByText('Podcast MP3')).toBeInTheDocument()

		fireEvent.contextMenu(screen.getByTestId('profile-row-b'))
		fireEvent.click(await screen.findByRole('menuitem', {name: /remove from list/i}))

		expect(screen.queryByTestId('profile-row-b')).not.toBeInTheDocument()
		// Pruned everywhere, not just dropped from the visible rows — an orphaned
		// assignment would silently resurrect on restore.
		expect(useAppStore.getState().removedPlaylistItemIds).toEqual(['b'])
		expect(useAppStore.getState().playlistProfileAssignments).toEqual({})
		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['a', 'c'])
		expect(screen.getByTestId('removed-playlist-items-count')).toHaveTextContent('1 removed')
	})

	it('removes the highlighted rows with the Delete key', () => {
		renderStep()
		fireEvent.click(screen.getByText('One Last Breath'))

		fireEvent.keyDown(window, {key: 'Delete'})

		expect(screen.queryByTestId('profile-row-b')).not.toBeInTheDocument()
		expect(useAppStore.getState().removedPlaylistItemIds).toEqual(['b'])
	})

	it('clears removedPlaylistItemIds and hides the restore control, though the row only rejoins this step via the items step', async () => {
		// This step has no checkbox — removePlaylistItems also prunes
		// selectedPlaylistItemIds (Task 11 requirement), and restore only
		// resets removedPlaylistItemIds, so a row removed here can't rejoin
		// `items` (which requires selectedPlaylistItemIds membership) without a
		// trip back to the items step to re-check it. Restore's job here is
		// only to stop counting it as "removed" and retire the toolbar control.
		renderStep()
		fireEvent.click(screen.getByText('One Last Breath'))
		fireEvent.contextMenu(screen.getByTestId('profile-row-b'))
		fireEvent.click(await screen.findByRole('menuitem', {name: /remove from list/i}))
		expect(screen.queryByTestId('profile-row-b')).not.toBeInTheDocument()

		fireEvent.click(screen.getByTestId('restore-removed-playlist-items'))

		expect(useAppStore.getState().removedPlaylistItemIds).toEqual([])
		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['a', 'c'])
		expect(screen.queryByTestId('profile-row-b')).not.toBeInTheDocument()
		expect(screen.queryByTestId('removed-playlist-items-count')).not.toBeInTheDocument()
	})

	it('shows the empty state and disables Continue once every item is removed', async () => {
		renderStep()
		// Ctrl+A highlights every row, so the right-click below acts on all three
		// (openContextMenuForRow keeps a selection it right-clicks into), not just 'a'.
		fireEvent.keyDown(window, {key: 'a', code: 'KeyA', ctrlKey: true})
		fireEvent.contextMenu(screen.getByTestId('profile-row-a'))
		fireEvent.click(await screen.findByRole('menuitem', {name: /remove from list/i}))

		expect(screen.queryByTestId(/^profile-row-/)).not.toBeInTheDocument()
		expect(useAppStore.getState().removedPlaylistItemIds.sort()).toEqual(['a', 'b', 'c'])
		expect(screen.getByTestId('playlist-profile-empty')).toBeInTheDocument()
		expect(screen.getByRole('button', {name: 'Continue'})).toBeDisabled()
		// Restore stays reachable even though the table itself is gone.
		expect(screen.getByTestId('restore-removed-playlist-items')).toBeInTheDocument()
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
		settings: {...defaultAppSettings('/downloads'), profiles: {active: ARCHIVE_REF, custom: profiles.filter(p => p.id !== 'balanced'), overrides: []}},
		wizardOutputDir: '/downloads',
		wizardStep: 'playlistItems',
		wizardMode,
		wizardExtractor: 'youtube:playlist',
		playlistItems: ITEMS_PLAYLIST_ENTRIES,
		selectedPlaylistItemIds: ITEMS_PLAYLIST_ENTRIES.map(entry => entry.id),
		playlistTitle: 'Playlist',
		playlistSelection: {kind: 'video', tier: 'best', codec: 'best'},
		queue: []
	} as never)
	// Controls the exact catalog size the gating check under test sees — see
	// the module-level `vi.mock` comment above for why this can't be done by
	// shaping `settings.profiles` alone.
	vi.mocked(downloadProfilesModule.allDownloadProfiles).mockReturnValueOnce(profiles)
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
		fireEvent.click(await screen.findByRole('menuitem', {name: /remove from list/i}))

		expect(screen.queryByTestId('playlist-item-row-y')).not.toBeInTheDocument()
		expect(screen.getByTestId('playlist-item-row-x')).toBeInTheDocument()
		expect(useAppStore.getState().removedPlaylistItemIds).toEqual(['y'])
		expect(useAppStore.getState().selectedPlaylistItemIds).toEqual(['x'])
		expect(screen.getByTestId('removed-playlist-items-count')).toHaveTextContent('1 removed')
	})

	it('removes the whole checked set when right-clicking a checked row', async () => {
		renderItemsStep({profiles: [ARCHIVE, PODCAST]})

		fireEvent.contextMenu(screen.getByTestId('playlist-item-row-x'))
		fireEvent.click(await screen.findByRole('menuitem', {name: /remove from list/i}))

		expect(screen.queryByTestId(/^playlist-item-row-/)).not.toBeInTheDocument()
		expect(useAppStore.getState().removedPlaylistItemIds.slice().sort()).toEqual(['x', 'y'])
	})

	it('removes the checked items with the Delete key, but not while typing in the range inputs', () => {
		renderItemsStep({profiles: [ARCHIVE, PODCAST]})

		fireEvent.keyDown(screen.getByPlaceholderText('1'), {key: 'Delete'})
		expect(useAppStore.getState().removedPlaylistItemIds).toEqual([])

		fireEvent.keyDown(window, {key: 'Delete'})
		expect(useAppStore.getState().removedPlaylistItemIds.slice().sort()).toEqual(['x', 'y'])
	})

	it('restores removed items via the Restore button', async () => {
		renderItemsStep({profiles: [ARCHIVE, PODCAST]})
		fireEvent.contextMenu(screen.getByTestId('playlist-item-row-x'))
		fireEvent.click(await screen.findByRole('menuitem', {name: /remove from list/i}))
		expect(screen.queryByTestId(/^playlist-item-row-/)).not.toBeInTheDocument()

		fireEvent.click(screen.getByTestId('restore-removed-playlist-items'))

		expect(useAppStore.getState().removedPlaylistItemIds).toEqual([])
		expect(screen.getByTestId('playlist-item-row-x')).toBeInTheDocument()
		expect(screen.getByTestId('playlist-item-row-y')).toBeInTheDocument()
	})

	it('shows the empty state and disables Continue once every item is removed', async () => {
		renderItemsStep({profiles: [ARCHIVE, PODCAST]})
		fireEvent.contextMenu(screen.getByTestId('playlist-item-row-x'))
		fireEvent.click(await screen.findByRole('menuitem', {name: /remove from list/i}))

		expect(screen.getByTestId('playlist-items-empty')).toBeInTheDocument()
		expect(screen.getByRole('button', {name: 'Continue'})).toBeDisabled()
		expect(screen.getByTestId('restore-removed-playlist-items')).toBeInTheDocument()
	})
})

function multiProfileState(overrides: Partial<AppState> = {}): AppState {
	return {wizardOutputDir: '/downloads', playlistItems: [], selectedPlaylistItemIds: [], removedPlaylistItemIds: [], playlistProfileAssignments: {}, settings: {...defaultAppSettings('/downloads'), profiles: {active: ARCHIVE_REF, custom: [ARCHIVE, PODCAST], overrides: []}}, ...overrides} as AppState
}

describe('multiProfileBreakdown', () => {
	it('groups the confirm summary by profile, ordered baseline-then-custom-then-builtin', () => {
		const rows = multiProfileBreakdown(multiProfileState({playlistItems: ITEMS_PLAYLIST_ENTRIES, selectedPlaylistItemIds: ['x', 'y'], playlistProfileAssignments: {y: PODCAST_REF}}))

		// Pinned order AND both names+counts: under raw catalog order (10
		// builtins first, customs last) this would come back empty for the
		// custom profiles used here, or in the wrong order — proving the
		// breakdown reuses playlistProfileOrder.ts rather than catalog order.
		expect(rows.map(row => [row.name, row.count])).toEqual([
			['Archive 4K', 1],
			['Podcast MP3', 1]
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
		const rows = multiProfileBreakdown(multiProfileState({playlistItems: ITEMS_PLAYLIST_ENTRIES, selectedPlaylistItemIds: ['x', 'y'], playlistProfileAssignments: {y: PODCAST_REF}, settings: {...defaultAppSettings('/downloads'), profiles: {active: ARCHIVE_REF, custom: [archiveFixed, podcastFixed], overrides: []}}}))

		const archiveRow = rows.find(row => row.profileId === 'archive')
		const podcastRow = rows.find(row => row.profileId === 'podcast')
		expect(archiveRow?.outputDir).toBe('/downloads/archive')
		expect(podcastRow?.outputDir).toBe('/downloads/podcast')
	})
})
