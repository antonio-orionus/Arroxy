import {useMemo, useRef, useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useVirtualizer} from '@tanstack/react-virtual'
import {FolderCheck, FolderSearch, Info, X} from 'lucide-react'
import {useAppStore} from '../../store/useAppStore.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {Checkbox} from '../ui/checkbox.js'
import {Input} from '../ui/input.js'
import {Alert, AlertDescription, AlertTitle} from '../ui/alert.js'
import {WizardStepFooterActions} from './WizardStepFooterActions.js'
import {isAudioOnlySource} from '@shared/ytdlp/extractorPredicates.js'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import {resolvePlaylistDir} from '../../store/wizard/playlistDir.js'
import {formatDuration} from '@renderer/lib/formatDuration.js'
import {notify} from '@renderer/lib/notify.js'
import {PlaylistProbeLimitSelector} from './PlaylistProbeLimitSelector.js'
import {PlaylistScopeControl} from './PlaylistScopeControl.js'

// undefined = no duration metadata (common for nested-playlist entries from
// music search, channel root, etc.) — render an em-dash instead of falsely
// labeling them "live".
function formatEntryDuration(seconds: number | undefined, liveLabel: string): string {
	if (seconds === undefined) return '—'
	return formatDuration(seconds, liveLabel)
}

function PlaylistProbeSkeletonRows({showThumbnail}: {showThumbnail: boolean}): ReactNode {
	const rows = [
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
	]
	return (
		<div className="min-h-[12rem] flex-1 overflow-hidden rounded-md border border-border" data-testid="playlist-probe-loading-list" aria-hidden>
			{rows.map(row => (
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

function PlaylistProbeLoadingStatus({loadingLabel, phaseLabel, progressLabel, progressValue, limitHint}: {loadingLabel: string; phaseLabel: string | null; progressLabel: string | null; progressValue: number | null; limitHint: string | null}): ReactNode {
	return (
		<div className="rounded-md border border-[var(--border-strong)] bg-card/40 px-3 py-2.5 text-sm" data-testid="playlist-probe-loading" aria-live="polite">
			<div className="flex items-center justify-between gap-3">
				<div className="flex min-w-0 items-center gap-3">
					<span className="grid size-8 shrink-0 place-items-center rounded-full border border-[var(--brand)]/35 bg-[var(--brand-dim)] text-[var(--brand)] shadow-[0_0_14px_var(--brand-glow)]">
						<span className="size-3 rounded-full border-2 border-current/20 border-t-current animate-spin" aria-hidden />
					</span>
					<div className="min-w-0">
						<p className="truncate font-medium text-foreground">{loadingLabel}</p>
						{phaseLabel ? <p className="truncate text-xs text-muted-foreground">{phaseLabel}</p> : null}
					</div>
				</div>
				{progressLabel ? (
					<Badge variant="outline" className="h-7 shrink-0 border-[var(--brand)]/40 bg-[var(--brand-dim)] px-2.5 font-mono text-[11px] tabular-nums text-[var(--brand)]" data-testid="playlist-probe-progress-count">
						{progressLabel}
					</Badge>
				) : null}
			</div>
			{progressValue !== null ? (
				<div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressValue}>
					<div className="h-full bg-primary transition-[width]" style={{width: `${progressValue}%`}} />
				</div>
			) : (
				<div className="thumb-shimmer mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary" aria-hidden />
			)}
			{limitHint ? <p className="mt-2 text-xs text-muted-foreground">{limitHint}</p> : null}
		</div>
	)
}

export function StepPlaylistItems(): ReactNode {
	const {t} = useTranslation()
	const store = useAppStore()
	const {
		playlistItems,
		selectedPlaylistItemIds,
		playlistTitle,
		playlistProbeLoading,
		playlistProbeProgress,
		playlistScopeReloading,
		playlistScopeError,
		playlistLikelyCapped,
		bulkMetadataStatus,
		bulkMetadataCompleted,
		bulkMetadataTotal,
		bulkMetadataById,
		syncedDownloadedIds,
		syncScanState,
		setPlaylistItemSelected,
		selectAllPlaylistItems,
		selectNonePlaylistItems,
		selectPlaylistRange,
		confirmPlaylistSelection,
		back,
		wizardExtractor,
		scanDownloadedInFolder,
		applyFolderSync,
		setPlaylistFolder,
		settings,
		reloadPlaylistWithScope,
		retryFormatProbe,
		wizardMode
	} = store
	const isBulk = wizardMode === 'bulk'

	// Effective folder the playlist's files land in (and where the scan looks) —
	// the same resolver the queue builder + scan use, so display == download == scan.
	const syncDir = resolvePlaylistDir(store)

	const [rangeFrom, setRangeFrom] = useState('')
	const [rangeTo, setRangeTo] = useState('')
	// Lets the user dismiss the sync alert (or hide it after applying) without
	// re-running the scan. Reset implicitly whenever a new scan completes.
	const [syncDismissed, setSyncDismissed] = useState(false)

	const foundCount = syncedDownloadedIds.length

	function changeSyncFolder(): void {
		// Open at the current playlist dir; the pick becomes base+subfolder via
		// setPlaylistFolder (single SSOT), then we rescan the new location. State
		// only changes after a successful pick + folder write, so a rejected dialog
		// or failed settings persist can't leave the sync UI inconsistent.
		void (async () => {
			try {
				const res = await window.appApi.dialog.chooseFolder(syncDir || undefined)
				if (!res.ok || !res.data.path) return
				await setPlaylistFolder(res.data.path)
				setSyncDismissed(false)
				void scanDownloadedInFolder()
			} catch (error) {
				notify.folderSelectFailed(error)
			}
		})()
	}

	const parentRef = useRef<HTMLDivElement>(null)
	// oxlint-disable-next-line react-hooks-js/incompatible-library
	const virtualizer = useVirtualizer({count: playlistItems.length, getScrollElement: () => parentRef.current, estimateSize: () => 56, overscan: 5})

	const selectedCount = selectedPlaylistItemIds.length
	const playlistLimit = resolvePlaylistProbeLimit(settings?.common)
	const playlistBusy = playlistProbeLoading || playlistScopeReloading
	const showProbeLimitAlert = !isBulk && !playlistBusy && playlistLikelyCapped
	const probeLimitDescription = t('wizard.playlist.probeLimitAlertDesc', {count: playlistLimit})
	const itemProgressTotal = playlistProbeProgress?.phase === 'items' && playlistProbeProgress.total ? Math.min(playlistProbeProgress.total, playlistLimit) : null
	const itemProgressLoaded = playlistProbeProgress?.phase === 'items' ? Math.min(playlistProbeProgress.loaded, itemProgressTotal ?? playlistProbeProgress.loaded) : null
	const probeProgressValue = itemProgressTotal && itemProgressLoaded !== null ? Math.min(100, Math.max(0, Math.round((itemProgressLoaded / itemProgressTotal) * 100))) : null
	const probePhaseLabel = playlistProbeProgress?.phase === 'pages' ? t('wizard.playlist.loadingPhasePages') : playlistProbeProgress?.phase === 'items' ? t('wizard.playlist.loadingPhaseItems') : null
	const probeProgressLabel = playlistProbeProgress ? (playlistProbeProgress.phase === 'pages' ? t('wizard.playlist.loadingPagesFound', {count: playlistProbeProgress.loaded}) : itemProgressTotal && itemProgressLoaded !== null ? `${itemProgressLoaded} / ${itemProgressTotal}` : String(playlistProbeProgress.loaded)) : null
	const showProbeLimitHint = playlistProbeProgress?.phase === 'items' && playlistProbeProgress.total !== undefined && playlistProbeProgress.total > playlistLimit
	const probeLimitHint = showProbeLimitHint ? t('wizard.playlist.loadingLimitHint', {count: playlistLimit}) : null
	// yt-dlp's --flat-playlist returns thumbnails for some extractors
	// (YouTube tab) but not others (PornHub paged list, generic). When no
	// entry has one, hide the thumbnail slot entirely so the list renders
	// compactly instead of showing 500 empty boxes.
	const hasAnyThumbnail = useMemo(() => playlistItems.some(e => !!e.thumbnail), [playlistItems])
	const canContinue = selectedCount > 0 && !playlistBusy

	function applyRange(): void {
		const from = parseInt(rangeFrom, 10)
		const to = parseInt(rangeTo, 10)
		if (!isNaN(from) && !isNaN(to)) selectPlaylistRange(from, to)
	}

	const liveLabel = t('wizard.playlist.durationUnknown')

	return (
		<div className="wizard-step gap-3" data-testid="step-playlist-items">
			<div className="flex min-h-0 flex-1 flex-col gap-3 py-3">
				<div className="flex items-baseline justify-between gap-2">
					<h2 className="text-sm font-semibold truncate">{isBulk ? t('wizard.playlist.bulkHeading') : playlistTitle || t('wizard.playlist.heading')}</h2>
					<span className="shrink-0 text-xs text-muted-foreground">{t(isBulk ? 'wizard.playlist.itemCountBulk' : isAudioOnlySource(wizardExtractor) ? 'wizard.playlist.itemCountAudio' : 'wizard.playlist.itemCount', {count: playlistItems.length})}</span>
				</div>

				{!isBulk ? (
					<PlaylistScopeControl applyLabel={t('wizard.url.playlistScope.applyReload', {defaultValue: 'Apply and reload'})} pendingLabel={t('wizard.url.playlistScope.reloading', {defaultValue: 'Reloading...'})} disabled={playlistProbeLoading || playlistScopeReloading} onApplyScope={reloadPlaylistWithScope} />
				) : null}

				{!isBulk && playlistScopeError ? (
					<Alert variant="warning" className="flex items-start gap-3" data-testid="playlist-scope-error">
						<Info className="mt-0.5 size-4 shrink-0 text-amber-500" />
						<div className="min-w-0 flex-1">
							<AlertTitle>{t('wizard.url.playlistScope.emptyTitle', {defaultValue: 'No videos in that scope'})}</AlertTitle>
							<AlertDescription className="break-words">{playlistScopeError}</AlertDescription>
						</div>
					</Alert>
				) : null}

				{showProbeLimitAlert && (
					<Alert variant="warning" className="flex items-start gap-3" data-testid="playlist-probe-limit-alert">
						<Info className="mt-0.5 size-4 shrink-0 text-sky-500" />
						<div className="min-w-0 flex-1">
							<AlertTitle>{t('wizard.playlist.probeLimitAlertTitle')}</AlertTitle>
							<AlertDescription className="break-words">{probeLimitDescription}</AlertDescription>
						</div>
						<PlaylistProbeLimitSelector testId="playlist-alert-probe-limit" showCurrent={false} onLimitChanged={() => retryFormatProbe()} className="w-40" />
					</Alert>
				)}

				{playlistBusy ? <PlaylistProbeLoadingStatus loadingLabel={t('wizard.playlist.loadingItems')} phaseLabel={probePhaseLabel} progressLabel={probeProgressLabel} progressValue={probeProgressValue} limitHint={probeLimitHint} /> : null}

				<div className="flex items-center gap-2 flex-wrap">
					<Button type="button" variant="outline" size="sm" onClick={selectAllPlaylistItems} disabled={playlistBusy}>
						{t('wizard.playlist.selectAll')}
					</Button>
					<Button type="button" variant="outline" size="sm" onClick={selectNonePlaylistItems} disabled={playlistBusy}>
						{t('wizard.playlist.selectNone')}
					</Button>
					<div className="ml-auto flex items-center gap-1">
						<span className="text-xs text-muted-foreground">{t('wizard.playlist.rangeFrom')}</span>
						<Input className="h-7 w-14 px-2 text-xs" value={rangeFrom} onChange={e => setRangeFrom(e.target.value)} placeholder="1" disabled={playlistBusy} />
						<span className="text-xs text-muted-foreground">{t('wizard.playlist.rangeTo')}</span>
						<Input className="h-7 w-14 px-2 text-xs" value={rangeTo} onChange={e => setRangeTo(e.target.value)} placeholder="10" disabled={playlistBusy} />
						<Button type="button" variant="outline" size="sm" onClick={applyRange} disabled={playlistBusy}>
							{t('wizard.playlist.rangeApply')}
						</Button>
					</div>
				</div>

				{playlistBusy ? (
					<PlaylistProbeSkeletonRows showThumbnail={playlistItems.length === 0 || hasAnyThumbnail} />
				) : (
					<>
						{!isBulk && syncScanState === 'scanning' && (
							<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
								<FolderSearch size={13} />
								{t('wizard.playlist.syncScanning')}
							</p>
						)}

						{isBulk && bulkMetadataStatus === 'resolving' && (
							<p className="flex items-center gap-1.5 text-xs text-muted-foreground" data-testid="bulk-metadata-status">
								<span className="h-3 w-3 rounded-full border-2 border-current/20 border-t-current animate-spin" aria-hidden />
								{t('wizard.playlist.bulkMetadataResolving', {done: bulkMetadataCompleted, total: bulkMetadataTotal})}
							</p>
						)}

						{!isBulk && syncScanState === 'done' && !syncDismissed && foundCount > 0 && (
							<Alert variant="success" className="flex items-start gap-3">
								<FolderCheck className="mt-0.5 size-4 shrink-0 text-emerald-500" />
								<div className="min-w-0 flex-1">
									<AlertTitle>{t('wizard.playlist.syncFoundTitle')}</AlertTitle>
									<AlertDescription className="break-words">{t('wizard.playlist.syncFoundDesc', {n: foundCount, dir: syncDir})}</AlertDescription>
									<div className="mt-2.5 flex items-center gap-2">
										<Button
											type="button"
											size="sm"
											onClick={() => {
												applyFolderSync()
												setSyncDismissed(true)
											}}
										>
											{t('wizard.playlist.syncApply')}
										</Button>
										<Button type="button" variant="outline" size="sm" onClick={changeSyncFolder}>
											{t('wizard.playlist.syncChange')}
										</Button>
									</div>
								</div>
								<Button type="button" variant="ghost" size="icon-sm" className="-mt-1 -me-1 shrink-0" aria-label={t('titleBar.close')} onClick={() => setSyncDismissed(true)}>
									<X />
								</Button>
							</Alert>
						)}

						{!isBulk && syncScanState === 'done' && !syncDismissed && foundCount === 0 && (
							<Alert variant="info" className="flex items-start gap-3">
								<Info className="mt-0.5 size-4 shrink-0 text-sky-500" />
								<div className="min-w-0 flex-1">
									<AlertTitle>{t('wizard.playlist.syncNoneTitle')}</AlertTitle>
									<AlertDescription className="break-words">{t('wizard.playlist.syncNoneDesc', {dir: syncDir})}</AlertDescription>
									<div className="mt-2.5">
										<Button type="button" variant="outline" size="sm" onClick={changeSyncFolder}>
											{t('wizard.playlist.syncChange')}
										</Button>
									</div>
								</div>
								<Button type="button" variant="ghost" size="icon-sm" className="-mt-1 -me-1 shrink-0" aria-label={t('titleBar.close')} onClick={() => setSyncDismissed(true)}>
									<X />
								</Button>
							</Alert>
						)}

						<div ref={parentRef} className="min-h-[12rem] flex-1 overflow-y-auto rounded-md border border-border">
							<div style={{height: virtualizer.getTotalSize(), position: 'relative'}}>
								{virtualizer.getVirtualItems().map(virtualRow => {
									const entry = playlistItems[virtualRow.index]
									const checked = selectedPlaylistItemIds.includes(entry.id)
									const isAlreadyDownloaded = !!(entry.videoId && syncedDownloadedIds.includes(entry.videoId))
									const bulkRowStatus = isBulk ? bulkMetadataById[entry.id] : undefined
									const bulkRowStatusKey = bulkRowStatus === 'pending' ? 'wizard.playlist.bulkRowWaiting' : bulkRowStatus === 'resolving' ? 'wizard.playlist.bulkRowResolving' : bulkRowStatus === 'failed' ? 'wizard.playlist.bulkRowFailed' : null
									return (
										// react-doctor-disable-next-line react-doctor/prefer-tag-over-role
										<div
											key={entry.id}
											role="checkbox"
											aria-checked={checked}
											tabIndex={0}
											data-index={virtualRow.index}
											ref={virtualizer.measureElement}
											style={{position: 'absolute', top: virtualRow.start, left: 0, right: 0}}
											className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer"
											onClick={() => setPlaylistItemSelected(entry.id, !checked)}
											onKeyDown={e => {
												if (e.key === ' ' || e.key === 'Enter') {
													e.preventDefault()
													setPlaylistItemSelected(entry.id, !checked)
												}
											}}
										>
											<Checkbox checked={checked} onCheckedChange={v => setPlaylistItemSelected(entry.id, !!v)} onClick={e => e.stopPropagation()} />
											{hasAnyThumbnail ? entry.thumbnail ? <img src={entry.thumbnail} alt={t('wizard.playlist.thumbnailAlt')} referrerPolicy="no-referrer" className="h-8 w-[56px] shrink-0 rounded-sm object-cover" loading="lazy" /> : <div className="h-8 w-[56px] shrink-0 rounded-sm bg-muted" /> : null}
											<span className="min-w-0 flex-1">
												<span className="block truncate text-sm">{entry.title}</span>
												{isBulk ? (
													<span className="block truncate font-mono text-[11px] text-muted-foreground" data-testid={`bulk-row-url-${entry.id}`}>
														{bulkRowStatusKey ? <span className="font-sans">{t(bulkRowStatusKey)} · </span> : null}
														{entry.url}
													</span>
												) : null}
											</span>
											{isAlreadyDownloaded && <span className="shrink-0 rounded-sm bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{t('wizard.playlist.alreadyDownloaded')}</span>}
											<span className="shrink-0 text-xs text-muted-foreground">{formatEntryDuration(entry.duration, liveLabel)}</span>
										</div>
									)
								})}
							</div>
						</div>

						{selectedCount > 0 ? <p className="text-xs text-muted-foreground">{t('wizard.playlist.selectedCount_other', {count: selectedCount})}</p> : <p className="text-xs text-destructive">{t('wizard.playlist.noSelection')}</p>}
					</>
				)}
			</div>

			<WizardStepFooterActions onBack={back} onContinue={() => void confirmPlaylistSelection()} continueDisabled={!canContinue} />
		</div>
	)
}
