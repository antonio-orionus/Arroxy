import type {ReactNode} from 'react'
import {useShallow} from 'zustand/react/shallow'
import {useTranslation} from 'react-i18next'
import {Info, Layers} from 'lucide-react'
import {useAppStore} from '../../store/useAppStore.js'
import type {BulkMetadataItemStatus, WizardMode} from '../../store/types.js'
import {Alert, AlertDescription, AlertTitle} from '../ui/alert.js'
import {Button} from '../ui/button.js'
import {Empty, EmptyDescription, EmptyHeader, EmptyTitle} from '../ui/empty.js'
import {Tooltip, TooltipTrigger, TooltipContent} from '../ui/tooltip.js'
import {WizardStepFooterActions} from './WizardStepFooterActions.js'
import {isAudioOnlySource} from '@shared/ytdlp/extractorPredicates.js'
import {enabledDownloadProfiles} from '@shared/downloadProfiles.js'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import {PlaylistProbeLimitSelector} from './PlaylistProbeLimitSelector.js'
import {PlaylistScopeControl} from './PlaylistScopeControl.js'
import {PlaylistSortControl} from './PlaylistSortControl.js'
import {collectionKindForWizardUrls} from '../../store/wizard/collectionKind.js'
import {PlaylistProbeLoading} from './PlaylistProbeLoading.js'
import {PlaylistSelectionToolbar} from './PlaylistSelectionToolbar.js'
import {PlaylistFolderScanStatus, PlaylistFolderSyncNotices} from './PlaylistFolderSyncNotices.js'
import {PlaylistItemsList} from './PlaylistItemsList.js'
import {usePlaylistFolderSync, type PlaylistFolderSync} from './usePlaylistFolderSync.js'
import {usePlaylistDeleteShortcut} from './usePlaylistDeleteShortcut.js'
import {usePlaylistItemsView, type PlaylistItemsView} from './usePlaylistItemsView.js'

const PLAYLIST_PROBE_SKELETON_ROWS = [
	{id: 'first', width: 'w-8/12', metaWide: false},
	{id: 'second', width: 'w-10/12', metaWide: true},
	{id: 'third', width: 'w-7/12', metaWide: false},
	{id: 'fourth', width: 'w-9/12', metaWide: false},
	{id: 'fifth', width: 'w-6/12', metaWide: true},
	{id: 'sixth', width: 'w-11/12', metaWide: false},
	{id: 'seventh', width: 'w-8/12', metaWide: false},
	{id: 'eighth', width: 'w-7/12', metaWide: true},
	{id: 'ninth', width: 'w-10/12', metaWide: false},
	{id: 'tenth', width: 'w-6/12', metaWide: false}
] as const

function PlaylistProbeSkeletonRows({showThumbnail}: {showThumbnail: boolean}): ReactNode {
	return (
		<div className="min-h-[12rem] flex-1 overflow-hidden rounded-md border border-border" data-testid="playlist-probe-loading-list" aria-hidden>
			{PLAYLIST_PROBE_SKELETON_ROWS.map(row => (
				<div key={row.id} className="flex h-14 items-center gap-2 border-b border-border/45 px-3 py-2 last:border-b-0" data-testid="playlist-probe-skeleton-row">
					<div className="thumb-shimmer size-4 shrink-0 rounded-[4px] opacity-75" />
					{showThumbnail ? <div className="thumb-shimmer h-8 w-[56px] shrink-0 rounded-sm opacity-75" /> : null}
					<div className="min-w-0 flex-1 space-y-1.5">
						<div className={`thumb-shimmer h-2.5 rounded-full ${row.width}`} />
						<div className="thumb-shimmer h-2 w-32 rounded-full opacity-65" />
					</div>
					<div className={`thumb-shimmer h-3 shrink-0 rounded-full opacity-55 ${row.metaWide ? 'w-14' : 'w-10'}`} />
				</div>
			))}
		</div>
	)
}

const PLAYLIST_COPY_KEYS = {heading: 'wizard.playlist.heading', loadingItems: 'wizard.playlist.loadingItems', probeLimitAlertTitle: 'wizard.playlist.probeLimitAlertTitle', syncNoneDesc: 'wizard.playlist.syncNoneDesc'} as const
const GENERIC_COLLECTION_COPY_KEYS = {heading: 'wizard.playlist.headingGeneric', loadingItems: 'wizard.playlist.loadingItemsGeneric', probeLimitAlertTitle: 'wizard.playlist.probeLimitAlertTitleGeneric', syncNoneDesc: 'wizard.playlist.syncNoneDescGeneric'} as const

