import type {PlaylistSelection, Preset, SubtitleMap} from '@shared/types.js'
import {mediaIntentSpec, playlistSelectionToMediaIntent} from '@shared/mediaIntent.js'
import {presetProducesMedia, presetProducesVideo} from '@shared/presetTraits.js'
import {isYouTubeExtractor} from '@shared/ytdlp/extractorPredicates.js'
import type {WizardMode, WizardStep} from '../types.js'

export type VisibleWizardStep = Exclude<WizardStep, 'error'>
export type WizardStepDirection = 'forward' | 'backward'

export interface WizardStepGraphInput {
	wizardStep: WizardStep
	activePreset: Preset | null
	wizardMode: WizardMode
	playlistSelection: PlaylistSelection | null
	wizardExtractor: string
	wizardSubtitles: SubtitleMap
	wizardAutomaticCaptions: SubtitleMap
	wizardSubtitleSkipped: boolean
}

export interface WizardStepGraph {
	current: WizardStep
	steps: VisibleWizardStep[]
	activeIndex: number
	isDownloadHome: boolean
	hasSubtitles: boolean
	state: WizardStepGraphInput
}

export const WIZARD_STEPS: readonly VisibleWizardStep[] = ['url', 'playlistItems', 'playlistPresets', 'formats', 'subtitles', 'sponsorblock', 'output', 'folder', 'confirm']

function isBatchMode(mode: WizardMode): boolean {
	return mode === 'playlist' || mode === 'bulk'
}

function hasSubtitleTracks(state: Pick<WizardStepGraphInput, 'wizardSubtitles' | 'wizardAutomaticCaptions'>): boolean {
	return Object.keys(state.wizardSubtitles).length > 0 || Object.keys(state.wizardAutomaticCaptions).length > 0
}

function stepApplies(step: VisibleWizardStep, state: WizardStepGraphInput, hasSubtitles: boolean): boolean {
	if (step === 'url') return true
	if (step === 'playlistItems') return isBatchMode(state.wizardMode)
	if (step === 'playlistPresets') return isBatchMode(state.wizardMode)
	if (step === 'formats') return !isBatchMode(state.wizardMode)
	if (step === 'subtitles') {
		if (state.wizardSubtitleSkipped) return false
		if (isBatchMode(state.wizardMode) && !!state.playlistSelection) return false
		if (!isBatchMode(state.wizardMode) && !hasSubtitles) return false
		return true
	}
	if (step === 'sponsorblock') {
		if (!isYouTubeExtractor(state.wizardExtractor)) return false
		if (isBatchMode(state.wizardMode) && state.playlistSelection) return mediaIntentSpec(playlistSelectionToMediaIntent(state.playlistSelection)).producesVideo
		if (state.activePreset && !presetProducesVideo(state.activePreset)) return false
		return true
	}
	if (step === 'output') {
		if (isBatchMode(state.wizardMode) && state.playlistSelection) return true
		if (state.activePreset && !presetProducesMedia(state.activePreset)) return false
		return true
	}
	return true
}

export function buildWizardStepGraph(state: WizardStepGraphInput): WizardStepGraph {
	const hasSubtitles = hasSubtitleTracks(state)
	const steps = WIZARD_STEPS.filter(step => stepApplies(step, state, hasSubtitles))
	return {current: state.wizardStep, steps, activeIndex: state.wizardStep === 'error' ? -1 : steps.indexOf(state.wizardStep), isDownloadHome: state.wizardStep === 'url', hasSubtitles, state}
}

export function visibleWizardSteps(graph: WizardStepGraph): readonly VisibleWizardStep[] {
	return graph.steps
}

export function nextWizardStep(graph: WizardStepGraph, direction: WizardStepDirection): VisibleWizardStep | null {
	if (graph.current === 'error') return null
	const i = WIZARD_STEPS.indexOf(graph.current)
	if (i < 0) return null
	const delta = direction === 'forward' ? 1 : -1
	let cursor = i + delta
	while (cursor >= 0 && cursor < WIZARD_STEPS.length) {
		const step = WIZARD_STEPS[cursor]
		if (graph.steps.includes(step)) return step
		cursor += delta
	}
	return null
}
