import {type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Download, Link2} from 'lucide-react'
import {resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
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
	const settings = useAppStore(state => state.settings)
	const cancelQuickDownload = useAppStore(state => state.cancelQuickDownload)
	const activeProfile = resolveActiveDownloadProfile(settings?.profiles).profile
	const open = quickDownloadStatus === 'preparing'
	const safeTotal = Math.max(total, 1)
	const percent = Math.min(100, Math.max(0, (completed / safeTotal) * 100))
	const currentLabel = title ?? current ?? t('wizard.quickProgress.currentFallback')

	return (
		<Dialog open={open} disablePointerDismissal onOpenChange={() => undefined}>
			<DialogContent data-testid="quick-download-progress-dialog" className="sm:max-w-md" showCloseButton={false}>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<span className="icon-tile grid size-9 shrink-0 place-items-center rounded-lg">
							<Download className="size-4" aria-hidden />
						</span>
						{t('wizard.quickProgress.title')}
					</DialogTitle>
					<DialogDescription>{t('wizard.quickProgress.description', {profileName: activeProfile.name})}</DialogDescription>
				</DialogHeader>

				<div className="grid gap-3">
					<div className="glow-tile rounded-xl border-transparent p-3">
						<div className="flex min-w-0 items-center gap-2">
							<Link2 className="size-4 shrink-0 text-[var(--brand)]" aria-hidden />
							<span className="min-w-0 truncate text-[13px] font-medium text-foreground">{currentLabel}</span>
						</div>
						<div className="mt-3 flex items-center justify-between gap-3 text-[12px]">
							<span className="inline-flex items-center gap-1.5 font-medium text-[var(--brand)]">
								<Spinner aria-hidden className="size-3.5" />
								{t(PHASE_LABEL_KEYS[phase])}
							</span>
							<span className="font-mono tabular-nums text-[var(--text-subtle)]" data-testid="quick-download-progress-count">
								{completed} / {safeTotal}
							</span>
						</div>
						<div className="progress-glow mt-2">
							<Progress value={percent} className="[&_[data-slot=progress-track]]:h-1.5" />
						</div>
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
