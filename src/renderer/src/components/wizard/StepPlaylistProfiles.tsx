// The playlist-profiles step: assign a different DownloadProfile to individual
// playlist items instead of downloading the batch as one homogeneous run.
// Deliberately mirrors QueueManagerTab's three zones — action bar, filter
// chips, virtualized table — so a user reaches for the same gestures they
// already know from the Downloads tab. Chips filter; the toolbar, each row's
// profile button and the row context menu assign. The first two open the same
// profile menu as the URL tab, Edit and New included.

import {useCallback, useEffect, useEffectEvent, useMemo, useReducer, useRef, useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'
import {useTable} from '@tanstack/react-table'
import {useVirtualizer} from '@tanstack/react-virtual'
import {allDownloadProfiles, downloadProfileRefFor} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfileRef, PlaylistEntry} from '@shared/types.js'
import {useAppStore} from '../../store/useAppStore.js'
import type {ListSelectionAction} from '../shared/listSelection.js'
import {useRowSelectionInteractions} from '../shared/useRowSelectionInteractions.js'
import {isTypingTarget} from '../shared/isTypingTarget.js'
import {Button} from '../ui/button.js'
import {createPopoverHandle} from '../ui/popover.js'
import {Empty, EmptyDescription, EmptyHeader, EmptyTitle} from '../ui/empty.js'
import {buildDownloadProfileActionModel} from './downloadProfileActions.js'
import {DownloadProfileEditor} from './DownloadProfileEditor.js'
import {profileAssignmentCounts, resolveAssignedProfile} from '../../store/wizard/playlistProfileAssignments.js'
import {createPlaylistProfileTableState, playlistProfileTableReducer} from './playlistProfileTableState.js'
import {PLAYLIST_PROFILE_COLUMNS} from './playlistProfileColumns.js'
import {PlaylistProfileColumnsContext, type PlaylistProfileColumnsContextValue, type PlaylistSelectAllState} from './playlistProfileColumnsContext.js'
import {playlistProfileMenuModel, rowMenuTargets} from './playlistProfileMenu.js'
import {profilePickerOptions} from './profilePickerOptions.js'
import {PlaylistProfileRowMenu, type PlaylistProfileRowMenuHandle} from './PlaylistProfileRowMenu.js'
import {playlistProfileTableFeatures} from './playlistProfileTableFeatures.js'
import {PlaylistProfileActionBar} from './PlaylistProfileActionBar.js'
import {PlaylistProfileFilterChips} from './PlaylistProfileFilterChips.js'
import {PlaylistProfileTable} from './PlaylistProfileTable.js'
import {WizardStepFooterActions} from './WizardStepFooterActions.js'