type PlaylistCopyKeys = typeof PLAYLIST_COPY_KEYS | typeof GENERIC_COLLECTION_COPY_KEYS

// Channels and searches aren't playlists, so they get collection-neutral copy.
function playlistCopyKeys(wizardMode: WizardMode, wizardUrl: string, wizardWebpageUrl: string): PlaylistCopyKeys {
	const collectionKind = wizardMode === 'playlist' ? collectionKindForWizardUrls(wizardUrl, wizardWebpageUrl) : null
	return collectionKind === 'channel' || collectionKind === 'search' ? GENERIC_COLLECTION_COPY_KEYS : PLAYLIST_COPY_KEYS
}

function itemCountKey(isBulk: boolean, extractor: string | null): 'wizard.playlist.itemCountBulk' | 'wizard.playlist.itemCountAudio' | 'wizard.playlist.itemCount' {
	if (isBulk) return 'wizard.playlist.itemCountBulk'
	return isAudioOnlySource(extractor) ? 'wizard.playlist.itemCountAudio' : 'wizard.playlist.itemCount'
}

function PlaylistItemsHeading({isBulk, copyKeys, itemCount}: {isBulk: boolean; copyKeys: PlaylistCopyKeys; itemCount: number}): ReactNode {
	const {t} = useTranslation()
	const playlistTitle = useAppStore(s => s.playlistTitle)
	const wizardExtractor = useAppStore(s => s.wizardExtractor)
	return (
		<div className="flex items-baseline justify-between gap-2">
			<h2 className="text-sm font-semibold truncate">{isBulk ? t('wizard.playlist.bulkHeading') : playlistTitle || t(copyKeys.heading)}</h2>
			<span className="shrink-0 text-xs text-muted-foreground">{t(itemCountKey(isBulk, wizardExtractor), {count: itemCount})}</span>
		</div>
	)
}

// Scope reload + probe-cap notices: a playlist/channel concern, never shown for a bulk intake.
function PlaylistCollectionNotices({busy, playlistLimit, copyKeys}: {busy: boolean; playlistLimit: number; copyKeys: PlaylistCopyKeys}): ReactNode {
	const {t} = useTranslation()
	const playlistScopeError = useAppStore(s => s.playlistScopeError)
	const playlistLikelyCapped = useAppStore(s => s.playlistLikelyCapped)
	const reloadPlaylistWithScope = useAppStore(s => s.reloadPlaylistWithScope)
	const retryFormatProbe = useAppStore(s => s.retryFormatProbe)
	return (
		<>
			<PlaylistScopeControl applyLabel={t('wizard.url.playlistScope.applyReload')} pendingLabel={t('wizard.url.playlistScope.reloading')} disabled={busy} onApplyScope={reloadPlaylistWithScope} />

			{playlistScopeError ? (
				<Alert variant="warning" data-testid="playlist-scope-error">
					<Info />
					<AlertTitle>{t('wizard.url.playlistScope.emptyTitle')}</AlertTitle>
					<AlertDescription>{playlistScopeError}</AlertDescription>
				</Alert>
			) : null}

			{!busy && playlistLikelyCapped && (
				<Alert variant="warning" data-testid="playlist-probe-limit-alert">
					<Info />
					<AlertTitle>{t(copyKeys.probeLimitAlertTitle)}</AlertTitle>
					<AlertDescription>{t('wizard.playlist.probeLimitAlertDesc', {count: playlistLimit})}</AlertDescription>
					<div className="col-start-2 mt-2">
						<PlaylistProbeLimitSelector testId="playlist-alert-probe-limit" showCurrent={false} onLimitChanged={() => retryFormatProbe()} className="w-40" />
					</div>
				</Alert>
			)}
		</>
	)
}

// Bulk URLs has no load-limit control: a pasted list past the limit is cut
// there, and its own link pasted alone asks how many.
function BulkCappedNotice({playlistLimit}: {playlistLimit: number}): ReactNode {
	const {t} = useTranslation()
	const cappedLists = useAppStore(s => s.bulkCappedLists)
	if (cappedLists.length === 0) return null
	const count = cappedLists.length
	return (
		<Alert variant="warning" data-testid="bulk-capped-alert">
			<Info />
			<AlertTitle>{t('wizard.playlist.bulkCappedTitle', {count, title: cappedLists[0]?.title || cappedLists[0]?.url, limit: playlistLimit})}</AlertTitle>
			<AlertDescription>{t('wizard.playlist.bulkCappedDesc', {count})}</AlertDescription>
		</Alert>
	)
}

