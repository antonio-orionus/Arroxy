import {describe, expect, it} from 'vite-plus/test'
import type {PlaylistSelection} from '@shared/types.js'
import {buildWizardStepGraph, nextWizardStep, visibleWizardSteps, WIZARD_STEPS, type WizardStepGraphInput} from '@renderer/store/wizard/wizardStepGraph.js'

function state(overrides: Partial<WizardStepGraphInput> = {}): WizardStepGraphInput {
	return {wizardStep: 'url', wizardMode: 'single', playlistSelection: null, wizardExtractor: 'youtube', multiProfileMode: false, ...overrides}
}

const VIDEO_1080 = {kind: 'video', tier: '1080', codec: 'best'} as const

describe('WizardStepGraph', () => {
	it('lists every step once, in order', () => {
		expect(WIZARD_STEPS).toEqual(['url', 'playlistItems', 'playlistPresets', 'playlistProfiles', 'formats', 'sponsorblock', 'output', 'folder', 'confirm'])
	})

	it('is two screens for a single video: Format, then Review', () => {
		for (const extractor of ['youtube', 'vimeo', '']) {
			const graph = buildWizardStepGraph(state({wizardExtractor: extractor}))
			expect(visibleWizardSteps(graph)).toEqual(['url', 'formats', 'confirm'])
		}
		expect(nextWizardStep(buildWizardStepGraph(state()), 'forward')).toBe('formats')
		expect(nextWizardStep(buildWizardStepGraph(state({wizardStep: 'formats'})), 'forward')).toBe('confirm')
		expect(nextWizardStep(buildWizardStepGraph(state({wizardStep: 'confirm'})), 'backward')).toBe('formats')
		expect(nextWizardStep(buildWizardStepGraph(state({wizardStep: 'formats'})), 'backward')).toBe('url')
	})

	it('keeps multi-profile mode out of the single-video path', () => {
		expect(visibleWizardSteps(buildWizardStepGraph(state({multiProfileMode: true})))).toEqual(['url', 'formats', 'confirm'])
	})

	it('routes playlist mode through item and preset selection', () => {
		const graph = buildWizardStepGraph(state({wizardMode: 'playlist', playlistSelection: VIDEO_1080, wizardStep: 'playlistPresets'}))
		expect(visibleWizardSteps(graph)).toEqual(['url', 'playlistItems', 'playlistPresets', 'sponsorblock', 'output', 'folder', 'confirm'])
		expect(nextWizardStep(graph, 'forward')).toBe('sponsorblock')
	})

	it('uses the batch path for bulk URLs', () => {
		const graph = buildWizardStepGraph(state({wizardMode: 'bulk', playlistSelection: VIDEO_1080}))
		expect(nextWizardStep(graph, 'forward')).toBe('playlistItems')
		expect(visibleWizardSteps(graph)).toContain('playlistPresets')
		expect(visibleWizardSteps(graph)).not.toContain('formats')
	})

	it.each(['vimeo', 'pornhub', 'twitch', ''])('hides SponsorBlock for a %s batch', extractor => {
		expect(visibleWizardSteps(buildWizardStepGraph(state({wizardMode: 'playlist', playlistSelection: VIDEO_1080, wizardExtractor: extractor})))).not.toContain('sponsorblock')
	})

	it('hides SponsorBlock for an audio batch and output for a subtitles batch', () => {
		expect(visibleWizardSteps(buildWizardStepGraph(state({wizardMode: 'playlist', playlistSelection: {kind: 'audio', format: 'best'}})))).toEqual(['url', 'playlistItems', 'playlistPresets', 'output', 'folder', 'confirm'])
		const subtitles: PlaylistSelection = {kind: 'subtitles', languages: ['en'], source: 'manual-first', mode: 'sidecar', format: 'srt'}
		expect(visibleWizardSteps(buildWizardStepGraph(state({wizardMode: 'playlist', playlistSelection: subtitles})))).toEqual(['url', 'playlistItems', 'playlistPresets', 'folder', 'confirm'])
	})

	it('routes multi-profile batches straight from items to confirm', () => {
		for (const wizardMode of ['playlist', 'bulk'] as const) {
			const graph = buildWizardStepGraph(state({wizardMode, multiProfileMode: true, wizardStep: 'playlistProfiles'}))
			expect(visibleWizardSteps(graph)).toEqual(['url', 'playlistItems', 'playlistProfiles', 'confirm'])
			expect(nextWizardStep(graph, 'forward')).toBe('confirm')
			expect(nextWizardStep(graph, 'backward')).toBe('playlistItems')
		}
	})

	it('hides the profiles step unless multi-profile mode is on', () => {
		expect(visibleWizardSteps(buildWizardStepGraph(state({wizardMode: 'playlist', playlistSelection: VIDEO_1080})))).not.toContain('playlistProfiles')
	})
})
