import type {ReactNode} from 'react'
import {AlertTriangle} from 'lucide-react'
import {useTranslation} from 'react-i18next'
import {useAppStore} from '../../store/useAppStore.js'
import {buildDownloadReview, conflictLabelKey, multiProfileBreakdown} from '../../store/wizard/downloadReviewProjection.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Button} from '../ui/button.js'
import {Table, TableBody, TableCell, TableRow} from '../ui/table.js'
import {Tooltip, TooltipTrigger, TooltipContent} from '../ui/tooltip.js'
import {WizardFooter} from './WizardFooter.js'
import {VideoSummaryCard} from '../shared/VideoSummaryCard.js'
import {PROFILE_ICONS} from './downloadProfileVisuals.js'
import loveImg from '../../assets/Love.png'
import {createTranslationPort} from '../../lib/translation.js'
import {SectionLabel} from '../shared/SectionLabel.js'
import {Card} from '../ui/card.js'

export function StepConfirm(): ReactNode {
	const {t, i18n} = useTranslation()
	const state = useAppStore()
	const {addToQueue, addAndDownloadImmediately, back, isSubmittingToQueue} = state
	const review = buildDownloadReview(state, {t: createTranslationPort(t), language: i18n.language, commonPaths: state.commonPaths})
	// A single preset row can't represent a batch where every item may carry a
	// different DownloadProfile — this replaces it with a per-profile grouping.
	const profileBreakdown = review.inMultiProfile ? multiProfileBreakdown(state) : []

	return (
		<div className="wizard-step flex flex-col gap-4" data-testid="step-confirm">
			{!review.inBatch && <VideoSummaryCard thumbnail={state.wizardThumbnail} title={state.wizardTitle} duration={state.wizardDuration} resolution={state.selectedVideoFormatId !== '' ? review.videoResolution : undefined} webpageUrl={state.wizardWebpageUrl} />}

			{/* Mascot banner */}
			<div className="flex shrink-0 items-center gap-4 rounded-lg border border-primary/20 bg-primary/12 p-4">
				<img src={loveImg} alt="" aria-hidden className="size-16 shrink-0 object-contain" />
				<div>
					<p className="text-sm font-semibold text-foreground">{t('wizard.confirm.readyHeadline')}</p>
					<p className="text-xs text-muted-foreground mt-1">
						{review.inMultiProfile ? (
							t('wizard.confirm.landInMultiProfile', {count: profileBreakdown.length})
						) : (
							<>
								{t('wizard.confirm.landIn')} <code className="font-mono text-foreground">{review.shortPath}</code>
							</>
						)}
					</p>
				</div>
			</div>

			{/* Summary table */}
			<Card variant="inset" className="gap-0 py-0" data-testid="confirm-preview">
				<Table>
					<TableBody>
						{review.summaryRows.map(row => (
							<TableRow key={row.key} className="hover:bg-transparent">
								<SectionLabel render={<TableCell />} className="w-16 px-4 py-2">
									{row.label}
								</SectionLabel>
								<TableCell className="max-w-xs px-4 py-2 text-sm text-foreground" data-testid={`confirm-${row.key}`}>
									<span className="block truncate">{row.value}</span>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</Card>

			{profileBreakdown.length > 0 && (
				<Card variant="inset" className="gap-0 py-0" data-testid="confirm-profile-breakdown">
					<SectionLabel className="px-4 pt-3">{t('wizard.confirm.profileBreakdownHeading')}</SectionLabel>
					<Table>
						<TableBody>
							{profileBreakdown.map(row => {
								const Icon = PROFILE_ICONS[row.icon]
								return (
									<TableRow key={row.profileId} className="hover:bg-transparent" data-testid={`confirm-profile-row-${row.profileId}`}>
										<TableCell className="w-8 px-4 py-2">
											<Icon size={14} className="text-muted-foreground" aria-hidden />
										</TableCell>
										<TableCell className="px-0 py-2 text-sm text-foreground">{row.name}</TableCell>
										<TableCell className="px-2 py-2 text-xs text-muted-foreground tabular-nums">{t('wizard.confirm.profileBreakdownCount', {count: row.count})}</TableCell>
										<TableCell className="max-w-xs px-4 py-2 font-mono text-xs text-muted-foreground">
											<span className="block truncate">{row.outputDir}</span>
										</TableCell>
									</TableRow>
								)
							})}
						</TableBody>
					</Table>
				</Card>
			)}

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
				<Button variant="outline" type="button" onClick={back} data-testid="btn-back" disabled={isSubmittingToQueue}>
					{t('common.back')}
				</Button>
				{review.inBatch ? (
					// Batch downloads always go through the queue — parallel-pulling N entries
					// would spike YouTube rate-limits and bot-detection. No Pull-it CTA.
					<Tooltip>
						<TooltipTrigger
							render={props => (
								<Button variant="glow" {...props} type="button" onClick={() => void addToQueue()} data-testid="btn-add-to-queue" disabled={!review.allowedActions.addToQueue || isSubmittingToQueue} className="min-w-24">
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
									<Button variant="glow" {...props} type="button" onClick={() => void addToQueue()} data-testid="btn-add-to-queue" disabled={!review.allowedActions.addToQueue || isSubmittingToQueue} className="min-w-24">
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