function BulkMetadataProgress(): ReactNode {
	const {t} = useTranslation()
	const bulkMetadataStatus = useAppStore(s => s.bulkMetadataStatus)
	const bulkMetadataCompleted = useAppStore(s => s.bulkMetadataCompleted)
	const bulkMetadataTotal = useAppStore(s => s.bulkMetadataTotal)
	if (bulkMetadataStatus !== 'resolving') return null
	return (
		<>
			<p className="flex items-center gap-1.5 text-xs text-muted-foreground" data-testid="bulk-metadata-status">
				<span className="h-3 w-3 rounded-full border-2 border-current/20 border-t-current animate-spin" aria-hidden />
				{t('wizard.playlist.bulkMetadataResolving', {done: bulkMetadataCompleted, total: bulkMetadataTotal})}
			</p>
			<p className="text-xs text-muted-foreground" data-testid="bulk-metadata-optional">
				{t('wizard.playlist.bulkMetadataOptional')}
			</p>
		</>
	)
}

function PlaylistItemsEmpty(): ReactNode {
	const {t} = useTranslation()
	return (
		<Empty className="flex-1 py-10" data-testid="playlist-items-empty">
			<EmptyHeader>
				<EmptyTitle>{t('wizard.playlist.allRemovedTitle')}</EmptyTitle>
				<EmptyDescription>{t('wizard.playlist.allRemovedDescription')}</EmptyDescription>
			</EmptyHeader>
		</Empty>
	)
}

function PlaylistSelectionSummary({selectedCount}: {selectedCount: number}): ReactNode {
	const {t} = useTranslation()
	return selectedCount > 0 ? <p className="text-xs text-muted-foreground">{t('wizard.playlist.selectedCount', {count: selectedCount})}</p> : <p className="text-xs text-destructive">{t('wizard.playlist.noSelection')}</p>
}

interface PlaylistItemsBodyProps {
	isBulk: boolean
	view: PlaylistItemsView
	folderSync: PlaylistFolderSync
	copyKeys: PlaylistCopyKeys
	selectedPlaylistItemIds: string[]
	bulkMetadataById: Record<string, BulkMetadataItemStatus>
	onSelectedChange: (id: string, selected: boolean) => void
	onRemove: (ids: string[]) => void
}

function PlaylistItemsBody({isBulk, view, folderSync, copyKeys, selectedPlaylistItemIds, bulkMetadataById, onSelectedChange, onRemove}: PlaylistItemsBodyProps): ReactNode {
	const {t} = useTranslation()
	return (
		<>
			{!isBulk && <PlaylistFolderScanStatus sync={folderSync} />}

			<BulkMetadataProgress />

			{!isBulk && <PlaylistFolderSyncNotices sync={folderSync} noneDescKey={copyKeys.syncNoneDesc} />}

			{view.nestedPlaylistCount > 0 && (
				<Alert variant="info" data-testid="nested-playlist-hint">
					<Info />
					<AlertDescription>{t('wizard.playlist.nestedPlaylistHint', {count: view.nestedPlaylistCount})}</AlertDescription>
				</Alert>
			)}

			{view.allRemoved ? (
				<PlaylistItemsEmpty />
			) : (
				<>
					<PlaylistItemsList
						visibleItems={view.visibleItems}
						selectedPlaylistItemIds={selectedPlaylistItemIds}
						selectedIdSet={view.selectedIdSet}
						syncedIdSet={view.syncedIdSet}
						bulkMetadataById={bulkMetadataById}
						isBulk={isBulk}
						hasAnyThumbnail={view.hasAnyThumbnail}
						onSelectedChange={onSelectedChange}
						onRemove={onRemove}
					/>

					<PlaylistSelectionSummary selectedCount={selectedPlaylistItemIds.length} />
				</>
			)}
		</>
	)
}

function PlaylistItemsFooter({canContinue}: {canContinue: boolean}): ReactNode {
	const {t} = useTranslation()
	const back = useAppStore(s => s.back)
	const confirmPlaylistSelection = useAppStore(s => s.confirmPlaylistSelection)
	const enterMultiProfileMode = useAppStore(s => s.enterMultiProfileMode)
	const profiles = useAppStore(s => s.settings?.profiles)
	// The mode is meaningless with a single profile — nothing to route items
	// between. Builtins alone already clear this bar, so in practice the
	// button is offered whenever any playlist item is selected.
	const canOfferMultiProfile = enabledDownloadProfiles(profiles).length >= 2
	return (
		<WizardStepFooterActions onBack={back} onContinue={() => void confirmPlaylistSelection()} continueDisabled={!canContinue}>
			{canOfferMultiProfile ? (
				<Tooltip>
					<TooltipTrigger
						render={props => (
							<Button {...props} type="button" variant="outline" size="sm" disabled={!canContinue} onClick={enterMultiProfileMode} data-testid="enter-multi-profile">
								<Layers size={14} aria-hidden />
								{t('wizard.playlist.multiProfileEntry')}
							</Button>
						)}
					/>
					<TooltipContent>{t('wizard.playlist.multiProfileEntryTooltip')}</TooltipContent>
				</Tooltip>
			) : null}
		</WizardStepFooterActions>
	)
}

