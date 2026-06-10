import type {ReactNode} from 'react'
import {AlertTriangle} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {useAppStore} from '../../store/useAppStore.js'
import {buildDownloadReview, conflictLabelKey} from '../../store/wizard/downloadReviewProjection.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Button} from '../ui/button.js'
import {Table, TableBody, TableCell, TableRow} from '../ui/table.js'
import {Tooltip, TooltipTrigger, TooltipContent} from '../ui/tooltip.js'
import {WizardFooter} from './WizardFooter.js'
import {VideoSummaryCard} from '../shared/VideoSummaryCard.js'
import loveImg from '../../assets/Love.png'

export function StepConfirm(): ReactNode {
	const {t, i18n} = useTranslation()
	const state = useAppStore()
	const {addToQueue, addAndDownloadImmediately, back, isSubmittingToQueue} = state
	const translateReview = (key: string, params?: Record<string, unknown>): string => (t as unknown as (key: string, params?: Record<string, unknown>) => string)(key, params)
	const review = buildDownloadReview(state, {t: translateReview, language: i18n.language, commonPaths: state.commonPaths})

	return (
		<div className="wizard-step flex flex-col gap-4" data-testid="step-confirm">
			{!review.inBatch && <VideoSummaryCard thumbnail={state.wizardThumbnail} title={state.wizardTitle} duration={state.wizardDuration} resolution={state.selectedVideoFormatId !== '' ? review.videoResolution : undefined} webpageUrl={state.wizardWebpageUrl} />}

			{/* Mascot banner */}
			<div className="flex items-center gap-4 p-4 rounded-lg border border-[hsla(220,100%,56%,0.15)] bg-[var(--brand-dim)] shrink-0">
				<img src={loveImg} alt="" aria-hidden className="size-16 shrink-0 object-contain" />
				<div>
					<p className="text-sm font-semibold text-foreground">{t('wizard.confirm.readyHeadline')}</p>
					<p className="text-xs text-muted-foreground mt-1">
						{t('wizard.confirm.landIn')} <code className="font-mono text-foreground/80">{review.shortPath}</code>
					</p>
				</div>
			</div>

			{/* Summary table */}
			<div className="overflow-hidden rounded-lg border border-border bg-secondary" data-testid="confirm-preview">
				<Table>
					<TableBody>
						{review.summaryRows.map(row => (
							<TableRow key={row.key} className="hover:bg-transparent">
								<TableCell className="w-16 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{row.label}</TableCell>
								<TableCell className="max-w-xs px-4 py-2 font-mono text-xs text-foreground/80" data-testid={`confirm-${row.key}`}>
									<span className="block truncate">{row.value}</span>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{review.conflictWarnings.length > 0 && (
				<Alert variant="warning" data-testid="confirm-conflicts">
					<AlertTriangle />
					<AlertDescription>
						<ul className="flex flex-col gap-1">
							{review.conflictWarnings.map(c => (
								<li key={c.code}>{t(conflictLabelKey(c.code))}</li>
							))}
						</ul>
					</AlertDescription>
				</Alert>
			)}

			{review.hasNothingSelected && (
				<Alert variant="info" data-testid="nothing-to-download-note">
					<AlertDescription>{t('wizard.confirm.nothingToDownload')}</AlertDescription>
				</Alert>
			)}

			<WizardFooter>
				<Button variant="ghost" type="button" onClick={back} data-testid="btn-back" disabled={isSubmittingToQueue} className="border-[1.5px] border-[var(--border-strong)] text-muted-foreground hover:text-foreground">
					{t('common.back')}
				</Button>
				{review.inBatch ? (
					// Batch downloads always go through the queue — parallel-pulling N entries
					// would spike YouTube rate-limits and bot-detection. No Pull-it CTA.
					<Tooltip>
						<TooltipTrigger
							render={props => (
								<Button {...props} type="button" onClick={() => void addToQueue()} data-testid="btn-add-to-queue" disabled={!review.allowedActions.addToQueue || isSubmittingToQueue} className="shadow-[0_4px_14px_var(--brand-glow)] pl-4 pr-3 min-w-[96px]">
									{t('wizard.confirm.addToQueue')}
								</Button>
							)}
						/>
						<TooltipContent>{t('wizard.confirm.addToQueueTooltip')}</TooltipContent>
					</Tooltip>
				) : (
					<>
						<Tooltip>
							<TooltipTrigger
								render={props => (
									<Button {...props} variant="outline" type="button" onClick={() => void addAndDownloadImmediately()} data-testid="btn-download-now" disabled={!review.allowedActions.downloadNow || isSubmittingToQueue}>
										{t('wizard.confirm.pullIt')}
									</Button>
								)}
							/>
							<TooltipContent>{t('wizard.confirm.pullItTooltip')}</TooltipContent>
						</Tooltip>
						<Tooltip>
							<TooltipTrigger
								render={props => (
									<Button {...props} type="button" onClick={() => void addToQueue()} data-testid="btn-add-to-queue" disabled={!review.allowedActions.addToQueue || isSubmittingToQueue} className="shadow-[0_4px_14px_var(--brand-glow)] pl-4 pr-3 min-w-[96px]">
										{t('wizard.confirm.addToQueue')}
									</Button>
								)}
							/>
							<TooltipContent>{t('wizard.confirm.addToQueueTooltip')}</TooltipContent>
						</Tooltip>
					</>
				)}
			</WizardFooter>
		</div>
	)
}
