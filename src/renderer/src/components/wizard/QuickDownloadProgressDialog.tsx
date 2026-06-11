import {type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Download, Link2} from 'lucide-react'
import {resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import {resolvePlaylistProbeLimit} from '@shared/networkPacing.js'
import type {QuickDownloadProgressPhase} from '@shared/types.js'
import {cn} from '@renderer/lib/utils.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Button} from '../ui/button.js'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../ui/dialog.js'
import {Progress} from '../ui/progress.js'
import {Spinner} from '../ui/spinner.js'

const PHASE_LABEL_KEYS: Record<QuickDownloadProgressPhase, 'wizard.quickProgress.phase.probing' | 'wizard.quickProgress.phase.queueing'> = {probing: 'wizard.quickProgress.phase.probing', queueing: 'wizard.quickProgress.phase.queueing'}

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
	const safeTotal = Math.max(total, 1)
	const currentLabel = title ?? current ?? t('wizard.quickProgress.currentFallback')
	const playlistLimit = resolvePlaylistProbeLimit(settings?.common)
	const activePlaylistProbeProgress = phase === 'probing' && playlistProbeProgress && (playlistProbeProgress.url === current || playlistProbeProgress.url === wizardUrl) ? playlistProbeProgress : null
	const itemProgressTotal = activePlaylistProbeProgress?.phase === 'items' && activePlaylistProbeProgress.total ? Math.min(activePlaylistProbeProgress.total, playlistLimit) : null
	const itemProgressLoaded = activePlaylistProbeProgress?.phase === 'items' ? Math.min(activePlaylistProbeProgress.loaded, itemProgressTotal ?? activePlaylistProbeProgress.loaded) : null
	const defaultProgressValue = Math.min(100, Math.max(0, (completed / safeTotal) * 100))
	const playlistProgressValue = itemProgressTotal && itemProgressLoaded !== null ? Math.min(100, Math.max(0, Math.round((itemProgressLoaded / itemProgressTotal) * 100))) : null
	const progressValue = playlistProgressValue ?? defaultProgressValue
	const phaseLabel = activePlaylistProbeProgress?.phase === 'pages' ? t('wizard.playlist.loadingPhasePages') : activePlaylistProbeProgress?.phase === 'items' ? t('wizard.playlist.loadingPhaseItems') : t(PHASE_LABEL_KEYS[phase])
	const progressCountLabel = activePlaylistProbeProgress
		? activePlaylistProbeProgress.phase === 'pages'
			? t('wizard.playlist.loadingPagesFound', {count: activePlaylistProbeProgress.loaded})
			: itemProgressTotal && itemProgressLoaded !== null
				? `${itemProgressLoaded} / ${itemProgressTotal}`
				: String(activePlaylistProbeProgress.loaded)
		: `${completed} / ${safeTotal}`
	const showIndeterminateProbeLine = activePlaylistProbeProgress?.phase === 'pages'
	const showProbeLimitHint = activePlaylistProbeProgress?.phase === 'items' && activePlaylistProbeProgress.total !== undefined && activePlaylistProbeProgress.total > playlistLimit

	return (
		<Dialog open={open} disablePointerDismissal onOpenChange={() => undefined}>
			<DialogContent data-testid="quick-download-progress-dialog" className="overflow-hidden sm:max-w-md" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<span className="icon-tile grid size-9 shrink-0 place-items-center rounded-lg">
							<Download className="size-4" aria-hidden />
						</span>
						{t('wizard.quickProgress.title')}
					</DialogTitle>
					<DialogDescription>{t('wizard.quickProgress.description', {profileName: activeProfile.name})}</DialogDescription>
				</DialogHeader>

				<div className="grid min-w-0 gap-3" data-testid="quick-download-progress-body">
					<div className="glow-tile min-w-0 max-w-full overflow-hidden rounded-xl border-transparent p-3" data-testid="quick-download-progress-current" aria-live="polite">
						<div className="flex min-w-0 items-center gap-2">
							<Link2 className="size-4 shrink-0 text-[var(--brand)]" aria-hidden />
							<span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground" data-testid="quick-download-progress-current-label">
								{currentLabel}
							</span>
						</div>
						<div className="mt-3 flex items-center justify-between gap-3 text-[12px]">
							<span className="inline-flex min-w-0 items-center gap-1.5 font-medium text-[var(--brand)]" data-testid="quick-download-progress-phase">
								<Spinner aria-hidden className="size-3.5" />
								<span className="truncate">{phaseLabel}</span>
							</span>
							<span className="shrink-0 rounded-full border border-[var(--brand)]/30 bg-[var(--brand-dim)] px-2 py-0.5 font-mono tabular-nums text-[var(--brand)]" data-testid="quick-download-progress-count">
								{progressCountLabel}
							</span>
						</div>
						{showIndeterminateProbeLine ? (
							<div className="thumb-shimmer mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary" aria-hidden />
						) : (
							<div className="progress-glow mt-2">
								<Progress value={progressValue} className="[&_[data-slot=progress-track]]:h-1.5" />
							</div>
						)}
						{showProbeLimitHint ? <p className="mt-2 text-[12px] text-[var(--text-glass-muted)]">{t('wizard.playlist.loadingLimitHint', {count: playlistLimit})}</p> : null}
						{failed > 0 ? <p className="mt-2 text-[12px] font-medium text-[var(--color-status-paused)]">{t('wizard.quickProgress.failedCount', {count: failed})}</p> : null}
					</div>
					<p className={cn('text-[12px] leading-relaxed text-[var(--text-glass-muted)]', failed > 0 && 'text-[var(--color-status-paused)]')}>{t('wizard.quickProgress.waitHint')}</p>
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
