import {describe, expect, it} from 'vitest'
import {buildWizardStepGraph, nextWizardStep, type WizardStepGraphInput, type VisibleWizardStep} from '@renderer/store/wizard/wizardStepGraph.js'

type NavTestContext = Omit<WizardStepGraphInput, 'wizardStep' | 'wizardSubtitles' | 'wizardAutomaticCaptions'> & {hasSubtitles: boolean}

function ctx(overrides: Partial<NavTestContext> = {}): NavTestContext {
	return {activePreset: null, wizardMode: 'single', playlistSelection: null, wizardExtractor: 'youtube', hasSubtitles: true, wizardSubtitleSkipped: false, ...overrides}
}

function walkStep(current: VisibleWizardStep, context: NavTestContext, dir: 'forward' | 'backward'): VisibleWizardStep | null {
	return nextWizardStep(buildWizardStepGraph({...context, wizardStep: current, wizardSubtitles: context.hasSubtitles ? {en: [{ext: 'vtt'}]} : {}, wizardAutomaticCaptions: {}}), dir)
}

describe('nextWizardStep — forward', () => {
	it('url → playlistItems when playlist mode', () => {
		expect(walkStep('url', ctx({wizardMode: 'playlist'}), 'forward')).toBe('playlistItems')
	})

	it('url → formats when single mode', () => {
		expect(walkStep('url', ctx({wizardMode: 'single'}), 'forward')).toBe('formats')
	})

	it('formats → subtitles when subtitles available', () => {
		expect(walkStep('formats', ctx({hasSubtitles: true}), 'forward')).toBe('subtitles')
	})

	it('formats → sponsorblock when no subtitles available', () => {
		expect(walkStep('formats', ctx({hasSubtitles: false}), 'forward')).toBe('sponsorblock')
	})

	it('formats → output when subtitleSkipped (re-entry from skip)', () => {
		// SponsorBlock applies only to YouTube; skipping it for non-YouTube too.
		expect(walkStep('formats', ctx({wizardSubtitleSkipped: true, wizardExtractor: 'vimeo'}), 'forward')).toBe('output')
	})

	it('subtitles → sponsorblock on YouTube', () => {
		expect(walkStep('subtitles', ctx({wizardExtractor: 'youtube'}), 'forward')).toBe('sponsorblock')
	})

	it('subtitles → output on non-YouTube (sponsorblock hidden)', () => {
		expect(walkStep('subtitles', ctx({wizardExtractor: 'vimeo'}), 'forward')).toBe('output')
	})

	it('audio-only preset hides sponsorblock', () => {
		expect(walkStep('subtitles', ctx({activePreset: 'audio-only'}), 'forward')).toBe('output')
	})

	it('subtitle-only preset hides sponsorblock and output', () => {
		expect(walkStep('subtitles', ctx({activePreset: 'subtitle-only'}), 'forward')).toBe('folder')
	})

	it('returns null at confirm boundary', () => {
		expect(walkStep('confirm', ctx(), 'forward')).toBeNull()
	})
})

describe('nextWizardStep — backward', () => {
	it('formats → url', () => {
		expect(walkStep('formats', ctx(), 'backward')).toBe('url')
	})

	it('confirm → folder', () => {
		expect(walkStep('confirm', ctx(), 'backward')).toBe('folder')
	})

	it('output → subtitles when subtitles available + not skipped', () => {
		expect(walkStep('output', ctx({hasSubtitles: true, wizardSubtitleSkipped: false, wizardExtractor: 'vimeo'}), 'backward')).toBe('subtitles')
	})

	it('output → formats when subtitles skipped', () => {
		expect(walkStep('output', ctx({wizardSubtitleSkipped: true, wizardExtractor: 'vimeo'}), 'backward')).toBe('formats')
	})

	it('folder → output for video presets', () => {
		expect(walkStep('folder', ctx({activePreset: 'best-quality'}), 'backward')).toBe('output')
	})

	it('folder → output for audio-only presets', () => {
		expect(walkStep('folder', ctx({activePreset: 'audio-only'}), 'backward')).toBe('output')
	})

	it('returns null at url boundary', () => {
		expect(walkStep('url', ctx(), 'backward')).toBeNull()
	})
})
