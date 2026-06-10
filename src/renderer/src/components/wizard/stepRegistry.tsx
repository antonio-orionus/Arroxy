import {createElement, lazy, type ReactNode} from 'react'
import {WIZARD_STEPS, type VisibleWizardStep} from '../../store/wizard/wizardStepGraph.js'
import {StepUrlInput} from './StepUrlInput.js'

const lazySteps = {
	confirm: lazy(() => import('./StepConfirm.js').then(module => ({default: module.StepConfirm}))),
	folder: lazy(() => import('./StepFolderConfirm.js').then(module => ({default: module.StepFolderConfirm}))),
	formats: lazy(() => import('./StepFormatSelect.js').then(module => ({default: module.StepFormatSelect}))),
	output: lazy(() => import('./StepOutput.js').then(module => ({default: module.StepOutput}))),
	playlistItems: lazy(() => import('./StepPlaylistItems.js').then(module => ({default: module.StepPlaylistItems}))),
	playlistPresets: lazy(() => import('./StepPlaylistPresets.js').then(module => ({default: module.StepPlaylistPresets}))),
	sponsorblock: lazy(() => import('./StepSponsorBlock.js').then(module => ({default: module.StepSponsorBlock}))),
	subtitles: lazy(() => import('./StepSubtitles.js').then(module => ({default: module.StepSubtitles})))
}

export interface StepDescriptor {
	id: VisibleWizardStep
	render(): ReactNode
}

const RENDER_BY_STEP: Record<VisibleWizardStep, () => ReactNode> = {
	url: () => <StepUrlInput />,
	playlistItems: () => createElement(lazySteps.playlistItems),
	playlistPresets: () => createElement(lazySteps.playlistPresets),
	formats: () => createElement(lazySteps.formats),
	subtitles: () => createElement(lazySteps.subtitles),
	sponsorblock: () => createElement(lazySteps.sponsorblock),
	output: () => createElement(lazySteps.output),
	folder: () => createElement(lazySteps.folder),
	confirm: () => createElement(lazySteps.confirm)
}

export const STEP_REGISTRY: StepDescriptor[] = WIZARD_STEPS.map(id => ({id, render: RENDER_BY_STEP[id]}))