export function StepPlaylistProfiles(): ReactNode {
	const {t} = useTranslation()
	const {playlistItems, selectedPlaylistItemIds, removedPlaylistItemIds, playlistProfileAssignments, settings, wizardOutputDir, assignPlaylistProfile, resetPlaylistProfile, removePlaylistItems, restoreRemovedPlaylistItems, saveDownloadProfile, chooseWizardFolder, exitMultiProfileMode, advance} = useAppStore(
		useShallow(state => ({
			playlistItems: state.playlistItems,
			selectedPlaylistItemIds: state.selectedPlaylistItemIds,
			removedPlaylistItemIds: state.removedPlaylistItemIds,
			playlistProfileAssignments: state.playlistProfileAssignments,
			settings: state.settings,
			wizardOutputDir: state.wizardOutputDir,
			assignPlaylistProfile: state.assignPlaylistProfile,
			resetPlaylistProfile: state.resetPlaylistProfile,
			removePlaylistItems: state.removePlaylistItems,
			restoreRemovedPlaylistItems: state.restoreRemovedPlaylistItems,
			saveDownloadProfile: state.saveDownloadProfile,
			chooseWizardFolder: state.chooseWizardFolder,
			exitMultiProfileMode: state.exitMultiProfileMode,
			advance: state.advance
		}))
	)
	// The profile open in the editor (null for a new one), and the rows a new
	// profile is assigned to once saved: the rows its menu was acting on.
	const [editing, setEditing] = useState<{profile: DownloadProfile | null; assignTo: string[]} | null>(null)
	const [rowMenu] = useState<PlaylistProfileRowMenuHandle>(() => createPopoverHandle<string>())

	// Hoisted once instead of `.includes` inside the filter below — at the
	// design's 1000-item target, `.includes` against two arrays that can each
	// be up to 1000 ids long turns this into ~10^6 comparisons per render; a
	// Set lookup is O(1) regardless of playlist size.
	const selectedIdSet = useMemo(() => new Set(selectedPlaylistItemIds), [selectedPlaylistItemIds])
	const removedIdSet = useMemo(() => new Set(removedPlaylistItemIds), [removedPlaylistItemIds])
	// The set the user narrowed to on the items step, minus anything removed
	// later in this flow (Task 11) — not the full flat-probe playlist.
	const items = useMemo(() => playlistItems.filter(entry => selectedIdSet.has(entry.id) && !removedIdSet.has(entry.id)), [playlistItems, selectedIdSet, removedIdSet])
	// Tied to removedPlaylistItemIds (not just "items is empty") so it only
	// covers "removal emptied the step" — distinct from the filter chip
	// narrowing to zero matches, which the table's own empty row already
	// covers. Restore always clears removedPlaylistItemIds (and re-checks
	// whatever it removed via removedSelectionIds — see commands.ts), so this
	// reliably clears too.
	const allRemoved = removedPlaylistItemIds.length > 0 && items.length === 0
	const hasAnyThumbnail = useMemo(() => items.some(entry => !!entry.thumbnail), [items])
	const liveLabel = t('wizard.playlist.durationUnknown')

	const profilesPrefs = settings?.profiles
	const model = useMemo(() => buildDownloadProfileActionModel(profilesPrefs), [profilesPrefs])
	// Every saved profile, hidden ones too: a row keeps a profile hidden after it was
	// assigned, and downloads with it (prepareMultiProfileQueueSubmission).
	const profiles = useMemo(() => allDownloadProfiles(profilesPrefs), [profilesPrefs])
	const resolveProfile = useCallback((entry: PlaylistEntry): DownloadProfile => resolveAssignedProfile(entry.id, playlistProfileAssignments, profiles, model.activeProfile), [playlistProfileAssignments, profiles, model.activeProfile])
	// Mirrors useDownloadHomeView's globalDestinationRoot so the quick-edit
	// dialog previews the same resolved path DownloadProfilesHome would show.
	const globalDestinationRoot = wizardOutputDir?.trim() ? wizardOutputDir : (settings?.common?.defaultOutputDir ?? '')

	const [state, dispatch] = useReducer(playlistProfileTableReducer, undefined, createPlaylistProfileTableState)
	const {filter, selection} = state
	const {selectedIds, contextIds} = selection
	const dispatchSelection = useCallback((action: ListSelectionAction): void => {
		dispatch({type: 'selection', action})
	}, [])
	const scrollRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		dispatch({type: 'prune-ids', liveIds: new Set(items.map(entry => entry.id))})
	}, [items])

	const counts = useMemo(
		() =>
			profileAssignmentCounts(
				items.map(entry => entry.id),
				playlistProfileAssignments,
				profiles,
				model.activeRef
			),
		[items, playlistProfileAssignments, profiles, model.activeRef]
	)
	// If everything gets reassigned away from the filtered-to profile, its
	// chip vanishes (PlaylistProfileFilterChips only renders chips with
	// count > 0) but `filter` itself doesn't reset — the table would sit
	// empty with no highlighted chip and no way back except clicking "All".
	// Reset automatically so the screen never reads as broken.
	useEffect(() => {
		if (filter !== 'all' && (counts.get(filter) ?? 0) === 0) dispatch({type: 'set-filter', filter: 'all'})
	}, [filter, counts])

	const filteredItems = useMemo(() => (filter === 'all' ? items : items.filter(entry => resolveProfile(entry).id === filter)), [filter, items, resolveProfile])
	// The table neither sorts nor groups, so this is also its row order.
	const filteredIds = useMemo(() => filteredItems.map(entry => entry.id), [filteredItems])
	const selectedFilteredCount = useMemo(() => filteredIds.filter(id => selectedIds.has(id)).length, [filteredIds, selectedIds])
	const selectAllState: PlaylistSelectAllState = selectedFilteredCount === 0 ? 'none' : selectedFilteredCount === filteredIds.length ? 'all' : 'some'
	// Like Ctrl/Cmd+A, select-all takes the rows the filter shows, not every item.
	const toggleAll = useCallback((): void => {
		dispatch({type: 'selection', action: {type: 'set', ids: selectAllState === 'all' ? [] : filteredIds}})
	}, [filteredIds, selectAllState])
	const toggleRow = useCallback((id: string): void => {
		dispatch({type: 'selection', action: {type: 'toggle', id}})
	}, [])

	const columnsContext = useMemo((): PlaylistProfileColumnsContextValue => ({hasAnyThumbnail, liveLabel, resolveProfile, selectedIds, selectAllState, onToggleAll: toggleAll, onToggleRow: toggleRow, rowMenu}), [hasAnyThumbnail, liveLabel, resolveProfile, selectedIds, selectAllState, toggleAll, toggleRow, rowMenu])
	const table = useTable({features: playlistProfileTableFeatures, data: filteredItems, columns: PLAYLIST_PROFILE_COLUMNS, getRowId: entry => entry.id})
	const rows = table.getRowModel().rows
	const interactions = useRowSelectionInteractions({orderedIds: filteredIds, selection, dispatch: dispatchSelection})
	// Measured sizes follow the row (see QueueManagerTab).
	const getRowKey = useCallback((index: number) => rows[index]?.id ?? index, [rows])
	// TanStack Virtual returns function-bearing objects that React Compiler cannot safely memoize.
	// oxlint-disable-next-line react-hooks-js/incompatible-library
	const virtualizer = useVirtualizer({count: rows.length, getScrollElement: () => scrollRef.current, estimateSize: () => 48, getItemKey: getRowKey, overscan: 8})
	const virtualRows = virtualizer.getVirtualItems()
	const firstVirtualRow = virtualRows[0]
	const lastVirtualRow = virtualRows.at(-1)
	const topVirtualPadding = firstVirtualRow?.start ?? 0
	const bottomVirtualPadding = Math.max(0, virtualizer.getTotalSize() - (lastVirtualRow?.start ?? 0) - (lastVirtualRow?.size ?? 0))

	const selectedItemIds = useMemo(() => items.filter(entry => selectedIds.has(entry.id)).map(entry => entry.id), [items, selectedIds])
	// Set lookup instead of `.includes` — contextIds can be the whole selection
	// (see openContextMenuForRow), so this is the same 1000-item-scale concern
	// as selectedIdSet elsewhere on this screen.
	const contextIdSet = useMemo(() => new Set(contextIds), [contextIds])
	const contextItemIds = useMemo(() => items.filter(entry => contextIdSet.has(entry.id)).map(entry => entry.id), [items, contextIdSet])
	const itemById = useMemo(() => new Map(items.map(entry => [entry.id, entry])), [items])
	const profilesOf = useCallback(
		(itemIds: readonly string[]): DownloadProfile[] =>
			itemIds.flatMap(id => {
				const entry = itemById.get(id)
				return entry ? [resolveProfile(entry)] : []
			}),
		[itemById, resolveProfile]
	)
	// The chips list the profiles in use the way every picker lists profiles.
	const chipOptions = useMemo(() => profilePickerOptions(profilesPrefs, {current: null, inUse: profiles.filter(profile => counts.has(profile.id))}), [profilesPrefs, profiles, counts])
	const toolbarMenu = useMemo(() => playlistProfileMenuModel(profilesPrefs, profilesOf(selectedItemIds)), [profilesPrefs, profilesOf, selectedItemIds])
	const contextMenu = useMemo(() => playlistProfileMenuModel(profilesPrefs, profilesOf(contextItemIds)), [profilesPrefs, profilesOf, contextItemIds])
	const rowMenuFor = useCallback(
		(rowId: string) => {
			const targets = rowMenuTargets(rowId, selectedIds, selectedItemIds)
			return {targets, menu: playlistProfileMenuModel(profilesPrefs, profilesOf(targets))}
		},
		[profilesPrefs, profilesOf, selectedIds, selectedItemIds]
	)

	const assign = useCallback(
		(itemIds: string[], ref: DownloadProfileRef): void => {
			if (itemIds.length === 0) return
			assignPlaylistProfile(itemIds, ref)
		},
		[assignPlaylistProfile]
	)
	const reset = useCallback(
		(itemIds: string[]): void => {
			if (itemIds.length === 0) return
			resetPlaylistProfile(itemIds)
		},
		[resetPlaylistProfile]
	)
	// Saved without becoming the app's active profile: that would move the
	// baseline under every row this step has not reassigned. A new profile goes
	// straight onto the rows its menu was opened for. The ref is read after the
	// save, since this render's settings predate it.
	async function saveProfile(profile: DownloadProfile): Promise<void> {
		const assignTo = editing?.profile ? [] : (editing?.assignTo ?? [])
		await saveDownloadProfile(profile, false)
		assign(assignTo, downloadProfileRefFor(profile, useAppStore.getState().settings?.profiles))
	}
	const editProfile = useCallback((profile: DownloadProfile): void => setEditing({profile, assignTo: []}), [])
	const newProfile = useCallback((assignTo: string[]): void => setEditing({profile: null, assignTo}), [])

	const remove = useCallback(
		(itemIds: string[]): void => {
			if (itemIds.length === 0) return
			removePlaylistItems(itemIds)
		},
		[removePlaylistItems]
	)

	// Window-scoped rather than a JSX onKeyDown on the step container — the
	// shortcuts (Delete, Ctrl/Cmd+A) must fire no matter which row or button
	// inside the step currently holds focus, and this step is only mounted
	// while it's the active wizard step, so the listener's lifetime already
	// matches "while this screen is visible".
	// An Effect Event reads the latest selection and rows, so the listener is
	// subscribed once instead of on every selection change.
	const onKeyDown = useEffectEvent((event: KeyboardEvent): void => {
		// isTypingTarget only catches literal text-entry fields. The profile
		// editor dialog is full of buttons, toggles and selects that aren't text
		// fields at all, so without this the shortcuts below reassign/delete the
		// selection *behind* the open dialog whenever a non-text control has
		// focus — the user sees nothing happen until they close it.
		if (editing) return
		if (isTypingTarget(event.target)) return
		const bareCtrlOrMeta = (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey
		if (bareCtrlOrMeta && event.key.toLowerCase() === 'a') {
			// Selects the currently filtered rows, not every item in the step —
			// large playlists usually get narrowed to one profile first.
			event.preventDefault()
			dispatch({type: 'selection', action: {type: 'set', ids: filteredIds}})
			return
		}
		if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
		// Delete only — Backspace is a common "go back" reflex and this
		// window-scoped listener has no visible affordance warning the user it
		// deletes rows instead, same reasoning as StepPlaylistItems.
		if (event.key === 'Delete') {
			if (selectedItemIds.length === 0) return
			event.preventDefault()
			remove(selectedItemIds)
		}
	})
	useEffect(() => {
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [])

	const renderedColumnCount = table.getAllLeafColumns().length

	return (
		<div className="wizard-step wizard-step-column gap-3" data-testid="step-playlist-profiles">
			<div className="flex min-h-0 flex-1 flex-col gap-3 py-3">
				<div className="flex items-baseline justify-between gap-2">
					<h2 className="text-sm font-semibold truncate">{t('wizard.playlistProfiles.heading')}</h2>
					<span className="shrink-0 text-xs text-muted-foreground" data-testid="playlist-profile-summary">
						{t('wizard.playlistProfiles.selectedSummary', {selected: selectedItemIds.length, total: items.length})}
					</span>
				</div>

				{removedPlaylistItemIds.length > 0 ? (
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground" data-testid="removed-playlist-items-count">
							{t('wizard.playlist.removedCount', {count: removedPlaylistItemIds.length})}
						</span>
						<Button type="button" variant="outline" size="sm" onClick={restoreRemovedPlaylistItems} data-testid="restore-removed-playlist-items">
							{t('wizard.playlist.restore')}
						</Button>
					</div>
				) : null}

				<PlaylistProfileActionBar menu={toolbarMenu} selectedCount={selectedItemIds.length} onAssign={ref => assign(selectedItemIds, ref)} onEditProfile={editProfile} onNewProfile={() => newProfile(selectedItemIds)} onReset={() => reset(selectedItemIds)} />

				<PlaylistProfileFilterChips options={chipOptions} counts={counts} totalCount={items.length} filter={filter} onFilterChange={next => dispatch({type: 'set-filter', filter: next})} />

				{allRemoved ? (
					<Empty className="flex-1 py-10" data-testid="playlist-profile-empty">
						<EmptyHeader>
							<EmptyTitle>{t('wizard.playlist.allRemovedTitle')}</EmptyTitle>
							<EmptyDescription>{t('wizard.playlist.allRemovedDescription')}</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<PlaylistProfileColumnsContext value={columnsContext}>
						<PlaylistProfileTable
							table={table}
							rows={rows}
							virtualRows={virtualRows}
							scrollRef={scrollRef}
							measureElement={virtualizer.measureElement}
							topVirtualPadding={topVirtualPadding}
							bottomVirtualPadding={bottomVirtualPadding}
							renderedColumnCount={renderedColumnCount}
							contextItemIds={contextItemIds}
							contextMenu={contextMenu}
							selectedIds={selectedIds}
							interactions={interactions}
							onAssign={assign}
							onReset={reset}
							onRemove={remove}
						/>
					</PlaylistProfileColumnsContext>
				)}
			</div>

			<PlaylistProfileRowMenu handle={rowMenu} menuFor={rowMenuFor} onAssign={assign} onEditProfile={editProfile} onNewProfile={newProfile} />

			<WizardStepFooterActions onBack={exitMultiProfileMode} onContinue={advance} continueDisabled={allRemoved} />

			{editing ? (
				<DownloadProfileEditor
					key={editing.profile?.id ?? 'new'}
					commonPaths={settings?.common?.commonPaths}
					globalDestination={globalDestinationRoot}
					globalNativeAudioPreference={settings?.common?.nativeAudioPreference}
					globalHdrSetting={settings?.common?.hdrPreference}
					initialProfile={editing.profile}
					onChangeGlobalDestination={() => chooseWizardFolder()}
					onOpenChange={open => {
						if (!open) setEditing(null)
					}}
					onSave={saveProfile}
					open
				/>
			) : null}
		</div>
	)
}
