// The playlist-profiles step: assign a different DownloadProfile to individual
// playlist items instead of downloading the batch as one homogeneous run.
// Deliberately mirrors QueueManagerTab's three zones — action bar, filter
// chips, virtualized table — so a user reaches for the same gestures they
// already know from the Downloads tab. Chips filter; the action bar, the
// row context menu, and number keys 1-9 assign.

import {useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {getCoreRowModel, useReactTable} from '@tanstack/react-table'
import {useVirtualizer} from '@tanstack/react-virtual'
import {Info, X} from 'lucide-react'
import type {DownloadProfile, DownloadProfileRef, PlaylistEntry} from '@shared/types.js'
import {useAppStore} from '../../store/useAppStore.js'
import {selectionModifierLabel} from '../../lib/platform.js'
import type {ListSelectionAction} from '../shared/listSelection.js'
import {useRowSelectionInteractions} from '../shared/useRowSelectionInteractions.js'
import {Alert, AlertDescription, AlertTitle} from '../ui/alert.js'
import {Button} from '../ui/button.js'
import {buildDownloadProfileActionModel} from './downloadProfileActions.js'
import {DownloadProfileEditor} from './DownloadProfileEditor.js'
import {profileAssignmentCounts, resolveAssignedProfile} from './playlistProfileAssignments.js'
import {orderProfileOptionsForAssignment} from './playlistProfileOrder.js'
import {createPlaylistProfileTableState, playlistProfileTableReducer} from './playlistProfileTableState.js'
import {usePlaylistProfileColumns} from './usePlaylistProfileColumns.js'
import {PlaylistProfileActionBar} from './PlaylistProfileActionBar.js'
import {PlaylistProfileFilterChips} from './PlaylistProfileFilterChips.js'
import {PlaylistProfileTable} from './PlaylistProfileTable.js'
import {WizardStepFooterActions} from './WizardStepFooterActions.js'

const DIGIT_CODES = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9']

function isTypingTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false
	return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
}

