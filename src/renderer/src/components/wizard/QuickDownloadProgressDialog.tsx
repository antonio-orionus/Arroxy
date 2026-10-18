import {type ReactNode} from 'react'
import type {TFunction} from 'i18next'
import {useTranslation} from 'react-i18next'
import {Download, Link2} from 'lucide-react'
import {resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import type {ProbeProgressEvent, QuickDownloadProgressPhase} from '@shared/types.js'
import {cn} from '@renderer/lib/utils.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Button} from '../ui/button.js'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../ui/dialog.js'
import {Progress} from '../ui/progress.js'
import {Spinner} from '../ui/spinner.js'
import {IconTile} from '../shared/IconTile.js'

const PHASE_LABEL_KEYS: Record<QuickDownloadProgressPhase, 'wizard.quickProgress.phase.probing' | 'wizard.quickProgress.phase.queueing'> = {probing: 'wizard.quickProgress.phase.probing', queueing: 'wizard.quickProgress.phase.queueing'}

// Items loaded so far in a playlist probe's items phase, with the total capped at the playlist load limit.
interface PlaylistItemCounts {
	loaded: number
	total: number | null
}

interface QuickDownloadProgressReadout {
	phaseLabel: string
	countLabel: string
	value: number
	showIndeterminateProbeLine: boolean
	showProbeLimitHint: boolean
}

// The store holds the latest playlist probe event app-wide; only the one for the link being prepared belongs here.
function matchActivePlaylistProbe(phase: QuickDownloadProgressPhase, probe: ProbeProgressEvent | null, current: string | null, wizardUrl: string): ProbeProgressEvent | null {
	if (phase !== 'probing' || !probe) return null
	return probe.url === current || probe.url === wizardUrl ? probe : null
}

function resolvePlaylistItemCounts(probe: ProbeProgressEvent | null, playlistLimit: number): PlaylistItemCounts | null {
	if (probe?.phase !== 'items') return null
	const total = probe.total ? Math.min(probe.total, playlistLimit) : null
	return {loaded: Math.min(probe.loaded, total ?? probe.loaded), total}
}

function clampPercent(value: number): number {
	return Math.min(100, Math.max(0, value))
}

function formatProgressCount(t: TFunction, probe: ProbeProgressEvent | null, itemCounts: PlaylistItemCounts | null, completed: number, safeTotal: number): string {
	if (!probe) return `${completed} / ${safeTotal}`
	if (probe.phase === 'pages') return t('wizard.playlist.loadingPagesFound', {count: probe.loaded})
	return itemCounts?.total ? `${itemCounts.loaded} / ${itemCounts.total}` : String(probe.loaded)
}

function formatPhaseLabel(t: TFunction, phase: QuickDownloadProgressPhase, probe: ProbeProgressEvent | null): string {
	if (probe?.phase === 'pages') return t('wizard.playlist.loadingPhasePages')
	if (probe?.phase === 'items') return t('wizard.playlist.loadingPhaseItems')
	return t(PHASE_LABEL_KEYS[phase])
}

function describeQuickDownloadProgress({t, phase, probe, playlistLimit, completed, total}: {t: TFunction; phase: QuickDownloadProgressPhase; probe: ProbeProgressEvent | null; playlistLimit: number; completed: number; total: number}): QuickDownloadProgressReadout {
	const safeTotal = Math.max(total, 1)
	const itemCounts = resolvePlaylistItemCounts(probe, playlistLimit)
	const value = itemCounts?.total ? clampPercent(Math.round((itemCounts.loaded / itemCounts.total) * 100)) : clampPercent((completed / safeTotal) * 100)
	return {phaseLabel: formatPhaseLabel(t, phase, probe), countLabel: formatProgressCount(t, probe, itemCounts, completed, safeTotal), value, showIndeterminateProbeLine: probe?.phase === 'pages', showProbeLimitHint: probe?.phase === 'items' && probe.total !== undefined && probe.total > playlistLimit}
}

export function QuickDownloadProgressDialog(): ReactNode {
	const {t} = useTranslation()
	const quickDownloadStatus = useAppStore(state => state.quickDownloadStatus)
	const phase = useAppStore(state => state.quickDownloadProgressPhase)
	const total = useAppStore(state => state.quickDownloadProgressTotal)
	const completed = useAppStore(state => state.quickDownloadProgressCompleted)
	const failed = useAppStore(state => state.quickDownloadProgressFailed)
	const current = useAppStore(state => state.quickDownloadProgressCurrent)
	const title = useAppStore(state => state.quickDownloadProgressTitle)
	const wizardUrl = useAppStore(state => state.wizardUrl)
	const playlistProbeProgress = useAppStore(state => state.playlistProbeProgress)
	const settings = useAppStore(state => state.settings)
	const cancelQuickDownload = useAppStore(state => state.cancelQuickDownload)
	const activeProfile = resolveActiveDownloadProfile(settings?.profiles).profile
	const open = quickDownloadStatus === 'preparing'
	const currentLabel = title ?? current ?? t('wizard.quickProgress.currentFallback')
	const playlistLimit = resolvePlaylistProbeLimit(settings?.common)
	const probe = matchActivePlaylistProbe(phase, playlistProbeProgress, current, wizardUrl)
	const readout = describeQuickDownloadProgress({t, phase, probe, playlistLimit, completed, total})
	const hasFailures = failed > 0

	return (
		<Dialog open={open} disablePointerDismissal onOpenChange={() => undefined}>
			<DialogContent data-testid="quick-download-progress-dialog" className="overflow-hidden sm:max-w-md" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<IconTile tone="lit" size="sm">
							<Download />
						</IconTile>
						{t('wizard.quickProgress.title')}
					</DialogTitle>
					<DialogDescription>{t('wizard.quickProgress.description', {profileName: activeProfile.name})}</DialogDescription>
				</DialogHeader>

				<div className="grid min-w-0 gap-3" data-testid="quick-download-progress-body">
					<div className="glow-tile min-w-0 max-w-full overflow-hidden rounded-xl border-transparent p-3" data-testid="quick-download-progress-current" aria-live="polite">
						<div className="flex min-w-0 items-center gap-2">
							<Link2 className="size-4 shrink-0 text-primary" aria-hidden />
							<span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground" data-testid="quick-download-progress-current-label">
								{currentLabel}
							</span>
						</div>
						<div className="mt-3 flex items-center justify-between gap-3 text-xs">
							<span className="inline-flex min-w-0 items-center gap-1.5 font-medium text-primary" data-testid="quick-download-progress-phase">
								<Spinner aria-hidden className="size-3.5" />
								<span className="truncate">{readout.phaseLabel}</span>
							</span>
							<span className="shrink-0 rounded-full border border-primary/30 bg-primary/12 px-2 py-0.5 font-mono tabular-nums text-primary" data-testid="quick-download-progress-count">
								{readout.countLabel}
							</span>
						</div>
						{readout.showIndeterminateProbeLine ? (
							<div className="thumb-shimmer mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary" aria-hidden />
						) : (
							<div className="progress-glow mt-2">
								<Progress value={readout.value} className="[&_[data-slot=progress-track]]:h-1.5" />
							</div>
						)}
						{readout.showProbeLimitHint ? <p className="mt-2 text-xs text-muted-foreground">{t('wizard.playlist.loadingLimitHint', {count: playlistLimit})}</p> : null}
						{hasFailures ? <p className="mt-2 text-xs font-medium text-warning">{t('wizard.quickProgress.failedCount', {count: failed})}</p> : null}
					</div>
					<p className={cn('text-xs leading-relaxed text-muted-foreground', hasFailures && 'text-warning')}>{t('wizard.quickProgress.waitHint')}</p>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={cancelQuickDownload} data-testid="quick-download-progress-cancel">
						{t('wizard.quickProgress.cancel')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
