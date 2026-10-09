import {Suspense, useEffect, useMemo, useRef, useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useAppStore} from '../../store/useAppStore.js'
import {STEP_REGISTRY} from '../wizard/stepRegistry.js'
import {buildWizardStepGraph, visibleWizardSteps} from '../../store/wizard/wizardStepGraph.js'
import {StepError} from '../wizard/StepError.js'
import {MixedUrlPromptDialog} from '../wizard/MixedUrlPromptDialog.js'
import {QuickPlaylistCapDialog} from '../wizard/QuickPlaylistCapDialog.js'
import {QuickDownloadProgressDialog} from '../wizard/QuickDownloadProgressDialog.js'
import {cn} from '@renderer/lib/utils.js'
import {collectionKindForWizardUrls} from '../../store/wizard/collectionKind.js'
import {Check} from 'lucide-react'
import {Card} from '../ui/card.js'

// The wizard lives on the same glass stage as the tabs. Overflow stays visible
// so each step's sticky footer can pin to the scrollport while the step scrolls.
function WizardStage({enabled, children}: {enabled: boolean; children: ReactNode}): ReactNode {
	if (!enabled) return children
	return (
		<Card variant="glass" data-wizard-stage="" className="flex-1 gap-0 overflow-visible px-6 pt-5 pb-0">
			{children}
		</Card>
	)
}

function WizardStepFallback(): ReactNode {
	return <div className="wizard-step min-h-32" data-testid="wizard-step-loading" aria-busy="true" />
}

export function WizardPanel(): ReactNode {
	const {t} = useTranslation()
	const wizardStep = useAppStore(s => s.wizardStep)
	const activePreset = useAppStore(s => s.activePreset)
	const wizardMode = useAppStore(s => s.wizardMode)
	const wizardUrl = useAppStore(s => s.wizardUrl)
	const wizardWebpageUrl = useAppStore(s => s.wizardWebpageUrl)
	const playlistSelection = useAppStore(s => s.playlistSelection)
	const wizardExtractor = useAppStore(s => s.wizardExtractor)
	const wizardSubtitles = useAppStore(s => s.wizardSubtitles)
	const wizardAutomaticCaptions = useAppStore(s => s.wizardAutomaticCaptions)
	const wizardSubtitleSkipped = useAppStore(s => s.wizardSubtitleSkipped)
	const multiProfileMode = useAppStore(s => s.multiProfileMode)

	const graph = useMemo(
		() => buildWizardStepGraph({wizardStep, activePreset, wizardMode, playlistSelection, wizardExtractor, wizardSubtitles, wizardAutomaticCaptions, wizardSubtitleSkipped, multiProfileMode}),
		[wizardStep, activePreset, wizardMode, playlistSelection, wizardExtractor, wizardSubtitles, wizardAutomaticCaptions, wizardSubtitleSkipped, multiProfileMode]
	)

	const visibleSteps = visibleWizardSteps(graph)
	const activeIndex = graph.activeIndex
	const activeDescriptor = STEP_REGISTRY.find(d => d.id === wizardStep)
	const isDownloadHome = graph.isDownloadHome
	const collectionKind = wizardMode === 'playlist' ? collectionKindForWizardUrls(wizardUrl, wizardWebpageUrl) : null
	const playlistItemsStepLabelKey = collectionKind === 'channel' || collectionKind === 'search' ? 'wizard.steps.playlistItemsGeneric' : 'wizard.steps.playlistItems'

	const prevIndexRef = useRef(activeIndex)
	const [isBackward, setIsBackward] = useState(false)

	useEffect(() => {
		setIsBackward(activeIndex >= 0 && prevIndexRef.current >= 0 && activeIndex < prevIndexRef.current)
		prevIndexRef.current = activeIndex
	}, [activeIndex])

	return (
		<section className={cn('flex min-h-full min-w-0 flex-col px-6', isDownloadHome ? 'pt-4' : 'pt-3 pb-4', isBackward ? 'wizard-backward' : 'wizard-forward')} data-testid="wizard-panel">
			<WizardStage enabled={!isDownloadHome}>
				{wizardStep !== 'error' && !isDownloadHome && (
					<div className="flex items-center mb-4" aria-hidden data-testid="step-indicator">
						{visibleSteps.map((stepKey, i) => {
							const isDone = i < activeIndex
							const isActive = i === activeIndex
							return (
								<div key={stepKey} className="flex items-center flex-1 last:flex-none">
									<div className="flex flex-col items-center gap-1">
										<div
											className={cn(
												'flex size-6 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300',
												isActive && 'border-primary bg-primary/12 text-primary ring-3 ring-primary/12',
												isDone && 'border-transparent bg-primary text-primary-foreground',
												!isActive && !isDone && 'border-border-strong bg-card text-muted-foreground'
											)}
										>
											{isDone ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : i + 1}
										</div>
										<span className={cn('text-label uppercase', isActive ? 'text-primary' : 'text-subtle-foreground')}>{t(stepKey === 'playlistItems' ? playlistItemsStepLabelKey : (`wizard.steps.${stepKey}` as const))}</span>
									</div>
									{i < visibleSteps.length - 1 && <div className={cn('mx-1 mb-4 h-0.5 flex-1 rounded-full transition-all duration-500', isDone ? 'bg-primary' : 'bg-border-strong')} />}
								</div>
							)
						})}
					</div>
				)}

				{wizardStep === 'error' ? <StepError /> : activeDescriptor ? <Suspense fallback={<WizardStepFallback />}>{activeDescriptor.render()}</Suspense> : null}
			</WizardStage>
			<MixedUrlPromptDialog />
			<QuickDownloadProgressDialog />
			<QuickPlaylistCapDialog />
		</section>
	)
}