export function StepPlaylistProfiles(): ReactNode {
	const {t} = useTranslation()
	const {playlistItems, selectedPlaylistItemIds, removedPlaylistItemIds, playlistProfileAssignments, settings, wizardOutputDir, assignPlaylistProfile, resetPlaylistProfile, saveDownloadProfile, exitMultiProfileMode, advance, dismissMultiProfileHint} = useAppStore()
	const [editingProfile, setEditingProfile] = useState<DownloadProfile | null>(null)

	// The set the user narrowed to on the items step, minus anything removed
	// later in this flow (Task 11) — not the full flat-probe playlist.
	const items = useMemo(() => playlistItems.filter(entry => selectedPlaylistItemIds.includes(entry.id) && !removedPlaylistItemIds.includes(entry.id)), [playlistItems, selectedPlaylistItemIds, removedPlaylistItemIds])
	const hasAnyThumbnail = useMemo(() => items.some(entry => !!entry.thumbnail), [items])
	const liveLabel = t('wizard.playlist.durationUnknown')

	const model = useMemo(() => buildDownloadProfileActionModel(settings?.profiles), [settings?.profiles])
	// Baseline first, then the user's custom profiles, then builtins — local to
	// this screen. See playlistProfileOrder.ts for why the catalog order (used
	// as-is by the home-screen picker) doesn't work here.
	const orderedOptions = useMemo(() => orderProfileOptionsForAssignment(model.options, model.activeRef), [model.options, model.activeRef])
	const profiles = useMemo(() => orderedOptions.map(option => option.profile), [orderedOptions])
	const resolveProfile = useCallback((entry: PlaylistEntry): DownloadProfile => resolveAssignedProfile(entry.id, playlistProfileAssignments, profiles, model.activeProfile), [playlistProfileAssignments, profiles, model.activeProfile])
	// Mirrors useDownloadHomeView's globalDestinationRoot so the quick-edit
	// dialog previews the same resolved path DownloadProfilesHome would show.
	const trimmedWizardOutputDir = wizardOutputDir?.trim() ?? ''
	const globalDestinationRoot = trimmedWizardOutputDir.length > 0 ? trimmedWizardOutputDir : (settings?.common?.defaultOutputDir ?? '')

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
	const filteredItems = useMemo(() => (filter === 'all' ? items : items.filter(entry => resolveProfile(entry).id === filter)), [filter, items, resolveProfile])

	const columns = usePlaylistProfileColumns({t, hasAnyThumbnail, liveLabel, resolveProfile})
	// TanStack Table returns function-bearing objects that React Compiler cannot safely memoize.
	// oxlint-disable-next-line react-hooks-js/incompatible-library
	const table = useReactTable<PlaylistEntry>({data: filteredItems, columns, getCoreRowModel: getCoreRowModel(), getRowId: entry => entry.id})
	const rows = table.getRowModel().rows
	const orderedRowIds = useMemo(() => rows.map(row => row.original.id), [rows])
	const interactions = useRowSelectionInteractions({orderedIds: orderedRowIds, selection, dispatch: dispatchSelection})
	const virtualizer = useVirtualizer({count: rows.length, getScrollElement: () => scrollRef.current, estimateSize: () => 48, overscan: 8})
	const virtualRows = virtualizer.getVirtualItems()
	const firstVirtualRow = virtualRows[0]
	const lastVirtualRow = virtualRows.at(-1)
	const topVirtualPadding = firstVirtualRow?.start ?? 0
	const bottomVirtualPadding = Math.max(0, virtualizer.getTotalSize() - (lastVirtualRow?.start ?? 0) - (lastVirtualRow?.size ?? 0))

	const selectedItemIds = useMemo(() => items.filter(entry => selectedIds.has(entry.id)).map(entry => entry.id), [items, selectedIds])
	const contextItemIds = useMemo(() => items.filter(entry => contextIds.includes(entry.id)).map(entry => entry.id), [items, contextIds])

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

	// Window-scoped rather than a JSX onKeyDown on the step container — the
	// shortcuts (Digit1-9, Ctrl/Cmd+A) must fire no matter which row or button
	// inside the step currently holds focus, and this step is only mounted
	// while it's the active wizard step, so the listener's lifetime already
	// matches "while this screen is visible".
	useEffect(() => {
		function onKeyDown(event: KeyboardEvent): void {
			if (isTypingTarget(event.target)) return
			const bareCtrlOrMeta = (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey
			if (bareCtrlOrMeta && event.key.toLowerCase() === 'a') {
				// Selects the currently filtered rows, not every item in the step —
				// large playlists usually get narrowed to one profile first.
				event.preventDefault()
				dispatch({type: 'selection', action: {type: 'set', ids: orderedRowIds}})
				return
			}
			if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
			const digitIndex = DIGIT_CODES.indexOf(event.code)
			if (digitIndex === -1) return
			const option = orderedOptions[digitIndex]
			if (!option || selectedItemIds.length === 0) return
			event.preventDefault()
			assign(selectedItemIds, option.ref)
		}
		window.addEventListener('keydown', onKeyDown)
		return () => window.removeEventListener('keydown', onKeyDown)
	}, [assign, orderedOptions, orderedRowIds, selectedItemIds])

	const renderedColumnCount = table.getAllLeafColumns().length

	return (
		<div className="wizard-step gap-3" data-testid="step-playlist-profiles">
			<div className="flex min-h-0 flex-1 flex-col gap-3 py-3">
				<div className="flex items-baseline justify-between gap-2">
					<h2 className="text-sm font-semibold truncate">{t('wizard.playlistProfiles.heading')}</h2>
					<span className="shrink-0 text-xs text-muted-foreground" data-testid="playlist-profile-summary">
						{t('wizard.playlistProfiles.selectedSummary', {selected: selectedItemIds.length, total: items.length})}
					</span>
				</div>

				<PlaylistProfileActionBar options={orderedOptions} selectedCount={selectedItemIds.length} onAssign={ref => assign(selectedItemIds, ref)} onEditProfile={setEditingProfile} onReset={() => reset(selectedItemIds)} />

				{!settings?.common?.multiProfileHintDismissed ? (
					<Alert variant="info" className="flex items-start gap-3" data-testid="multi-profile-hint">
						<Info className="mt-0.5 size-4 shrink-0 text-sky-500" />
						<div className="min-w-0 flex-1">
							<AlertTitle>{t('wizard.playlistProfiles.hintTitle')}</AlertTitle>
							<AlertDescription className="break-words">{t('wizard.playlistProfiles.hintBody', {modifier: selectionModifierLabel()})}</AlertDescription>
						</div>
						<Button type="button" variant="ghost" size="icon-sm" className="-mt-1 -me-1 shrink-0" aria-label={t('titleBar.close')} onClick={() => void dismissMultiProfileHint()}>
							<X />
						</Button>
					</Alert>
				) : null}

				<PlaylistProfileFilterChips options={orderedOptions} counts={counts} totalCount={items.length} filter={filter} onFilterChange={next => dispatch({type: 'set-filter', filter: next})} />

				<PlaylistProfileTable
					table={table}
					rows={rows}
					virtualRows={virtualRows}
					scrollRef={scrollRef}
					topVirtualPadding={topVirtualPadding}
					bottomVirtualPadding={bottomVirtualPadding}
					renderedColumnCount={renderedColumnCount}
					options={orderedOptions}
					contextItemIds={contextItemIds}
					selectedIds={selectedIds}
					interactions={interactions}
					onAssign={assign}
					onReset={reset}
				/>
			</div>

			<WizardStepFooterActions onBack={exitMultiProfileMode} onContinue={advance} />

			{editingProfile ? (
				<DownloadProfileEditor
					key={editingProfile.id}
					commonPaths={settings?.common?.commonPaths}
					globalDestination={globalDestinationRoot}
					initialProfile={editingProfile}
					onOpenChange={open => {
						if (!open) setEditingProfile(null)
					}}
					onSave={profile => saveDownloadProfile(profile)}
					open
				/>
			) : null}
		</div>
	)
}
