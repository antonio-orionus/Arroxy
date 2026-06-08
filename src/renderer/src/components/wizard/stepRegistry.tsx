import type {ReactNode} from 'react'
import {STEP_APPLICABLE, STEPS, type StepContext, type VisibleStep} from './stepNavigation.js'
import {StepUrlInput} from './StepUrlInput.js'
import {StepPlaylistItems} from './StepPlaylistItems.js'
import {StepPlaylistPresets} from './StepPlaylistPresets.js'
import {StepFormatSelect} from './StepFormatSelect.js'
import {StepSubtitles} from './StepSubtitles.js'
import {StepSponsorBlock} from './StepSponsorBlock.js'
import {StepOutput} from './StepOutput.js'
import {StepFolderConfirm} from './StepFolderConfirm.js'
import {StepConfirm} from './StepConfirm.js'

export interface StepDescriptor {
	id: VisibleStep
	render(): ReactNode
	applicable(ctx: StepContext): boolean
}

const RENDER_BY_STEP: Record<VisibleStep, () => ReactNode> = {
	url: () => <StepUrlInput />,
	playlistItems: () => <StepPlaylistItems />,
	playlistPresets: () => <StepPlaylistPresets />,
	formats: () => <StepFormatSelect />,
	subtitles: () => <StepSubtitles />,
	sponsorblock: () => <StepSponsorBlock />,
	output: () => <StepOutput />,
	folder: () => <StepFolderConfirm />,
	confirm: () => <StepConfirm />
}

export const STEP_REGISTRY: StepDescriptor[] = STEPS.map(id => ({id, render: RENDER_BY_STEP[id], applicable: STEP_APPLICABLE[id]}))
