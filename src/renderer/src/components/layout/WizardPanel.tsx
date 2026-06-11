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

function WizardStepFallback(): ReactNode {
	return <div className="wizard-step min-h-32" data-testid="wizard-step-loading" aria-busy="true" />
}

export function WizardPanel(): ReactNode {
	const {t} = useTranslation()
	const wizardStep = useAppStore(s => s.wizardStep)
	const activePreset = useAppStore(s => s.activePreset)
	const wizardMode = useAppStore(s => s.wizardMode)
	const playlistSelection = useAppStore(s => s.playlistSelection)
	const wizardExtractor = useAppStore(s => s.wizardExtractor)
	const wizardSubtitles = useAppStore(s => s.wizardSubtitles)
	const wizardAutomaticCaptions = useAppStore(s => s.wizardAutomaticCaptions)
	const wizardSubtitleSkipped = useAppStore(s => s.wizardSubtitleSkipped)

	const graph = useMemo(
		() => buildWizardStepGraph({wizardStep, activePreset, wizardMode, playlistSelection, wizardExtractor, wizardSubtitles, wizardAutomaticCaptions, wizardSubtitleSkipped}),
		[wizardStep, activePreset, wizardMode, playlistSelection, wizardExtractor, wizardSubtitles, wizardAutomaticCaptions, wizardSubtitleSkipped]
	)

	const visibleSteps = visibleWizardSteps(graph)
	const activeIndex = graph.activeIndex
	const activeDescriptor = STEP_REGISTRY.find(d => d.id === wizardStep)
	const isDownloadHome = graph.isDownloadHome

	const prevIndexRef = useRef(activeIndex)
	const [isBackward, setIsBackward] = useState(false)

	useEffect(() => {
		setIsBackward(activeIndex >= 0 && prevIndexRef.current >= 0 && activeIndex < prevIndexRef.current)
		prevIndexRef.current = activeIndex
	}, [activeIndex])

	return (
		<section className={cn('flex min-h-full min-w-0 flex-col px-6', isDownloadHome ? 'pt-4' : 'pt-3', isBackward ? 'wizard-backward' : 'wizard-forward')} data-testid="wizard-panel">
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
											'w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold border shadow-[inset_0_1px_0_var(--field-highlight)] transition-all duration-300',
											isActive && 'border-[var(--brand)] bg-[var(--brand-dim)] text-[var(--brand)]',
											isDone && 'border-transparent bg-[var(--brand)] text-white',
											!isActive && !isDone && 'border-[var(--field-border)] bg-[var(--field-bg)] text-[var(--field-addon)]'
										)}
										style={isActive ? {boxShadow: '0 0 0 3px var(--brand-dim), 0 0 12px var(--brand-glow)'} : isDone ? {boxShadow: '0 0 6px var(--brand-glow)'} : undefined}
									>
										{isDone ? '✓' : i + 1}
									</div>
									<span className={cn('text-[11px] font-semibold uppercase tracking-[0.07em]', isActive && 'text-[var(--brand)]', (isDone || (!isActive && !isDone)) && 'text-[var(--text-subtle)]')}>{t(`wizard.steps.${stepKey}` as const)}</span>
								</div>
								{i < visibleSteps.length - 1 && <div className={cn('h-[2px] flex-1 mb-4 mx-1 transition-all duration-500 rounded-full', isDone ? 'bg-[var(--brand)]' : 'bg-[var(--field-border)]')} style={isDone ? {boxShadow: '0 0 4px var(--brand-glow)'} : undefined} />}
							</div>
						)
					})}
				</div>
			)}

			{wizardStep === 'error' ? <StepError /> : activeDescriptor ? <Suspense fallback={<WizardStepFallback />}>{activeDescriptor.render()}</Suspense> : null}
			<MixedUrlPromptDialog />
			<QuickDownloadProgressDialog />
			<QuickPlaylistCapDialog />
		</section>
	)
}
