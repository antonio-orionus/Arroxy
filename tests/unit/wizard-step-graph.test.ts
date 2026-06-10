import {describe, expect, it} from 'vitest'
import {buildWizardStepGraph, nextWizardStep, visibleWizardSteps, type WizardStepGraphInput} from '@renderer/store/wizard/wizardStepGraph.js'

function state(overrides: Partial<WizardStepGraphInput> = {}): WizardStepGraphInput {
	return {wizardStep: 'url', activePreset: null, wizardMode: 'single', playlistSelection: null, wizardExtractor: 'youtube', wizardSubtitles: {en: [{ext: 'vtt'}]}, wizardAutomaticCaptions: {}, wizardSubtitleSkipped: false, ...overrides}
}

describe('WizardStepGraph', () => {
	it('builds the current single-video step list', () => {
		const graph = buildWizardStepGraph(state())

		expect(visibleWizardSteps(graph)).toEqual(['url', 'formats', 'subtitles', 'sponsorblock', 'output', 'folder', 'confirm'])
		expect(graph.activeIndex).toBe(0)
		expect(nextWizardStep(graph, 'forward')).toBe('formats')
	})

	it('routes playlist mode through item and preset selection', () => {
		const graph = buildWizardStepGraph(state({wizardMode: 'playlist', playlistSelection: {kind: 'video', tier: '1080', codec: 'best'}, wizardStep: 'playlistPresets'}))

		expect(visibleWizardSteps(graph)).toEqual(['url', 'playlistItems', 'playlistPresets', 'sponsorblock', 'output', 'folder', 'confirm'])
		expect(nextWizardStep(graph, 'forward')).toBe('sponsorblock')
	})

	it('uses the batch path for bulk URLs', () => {
		const graph = buildWizardStepGraph(state({wizardMode: 'bulk', wizardStep: 'url'}))

		expect(nextWizardStep(graph, 'forward')).toBe('playlistItems')
		expect(visibleWizardSteps(graph)).toContain('playlistPresets')
	})

	it('keeps skipped subtitles out of forward and backward traversal', () => {
		const graph = buildWizardStepGraph(state({wizardStep: 'output', wizardExtractor: 'vimeo', wizardSubtitleSkipped: true}))

		expect(visibleWizardSteps(graph)).not.toContain('subtitles')
		expect(nextWizardStep(graph, 'backward')).toBe('formats')
	})

	it('hides SponsorBlock for non-YouTube extractors', () => {
		const graph = buildWizardStepGraph(state({wizardExtractor: 'vimeo'}))

		expect(visibleWizardSteps(graph)).not.toContain('sponsorblock')
		expect(nextWizardStep(buildWizardStepGraph(state({wizardStep: 'subtitles', wizardExtractor: 'vimeo'})), 'forward')).toBe('output')
	})

	it('skips output for subtitle-only single-video downloads', () => {
		const graph = buildWizardStepGraph(state({wizardStep: 'subtitles', activePreset: 'subtitle-only'}))

		expect(visibleWizardSteps(graph)).toEqual(['url', 'formats', 'subtitles', 'folder', 'confirm'])
		expect(nextWizardStep(graph, 'forward')).toBe('folder')
	})

	it('walks backward through only visible steps', () => {
		const graph = buildWizardStepGraph(state({wizardStep: 'folder', activePreset: 'audio-only'}))

		expect(visibleWizardSteps(graph)).toEqual(['url', 'formats', 'subtitles', 'output', 'folder', 'confirm'])
		expect(nextWizardStep(graph, 'backward')).toBe('output')
	})
})