export function StepPlaylistItems(): ReactNode {
	const {t} = useTranslation()
	const {
		playlistItems,
		selectedPlaylistItemIds,
		removedPlaylistItemIds,
		playlistProbeLoading,
		playlistProbeProgress,
		playlistScopeReloading,
		bulkMetadataStatus,
		bulkMetadataById,
		playlistSortMode,
		setPlaylistSortMode,
		syncedDownloadedIds,
		setPlaylistItemSelected,
		removePlaylistItems,
		wizardUrl,
		wizardWebpageUrl,
		settings,
		wizardMode
	} = useAppStore(
		useShallow(state => ({
			playlistItems: state.playlistItems,
			selectedPlaylistItemIds: state.selectedPlaylistItemIds,
			removedPlaylistItemIds: state.removedPlaylistItemIds,
			playlistProbeLoading: state.playlistProbeLoading,
			playlistProbeProgress: state.playlistProbeProgress,
			playlistScopeReloading: state.playlistScopeReloading,
			bulkMetadataStatus: state.bulkMetadataStatus,
			bulkMetadataById: state.bulkMetadataById,
			playlistSortMode: state.playlistSortMode,
			setPlaylistSortMode: state.setPlaylistSortMode,
			syncedDownloadedIds: state.syncedDownloadedIds,
			setPlaylistItemSelected: state.setPlaylistItemSelected,
			removePlaylistItems: state.removePlaylistItems,
			wizardUrl: state.wizardUrl,
			wizardWebpageUrl: state.wizardWebpageUrl,
			settings: state.settings,
			wizardMode: state.wizardMode
		}))
	)
	const isBulk = wizardMode === 'bulk'

	const folderSync = usePlaylistFolderSync()
	const view = usePlaylistItemsView({playlistItems, removedPlaylistItemIds, selectedPlaylistItemIds, syncedDownloadedIds, playlistSortMode, bulkMetadataStatus, isBulk})
	usePlaylistDeleteShortcut(selectedPlaylistItemIds, removePlaylistItems)

	const playlistLimit = resolvePlaylistProbeLimit(settings?.common)
	const playlistBusy = playlistProbeLoading || playlistScopeReloading
	const copyKeys = playlistCopyKeys(wizardMode, wizardUrl, wizardWebpageUrl)
	// selectedCount is already 0 once every item is removed — removePlaylistItems
	// prunes the selection — but allRemoved is spelled out here too so Continue's
	// disabled state doesn't depend on that pruning detail holding forever.
	const canContinue = selectedPlaylistItemIds.length > 0 && !playlistBusy && !view.allRemoved

	return (
		<div className="wizard-step wizard-step-column gap-3" data-testid="step-playlist-items">
			<div className="flex min-h-0 flex-1 flex-col gap-3 py-3">
				<PlaylistItemsHeading isBulk={isBulk} copyKeys={copyKeys} itemCount={playlistItems.length} />

				{isBulk ? <BulkCappedNotice playlistLimit={playlistLimit} /> : <PlaylistCollectionNotices busy={playlistBusy} playlistLimit={playlistLimit} copyKeys={copyKeys} />}

				{playlistBusy ? <PlaylistProbeLoading loadingLabel={t(copyKeys.loadingItems)} progress={playlistProbeProgress} limit={playlistLimit} /> : null}

				<PlaylistSelectionToolbar busy={playlistBusy} />

				{!isBulk ? <PlaylistSortControl value={playlistSortMode} onChange={setPlaylistSortMode} canSortByUpload={view.canSortByUpload} isFetching={view.sortFetching} disabled={playlistBusy} /> : null}

				{playlistBusy ? (
					<PlaylistProbeSkeletonRows showThumbnail={playlistItems.length === 0 || view.hasAnyThumbnail} />
				) : (
					<PlaylistItemsBody isBulk={isBulk} view={view} folderSync={folderSync} copyKeys={copyKeys} selectedPlaylistItemIds={selectedPlaylistItemIds} bulkMetadataById={bulkMetadataById} onSelectedChange={setPlaylistItemSelected} onRemove={removePlaylistItems} />
				)}
			</div>

			<PlaylistItemsFooter canContinue={canContinue} />
		</div>
	)
}
